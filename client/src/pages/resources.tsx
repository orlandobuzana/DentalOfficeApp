import Navigation from "@/components/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Play, Eye, Book, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  imageUrl?: string;
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <Download className="w-4 h-4" />;
    case 'video':
      return <Play className="w-4 h-4" />;
    case 'infographic':
      return <Eye className="w-4 h-4" />;
    default:
      return <Book className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'bg-blue-100 text-blue-800';
    case 'video':
      return 'bg-green-100 text-green-800';
    case 'infographic':
      return 'bg-purple-100 text-purple-800';
    case 'article':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getActionText = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'Download';
    case 'video':
      return 'Watch';
    case 'infographic':
      return 'View';
    default:
      return 'Read';
  }
};

export default function Resources() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    retry: false,
  });

  // Default resources for demo purposes when no resources are available
  const defaultResources: Resource[] = [
    {
      id: '1',
      title: 'Daily Oral Care Guide',
      description: 'Learn the best practices for maintaining excellent oral hygiene at home.',
      type: 'PDF',
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    },
    {
      id: '2',
      title: 'Understanding Root Canals',
      description: 'A comprehensive guide to root canal procedures and what to expect.',
      type: 'Video',
      imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    },
    {
      id: '3',
      title: 'Nutrition for Healthy Teeth',
      description: 'Discover which foods promote dental health and which to avoid.',
      type: 'Infographic',
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    },
    {
      id: '4',
      title: 'Emergency Dental Care',
      description: 'What to do in case of dental emergencies and when to seek immediate care.',
      type: 'Article',
      imageUrl: 'https://pixabay.com/get/g89cc2cae7164c22b9510ca84e0ca1fa30c5c0b09a4d75bfb8327f2f64189756a0271e4e662adc771349d41ff80e994066cbc272e907e22ad5ddb9733c574e5ae_1280.jpg',
    },
    {
      id: '5',
      title: 'Post-Treatment Care',
      description: 'Instructions for caring for your teeth after various dental procedures.',
      type: 'PDF',
      imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    },
    {
      id: '6',
      title: 'Insurance & Billing',
      description: 'Understanding your dental insurance benefits and our billing process.',
      type: 'Article',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    },
  ];

  const displayResources = resources && resources.length > 0 ? resources : defaultResources;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Patient Resources</h2>
          <p className="text-gray-600">Educational materials and helpful information for your dental health</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse bg-gray-200 h-48"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                    <div className="flex space-x-2">
                      <Link href={`/resources/${resource.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {resource.fileUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                          onClick={() => window.open(resource.fileUrl, '_blank')}
                        >
                          {getTypeIcon(resource.type)}
                          <span className="ml-1">{getActionText(resource.type)}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && displayResources.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
              <p className="text-gray-600">Check back later for educational materials and resources.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
