import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring - must be first
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      if (user && !user.role) {
        // Set user as admin if they don't have a role yet
        user = await storage.updateUser(userId, { role: 'admin' });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/promote-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUserRole(userId, 'admin');
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        success: true,
        message: "User promoted to admin successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "Failed to promote user to admin" });
    }
  });

  // Appointment cleanup endpoint
  app.post("/api/appointments/cleanup", isAuthenticated, async (req, res) => {
    try {
      const { appointmentIds } = req.body;
      
      if (!appointmentIds || !Array.isArray(appointmentIds)) {
        return res.status(400).json({ message: "Invalid appointment IDs" });
      }

      // Update appointments status to 'missed' or delete them
      const result = await storage.cleanupMissedAppointments(appointmentIds);
      
      res.json({ 
        message: "Appointments cleaned up successfully",
        count: result.count 
      });
    } catch (error) {
      console.error("Error cleaning up appointments:", error);
      res.status(500).json({ message: "Failed to clean up appointments" });
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
      console.log('Session user:', user);
      const userId = user.claims.sub;
      
      // Check user role from database 
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(403).json({ message: "User not found" });
      }
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Validate required fields
      if (!req.body.name || !req.body.position || !req.body.bio) {
        return res.status(400).json({ 
          message: "Missing required fields: name, position, and bio are required" 
        });
      }
      
      console.log('About to create team member with:', req.body);
      const teamMember = await storage.createTeamMember(req.body);
      console.log('Created team member:', teamMember);
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      
      // More detailed error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          return res.status(400).json({ message: "A team member with this information already exists" });
        }
        if (error.message.includes('constraint')) {
          return res.status(400).json({ message: "Invalid data format or missing required fields" });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to create team member",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.put("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Check user role from database (not from claims which might be stale)
      const dbUser = await storage.getUser(userId);
      if (!dbUser || dbUser.role !== 'admin') {
        console.log('Access denied - user role:', dbUser?.role || 'no user found');
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      console.log('Updating team member:', id, 'with data:', req.body);
      
      // Validate required fields
      if (!req.body.name || !req.body.position || !req.body.bio) {
        return res.status(400).json({ 
          message: "Missing required fields: name, position, and bio are required" 
        });
      }
      
      const teamMember = await storage.updateTeamMember(id, req.body);
      
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ 
        message: "Failed to update team member",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.delete("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Check user role from database
      const dbUser = await storage.getUser(userId);
      if (!dbUser || dbUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      await storage.deleteTeamMember(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ 
        message: "Failed to delete team member",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
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
      const userId = user.claims.sub;
      
      // Check user role from database (consistent with team member route)
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(403).json({ message: "User not found" });
      }
      if (dbUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      console.log('About to create resource with:', req.body);
      const resource = await storage.createResource(req.body);
      console.log('Created resource:', resource);
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      res.status(500).json({ 
        message: "Failed to create resource",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.put("/api/resources/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Check user role from database
      const dbUser = await storage.getUser(userId);
      if (!dbUser || dbUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      const resource = await storage.updateResource(id, req.body);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ 
        message: "Failed to update resource",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.delete("/api/resources/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Check user role from database
      const dbUser = await storage.getUser(userId);
      if (!dbUser || dbUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { id } = req.params;
      await storage.deleteResource(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ 
        message: "Failed to delete resource",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
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

  // Reminder routes
  app.post("/api/reminders/email", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { appointmentId, email, message, appointmentDetails } = req.body;
      
      if (!appointmentId || !email || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Log the reminder for now (in real app, integrate with email service)
      console.log("Sending email reminder:", {
        appointmentId,
        email,
        message,
        appointmentDetails
      });
      
      // For now, simulate successful email sending
      // In production, integrate with SendGrid, AWS SES, or similar service
      const reminder = {
        id: Date.now().toString(),
        appointmentId,
        type: 'email',
        recipient: email,
        message,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      res.json({
        success: true,
        message: "Email reminder sent successfully",
        reminder
      });
    } catch (error) {
      console.error("Error sending email reminder:", error);
      res.status(500).json({ message: "Failed to send email reminder" });
    }
  });

  app.post("/api/reminders/sms", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { appointmentId, phone, message, appointmentDetails } = req.body;
      
      if (!appointmentId || !phone || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Log the reminder for now (in real app, integrate with SMS service)
      console.log("Sending SMS reminder:", {
        appointmentId,
        phone,
        message,
        appointmentDetails
      });
      
      // For now, simulate successful SMS sending
      // In production, integrate with Twilio, AWS SNS, or similar service
      const reminder = {
        id: Date.now().toString(),
        appointmentId,
        type: 'sms',
        recipient: phone,
        message: message.substring(0, 160), // SMS character limit
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      res.json({
        success: true,
        message: "SMS reminder sent successfully",
        reminder
      });
    } catch (error) {
      console.error("Error sending SMS reminder:", error);
      res.status(500).json({ message: "Failed to send SMS reminder" });
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

  // Time slots routes
  app.get("/api/timeslots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const { procedure } = req.query;
      
      const timeSlots = await storage.getTimeSlots(date);
      
      // Filter by procedure if specified
      let filteredSlots = timeSlots;
      if (procedure) {
        // Get procedure details to determine duration
        const procedures = await storage.getProcedures();
        const selectedProcedure = procedures.find(p => p.name === procedure);
        const duration = selectedProcedure?.duration || 60; // Default 60 minutes
        
        // Filter slots based on procedure duration and availability
        filteredSlots = timeSlots.filter(slot => {
          if (!slot.isAvailable) return false;
          
          // Check if there are enough consecutive slots for the procedure
          const slotTime = new Date(`${date}T${convertTo24Hour(slot.time)}`);
          const endTime = new Date(slotTime.getTime() + duration * 60000);
          
          // For now, just return available slots - can be enhanced with more complex logic
          return true;
        });
      }
      
      res.json(filteredSlots);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      res.status(500).json({ message: "Failed to fetch timeslots" });
    }
  });

  // Get available time slots for next 7 days (for one-click booking)
  app.get("/api/time-slots/available", async (req, res) => {
    try {
      const availableSlots = [];
      const today = new Date();
      
      // Get slots for next 7 days
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const slots = await storage.getTimeSlots(dateStr);
        const available = slots.filter(slot => slot.isAvailable);
        availableSlots.push(...available);
      }
      
      res.json(availableSlots);
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      res.status(500).json({ message: "Failed to fetch available time slots" });
    }
  });

  app.post("/api/timeslots", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Check user role from database instead of claims
      const dbUser = await storage.getUser(userId);
      console.log("Creating time slot - DB user role:", dbUser?.role);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      if (dbUser?.role !== 'admin') {
        console.log("Access denied - user is not admin in database");
        return res.status(403).json({ message: "Admin access required" });
      }
      
      console.log("Creating time slot with data:", req.body);
      const timeSlot = await storage.createTimeSlot(req.body);
      console.log("Time slot created successfully:", timeSlot);
      res.status(201).json(timeSlot);
    } catch (error) {
      console.error("Error creating timeslot:", error);
      const err = error as Error;
      console.error("Error details:", err.message);
      console.error("Stack trace:", err.stack);
      res.status(500).json({ message: "Failed to create timeslot", error: err.message });
    }
  });

  app.post("/api/timeslots/bulk", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { timeSlots: slotsData } = req.body;
      const timeSlots = [];
      
      for (const slotData of slotsData) {
        const timeSlot = await storage.createTimeSlot({
          date: slotData.date,
          time: slotData.time,
          doctorName: slotData.doctorName,
          isAvailable: slotData.isAvailable || true,
          slotType: slotData.slotType || 'general',
          duration: slotData.duration || 30,
          maxBookings: slotData.maxBookings || 1,
          notes: slotData.notes || ''
        });
        timeSlots.push(timeSlot);
      }
      
      res.status(201).json(timeSlots);
    } catch (error) {
      console.error("Error creating bulk timeslots:", error);
      res.status(500).json({ message: "Failed to create bulk timeslots" });
    }
  });

  // Helper function to convert time to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hoursNum = parseInt(hours, 10);
    
    if (hoursNum === 12) {
      hoursNum = 0;
    }
    
    if (modifier === 'PM') {
      hoursNum = hoursNum + 12;
    }
    
    return `${String(hoursNum).padStart(2, '0')}:${minutes}:00`;
  };

  // Reports routes
  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { type, startDate, endDate } = req.query;
      
      let reportData = {};
      
      switch (type) {
        case 'appointments':
          const appointments = await storage.getAllAppointments();
          const filteredAppointments = appointments.filter((apt: any) => {
            if (startDate && endDate) {
              const aptDate = new Date(apt.appointmentDate);
              return aptDate >= new Date(startDate as string) && aptDate <= new Date(endDate as string);
            }
            return true;
          });
          
          reportData = {
            totalAppointments: filteredAppointments.length,
            confirmedAppointments: filteredAppointments.filter((apt: any) => apt.status === 'confirmed').length,
            pendingAppointments: filteredAppointments.filter((apt: any) => apt.status === 'pending').length,
            cancelledAppointments: filteredAppointments.filter((apt: any) => apt.status === 'cancelled').length,
            appointmentsByTreatment: filteredAppointments.reduce((acc: any, apt: any) => {
              acc[apt.treatmentType] = (acc[apt.treatmentType] || 0) + 1;
              return acc;
            }, {}),
            appointmentsByDoctor: filteredAppointments.reduce((acc: any, apt: any) => {
              acc[apt.doctorName] = (acc[apt.doctorName] || 0) + 1;
              return acc;
            }, {}),
            appointments: filteredAppointments
          };
          break;
          
        case 'payments':
          const payments = await storage.getPayments();
          const filteredPayments = payments.filter((payment: any) => {
            if (startDate && endDate) {
              const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : null;
              if (!paymentDate) return false;
              return paymentDate >= new Date(startDate as string) && paymentDate <= new Date(endDate as string);
            }
            return true;
          });
          
          reportData = {
            totalRevenue: filteredPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0),
            totalInsuranceCovered: filteredPayments.reduce((sum: number, payment: any) => sum + (payment.insuranceCovered || 0), 0),
            totalPatientPaid: filteredPayments.reduce((sum: number, payment: any) => sum + (payment.patientResponsibility || 0), 0),
            paymentsByMethod: filteredPayments.reduce((acc: any, payment: any) => {
              acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + (payment.amount || 0);
              return acc;
            }, {}),
            paymentsByProcedure: filteredPayments.reduce((acc: any, payment: any) => {
              acc[payment.procedureName] = (acc[payment.procedureName] || 0) + (payment.amount || 0);
              return acc;
            }, {}),
            payments: filteredPayments
          };
          break;
          
        case 'patients':
          const allUsers = await storage.getAllUsers();
          const patientUsers = allUsers.filter((user: any) => user.role !== 'admin');
          
          reportData = {
            totalPatients: patientUsers.length,
            newPatientsThisMonth: patientUsers.filter((user: any) => {
              const createdDate = user.createdAt ? new Date(user.createdAt) : null;
              if (!createdDate) return false;
              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              return createdDate >= startOfMonth;
            }).length,
            patients: patientUsers
          };
          break;
          
        default:
          return res.status(400).json({ message: "Invalid report type" });
      }
      
      res.json(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
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