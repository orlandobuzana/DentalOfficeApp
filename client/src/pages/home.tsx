import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Calendar from "@/components/calendar";
import Chatbot from "@/components/chatbot";
import { PaymentHistory } from "@/components/payment-history";
import { FormsDownload } from "@/components/forms-download";
import { ReportsManagement } from "@/components/reports-management";
import { AllAppointmentsPopup } from "@/components/all-appointments-popup";
import { OneClickBooking } from "@/components/one-click-booking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, CreditCard, Download, Shield, CalendarPlus, ArrowLeft, BarChart3 } from "lucide-react";
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

  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments, isFetching: appointmentsRefetching } = useQuery<Appointment[]>({
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
        const errorText = await response.text();
        console.error('Promote admin failed:', response.status, errorText);
        throw new Error(`Failed to promote to admin: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "You're now an admin. Refreshing...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload();
    },
    onError: (error) => {
      console.error('Promotion error:', error);
      toast({
        title: "Promotion Failed",
        description: error.message || "Failed to promote to admin",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-xl card-elevated p-8 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gradient mb-3">
                    Welcome back, {user?.firstName || 'Patient'}!
                  </h2>
                  <p className="text-gray-600 text-lg">Here's what's coming up for your dental care.</p>
                  

                </div>

              </div>

              {/* Upcoming Appointments in Jumbotron */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        refetchAppointments();
                        toast({
                          title: "Refreshing",
                          description: "Loading latest appointments...",
                        });
                      }}
                      disabled={appointmentsRefetching}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      data-testid="button-refresh-home-appointments"
                    >
                      <CalendarCheck className={`w-4 h-4 ${appointmentsRefetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <AllAppointmentsPopup>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        data-testid="button-see-all-appointments"
                      >
                        See All
                      </Button>
                    </AllAppointmentsPopup>
                  </div>
                </div>
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
                        <div key={appointment.id} className={`p-4 rounded-xl border-l-4 card-elevated transition-all hover:scale-[1.02] ${isPast ? 'bg-gradient-to-r from-red-50 to-red-25 border-red-500' : 'bg-gradient-to-r from-blue-50 to-cyan-25 border-blue-500 pulse-glow'}`}>
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
                ) : null}
              </div>
            </div>

            {/* Interactive Calendar */}
            <Calendar />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* One-Click Booking */}
            <OneClickBooking />

            {/* Quick Actions */}
            <Card className="card-elevated glass-effect">
              <CardHeader>
                <CardTitle className="text-lg text-gradient">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('medical-records')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-lg flex items-center transition-all duration-200 hover:transform hover:translate-x-1"
                  >
                    <FileText className="w-4 h-4 mr-3 text-blue-500" />
                    View Medical Records
                  </button>
                  <button 
                    onClick={() => setActiveView('payment-history')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg flex items-center transition-all duration-200 hover:transform hover:translate-x-1"
                  >
                    <CreditCard className="w-4 h-4 mr-3 text-green-500" />
                    Payment History
                  </button>
                  <button 
                    onClick={() => setActiveView('download-forms')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg flex items-center transition-all duration-200 hover:transform hover:translate-x-1"
                  >
                    <Download className="w-4 h-4 mr-3 text-purple-500" />
                    Download Forms
                  </button>

                  {/* Become Admin button - only show for non-admin users */}
                  {user && user.role !== 'admin' && (
                    <button 
                      onClick={() => promoteToAdminMutation.mutate()}
                      disabled={promoteToAdminMutation.isPending}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-lg flex items-center transition-all duration-200 hover:transform hover:translate-x-1"
                    >
                      <Shield className="w-4 h-4 mr-3 text-orange-500" />
                      {promoteToAdminMutation.isPending ? 'Promoting...' : 'Become Admin'}
                    </button>
                  )}

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
      case 'reports':
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
                    Reports & Analytics
                  </h1>
                </div>
                <ReportsManagement />
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
