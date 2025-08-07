import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form as UIForm,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Upload, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertFormSchema, type Form as FormType } from "@shared/schema";
import { z } from "zod";

const formSchema = insertFormSchema;
type FormData = z.infer<typeof formSchema>;

interface FormUploadProps {
  form?: FormType;
  trigger?: React.ReactNode;
}

export function FormUpload({ form, trigger }: FormUploadProps) {
  const [open, setOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formHandler = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileName: "",
      fileUrl: "",
      category: "general",
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (form) {
      formHandler.reset({
        title: form.title,
        description: form.description,
        fileName: form.fileName,
        fileUrl: form.fileUrl,
        category: form.category,
        displayOrder: form.displayOrder || 0,
      });
    }
  }, [form, formHandler]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      setPdfFile(file);
      formHandler.setValue('fileName', file.name);
      
      // In a real app, you would upload the file to your storage service
      // For now, we'll use a placeholder URL
      const fileUrl = `/forms/${Date.now()}_${file.name}`;
      formHandler.setValue('fileUrl', fileUrl);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // In a real application, you would upload the PDF file to your storage service here
      // and get back the actual URL to store in the database
      
      const method = form ? 'PUT' : 'POST';
      const url = form ? `/api/forms/${form.id}` : '/api/forms';
      await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Success",
        description: `Form ${form ? 'updated' : 'uploaded'} successfully!`,
      });
      setOpen(false);
      formHandler.reset();
      setPdfFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${form ? 'update' : 'upload'} form. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!form && !pdfFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate(data);
  };

  const defaultTrigger = form ? (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Upload Form
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {form ? "Edit Form" : "Upload New Form"}
          </DialogTitle>
          <DialogDescription>
            {form ? "Update the form information." : "Upload a PDF form for patients to download."}
          </DialogDescription>
        </DialogHeader>

        <UIForm {...formHandler}>
          <form onSubmit={formHandler.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={formHandler.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Patient Registration Form" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formHandler.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of what this form is for..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formHandler.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pre-appointment">Pre-Appointment</SelectItem>
                        <SelectItem value="post-treatment">Post-Treatment</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formHandler.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>PDF File</FormLabel>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {pdfFile && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-600">{pdfFile.name}</span>
                  </div>
                )}
                {form && form.fileName && !pdfFile && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-600">{form.fileName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setPdfFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? (form ? "Updating..." : "Uploading...")
                  : (form ? "Update" : "Upload")}
              </Button>
            </div>
          </form>
        </UIForm>
      </DialogContent>
    </Dialog>
  );
}