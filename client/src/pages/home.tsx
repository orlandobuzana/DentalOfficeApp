import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Calendar from "@/components/calendar";
import Chatbot from "@/components/chatbot";
import { PaymentHistory } from "@/components/payment-history";
import { FormsDownload } from "@/components/forms-download";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, CreditCard, Download, Shield, CalendarPlus, ArrowLeft } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Appointment {
  id: string;
  doctorName: string;
  treatmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    retry: false,
    enabled: !!user,
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/promote-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to promote to admin');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been promoted to admin. Refresh the page to see admin options.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to promote to admin",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
    const location = encodeURIComponent('SmileCare Dental Clinic');
    
    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
    
    // Outlook/ICS format for other calendar apps
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmileCare Dental//Appointment Reminder//EN
BEGIN:VEVENT
UID:${appointment.id}@smilecare.dental
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${decodeURIComponent(title)}
DESCRIPTION:${decodeURIComponent(details)}
LOCATION:${decodeURIComponent(location)}
END:VEVENT
END:VCALENDAR`;
    
    // Try to detect if user prefers Google Calendar or download ICS
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
      window.open(googleUrl, '_blank');
    } else {
      // Create and download ICS file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `dental-appointment-${appointment.appointmentDate}.ics`;
      link.click();
    }
  };

  const upcomingAppointments = appointments?.filter(apt => {
    // Include confirmed, pending, and other non-cancelled statuses
    const validStatuses = ['confirmed', 'pending', 'scheduled'];
    const isValidStatus = validStatuses.includes(apt.status.toLowerCase());
    
    return isValidStatus;
  }).sort((a, b) => {
    // Sort by date and time, earliest first
    const parseDateTime = (appointment: any) => {
      const [time, period] = appointment.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
      const date = new Date(appointment.appointmentDate + 'T00:00:00');
      date.setHours(hour24, minutes, 0, 0);
      return date;
    };
    
    return parseDateTime(a).getTime() - parseDateTime(b).getTime();
  }).slice(0, 5) || []; // Show up to 5 appointments (including missed ones)

  // Dashboard content
  const dashboardContent = () => (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Welcome back, {(user as any)?.firstName || 'Patient'}!
                  </h2>
                  <p className="text-gray-600">Here's what's coming up for your dental care.</p>
                </div>
                {(user as any)?.role !== 'admin' && (
                  <Button
                    onClick={() => promoteToAdminMutation.mutate()}
                    disabled={promoteToAdminMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {promoteToAdminMutation.isPending ? 'Promoting...' : 'Become Admin'}
                  </Button>
                )}
              </div>

              {/* Upcoming Appointments in Jumbotron */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Upcoming Appointments</h3>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse bg-gray-200 h-16 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-16 rounded"></div>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => {
                      // Check if appointment time has passed
                      const [time, period] = appointment.appointmentTime.split(' ');
                      const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
                      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                      
                      const appointmentDateTime = new Date(appointment.appointmentDate + 'T00:00:00');
                      appointmentDateTime.setHours(hour24, minutes, 0, 0);
                      
                      const now = new Date();
                      const isPast = appointmentDateTime < now;
                      
                      return (
                        <div key={appointment.id} className={`p-4 rounded-lg border-l-4 ${isPast ? 'bg-red-50 border-red-600' : 'bg-blue-50 border-blue-600'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{appointment.treatmentType}</p>
                                {isPast && (
                                  <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                    MISSED
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className={`text-sm ${isPast ? 'text-red-600' : 'text-gray-600'}`}>{appointment.appointmentTime}</p>
                              </div>
                              {!isPast && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => createCalendarReminder(appointment)}
                                  className="flex items-center gap-1 px-2 py-1 h-8 text-xs"
                                  title="Add to Calendar"
                                >
                                  <CalendarPlus className="w-3 h-3" />
                                  Remind
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-center">No upcoming appointments scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Calendar */}
            <Calendar />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('medical-records')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-3 text-gray-400" />
                    View Medical Records
                  </button>
                  <button 
                    onClick={() => setActiveView('payment-history')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                    Payment History
                  </button>
                  <button 
                    onClick={() => setActiveView('download-forms')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <Download className="w-4 h-4 mr-3 text-gray-400" />
                    Download Forms
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );

  // Render different views based on activeView
  const renderView = () => {
    switch (activeView) {
      case 'payment-history':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="mb-6">
                  <Button
                    onClick={() => setActiveView('dashboard')}
                    variant="ghost"
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Payment History
                  </h1>
                </div>
                <PaymentHistory />
              </div>
            </div>
          </div>
        );
      case 'download-forms':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="mb-6">
                  <Button
                    onClick={() => setActiveView('dashboard')}
                    variant="ghost"
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Download Forms
                  </h1>
                </div>
                <FormsDownload />
              </div>
            </div>
          </div>
        );
      case 'medical-records':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="mb-6">
                  <Button
                    onClick={() => setActiveView('dashboard')}
                    variant="ghost"
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Medical Records
                  </h1>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Medical Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Medical Records Coming Soon
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Access to your complete medical records will be available soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      default:
        return dashboardContent();
    }
  };

  return renderView();
}
