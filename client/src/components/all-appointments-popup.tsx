import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, RefreshCw, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patientId?: string;
  doctorName: string;
  treatmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
}

interface AllAppointmentsPopupProps {
  children: React.ReactNode;
}

export function AllAppointmentsPopup({ children }: AllAppointmentsPopupProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, refetch, isFetching } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/all'],
    queryFn: async () => {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
    enabled: open,
  });

  // Function to create calendar reminder
  const createCalendarReminder = (appointment: Appointment) => {
    const [time, period] = appointment.appointmentTime.split(' ');
    const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
    
    const startDate = new Date(appointment.appointmentDate + 'T00:00:00');
    startDate.setHours(hour24, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Assume 1 hour appointment
    
    // Format dates for calendar URL (YYYYMMDDTHHMMSS)
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startDateTime = formatDate(startDate);
    const endDateTime = formatDate(endDate);
    
    // Create calendar URL
    const title = encodeURIComponent(`Dental Appointment - ${appointment.treatmentType}`);
    const details = encodeURIComponent(`Appointment with ${appointment.doctorName} for ${appointment.treatmentType}`);
    const location = encodeURIComponent('Dental Clinic');
    
    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
    
    // Try to detect if user prefers Google Calendar or download ICS
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
      window.open(googleUrl, '_blank');
    } else {
      // Create and download ICS file
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dental Clinic//Appointment Reminder//EN
BEGIN:VEVENT
UID:${appointment.id}@dental.clinic
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${decodeURIComponent(title)}
DESCRIPTION:${decodeURIComponent(details)}
LOCATION:${decodeURIComponent(location)}
END:VEVENT
END:VCALENDAR`;
      
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `dental-appointment-${appointment.appointmentDate}.ics`;
      link.click();
    }
  };

  const handleRefresh = () => {
    refetch();
    // Also invalidate the home page appointments cache to ensure synchronization
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    toast({
      title: "Refreshing",
      description: "Loading latest appointments...",
    });
  };

  // Sort appointments by date and time
  const sortedAppointments = appointments?.sort((a, b) => {
    const parseDateTime = (appointment: Appointment) => {
      const [time, period] = appointment.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
      const date = new Date(appointment.appointmentDate + 'T00:00:00');
      date.setHours(hour24, minutes, 0, 0);
      return date;
    };
    
    return parseDateTime(b).getTime() - parseDateTime(a).getTime(); // Most recent first
  }) || [];

  const getStatusColor = (status: string, appointmentDate: string, appointmentTime: string) => {
    // Check if appointment time has passed
    const [time, period] = appointmentTime.split(' ');
    const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
    
    const appointmentDateTime = new Date(appointmentDate + 'T00:00:00');
    appointmentDateTime.setHours(hour24, minutes, 0, 0);
    
    const now = new Date();
    const isPast = appointmentDateTime < now;
    
    if (isPast && status.toLowerCase() === 'pending') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">All Appointments</DialogTitle>
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-refresh-appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <DialogDescription>
            View and manage all appointments with real-time status updates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : sortedAppointments.length > 0 ? (
            <div className="space-y-4">
              {sortedAppointments.map((appointment) => {
                // Check if appointment time has passed
                const [time, period] = appointment.appointmentTime.split(' ');
                const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
                const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                
                const appointmentDateTime = new Date(appointment.appointmentDate + 'T00:00:00');
                appointmentDateTime.setHours(hour24, minutes, 0, 0);
                
                const now = new Date();
                const isPast = appointmentDateTime < now;
                const isMissed = isPast && appointment.status.toLowerCase() === 'pending';

                return (
                  <Card 
                    key={appointment.id} 
                    className={`transition-all hover:shadow-md ${isMissed ? 'border-red-200 bg-red-50' : ''}`}
                    data-testid={`card-appointment-${appointment.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {appointment.treatmentType}
                            </h3>
                            <Badge 
                              className={getStatusColor(appointment.status, appointment.appointmentDate, appointment.appointmentTime)}
                              data-testid={`badge-status-${appointment.status}`}
                            >
                              {isMissed ? 'MISSED' : appointment.status.toUpperCase()}
                            </Badge>
                          </div>
                          
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
                              <span className={isPast ? 'text-red-600 font-medium' : ''}>
                                {appointment.appointmentTime}
                              </span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>Notes:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {!isPast && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => createCalendarReminder(appointment)}
                              className="flex items-center gap-1 px-3 py-1 h-8 text-xs"
                              title="Add to Calendar"
                              data-testid={`button-calendar-${appointment.id}`}
                            >
                              <CalendarPlus className="w-3 h-3" />
                              Remind
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400 text-sm">Schedule your first appointment to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}