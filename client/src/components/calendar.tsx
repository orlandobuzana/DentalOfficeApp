import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
  doctorName: string;
}

export default function Calendar() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [treatmentType, setTreatmentType] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentDate = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
    calendarDays.push({
      date: prevDate.getDate(),
      isCurrentMonth: false,
      fullDate: prevDate.toISOString().split('T')[0],
    });
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      fullDate: date.toISOString().split('T')[0],
      isPast: date < currentDate,
    });
  }

  const { data: timeSlots } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots", selectedDate],
    enabled: !!selectedDate,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: {
      doctorName: string;
      treatmentType: string;
      appointmentDate: string;
      appointmentTime: string;
    }) => {
      await apiRequest('POST', '/api/appointments', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
      setSelectedDate('');
      setSelectedTime('');
      setSelectedDoctor('');
      setTreatmentType('');
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
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (fullDate: string, isPast: boolean) => {
    if (isPast) return;
    setSelectedDate(fullDate);
    setSelectedTime('');
    setSelectedDoctor('');
  };

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !treatmentType) {
      toast({
        title: "Error",
        description: "Please select all required fields",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      doctorName: selectedDoctor,
      treatmentType,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
    });
  };

  const availableSlots = timeSlots?.filter(slot => slot.isAvailable) || [];
  const doctors = Array.from(new Set(availableSlots.map(slot => slot.doctorName)));
  const availableTimes = availableSlots
    .filter(slot => !selectedDoctor || slot.doctorName === selectedDoctor)
    .map(slot => slot.time);

  // Fallback doctors list if no time slots are available
  const fallbackDoctors = ["Dr. Sarah Johnson", "Dr. Mike Chen", "Dr. James Wilson"];
  const doctorsList = doctors.length > 0 ? doctors : fallbackDoctors;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Book an Appointment</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && handleDateClick(day.fullDate, !!day.isPast)}
              disabled={!day.isCurrentMonth || !!day.isPast}
              className={`
                text-center py-3 text-sm rounded transition-colors
                ${!day.isCurrentMonth 
                  ? 'text-gray-400' 
                  : day.isPast
                  ? 'text-gray-400 cursor-not-allowed'
                  : selectedDate === day.fullDate
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                }
              `}
            >
              {day.date}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>

        {/* Booking Form */}
        {selectedDate && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h4 className="text-md font-medium text-gray-900">
              Book for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Type
                </label>
                <Select value={treatmentType} onValueChange={setTreatmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Routine Cleaning</SelectItem>
                    <SelectItem value="checkup">General Checkup</SelectItem>
                    <SelectItem value="filling">Dental Filling</SelectItem>
                    <SelectItem value="root-canal">Root Canal</SelectItem>
                    <SelectItem value="crown">Crown Placement</SelectItem>
                    <SelectItem value="extraction">Tooth Extraction</SelectItem>
                    <SelectItem value="orthodontics">Orthodontic Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsList.map(doctor => (
                      <SelectItem key={doctor} value={doctor}>
                        {doctor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDoctor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Times
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableTimes.map(time => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-sm"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBookAppointment}
                  disabled={!selectedTime || !treatmentType || createAppointmentMutation.isPending}
                  className="w-full"
                >
                  {createAppointmentMutation.isPending ? "Booking..." : "Book Selected Time"}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
