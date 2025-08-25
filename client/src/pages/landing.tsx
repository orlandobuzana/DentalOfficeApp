import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Users, FileText, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Heart className="text-blue-600 text-5xl mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">SmileCare Dental</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive dental care solution with easy appointment booking, 
              patient portal, and educational resources all in one place.
            </p>
            <div className="space-y-4">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg"
                >
                  Sign In to Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-lg text-gray-600">Comprehensive dental care management at your fingertips</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Interactive calendar with real-time availability for seamless appointment scheduling.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Expert Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Meet our qualified dental professionals dedicated to your oral health.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Access educational materials and guides for optimal dental care.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Smart Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get instant answers to common dental questions with our chatbot.</p>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}
