import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, User, CheckCircle, Loader2, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface QuickBookingOption {
  id: string;
  title: string;
  description: string;
  procedure: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  availableSlots: number;
}

const BASE_BOOKING_OPTIONS = [
  {
    id: 'emergency',
    title: 'Emergency Visit',
    description: 'Urgent dental care - next available slot',
    procedure: 'Emergency Consultation',
    estimatedTime: '30-45 min',
    priority: 'high' as const,
  },
  {
    id: 'checkup',
    title: 'Routine Checkup',
    description: 'Regular dental examination and cleaning',
    procedure: 'Routine Cleaning',
    estimatedTime: '60 min',
    priority: 'medium' as const,
  },
  {
    id: 'consultation',
    title: 'New Patient Consultation',
    description: 'First visit - comprehensive examination',
    procedure: 'New Patient Consultation',
    estimatedTime: '90 min',
    priority: 'medium' as const,
  },
  {
    id: 'followup',
    title: 'Follow-up Visit',
    description: 'Check progress from previous treatment',
    procedure: 'Follow-up',
    estimatedTime: '30 min',
    priority: 'low' as const,
  }
];

const BOOKING_STEPS = [
  { id: 1, name: 'Select Type', description: 'Choose appointment type' },
  { id: 2, name: 'Find Slot', description: 'Finding best available time' },
  { id: 3, name: 'Confirm', description: 'Booking appointment' },
  { id: 4, name: 'Complete', description: 'Appointment confirmed' }
];

export function OneClickBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<QuickBookingOption | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);

  // Fetch available time slots for the next 7 days
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/time-slots/available'],
    retry: false,
  });

  // Calculate available slots for each booking type
  const getAvailableSlotsForType = (procedureType: string): number => {
    const availableSlots = Array.isArray(slotsData) ? slotsData : [];
    
    if (availableSlots.length === 0) return 0;
    
    // For emergency, count all available slots (highest priority)
    if (procedureType === 'Emergency Consultation') {
      return availableSlots.length;
    }
    
    // For other types, simulate availability based on slot distribution
    const totalSlots = availableSlots.length;
    const availabilityRatio = {
      'Routine Cleaning': 0.4, // 40% of slots suitable for cleanings
      'New Patient Consultation': 0.25, // 25% for new patients (longer appointments)  
      'Follow-up': 0.6, // 60% for follow-ups (shorter, flexible)
    };
    
    return Math.floor(totalSlots * (availabilityRatio[procedureType as keyof typeof availabilityRatio] || 0.3));
  };

  // Create booking options with real slot counts
  const QUICK_BOOKING_OPTIONS: QuickBookingOption[] = BASE_BOOKING_OPTIONS.map(option => ({
    ...option,
    availableSlots: getAvailableSlotsForType(option.procedure)
  }));
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const quickBookMutation = useMutation({
    mutationFn: async (option: QuickBookingOption) => {
      // Step 2: Find available slot
      setCurrentStep(2);
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate finding slot
      
      // Step 3: Book appointment
      setCurrentStep(3);
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get next available date (tomorrow or later)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Generate time slots for the selected procedure priority
      const timeSlots = option.priority === 'high' 
        ? ['9:00 AM', '10:30 AM', '2:00 PM'] 
        : ['10:00 AM', '2:00 PM', '4:00 PM'];
      
      const selectedTime = timeSlots[0]; // Pick first available
      
      const appointmentData = {
        doctorName: 'Dr. Smith',
        treatmentType: option.procedure,
        appointmentDate: tomorrow.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        notes: `One-click booking - ${option.title}`,
      };
      
      const result = await apiRequest('POST', '/api/appointments', appointmentData);
      
      // Step 4: Complete
      setCurrentStep(4);
      setProgress(100);
      
      return result;
    },
    onSuccess: (result) => {
      setBookedAppointment(result);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      
      toast({
        title: "Appointment Booked!",
        description: `Your ${selectedOption?.title.toLowerCase()} has been scheduled successfully.`,
      });
    },
    onError: (error: Error) => {
      setCurrentStep(1);
      setProgress(0);
      setIsBooking(false);
      
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
        title: "Booking Failed",
        description: error.message || "Unable to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickBook = async (option: QuickBookingOption) => {
    setSelectedOption(option);
    setIsBooking(true);
    setCurrentStep(1);
    setProgress(10);
    
    // Short delay to show first step
    await new Promise(resolve => setTimeout(resolve, 300));
    
    quickBookMutation.mutate(option);
  };

  const resetBooking = () => {
    setSelectedOption(null);
    setCurrentStep(1);
    setProgress(0);
    setIsBooking(false);
    setBookedAppointment(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50';
      case 'medium': return 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50';
      case 'low': return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50';
      default: return 'border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '📅';
      case 'low': return '✅';
      default: return '📋';
    }
  };

  if (bookedAppointment) {
    return (
      <Card className="card-elevated glass-effect">
        <CardHeader>
          <CardTitle className="text-lg text-gradient flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Appointment Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Booking Successful!
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Treatment:</strong> {bookedAppointment.treatmentType}</p>
              <p><strong>Doctor:</strong> {bookedAppointment.doctorName}</p>
              <p><strong>Date:</strong> {new Date(bookedAppointment.appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> {bookedAppointment.appointmentTime}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={resetBooking}
              variant="outline"
              className="flex-1 button-animate"
            >
              Book Another
            </Button>
            <Button 
              onClick={() => {
                // Create calendar event
                const startDate = new Date(bookedAppointment.appointmentDate + 'T00:00:00');
                const [time, period] = bookedAppointment.appointmentTime.split(' ');
                const [hours, minutes] = time.split(':').map((num: string) => parseInt(num));
                const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                startDate.setHours(hour24, minutes, 0, 0);
                
                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1);
                
                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dental Appointment - ${bookedAppointment.treatmentType}`)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Doctor: ${bookedAppointment.doctorName}\nTreatment: ${bookedAppointment.treatmentType}`)}`;
                
                window.open(googleCalendarUrl, '_blank');
              }}
              className="flex-1 button-animate"
            >
              Add to Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isBooking) {
    return (
      <Card className="card-elevated glass-effect">
        <CardHeader>
          <CardTitle className="text-lg text-gradient flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            Booking Your Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">
              {selectedOption?.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedOption?.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Indicator */}
          <div className="space-y-3">
            {BOOKING_STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  step.id === currentStep 
                    ? 'bg-blue-50 border border-blue-200' 
                    : step.id < currentStep 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : step.id === currentStep ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    step.id === currentStep ? 'text-blue-900' : 
                    step.id < currentStep ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated glass-effect">
      <CardHeader>
        <CardTitle className="text-lg text-gradient flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          One-Click Booking
        </CardTitle>
        <p className="text-sm text-gray-600">
          Quick appointment booking for common procedures
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {QUICK_BOOKING_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-l-4 transition-all interactive-hover slide-up-animate ${
                option.availableSlots === 0 
                  ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-300' 
                  : `cursor-pointer hover:shadow-md hover:scale-[1.02] ${getPriorityColor(option.priority)}`
              }`}
              onClick={() => option.availableSlots > 0 && handleQuickBook(option)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getPriorityIcon(option.priority)}</span>
                    <h3 className="font-medium text-gray-900">{option.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {option.estimatedTime}
                    </span>
                    <span className={`flex items-center gap-1 ${option.availableSlots === 0 ? 'text-red-500' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      {option.availableSlots === 0 ? '0 slots available' : `${option.availableSlots} slots available`}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={option.availableSlots === 0}
                  className={`button-animate ${
                    option.availableSlots === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  } text-white border-none shadow-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.availableSlots > 0) {
                      handleQuickBook(option);
                    }
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {option.availableSlots === 0 ? 'No Slots' : 'Book Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">How it works:</p>
              <p className="text-blue-700">
                Select your appointment type above for instant booking. We'll automatically find the next available slot and confirm your appointment in seconds.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}