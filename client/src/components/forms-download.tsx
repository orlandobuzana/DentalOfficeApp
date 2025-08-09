import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Form } from "@shared/schema";

export function FormsDownload() {
  const { toast } = useToast();
  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ['/api/forms'],
  });

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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (form: Form) => {
    try {
      // Show download start notification
      toast({
        title: "Download Started",
        description: `Downloading ${form.fileName}...`,
      });

      // Create download link and trigger download
      const link = document.createElement('a');
      
      // If the fileUrl starts with a protocol, use it directly
      // Otherwise, assume it's a relative path and prepend the base URL
      if (form.fileUrl.startsWith('http://') || form.fileUrl.startsWith('https://')) {
        link.href = form.fileUrl;
      } else {
        // Handle relative paths - in a real app this would be your file storage URL
        link.href = `${window.location.origin}/forms/${form.fileName}`;
      }
      
      link.download = form.fileName;
      link.target = '_blank'; // Open in new tab as fallback
      
      // Temporarily add to DOM, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification after a brief delay
      setTimeout(() => {
        toast({
          title: "Download Complete",
          description: `${form.fileName} has been downloaded successfully.`,
        });
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group forms by category
  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, Form[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Download Forms
          </CardTitle>
          <CardDescription>Access patient forms and documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading forms...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Download Forms
          </CardTitle>
          <CardDescription>Access patient forms and documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Forms Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Patient forms are not currently available for download.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Download Forms
        </CardTitle>
        <CardDescription>
          Download patient forms and documents for your appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedForms).map(([category, categoryForms]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">
                  {formatCategory(category)}
                </h3>
                <Badge variant="outline">{categoryForms.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryForms.map((form) => (
                  <Card key={form.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <h4 className="font-medium text-sm truncate">
                              {form.title}
                            </h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {form.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(form.createdAt)}
                            </div>
                            <div className="truncate">
                              {form.fileName}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleDownload(form)}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Important Notes
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Please complete all forms before your appointment</li>
                <li>• Bring completed forms with you or email them in advance</li>
                <li>• Contact our office if you have questions about any form</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}