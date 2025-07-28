import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertAppointmentSchema,
  insertTeamMemberSchema,
  insertResourceSchema,
  insertTimeSlotSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin promotion route (for initial setup)
  app.post('/api/auth/promote-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user role to admin
      const updatedUser = await storage.upsertUser({
        ...user,
        role: 'admin'
      });
      
      res.json({ message: "User promoted to admin", user: updatedUser });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: userId
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  app.get('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let appointments;
      if (user?.role === 'admin') {
        appointments = await storage.getAllAppointments();
      } else {
        appointments = await storage.getAppointmentsByPatient(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.patch('/api/appointments/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  // Team member routes (admin only)
  app.get('/api/team', async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/team', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(400).json({ message: "Failed to create team member" });
    }
  });

  app.put('/api/team/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const memberData = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(req.params.id, memberData);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(400).json({ message: "Failed to update team member" });
    }
  });

  app.delete('/api/team/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(400).json({ message: "Failed to delete team member" });
    }
  });

  // Resource routes
  app.get('/api/resources', async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post('/api/resources', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      res.json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(400).json({ message: "Failed to create resource" });
    }
  });

  app.put('/api/resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const resourceData = insertResourceSchema.partial().parse(req.body);
      const resource = await storage.updateResource(req.params.id, resourceData);
      res.json(resource);
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(400).json({ message: "Failed to update resource" });
    }
  });

  app.delete('/api/resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.deleteResource(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(400).json({ message: "Failed to delete resource" });
    }
  });

  // Chatbot routes
  app.post('/api/chatbot/query', async (req, res) => {
    try {
      const { message } = req.body;
      const keywords = message.toLowerCase().split(' ').filter((word: string) => word.length > 2);
      
      const response = await storage.findChatbotResponse(keywords);
      
      if (response) {
        res.json({ answer: response.answer });
      } else {
        res.json({ 
          answer: "Thank you for your question. For specific inquiries, please call our office at (555) 123-4567 or schedule an appointment." 
        });
      }
    } catch (error) {
      console.error("Error processing chatbot query:", error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  // Time slots routes
  app.get('/api/timeslots/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const timeSlots = await storage.getTimeSlots(date);
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Initialize some default data
  app.post('/api/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Initialize chatbot responses
      const chatbotResponses = [
        {
          question: "What are your office hours?",
          answer: "Our office hours are Monday-Friday 8AM-6PM, Saturday 9AM-3PM. We're closed on Sundays.",
          keywords: ["hours", "open", "closed", "time", "schedule"]
        },
        {
          question: "How do I prepare for my appointment?",
          answer: "Please arrive 15 minutes early, bring your insurance card and ID, and avoid eating 2 hours before certain procedures.",
          keywords: ["prepare", "appointment", "ready", "before", "instructions"]
        },
        {
          question: "What insurance do you accept?",
          answer: "We accept most major dental insurance plans including Delta Dental, Aetna, Cigna, and MetLife. Please call to verify your specific plan.",
          keywords: ["insurance", "accept", "plans", "coverage", "dental"]
        }
      ];

      // Create default time slots for the next 30 days
      const timeSlots = [];
      const doctors = ["Dr. Sarah Johnson", "Dr. Mike Chen", "Dr. James Wilson"];
      const times = ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"];
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        for (const time of times) {
          for (const doctor of doctors) {
            timeSlots.push({
              date: dateStr,
              time,
              doctorName: doctor,
              isAvailable: Math.random() > 0.3 // 70% availability
            });
          }
        }
      }

      await storage.createTimeSlots(timeSlots);
      res.json({ success: true, message: "Default data initialized" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
