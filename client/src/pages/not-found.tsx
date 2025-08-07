import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Smile, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      {/* Watermark Logo - hidden when admin panel is open */}
      {!isAdminRoute && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="text-center">
            <Smile className="h-96 w-96 text-blue-600 mb-8 mx-auto" />
            <div className="text-8xl font-bold text-blue-600">SmileCare</div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Smile className="h-16 w-16 text-blue-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SmileCare Dental</h1>
                <p className="text-sm text-gray-600">Your Trusted Dental Care Partner</p>
              </div>
            </div>

            <div className="mb-6">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Oops! We're still setting things up
              </h2>
              <p className="text-gray-600">
                Our dental care system is being prepared to serve you better. 
                Please return to the home page to access available features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800">Appointment Booking</div>
                <div className="text-blue-600">Schedule your visit</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800">Patient Portal</div>
                <div className="text-green-600">Manage your care</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800">Dental Resources</div>
                <div className="text-purple-600">Learn about oral health</div>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                SmileCare Dental - Excellence in Oral Healthcare
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
