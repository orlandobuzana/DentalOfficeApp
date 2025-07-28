import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, FileText, Play, Image } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export default function ResourceDetail() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [match, params] = useRoute("/resources/:id");
  const resourceId = params?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: resource, isLoading: resourceLoading } = useQuery<Resource>({
    queryKey: ["/api/resources", resourceId],
    retry: false,
    enabled: !!user && !!resourceId,
  });

  if (isLoading || resourceLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
              <p className="text-gray-600 mb-4">The resource you're looking for doesn't exist.</p>
              <Link href="/resources">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'video':
        return <Play className="w-6 h-6" />;
      case 'infographic':
        return <Image className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const renderContent = () => {
    if (!resource.fileUrl && !resource.imageUrl) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No content available for this resource</p>
        </div>
      );
    }

    if (resource.type === 'pdf' && resource.fileUrl) {
      return (
        <div className="w-full">
          <iframe
            src={resource.fileUrl}
            className="w-full h-96 border border-gray-200 rounded-lg"
            title={resource.title}
          />
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      );
    }

    if (resource.type === 'video' && resource.fileUrl) {
      return (
        <div className="w-full">
          <video
            controls
            className="w-full h-auto rounded-lg border border-gray-200"
            poster={resource.imageUrl}
          >
            <source src={resource.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (resource.imageUrl) {
      return (
        <div className="w-full">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-auto rounded-lg border border-gray-200"
          />
          {resource.fileUrl && (
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original
                </a>
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/resources">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-blue-600">
                  {getTypeIcon(resource.type)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {resource.type}
                </span>
                <span>Added {new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {resource.description}
            </p>
          </CardContent>
        </Card>

        {/* Main Content Display */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}