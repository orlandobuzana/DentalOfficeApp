import {
  users,
  appointments,
  teamMembers,
  resources,
  chatbotResponses,
  timeSlots,
  procedures,
  promotions,
  forms,
  payments,
  patientPoints,
  achievements,
  patientAchievements,
  pointsHistory,
  challenges,
  patientChallenges,
  type User,
  type UpsertUser,
  type InsertAppointment,
  type Appointment,
  type InsertTeamMember,
  type TeamMember,
  type InsertResource,
  type Resource,
  type InsertChatbotResponse,
  type ChatbotResponse,
  type InsertTimeSlot,
  type TimeSlot,
  type InsertProcedure,
  type Procedure,
  type InsertPromotion,
  type Promotion,
  type InsertForm,
  type Form,
  type InsertPayment,
  type Payment,
  type PatientPoints,
  type InsertPatientPoints,
  type Achievement,
  type InsertAchievement,
  type PatientAchievement,
  type InsertPatientAchievement,
  type PointsHistory,
  type InsertPointsHistory,
  type Challenge,
  type InsertChallenge,
  type PatientChallenge,
  type InsertPatientChallenge,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  cleanupMissedAppointments(appointmentIds: string[]): Promise<{ count: number }>;
  
  // Team member operations
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(): Promise<TeamMember[]>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<void>;
  
  // Resource operations
  createResource(resource: InsertResource): Promise<Resource>;
  getResources(): Promise<Resource[]>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: string): Promise<void>;
  
  // Additional user operations
  getAllUsers(): Promise<User[]>;
  
  // Chatbot operations
  getChatbotResponses(): Promise<ChatbotResponse[]>;
  findChatbotResponse(keywords: string[]): Promise<ChatbotResponse | undefined>;
  createChatbotResponse(response: InsertChatbotResponse): Promise<ChatbotResponse>;
  updateChatbotResponse(id: string, response: Partial<InsertChatbotResponse>): Promise<ChatbotResponse | undefined>;
  deleteChatbotResponse(id: string): Promise<void>;
  
  // Time slot operations
  getTimeSlots(date: string): Promise<TimeSlot[]>;
  createTimeSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: string, updates: Partial<InsertTimeSlot>): Promise<TimeSlot | undefined>;
  deleteTimeSlot(id: string): Promise<void>;
  createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]>;
  
  // Procedure operations
  getProcedures(): Promise<Procedure[]>;
  createProcedure(procedure: InsertProcedure): Promise<Procedure>;
  updateProcedure(id: string, procedure: Partial<InsertProcedure>): Promise<Procedure | undefined>;
  deleteProcedure(id: string): Promise<void>;
  
  // Promotion operations
  getPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: string): Promise<void>;
  
  // Form operations
  getForms(): Promise<Form[]>;
  getActiveFormsByCategory(category: string): Promise<Form[]>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: string): Promise<void>;

  // Payment operations
  getPaymentsByPatientId(patientId: string): Promise<Payment[]>;
  createPayment(paymentData: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
  
  // Gamification operations
  getOrCreatePatientPoints(userId: string): Promise<PatientPoints>;
  awardPoints(userId: string, points: number, action: string, description: string): Promise<PatientPoints>;
  getPointsHistory(userId: string): Promise<PointsHistory[]>;
  getAchievements(): Promise<Achievement[]>;
  getPatientAchievements(userId: string): Promise<PatientAchievement[]>;
  checkAndAwardAchievements(userId: string): Promise<PatientAchievement[]>;
  getChallenges(): Promise<Challenge[]>;
  getPatientChallenges(userId: string): Promise<PatientChallenge[]>;
  updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<PatientChallenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Appointment operations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.appointmentDate));
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  // Cleanup missed appointments
  async cleanupMissedAppointments(appointmentIds: string[]): Promise<{ count: number }> {
    const result = await db
      .update(appointments)
      .set({ status: 'missed' })
      .where(inArray(appointments.id, appointmentIds))
      .returning({ id: appointments.id });
    
    return { count: result.length };
  }

  // Team member operations
  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.displayOrder));
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set({ ...member, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db
      .update(teamMembers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
  }

  // Resource operations
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  async getResources(): Promise<Resource[]> {
    return await db
      .select()
      .from(resources)
      .where(eq(resources.isActive, true))
      .orderBy(asc(resources.displayOrder));
  }

  async updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updated] = await db
      .update(resources)
      .set({ ...resource, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return updated;
  }

  async deleteResource(id: string): Promise<void> {
    await db
      .update(resources)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(resources.id, id));
  }

  // Chatbot operations
  async getChatbotResponses(): Promise<ChatbotResponse[]> {
    return await db
      .select()
      .from(chatbotResponses)
      .where(eq(chatbotResponses.isActive, true));
  }

  async findChatbotResponse(keywords: string[]): Promise<ChatbotResponse | undefined> {
    const responses = await this.getChatbotResponses();
    
    // Simple keyword matching - find response with most matching keywords
    let bestMatch: ChatbotResponse | undefined;
    let bestScore = 0;
    
    for (const response of responses) {
      let score = 0;
      const responseKeywords = response.keywords || [];
      
      for (const keyword of keywords) {
        if (responseKeywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))) {
          score++;
        }
        if (response.question.toLowerCase().includes(keyword.toLowerCase())) {
          score++;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = response;
      }
    }
    
    return bestMatch;
  }

  async createChatbotResponse(responseData: InsertChatbotResponse): Promise<ChatbotResponse> {
    const [response] = await db
      .insert(chatbotResponses)
      .values(responseData)
      .returning();
    return response;
  }

  async updateChatbotResponse(id: string, responseData: Partial<InsertChatbotResponse>): Promise<ChatbotResponse | undefined> {
    const [updated] = await db
      .update(chatbotResponses)
      .set({ ...responseData, updatedAt: new Date() })
      .where(eq(chatbotResponses.id, id))
      .returning();
    return updated;
  }

  async deleteChatbotResponse(id: string): Promise<void> {
    await db
      .update(chatbotResponses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(chatbotResponses.id, id));
  }

  // Time slot operations
  async getTimeSlots(date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.date, date))
      .orderBy(asc(timeSlots.time));
  }

  async createTimeSlot(slotData: InsertTimeSlot): Promise<TimeSlot> {
    const [slot] = await db
      .insert(timeSlots)
      .values(slotData)
      .returning();
    return slot;
  }

  async updateTimeSlot(id: string, updates: Partial<InsertTimeSlot>): Promise<TimeSlot | undefined> {
    const [updated] = await db
      .update(timeSlots)
      .set(updates)
      .where(eq(timeSlots.id, id))
      .returning();
    return updated;
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await db
      .delete(timeSlots)
      .where(eq(timeSlots.id, id));
  }

  async createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]> {
    return await db
      .insert(timeSlots)
      .values(slots)
      .returning();
  }

  // Procedure operations
  async getProcedures(): Promise<Procedure[]> {
    return await db
      .select()
      .from(procedures)
      .where(eq(procedures.isActive, true))
      .orderBy(asc(procedures.displayOrder), asc(procedures.name));
  }

  async createProcedure(procedureData: InsertProcedure): Promise<Procedure> {
    const [procedure] = await db
      .insert(procedures)
      .values(procedureData)
      .returning();
    return procedure;
  }

  async updateProcedure(id: string, procedureData: Partial<InsertProcedure>): Promise<Procedure | undefined> {
    const [updated] = await db
      .update(procedures)
      .set({ ...procedureData, updatedAt: new Date() })
      .where(eq(procedures.id, id))
      .returning();
    return updated;
  }

  async deleteProcedure(id: string): Promise<void> {
    await db
      .update(procedures)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(procedures.id, id));
  }

  // Promotion operations
  async getPromotions(): Promise<Promotion[]> {
    return await db
      .select()
      .from(promotions)
      .where(eq(promotions.isActive, true))
      .orderBy(asc(promotions.displayOrder), desc(promotions.validUntil));
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const currentDate = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          gte(promotions.validUntil, currentDate)
        )
      )
      .orderBy(asc(promotions.displayOrder));
  }

  async createPromotion(promotionData: InsertPromotion): Promise<Promotion> {
    const [promotion] = await db
      .insert(promotions)
      .values(promotionData)
      .returning();
    return promotion;
  }

  async updatePromotion(id: string, promotionData: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const [updated] = await db
      .update(promotions)
      .set({ ...promotionData, updatedAt: new Date() })
      .where(eq(promotions.id, id))
      .returning();
    return updated;
  }

  async deletePromotion(id: string): Promise<void> {
    await db
      .update(promotions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(promotions.id, id));
  }

  // Form operations
  async getForms(): Promise<Form[]> {
    return await db
      .select()
      .from(forms)
      .where(eq(forms.isActive, true))
      .orderBy(asc(forms.category), asc(forms.displayOrder), asc(forms.title));
  }

  async getActiveFormsByCategory(category: string): Promise<Form[]> {
    return await db
      .select()
      .from(forms)
      .where(
        and(
          eq(forms.isActive, true),
          eq(forms.category, category)
        )
      )
      .orderBy(asc(forms.displayOrder), asc(forms.title));
  }

  async createForm(formData: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values(formData)
      .returning();
    return form;
  }

  async updateForm(id: string, formData: Partial<InsertForm>): Promise<Form | undefined> {
    const [updated] = await db
      .update(forms)
      .set({ ...formData, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updated;
  }

  async deleteForm(id: string): Promise<void> {
    await db
      .update(forms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(forms.id, id));
  }

  // Payment operations
  async getPaymentsByPatientId(patientId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.patientId, patientId))
      .orderBy(desc(payments.paymentDate));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
  }

  // Gamification operations
  async getOrCreatePatientPoints(userId: string): Promise<PatientPoints> {
    let [points] = await db.select().from(patientPoints).where(eq(patientPoints.userId, userId));
    
    if (!points) {
      [points] = await db
        .insert(patientPoints)
        .values({ userId, points: 0, level: 1, totalPointsEarned: 0, streakDays: 0 })
        .returning();
    }
    
    return points;
  }

  async awardPoints(userId: string, points: number, action: string, description: string): Promise<PatientPoints> {
    // Get or create patient points
    const currentPoints = await this.getOrCreatePatientPoints(userId);
    
    // Calculate new points and level
    const newTotalPoints = currentPoints.totalPointsEarned + points;
    const newCurrentPoints = currentPoints.points + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // 100 points per level
    
    // Update patient points
    const [updatedPoints] = await db
      .update(patientPoints)
      .set({
        points: newCurrentPoints,
        totalPointsEarned: newTotalPoints,
        level: newLevel,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(patientPoints.userId, userId))
      .returning();

    // Record points history
    await db.insert(pointsHistory).values({
      userId,
      points,
      action,
      description,
    });

    // Check for achievements
    await this.checkAndAwardAchievements(userId);
    
    return updatedPoints;
  }

  async getPointsHistory(userId: string): Promise<PointsHistory[]> {
    return await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt));
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(asc(achievements.category), asc(achievements.requirement));
  }

  async getPatientAchievements(userId: string): Promise<PatientAchievement[]> {
    return await db
      .select()
      .from(patientAchievements)
      .where(eq(patientAchievements.userId, userId))
      .orderBy(desc(patientAchievements.earnedAt));
  }

  async checkAndAwardAchievements(userId: string): Promise<PatientAchievement[]> {
    const newAchievements: PatientAchievement[] = [];
    const allAchievements = await this.getAchievements();
    const existingAchievements = await this.getPatientAchievements(userId);
    const existingIds = existingAchievements.map(a => a.achievementId);
    
    const patientPointsData = await this.getOrCreatePatientPoints(userId);
    const totalAppointments = await this.getAppointmentsByPatient(userId);
    const completedAppointments = totalAppointments.filter(a => a.status === 'completed');
    
    for (const achievement of allAchievements) {
      if (existingIds.includes(achievement.id)) continue;
      
      let shouldAward = false;
      let progress = 0;
      
      switch (achievement.category) {
        case 'points':
          progress = patientPointsData.totalPointsEarned;
          shouldAward = progress >= achievement.requirement;
          break;
        case 'appointments':
          progress = completedAppointments.length;
          shouldAward = progress >= achievement.requirement;
          break;
        case 'level':
          progress = patientPointsData.level;
          shouldAward = progress >= achievement.requirement;
          break;
        case 'streak':
          progress = patientPointsData.streakDays;
          shouldAward = progress >= achievement.requirement;
          break;
      }
      
      if (shouldAward) {
        const [newAchievement] = await db
          .insert(patientAchievements)
          .values({
            userId,
            achievementId: achievement.id,
            progress: achievement.requirement,
          })
          .returning();
        
        // Award bonus points for achievement
        if (achievement.pointsReward > 0) {
          await this.awardPoints(userId, achievement.pointsReward, 'achievement', `Unlocked: ${achievement.name}`);
        }
        
        newAchievements.push(newAchievement);
      }
    }
    
    return newAchievements;
  }

  async getChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return await db
      .select()
      .from(challenges)
      .where(and(
        eq(challenges.isActive, true),
        gte(challenges.endDate, now)
      ))
      .orderBy(asc(challenges.type), asc(challenges.endDate));
  }

  async getPatientChallenges(userId: string): Promise<PatientChallenge[]> {
    return await db
      .select()
      .from(patientChallenges)
      .where(eq(patientChallenges.userId, userId))
      .orderBy(desc(patientChallenges.startedAt));
  }

  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<PatientChallenge | undefined> {
    // Get or create patient challenge
    let [patientChallenge] = await db
      .select()
      .from(patientChallenges)
      .where(and(
        eq(patientChallenges.userId, userId),
        eq(patientChallenges.challengeId, challengeId)
      ));

    if (!patientChallenge) {
      [patientChallenge] = await db
        .insert(patientChallenges)
        .values({ userId, challengeId, progress: 0 })
        .returning();
    }

    // Get challenge details
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId));

    if (!challenge) return undefined;

    const newProgress = Math.min(progress, challenge.requirement);
    const isCompleted = newProgress >= challenge.requirement && !patientChallenge.completed;

    const [updatedChallenge] = await db
      .update(patientChallenges)
      .set({
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : patientChallenge.completedAt,
      })
      .where(eq(patientChallenges.id, patientChallenge.id))
      .returning();

    // Award points if challenge is completed
    if (isCompleted) {
      await this.awardPoints(userId, challenge.pointsReward, 'challenge', `Completed: ${challenge.name}`);
    }

    return updatedChallenge;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db
      .insert(challenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }
}

export const storage = new DatabaseStorage();
