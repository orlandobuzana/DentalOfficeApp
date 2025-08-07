import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Calendar from "@/components/calendar";
import Chatbot from "@/components/chatbot";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, CreditCard, Download, Shield } from "lucide-react";
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

  const upcomingAppointments = appointments?.filter(apt => {
    // Parse the appointment time correctly - it comes in format like "10:30 AM"
    const [time, period] = apt.appointmentTime.split(' ');
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
    
    const appointmentDateTime = new Date(apt.appointmentDate);
    appointmentDateTime.setHours(hour24, minutes, 0, 0);
    
    const now = new Date();
    
    // Include confirmed, pending, and other non-cancelled statuses
    const validStatuses = ['confirmed', 'pending', 'scheduled'];
    const isUpcoming = appointmentDateTime > now;
    const isValidStatus = validStatuses.includes(apt.status.toLowerCase());
    
    console.log('Appointment:', apt.treatmentType, 'Status:', apt.status, 'DateTime:', appointmentDateTime, 'Now:', now, 'IsUpcoming:', isUpcoming, 'IsValidStatus:', isValidStatus);
    
    return isValidStatus && isUpcoming;
  }).sort((a, b) => {
    // Sort by date and time, earliest first
    const parseDateTime = (appointment: any) => {
      const [time, period] = appointment.appointmentTime.split(' ');
      const [hours, minutes] = time.split(':').map(num => parseInt(num));
      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
      const date = new Date(appointment.appointmentDate);
      date.setHours(hour24, minutes, 0, 0);
      return date;
    };
    
    return parseDateTime(a).getTime() - parseDateTime(b).getTime();
  }).slice(0, 3) || []; // Show up to 3 upcoming appointments

  return (
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
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{appointment.treatmentType}</p>
                            <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.appointmentTime}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-gray-400" />
                    View Medical Records
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                    <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                    Payment History
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
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
}
