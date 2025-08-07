import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Info } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Form } from "@shared/schema";
import { useEffect } from "react";

export default function Forms() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to access patient forms.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: forms = [], isLoading: formsLoading, error } = useQuery<Form[]>({
    queryKey: ['/api/forms'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Session Expired",
        description: "Please log in again to access forms.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (form: Form) => {
    toast({
      title: "Download Started",
      description: `Downloading ${form.fileName}...`,
    });
    
    // In a real application, this would handle proper file downloads
    const link = document.createElement('a');
    link.href = form.fileUrl;
    link.download = form.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Group forms by category
  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, Form[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Patient Forms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Download and complete the necessary forms before your appointment. 
            This helps us provide you with the best care possible.
          </p>
        </div>

        {/* Information Card */}
        <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to Use These Forms
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                  <li>• Download the forms you need for your appointment type</li>
                  <li>• Fill them out completely and bring them to your appointment</li>
                  <li>• Forms can be printed and filled by hand, or completed digitally</li>
                  <li>• Contact us if you have questions about any form</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {formsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No Forms Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are currently no forms available for download. 
                Please contact us if you need specific forms.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedForms).map(([category, categoryForms]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-sm">
                      {formatCategory(category)}
                    </Badge>
                    <CardTitle className="text-lg">
                      {formatCategory(category)} Forms
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {category === 'pre-appointment' && 'Forms to complete before your visit'}
                    {category === 'post-treatment' && 'Information and care instructions after treatment'}
                    {category === 'insurance' && 'Insurance and billing related forms'}
                    {category === 'general' && 'General forms and documents'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryForms.map((form) => (
                      <div 
                        key={form.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="h-5 w-5 text-red-600" />
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {form.title}
                              </h4>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              {form.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Updated {formatDate(form.updatedAt)}
                              </span>
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {form.fileName}
                              </code>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownload(form)}
                            className="ml-4 flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}