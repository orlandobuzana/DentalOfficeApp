import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTeamMemberSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, X, Loader2 } from "lucide-react";
import { z } from "zod";

const teamFormSchema = insertTeamMemberSchema.extend({
  displayOrder: z.number().min(0),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  onClose: () => void;
  member?: any;
}

export default function TeamForm({ onClose, member }: TeamFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(member?.imageUrl || null);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: member?.name || "",
      position: member?.position || "",
      bio: member?.bio || "",
      education: member?.education || "",
      imageUrl: member?.imageUrl || "",
      displayOrder: member?.displayOrder || 0,
      isActive: member?.isActive ?? true,
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit - much more reasonable
        toast({
          title: "Error",
          description: "File size must be less than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error", 
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Compress and convert file to base64 for simple storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800x800 for better quality)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% quality for better images
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      let finalData = { ...data };
      
      // If a file is selected, convert to base64 and use as imageUrl
      if (selectedFile) {
        try {
          const base64 = await fileToBase64(selectedFile);
          finalData.imageUrl = base64;
        } catch (error) {
          throw new Error('Failed to process image');
        }
      }
      
      if (member) {
        return apiRequest('PUT', `/api/team/${member.id}`, finalData);
      } else {
        return apiRequest('POST', '/api/team', finalData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      toast({
        title: "Success",
        description: `Team member ${member ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error('Team member creation/update error:', error);
      
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
      
      // Handle specific error messages
      let errorMessage = error.message || `Failed to ${member ? 'update' : 'create'} team member`;
      
      if (errorMessage.includes('413') || errorMessage.includes('entity too large')) {
        errorMessage = "Image file is too large. Please use a smaller image (under 25MB).";
      } else if (errorMessage.includes('400')) {
        errorMessage = "Invalid data provided. Please check all required fields.";
      } else if (errorMessage.includes('500')) {
        errorMessage = "Server error. Please try again or contact support.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamFormData) => {
    console.log('Form data being submitted:', data);
    console.log('Form validation errors:', form.formState.errors);
    
    // Validate required fields locally first
    if (!data.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.position?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Position is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.bio?.trim()) {
      toast({
        title: "Validation Error",
        description: "Bio is required",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Dr. John Smith" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Lead Dentist" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief professional biography..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Harvard School of Dental Medicine" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <FormLabel>Profile Photo</FormLabel>
          
          {/* Photo Preview */}
          {previewUrl && (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  form.setValue('imageUrl', '');
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Upload Button */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </Button>
            <p className="text-sm text-gray-500">
              Upload a professional photo (max 5MB, JPG/PNG)
            </p>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {/* Alternative: Image URL input */}
          <div className="pt-4 border-t">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Or enter Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      placeholder="https://example.com/photo.jpg"
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value && !selectedFile) {
                          setPreviewUrl(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending 
              ? (member ? "Updating..." : "Creating...") 
              : (member ? "Update" : "Create")
            }
          </Button>
        </div>
        </form>
      </Form>
    </div>
  );
}
