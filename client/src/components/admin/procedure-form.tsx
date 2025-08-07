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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertProcedureSchema, type Procedure } from "@shared/schema";
import { z } from "zod";

const formSchema = insertProcedureSchema.extend({
  price: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      return val ? parseInt(val) * 100 : undefined;
    }
    return val ? val * 100 : undefined;
  }),
}).omit({ priceCents: true });

type FormData = z.infer<typeof formSchema>;

interface ProcedureFormProps {
  procedure?: Procedure;
  trigger?: React.ReactNode;
}

export function ProcedureForm({ procedure, trigger }: ProcedureFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      category: "general",
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (procedure) {
      form.reset({
        name: procedure.name,
        description: procedure.description || "",
        duration: procedure.duration,
        price: procedure.priceCents ? (procedure.priceCents / 100) : 0,
        category: procedure.category,
        displayOrder: procedure.displayOrder || 0,
      });
    }
  }, [procedure, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = procedure ? 'PUT' : 'POST';
      const url = procedure ? `/api/procedures/${procedure.id}` : '/api/procedures';
      
      // Transform the data for the backend
      const { price, ...restData } = data;
      const submitData = {
        ...restData,
        priceCents: price,
      };
      
      await apiRequest(method, url, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/procedures'] });
      toast({
        title: "Success",
        description: `Procedure ${procedure ? 'updated' : 'created'} successfully!`,
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${procedure ? 'update' : 'create'} procedure. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const defaultTrigger = procedure ? (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Procedure
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {procedure ? "Edit Procedure" : "Add New Procedure"}
          </DialogTitle>
          <DialogDescription>
            {procedure ? "Update the procedure information." : "Add a new dental procedure to your services."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedure Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Root Canal Therapy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the procedure..."
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
                control={form.control}
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
                        <SelectItem value="general">General Dentistry</SelectItem>
                        <SelectItem value="cosmetic">Cosmetic Dentistry</SelectItem>
                        <SelectItem value="oral-surgery">Oral Surgery</SelectItem>
                        <SelectItem value="orthodontics">Orthodontics</SelectItem>
                        <SelectItem value="endodontics">Endodontics</SelectItem>
                        <SelectItem value="periodontics">Periodontics</SelectItem>
                        <SelectItem value="pedodontics">Pediatric Dentistry</SelectItem>
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
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? (procedure ? "Updating..." : "Creating...")
                  : (procedure ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}