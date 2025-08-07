import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Calendar, Percent, DollarSign, Image } from "lucide-react";
import { PromotionForm } from "./promotion-form";
import { apiRequest } from "@/lib/queryClient";
import { type Promotion } from "@shared/schema";

export function PromotionList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "Success",
        description: "Promotion deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete promotion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (cents: number | null) => {
    if (!cents) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);
    return now >= validFrom && now <= validUntil && promotion.isActive;
  };

  const isExpired = (promotion: Promotion) => {
    const now = new Date();
    const validUntil = new Date(promotion.validUntil);
    return now > validUntil;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Promotions</CardTitle>
            <CardDescription>
              Manage your promotional offers and special deals
            </CardDescription>
          </div>
          <PromotionForm />
        </div>
      </CardHeader>
      <CardContent>
        {promotions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No promotions found. Create your first promotion to attract more patients.
            </p>
            <PromotionForm />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {promotion.bannerImageUrl && (
                        <div className="w-12 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <Image className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{promotion.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {promotion.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {promotion.discountPercent && (
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 mr-1" />
                          {promotion.discountPercent}%
                        </div>
                      )}
                      {promotion.discountAmountCents && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatPrice(promotion.discountAmountCents)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(promotion.validFrom)} - {formatDate(promotion.validUntil)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isExpired(promotion) ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : isActive(promotion) ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Scheduled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PromotionForm promotion={promotion} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(promotion.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}