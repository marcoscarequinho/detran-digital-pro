import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  profiles, 
  clientes, 
  documentos, 
  security_audit_logs,
  auth_attempts,
  api_rate_limits,
  generateId,
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Cliente,
  type InsertCliente,
  type Documento,
  type InsertDocumento,
  type SecurityAuditLog,
  type AuthAttempt,
  type ApiRateLimit
} from "../shared/schema-sqlite";

// Enhanced interface with full application CRUD methods
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  
  // Clientes
  getCliente(id: string): Promise<Cliente | undefined>;
  getClienteByPlacaCpf(placa: string, cpf: string): Promise<Cliente | undefined>;
  getAllClientes(): Promise<Cliente[]>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: string, updates: Partial<Cliente>): Promise<Cliente | undefined>;
  
  // Documentos
  getDocumentosByCliente(clienteId: string): Promise<Documento[]>;
  createDocumento(documento: InsertDocumento): Promise<Documento>;
  updateDocumento(id: string, updates: Partial<Documento>): Promise<Documento | undefined>;
  
  // Security & Auditing
  logSecurityEvent(log: Omit<SecurityAuditLog, "id" | "created_at">): Promise<void>;
  logAuthAttempt(attempt: Omit<AuthAttempt, "id" | "created_at">): Promise<void>;
  checkRateLimit(ipAddress: string, endpoint: string): Promise<boolean>;
  updateRateLimit(ipAddress: string, endpoint: string): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await db.insert(users).values(insertUser);
    const result = await db.select().from(users).where(eq(users.username, insertUser.username!)).limit(1);
    return result[0];
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.user_id, userId)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const profileWithId = { ...profile, id: profile.id || generateId() };
    await db.insert(profiles).values(profileWithId);
    const result = await db.select().from(profiles).where(eq(profiles.id, profileWithId.id!)).limit(1);
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    await db.update(profiles)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(profiles.user_id, userId));
    const result = await db.select().from(profiles).where(eq(profiles.user_id, userId)).limit(1);
    return result[0];
  }

  // Clientes
  async getCliente(id: string): Promise<Cliente | undefined> {
    const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    return result[0];
  }

  async getClienteByPlacaCpf(placa: string, cpf: string): Promise<Cliente | undefined> {
    const result = await db.select().from(clientes)
      .where(and(eq(clientes.placa_veiculo, placa), eq(clientes.cpf, cpf)))
      .limit(1);
    return result[0];
  }

  async getAllClientes(): Promise<Cliente[]> {
    return await db.select().from(clientes);
  }

  async createCliente(cliente: InsertCliente): Promise<Cliente> {
    const clienteWithId = { ...cliente, id: cliente.id || generateId() };
    await db.insert(clientes).values(clienteWithId);
    const result = await db.select().from(clientes).where(eq(clientes.id, clienteWithId.id!)).limit(1);
    return result[0];
  }

  async updateCliente(id: string, updates: Partial<Cliente>): Promise<Cliente | undefined> {
    await db.update(clientes)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(clientes.id, id));
    const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    return result[0];
  }

  // Documentos
  async getDocumentosByCliente(clienteId: string): Promise<Documento[]> {
    return await db.select().from(documentos).where(eq(documentos.cliente_id, clienteId));
  }

  async createDocumento(documento: InsertDocumento): Promise<Documento> {
    const documentoWithId = { ...documento, id: documento.id || generateId() };
    await db.insert(documentos).values(documentoWithId);
    const result = await db.select().from(documentos).where(eq(documentos.id, documentoWithId.id!)).limit(1);
    return result[0];
  }

  async updateDocumento(id: string, updates: Partial<Documento>): Promise<Documento | undefined> {
    await db.update(documentos)
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where(eq(documentos.id, id));
    const result = await db.select().from(documentos).where(eq(documentos.id, id)).limit(1);
    return result[0];
  }

  // Security & Auditing
  async logSecurityEvent(log: Omit<SecurityAuditLog, "id" | "created_at">): Promise<void> {
    await db.insert(security_audit_logs).values({
      action: log.action,
      resource_type: log.resource_type || null,
      resource_id: log.resource_id || null,
      user_id: log.user_id || null,
      ip_address: log.ip_address || null,
      user_agent: log.user_agent || null,
      details: log.details ? JSON.stringify(log.details) : null,
    });
  }

  async logAuthAttempt(attempt: Omit<AuthAttempt, "id" | "created_at">): Promise<void> {
    await db.insert(auth_attempts).values({
      identifier: attempt.identifier || null,
      email: attempt.email || null,
      attempt_type: attempt.attempt_type,
      success: attempt.success,
      ip_address: attempt.ip_address || null,
      error_message: attempt.error_message || null,
    });
  }

  async checkRateLimit(ipAddress: string, endpoint: string): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const result = await db.select().from(api_rate_limits)
      .where(and(
        eq(api_rate_limits.ip_address, ipAddress),
        eq(api_rate_limits.endpoint, endpoint)
      ));
    
    const totalRequests = result.reduce((sum, record) => {
      return record.created_at > oneMinuteAgo ? sum + record.request_count : sum;
    }, 0);
    
    return totalRequests < 15; // Allow 15 requests per minute
  }

  async updateRateLimit(ipAddress: string, endpoint: string): Promise<void> {
    const existing = await db.select().from(api_rate_limits)
      .where(and(
        eq(api_rate_limits.ip_address, ipAddress),
        eq(api_rate_limits.endpoint, endpoint)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(api_rate_limits)
        .set({ 
          request_count: existing[0].request_count + 1,
          created_at: new Date().toISOString()
        })
        .where(eq(api_rate_limits.id, existing[0].id));
    } else {
      await db.insert(api_rate_limits).values({
        ip_address: ipAddress,
        endpoint: endpoint,
        request_count: 1,
        window_start: new Date().toISOString(),
      });
    }
  }
}

export const storage = new PostgresStorage();