import {
  users,
  appointments,
  teamMembers,
  resources,
  chatbotResponses,
  timeSlots,
  procedures,
  promotions,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  
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
}

export const storage = new DatabaseStorage();
