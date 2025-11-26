import { pgTable, text, serial, integer, boolean, varchar, timestamp, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Enums
export const appRoleEnum = pgEnum("app_role", ["admin", "cliente"]);

// Users table (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Profiles table (user profiles with roles)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().unique(),
  email: text("email"),
  nome: text("nome"),
  tipo_usuario: appRoleEnum("tipo_usuario").notNull().default("cliente"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
  updated_at: timestamp("updated_at").notNull().default(sql`now()`),
});

// Clientes table (customer data)
export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  telefone: text("telefone"),
  email: text("email"),
  endereco: text("endereco"),
  placa_veiculo: text("placa_veiculo"),
  account_status: text("account_status").default("pending_activation"),
  email_verified: boolean("email_verified").default(false),
  last_login_at: timestamp("last_login_at"),
  login_attempts: integer("login_attempts").default(0),
  locked_until: timestamp("locked_until"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
  updated_at: timestamp("updated_at").notNull().default(sql`now()`),
});

// Documentos table (document management)
export const documentos = pgTable("documentos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cliente_id: uuid("cliente_id").references(() => clientes.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull().default("pendente"),
  uploaded_by: varchar("uploaded_by"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
  updated_at: timestamp("updated_at").notNull().default(sql`now()`),
});

// Security audit logs
export const security_audit_logs = pgTable("security_audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id"),
  action: text("action").notNull(),
  resource_type: text("resource_type").notNull(),
  resource_id: uuid("resource_id"),
  details: jsonb("details"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

// Authentication attempts tracking
export const auth_attempts = pgTable("auth_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email"),
  identifier: text("identifier"), // for client logins (placa/cpf combination)
  attempt_type: text("attempt_type").notNull(), // 'admin' or 'client'
  success: boolean("success").notNull().default(false),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

// API rate limiting
export const api_rate_limits = pgTable("api_rate_limits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ip_address: text("ip_address").notNull(),
  endpoint: text("endpoint").notNull(),
  request_count: integer("request_count").notNull().default(1),
  window_start: timestamp("window_start").notNull().default(sql`now()`),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export const insertClienteSchema = createInsertSchema(clientes);
export const selectClienteSchema = createSelectSchema(clientes);

export const insertDocumentoSchema = createInsertSchema(documentos);
export const selectDocumentoSchema = createSelectSchema(documentos);

export const insertSecurityAuditLogSchema = createInsertSchema(security_audit_logs);
export const insertAuthAttemptSchema = createInsertSchema(auth_attempts);
export const insertApiRateLimitSchema = createInsertSchema(api_rate_limits);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;

export type SecurityAuditLog = typeof security_audit_logs.$inferSelect;
export type AuthAttempt = typeof auth_attempts.$inferSelect;
export type ApiRateLimit = typeof api_rate_limits.$inferSelect;