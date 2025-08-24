import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Clock, User, CalendarCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
  doctorName: string;
  slotType: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
  notes?: string;
  createdAt: string;
}

const timeSlotSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  isAvailable: z.boolean().default(true),
  doctorName: z.string().min(1, "Doctor name is required"),
  slotType: z.string().default('general'),
  duration: z.number().default(60),
  maxBookings: z.number().default(1),
  notes: z.string().optional(),
});

type TimeSlotData = z.infer<typeof timeSlotSchema>;

interface CalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const doctors = ["Dr. Sarah Johnson", "Dr. Mike Chen", "Dr. James Wilson"];
const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

export default function CalendarManager({ isOpen, onClose }: CalendarManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const form = useForm<TimeSlotData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      date: "",
      time: "",
      isAvailable: true,
      doctorName: "",
      slotType: "general",
      duration: 60,
      maxBookings: 1,
      notes: "",
    },
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get the next 30 days for display
  const getNext30Days = () => {
    try {
      const dates = [];
      const baseDate = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        if (dateString) {
          dates.push(dateString);
        }
      }
      return dates;
    } catch (error) {
      console.error('Error generating dates:', error);
      return [today];
    }
  };

  const { data: availableTimeSlots, isLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots", selectedDate || today],
    retry: false,
    enabled: isOpen,
  });

  const createTimeSlotMutation = useMutation({
    mutationFn: async (data: TimeSlotData) => {
      await apiRequest('POST', '/api/timeslots', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Time slot created successfully",
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
        description: "Failed to create time slot",
        variant: "destructive",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      await apiRequest('PATCH', `/api/timeslots/${id}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
      toast({
        title: "Success",
        description: "Availability updated successfully",
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
        description: "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  const deleteTimeSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/timeslots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
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
        description: "Failed to delete time slot",
        variant: "destructive",
      });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (data: { date: string; doctorName: string }) => {
      const slots = timeSlots.map(time => ({
        date: data.date,
        time,
        doctorName: data.doctorName,
        isAvailable: true,
        slotType: 'general',
        duration: 30,
        maxBookings: 1,
        notes: '',
      }));
      await apiRequest('POST', '/api/timeslots/bulk', { timeSlots: slots });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
      toast({
        title: "Success",
        description: "Full day schedule created successfully",
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
        description: "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TimeSlotData) => {
    createTimeSlotMutation.mutate(data);
  };

  const handleBulkCreate = (date: string, doctorName: string) => {
    if (confirm(`Create all time slots for ${doctorName} on ${date}?`)) {
      bulkCreateMutation.mutate({ date, doctorName });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Manage Calendar Availability
          </DialogTitle>
          <DialogDescription>
            Create and manage time slots for different dates and doctors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">View Date:</label>
            <Select value={selectedDate || today} onValueChange={(value) => {
              try {
                setSelectedDate(value);
              } catch (error) {
                console.error('Error setting date:', error);
              }
            }}>
              <SelectTrigger className="w-48 form-field-animate focus-ring-animate">
                <SelectValue placeholder="Select date..." />
              </SelectTrigger>
              <SelectContent>
                {getNext30Days().map(date => {
                  try {
                    const dateObj = new Date(date + 'T00:00:00');
                    return (
                      <SelectItem key={date} value={date}>
                        {dateObj.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </SelectItem>
                    );
                  } catch (error) {
                    console.error('Error formatting date:', date, error);
                    return (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    );
                  }
                })}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {doctors.map(doctor => (
                  <div key={doctor} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">{doctor}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkCreate(selectedDate || today, doctor)}
                      disabled={bulkCreateMutation.isPending}
                      className="w-full"
                    >
                      Create Full Day
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Time Slot Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Time Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              min={today}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="form-field-animate focus-ring-animate">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="form-field-animate focus-ring-animate">
                                <SelectValue placeholder="Select doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors.map(doctor => (
                                <SelectItem key={doctor} value={doctor}>
                                  {doctor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="slotType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slot Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-field-animate focus-ring-animate">
                                  <SelectValue placeholder="Select slot type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Appointment</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="followup">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                className="form-field-animate focus-ring-animate"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxBookings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Bookings</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1" 
                                className="form-field-animate focus-ring-animate"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Special requirements" className="form-field-animate focus-ring-animate" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button
                        type="submit"
                        disabled={createTimeSlotMutation.isPending}
                        className="flex-1 button-animate"
                      >
                        {createTimeSlotMutation.isPending ? 'Adding...' : 'Add Slot'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="button-animate"
                        onClick={() => {
                          setShowForm(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Time Slots Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarCheck className="w-5 h-5 mr-2" />
                Available Time Slots - {new Date(selectedDate || today).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                  ))}
                </div>
              ) : availableTimeSlots && availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTimeSlots.map((slot) => (
                    <Card key={slot.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">{slot.time}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {slot.duration || 30}min
                            </Badge>
                          </div>
                          <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                            {slot.isAvailable ? "Available" : "Blocked"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">{slot.doctorName}</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {slot.slotType || 'general'}
                          </Badge>
                        </div>
                        {slot.notes && (
                          <p className="text-xs text-gray-500 mb-2">{slot.notes}</p>
                        )}
                        <div className="text-xs text-gray-400 mb-2">
                          Max: {slot.maxBookings || 1} | Current: {slot.currentBookings || 0}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={slot.isAvailable}
                              onCheckedChange={(checked) => 
                                updateAvailabilityMutation.mutate({ 
                                  id: slot.id, 
                                  isAvailable: checked 
                                })
                              }
                              disabled={updateAvailabilityMutation.isPending}
                            />
                            <span className="text-sm text-gray-600">Available</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this time slot?')) {
                                deleteTimeSlotMutation.mutate(slot.id);
                              }
                            }}
                            disabled={deleteTimeSlotMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Time Slots Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create time slots for this date to allow patient bookings.
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}