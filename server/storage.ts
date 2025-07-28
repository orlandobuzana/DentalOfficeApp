import {
  users,
  appointments,
  teamMembers,
  resources,
  chatbotResponses,
  timeSlots,
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
  
  // Time slot operations
  getTimeSlots(date: string): Promise<TimeSlot[]>;
  updateTimeSlot(id: string, isAvailable: boolean): Promise<TimeSlot | undefined>;
  createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]>;
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

  // Time slot operations
  async getTimeSlots(date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.date, date))
      .orderBy(asc(timeSlots.time));
  }

  async updateTimeSlot(id: string, isAvailable: boolean): Promise<TimeSlot | undefined> {
    const [updated] = await db
      .update(timeSlots)
      .set({ isAvailable })
      .where(eq(timeSlots.id, id))
      .returning();
    return updated;
  }

  async createTimeSlots(slots: InsertTimeSlot[]): Promise<TimeSlot[]> {
    return await db
      .insert(timeSlots)
      .values(slots)
      .returning();
  }
}

export const storage = new DatabaseStorage();
