import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import TeamForm from "@/components/admin/team-form";
import ResourceForm from "@/components/admin/resource-form";
import ChatbotManager from "@/components/admin/chatbot-manager";
import CalendarManager from "@/components/admin/calendar-manager";
import { ProcedureList } from "@/components/admin/procedure-list";
import { PromotionList } from "@/components/admin/promotion-list";
import { FormUpload } from "@/components/admin/form-upload";
import { FormsList } from "@/components/admin/forms-list";
import { SimpleReportsManagement } from "@/components/simple-reports";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarCheck, Users, DollarSign, Clock, UserPlus, FileText, Calendar, Settings, MessageSquare, Stethoscope, Percent, BarChart3 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
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

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showChatbotManager, setShowChatbotManager] = useState(false);
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [showProcedures, setShowProcedures] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Redirect to home if not authenticated or not admin
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
    if (!isLoading && isAuthenticated && (user as any)?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required. Redirecting to home...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    retry: false,
    enabled: !!user && (user as any).role === 'admin',
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/initialize');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default data has been initialized",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to initialize data",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest('PATCH', `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Success",
        description: "Appointment status updated",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update appointment",
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

  if ((user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return null;
  }

  const todayAppointments = appointments?.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  ).length || 0;

  const pendingAppointments = appointments?.filter(apt => apt.status === 'pending').length || 0;
  const recentAppointments = appointments?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600">Manage your dental practice efficiently</p>
            </div>
            <Button
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              variant="outline"
            >
              {initializeMutation.isPending ? "Initializing..." : "Initialize Data"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarCheck className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{todayAppointments}</p>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{appointments?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">$12,450</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{pendingAppointments}</p>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Appointments</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              ) : recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.treatmentType}</p>
                          <p className="text-xs text-gray-600">{appointment.doctorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{appointment.appointmentTime}</p>
                        <div className="flex items-center space-x-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                          {appointment.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatusMutation.mutate({ 
                                id: appointment.id, 
                                status: 'confirmed' 
                              })}
                              disabled={updateStatusMutation.isPending}
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments found</p>
              )}
            </CardContent>
          </Card>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Dialog open={showTeamForm} onOpenChange={setShowTeamForm}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <UserPlus className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Add Team Member</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                    </DialogHeader>
                    <TeamForm onClose={() => setShowTeamForm(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={showResourceForm} onOpenChange={setShowResourceForm}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <FileText className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Add Resource</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Resource</DialogTitle>
                    </DialogHeader>
                    <ResourceForm onClose={() => setShowResourceForm(false)} />
                  </DialogContent>
                </Dialog>

                <button 
                  onClick={() => setShowCalendarManager(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <Calendar className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Calendar</p>
                </button>

                <button 
                  onClick={() => setShowChatbotManager(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <MessageSquare className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Chatbot</p>
                </button>

                <Dialog open={showProcedures} onOpenChange={setShowProcedures}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <Stethoscope className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Procedures</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Procedures Management</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                      <ProcedureList />
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showPromotions} onOpenChange={setShowPromotions}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <Percent className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage Promotions</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Promotions Management</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                      <PromotionList />
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showReports} onOpenChange={setShowReports}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Reports & Analytics</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Reports & Analytics</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                      <SimpleReportsManagement />
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showForms} onOpenChange={setShowForms}>
                  <DialogTrigger asChild>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                      <FileText className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Manage PDF Forms</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>PDF Forms Management</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[80vh] pr-2">
                      <FormsList />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Modal Components */}
        <ChatbotManager 
          isOpen={showChatbotManager} 
          onClose={() => setShowChatbotManager(false)}
        />
        <CalendarManager 
          isOpen={showCalendarManager} 
          onClose={() => setShowCalendarManager(false)}
        />
      </div>
    </div>
  );
}
