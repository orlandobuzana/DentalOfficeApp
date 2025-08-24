import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Bell, Send, User, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  treatmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

interface ReminderPanelProps {
  appointment: Appointment;
  children: React.ReactNode;
}

export function ReminderPanel({ appointment, children }: ReminderPanelProps) {
  const [open, setOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  // Default reminder message
  const defaultMessage = `Reminder: You have a dental appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })} at ${appointment.appointmentTime} with ${appointment.doctorName} for ${appointment.treatmentType}. Please arrive 15 minutes early. Contact us if you need to reschedule.`;

  const sendEmailMutation = useMutation({
    mutationFn: async ({ email, message }: { email: string; message: string }) => {
      return await apiRequest('POST', '/api/reminders/email', {
        appointmentId: appointment.id,
        email,
        message,
        appointmentDetails: {
          patientId: appointment.patientId,
          doctorName: appointment.doctorName,
          treatmentType: appointment.treatmentType,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Appointment reminder email has been sent successfully",
      });
      setOpen(false);
      setEmailRecipient("");
      setCustomMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email reminder",
        variant: "destructive",
      });
    },
  });

  const sendSMSMutation = useMutation({
    mutationFn: async ({ phone, message }: { phone: string; message: string }) => {
      return await apiRequest('POST', '/api/reminders/sms', {
        appointmentId: appointment.id,
        phone,
        message,
        appointmentDetails: {
          patientId: appointment.patientId,
          doctorName: appointment.doctorName,
          treatmentType: appointment.treatmentType,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent",
        description: "Appointment reminder SMS has been sent successfully",
      });
      setOpen(false);
      setPhoneNumber("");
      setCustomMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "SMS Failed",
        description: error.message || "Failed to send SMS reminder",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!emailRecipient.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const message = customMessage.trim() || defaultMessage;
    sendEmailMutation.mutate({ email: emailRecipient, message });
  };

  const handleSendSMS = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    const message = customMessage.trim() || defaultMessage;
    sendSMSMutation.mutate({ phone: phoneNumber, message });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Send Appointment Reminder
          </DialogTitle>
        </DialogHeader>

        {/* Appointment Details Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">{appointment.treatmentType}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Dr. {appointment.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.appointmentTime}</span>
                  </div>
                </div>
              </div>
              <Badge 
                className={`${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-700'
                    : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {appointment.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                data-testid="input-email-recipient"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-message">Custom Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Leave blank to use default message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                data-testid="textarea-email-message"
              />
              <p className="text-xs text-gray-500">
                Default message will include appointment details and instructions
              </p>
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending}
              className="w-full"
              data-testid="button-send-email"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendEmailMutation.isPending ? "Sending..." : "Send Email Reminder"}
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                data-testid="input-phone-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms-message">Custom Message (Optional)</Label>
              <Textarea
                id="sms-message"
                placeholder="Leave blank to use default message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                data-testid="textarea-sms-message"
              />
              <p className="text-xs text-gray-500">
                Default message will include appointment details (SMS messages have character limits)
              </p>
            </div>

            <Button
              onClick={handleSendSMS}
              disabled={sendSMSMutation.isPending}
              className="w-full"
              data-testid="button-send-sms"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendSMSMutation.isPending ? "Sending..." : "Send SMS Reminder"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Default Message Preview */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Label className="text-xs font-medium text-gray-700">Default Message Preview:</Label>
          <p className="text-xs text-gray-600 mt-1">{defaultMessage}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}