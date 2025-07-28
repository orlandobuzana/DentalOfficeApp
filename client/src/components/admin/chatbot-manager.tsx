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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MessageSquare, Tags } from "lucide-react";

interface ChatbotResponse {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
}

const chatbotResponseSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  keywords: z.string().min(1, "Please enter at least one keyword"),
  isActive: z.boolean().default(true),
});

type ChatbotResponseData = z.infer<typeof chatbotResponseSchema>;

interface ChatbotManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotManager({ isOpen, onClose }: ChatbotManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingResponse, setEditingResponse] = useState<ChatbotResponse | null>(null);

  const form = useForm<ChatbotResponseData>({
    resolver: zodResolver(chatbotResponseSchema),
    defaultValues: {
      question: "",
      answer: "",
      keywords: "",
      isActive: true,
    },
  });

  const { data: responses, isLoading } = useQuery<ChatbotResponse[]>({
    queryKey: ["/api/chatbot-responses"],
    retry: false,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ChatbotResponseData) => {
      const payload = {
        ...data,
        keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k),
      };
      await apiRequest('POST', '/api/chatbot-responses', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-responses'] });
      setShowForm(false);
      setEditingResponse(null);
      form.reset();
      toast({
        title: "Success",
        description: "Chatbot response created successfully",
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
        description: "Failed to create chatbot response",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ChatbotResponseData & { id: string }) => {
      const payload = {
        ...data,
        keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k),
      };
      await apiRequest('PUT', `/api/chatbot-responses/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-responses'] });
      setShowForm(false);
      setEditingResponse(null);
      form.reset();
      toast({
        title: "Success",
        description: "Chatbot response updated successfully",
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
        description: "Failed to update chatbot response",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/chatbot-responses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-responses'] });
      toast({
        title: "Success",
        description: "Chatbot response deleted successfully",
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
        description: "Failed to delete chatbot response",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChatbotResponseData) => {
    if (editingResponse) {
      updateMutation.mutate({ ...data, id: editingResponse.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (response: ChatbotResponse) => {
    setEditingResponse(response);
    form.reset({
      question: response.question,
      answer: response.answer,
      keywords: response.keywords.join(', '),
      isActive: response.isActive,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingResponse(null);
    form.reset({
      question: "",
      answer: "",
      keywords: "",
      isActive: true,
    });
    setShowForm(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Manage Chatbot Responses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Button */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Manage the questions and answers that the chatbot can respond to.
            </p>
            <Button onClick={handleAdd} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Response
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingResponse ? 'Edit Response' : 'Add New Response'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="What are your office hours?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Our office hours are Monday-Friday 8AM-6PM..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="hours, open, closed, time, schedule"
                            />
                          </FormControl>
                          <p className="text-sm text-gray-500">
                            Enter keywords that will trigger this response, separated by commas
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setEditingResponse(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? 'Saving...'
                          : editingResponse
                          ? 'Update Response'
                          : 'Add Response'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Responses List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : responses && responses.length > 0 ? (
              responses.map((response) => (
                <Card key={response.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {response.question}
                        </h3>
                        <p className="text-gray-600 mb-3 text-sm">
                          {response.answer}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Tags className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {response.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(response)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this response?')) {
                              deleteMutation.mutate(response.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Chatbot Responses
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add some questions and answers for the chatbot to help patients.
                  </p>
                  <Button onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Response
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}