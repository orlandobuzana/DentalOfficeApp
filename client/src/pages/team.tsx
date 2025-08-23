import Navigation from "@/components/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  education?: string;
  imageUrl?: string;
}

export default function Team() {
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    retry: false,
  });

  // Default team members for demo purposes when no team members are available
  const defaultTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      position: 'Lead Dentist',
      bio: 'Dr. Johnson has over 15 years of experience in general dentistry and specializes in cosmetic procedures. She graduated from Harvard School of Dental Medicine and is committed to providing gentle, comprehensive care.',
      education: 'Harvard School of Dental Medicine',
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
    },
    {
      id: '2',
      name: 'Dr. Mike Chen',
      position: 'Orthodontist',
      bio: 'Specializing in orthodontics and teeth alignment, Dr. Chen brings 12 years of expertise in creating beautiful smiles. He\'s certified in Invisalign and traditional braces treatment.',
      education: 'UCLA School of Dentistry',
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      position: 'Dental Hygienist',
      bio: 'Lisa is passionate about preventive care and patient education. With 8 years of experience, she ensures every cleaning is thorough and comfortable while teaching patients optimal oral hygiene techniques.',
      education: 'Dental Hygiene Program',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      position: 'Oral Surgeon',
      bio: 'Dr. Wilson specializes in oral and maxillofacial surgery including extractions, implants, and corrective jaw surgery. His precise technique and gentle approach ensure optimal patient outcomes.',
      education: 'Johns Hopkins School of Medicine',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
    },
    {
      id: '5',
      name: 'Maria Garcia',
      position: 'Dental Assistant',
      bio: 'Maria supports our clinical team with exceptional skill and warmth. She assists with procedures, manages patient care, and ensures every visit is comfortable and efficient.',
      education: 'Certified Dental Assistant Program',
      imageUrl: 'https://pixabay.com/get/g22247e8abde243f4be1e310045d5ae6f97e60d9f9f9724f9b772ff1f611750f03da2d9b05100f7d5bf1eb81541093f9b8e7a993c9d10d452956403eb354ae85c_1280.jpg',
    },
    {
      id: '6',
      name: 'Jennifer Kim',
      position: 'Office Manager',
      bio: 'Jennifer oversees daily operations and ensures smooth patient experiences from scheduling to billing. Her organizational skills and friendly demeanor make every visit welcoming and stress-free.',
      education: 'Business Administration',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
    },
  ];

  const displayTeamMembers = teamMembers && teamMembers.length > 0 ? teamMembers : defaultTeamMembers;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
          <p className="text-gray-600 mt-2">Dedicated professionals committed to your dental health</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse bg-gray-200 h-64"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded w-1/2"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTeamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={member.imageUrl} 
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  {member.education && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span>{member.education}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && displayTeamMembers.length === 0 && null}
      </div>
    </div>
  );
}
