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
import { insertPromotionSchema, type Promotion } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPromotionSchema.extend({
  discountAmount: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      return val ? parseInt(val) * 100 : undefined;
    }
    return val ? val * 100 : undefined;
  }),
}).omit({ discountAmountCents: true });

type FormData = z.infer<typeof formSchema>;

interface PromotionFormProps {
  promotion?: Promotion;
  trigger?: React.ReactNode;
}

export function PromotionForm({ promotion, trigger }: PromotionFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercent: 0,
      validFrom: "",
      validUntil: "",
      discountAmount: 0,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (promotion) {
      form.reset({
        title: promotion.title,
        description: promotion.description || "",
        discountPercent: promotion.discountPercent || 0,
        validFrom: promotion.validFrom,
        validUntil: promotion.validUntil,
        discountAmount: promotion.discountAmountCents ? (promotion.discountAmountCents / 100) : 0,
        displayOrder: promotion.displayOrder || 0,
      });
    }
  }, [promotion, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = promotion ? 'PUT' : 'POST';
      const url = promotion ? `/api/promotions/${promotion.id}` : '/api/promotions';
      
      // Transform the data for the backend
      const { discountAmount, ...restData } = data;
      const submitData = {
        ...restData,
        discountAmountCents: discountAmount,
      };
      
      await apiRequest(method, url, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "Success",
        description: `Promotion ${promotion ? 'updated' : 'created'} successfully!`,
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${promotion ? 'update' : 'create'} promotion. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const defaultTrigger = promotion ? (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Promotion
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
            {promotion ? "Edit Promotion" : "Add New Promotion"}
          </DialogTitle>
          <DialogDescription>
            {promotion ? "Update the promotion information." : "Create a new promotional offer for your practice."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New Patient Special" {...field} />
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
                      placeholder="Describe the promotional offer..."
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
                name="discountPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
                        min="0"
                        max="100"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  ? (promotion ? "Updating..." : "Creating...") 
                  : (promotion ? "Update Promotion" : "Create Promotion")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}