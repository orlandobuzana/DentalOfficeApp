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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertPromotionSchema, type Promotion } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPromotionSchema.extend({
  discountAmount: z.string().transform((val) => val ? parseInt(val) * 100 : undefined), // Convert to cents
  discountPercent: z.string().transform((val) => val ? parseInt(val) : undefined),
});

type FormData = z.infer<typeof formSchema>;

interface PromotionFormProps {
  promotion?: Promotion;
  trigger?: React.ReactNode;
}

export function PromotionForm({ promotion, trigger }: PromotionFormProps) {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercent: "",
      discountAmount: "",
      bannerImageUrl: "",
      validFrom: "",
      validUntil: "",
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (promotion) {
      const validFrom = promotion.validFrom ? new Date(promotion.validFrom).toISOString().split('T')[0] : "";
      const validUntil = promotion.validUntil ? new Date(promotion.validUntil).toISOString().split('T')[0] : "";
      
      form.reset({
        title: promotion.title,
        description: promotion.description,
        discountPercent: promotion.discountPercent?.toString() || "",
        discountAmount: promotion.discountAmountCents ? (promotion.discountAmountCents / 100).toString() : "",
        bannerImageUrl: promotion.bannerImageUrl || "",
        validFrom,
        validUntil,
        displayOrder: promotion.displayOrder || 0,
      });
      
      if (promotion.bannerImageUrl) {
        setImagePreview(promotion.bannerImageUrl);
      }
    }
  }, [promotion, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      let finalData = { ...data };
      
      // Handle image upload if there's a file
      if (imageFile) {
        // For now, we'll use a placeholder URL. In a real app, you'd upload to your image service
        finalData.bannerImageUrl = `/images/promotions/${Date.now()}_${imageFile.name}`;
      }
      
      const method = promotion ? 'PUT' : 'POST';
      const url = promotion ? `/api/promotions/${promotion.id}` : '/api/promotions';
      await apiRequest(method, url, finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "Success",
        description: `Promotion ${promotion ? 'updated' : 'created'} successfully!`,
      });
      setOpen(false);
      form.reset();
      setImageFile(null);
      setImagePreview("");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promotion ? "Edit Promotion" : "Add New Promotion"}
          </DialogTitle>
          <DialogDescription>
            {promotion ? "Update the promotion details." : "Create a new promotional offer for your patients."}
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
                    <Input placeholder="e.g., Summer Whitening Special" {...field} />
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
                      placeholder="Detailed description of the promotion offer..."
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
                    <FormLabel>Discount Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="20"
                        {...field}
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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
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
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Banner Image</FormLabel>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageFile && (
                  <span className="text-sm text-gray-600">{imageFile.name}</span>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setImageFile(null);
                  setImagePreview("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? (promotion ? "Updating..." : "Creating...")
                  : (promotion ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}