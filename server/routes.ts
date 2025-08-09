import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

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

  // Appointment routes
  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const appointmentData = {
        ...req.body,
        patientId: userId,
        status: 'pending'
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // Award points for booking appointment
      await storage.awardPoints(userId, 10, 'appointment_booked', 'Booked a new appointment');
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = (req as any).user;
      
      let appointments;
      if (user.claims.role === 'admin') {
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

  app.patch("/api/appointments/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Award points for completing appointment
      if (status === 'completed') {
        await storage.awardPoints(appointment.patientId, 25, 'appointment_completed', 'Completed appointment');
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Gamification routes
  app.get("/api/gamification/points", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const points = await storage.getOrCreatePatientPoints(userId);
      res.json(points);
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });

  app.get("/api/gamification/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const history = await storage.getPointsHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  app.get("/api/gamification/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const achievements = await storage.getPatientAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/gamification/challenges", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const challenges = await storage.getPatientChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Admin routes for gamification
  app.post("/api/admin/achievements", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const achievement = await storage.createAchievement(req.body);
      res.status(201).json(achievement);
    } catch (error) {
      console.error("Error creating achievement:", error);
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.post("/api/admin/challenges", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const challenge = await storage.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  // Team routes
  app.get("/api/team", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const teamMember = await storage.createTeamMember(req.body);
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const resource = await storage.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Chatbot routes
  app.get("/api/chatbot", async (req, res) => {
    try {
      const { keywords } = req.query;
      if (keywords) {
        const keywordArray = (keywords as string).split(',').map(k => k.trim().toLowerCase());
        const response = await storage.findChatbotResponse(keywordArray);
        res.json(response || { message: "Sorry, I don't have information about that. Please contact our office for assistance." });
      } else {
        const responses = await storage.getChatbotResponses();
        res.json(responses);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      res.status(500).json({ message: "Failed to fetch chatbot response" });
    }
  });

  // Procedure routes
  app.get("/api/procedures", async (req, res) => {
    try {
      const procedures = await storage.getProcedures();
      res.json(procedures);
    } catch (error) {
      console.error("Error fetching procedures:", error);
      res.status(500).json({ message: "Failed to fetch procedures" });
    }
  });

  app.post("/api/procedures", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const procedure = await storage.createProcedure(req.body);
      res.status(201).json(procedure);
    } catch (error) {
      console.error("Error creating procedure:", error);
      res.status(500).json({ message: "Failed to create procedure" });
    }
  });

  app.put("/api/procedures/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const procedure = await storage.updateProcedure(id, req.body);
      
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      
      res.json(procedure);
    } catch (error) {
      console.error("Error updating procedure:", error);
      res.status(500).json({ message: "Failed to update procedure" });
    }
  });

  app.delete("/api/procedures/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      await storage.deleteProcedure(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting procedure:", error);
      res.status(500).json({ message: "Failed to delete procedure" });
    }
  });

  // Promotion routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const promotion = await storage.createPromotion(req.body);
      res.status(201).json(promotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.put("/api/promotions/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const promotion = await storage.updatePromotion(id, req.body);
      
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  app.delete("/api/promotions/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      await storage.deletePromotion(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      res.status(500).json({ message: "Failed to delete promotion" });
    }
  });

  // Form routes
  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.post("/api/forms", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const form = await storage.createForm(req.body);
      res.status(201).json(form);
    } catch (error) {
      console.error("Error creating form:", error);
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.put("/api/forms/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const form = await storage.updateForm(id, req.body);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Error updating form:", error);
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      await storage.deleteForm(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).json({ message: "Failed to delete form" });
    }
  });

  // Payment routes
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // If admin, return all payments, otherwise just the patient's payments
      const payments = user.claims.role === 'admin' 
        ? await storage.getPayments()
        : await storage.getPaymentsByPatientId(userId);
      
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Initialize default data
  app.post("/api/initialize", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Initialize default achievements
      const defaultAchievements = [
        {
          id: 'first-appointment',
          name: 'First Visit',
          description: 'Complete your first dental appointment',
          icon: '🦷',
          pointsReward: 50,
          category: 'appointments',
          requirement: 1,
          isActive: true
        },
        {
          id: 'regular-visitor',
          name: 'Regular Visitor',
          description: 'Complete 5 dental appointments',
          icon: '⭐',
          pointsReward: 100,
          category: 'appointments',
          requirement: 5,
          isActive: true
        },
        {
          id: 'points-collector',
          name: 'Points Collector',
          description: 'Earn your first 100 points',
          icon: '💎',
          pointsReward: 25,
          category: 'points',
          requirement: 100,
          isActive: true
        },
        {
          id: 'level-up',
          name: 'Level Up',
          description: 'Reach Level 5',
          icon: '🏆',
          pointsReward: 200,
          category: 'level',
          requirement: 5,
          isActive: true
        }
      ];

      // Initialize default challenges
      const defaultChallenges = [
        {
          id: 'monthly-checkup',
          name: 'Monthly Checkup',
          description: 'Book and complete a checkup this month',
          icon: '📅',
          pointsReward: 75,
          type: 'monthly',
          requirement: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      ];

      // Create achievements and challenges
      for (const achievement of defaultAchievements) {
        try {
          await storage.createAchievement(achievement);
        } catch (error) {
          // Achievement might already exist, skip
        }
      }

      for (const challenge of defaultChallenges) {
        try {
          await storage.createChallenge(challenge);
        } catch (error) {
          // Challenge might already exist, skip
        }
      }

      res.json({ message: "Gamification system initialized successfully" });
    } catch (error) {
      console.error("Error initializing gamification:", error);
      res.status(500).json({ message: "Failed to initialize gamification system" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}