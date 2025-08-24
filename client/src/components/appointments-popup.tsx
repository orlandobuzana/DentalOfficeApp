import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Trash2, CheckCircle } from "lucide-react";
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
  notes?: string;
}

interface AppointmentsPopupProps {
  children: React.ReactNode;
}

export function AppointmentsPopup({ children }: AppointmentsPopupProps) {
  const [open, setOpen] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments?limit=50');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
    enabled: open,
  });

  const cleanupMutation = useMutation({
    mutationFn: async (appointmentIds: string[]) => {
      const response = await fetch('/api/appointments/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentIds })
      });
      if (!response.ok) throw new Error('Failed to cleanup appointments');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Missed appointments have been cleaned up",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setSelectedAppointments([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clean up appointments",
        variant: "destructive",
      });
    },
  });

  const missedAppointments = appointments?.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return appointmentDate < today && apt.status === 'pending';
  }) || [];

  const upcomingAppointments = appointments?.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return appointmentDate >= today;
  }) || [];

  const handleSelectAppointment = (id: string) => {
    setSelectedAppointments(prev => 
      prev.includes(id) 
        ? prev.filter(appointmentId => appointmentId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllMissed = () => {
    const missedIds = missedAppointments.map(apt => apt.id);
    setSelectedAppointments(prev => 
      prev.length === missedIds.length ? [] : missedIds
    );
  };

  const handleCleanup = () => {
    if (selectedAppointments.length > 0) {
      cleanupMutation.mutate(selectedAppointments);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Appointments
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {isLoading && (
            <div className="text-center py-8">
              <p>Loading appointments...</p>
            </div>
          )}

          {!isLoading && appointments && (
            <>
              {/* Missed Appointments Section */}
              {missedAppointments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-red-600">
                      Missed Appointments ({missedAppointments.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllMissed}
                        data-testid="button-select-all-missed"
                      >
                        {selectedAppointments.length === missedAppointments.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCleanup}
                        disabled={selectedAppointments.length === 0 || cleanupMutation.isPending}
                        data-testid="button-cleanup-missed"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clean Up Selected ({selectedAppointments.length})
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {missedAppointments.map((appointment) => (
                      <Card 
                        key={appointment.id} 
                        className={`border-red-200 ${selectedAppointments.includes(appointment.id) ? 'ring-2 ring-red-300' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedAppointments.includes(appointment.id)}
                                onChange={() => handleSelectAppointment(appointment.id)}
                                className="h-4 w-4 text-red-600"
                                data-testid={`checkbox-appointment-${appointment.id}`}
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{appointment.doctorName}</span>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {appointment.treatmentType}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(appointment.appointmentDate)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(appointment.appointmentTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Appointments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">
                  Upcoming Appointments ({upcomingAppointments.length})
                </h3>
                
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{appointment.doctorName}</span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {appointment.treatmentType}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(appointment.appointmentDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(appointment.appointmentTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {upcomingAppointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {!isLoading && (!appointments || appointments.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}