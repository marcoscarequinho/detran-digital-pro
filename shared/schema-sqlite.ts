import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Generate simple UUID for SQLite
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Users table (for authentication)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Profiles table (user profiles with roles)
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().unique(),
  nome: text("nome").notNull(),
  email: text("email").unique(),
  telefone: text("telefone"),
  tipo_usuario: text("tipo_usuario").notNull().default("cliente"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Clientes table (customer data)
export const clientes = sqliteTable("clientes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").unique(),
  telefone: text("telefone"),
  cpf: text("cpf").notNull().unique(),
  placa_veiculo: text("placa_veiculo"),
  account_status: text("account_status").default("active"),
  login_attempts: integer("login_attempts").default(0),
  last_login_at: text("last_login_at"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Documentos table (document management)
export const documentos = sqliteTable("documentos", {
  id: text("id").primaryKey(),
  cliente_id: text("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  tipo_documento: text("tipo_documento").notNull(),
  numero_documento: text("numero_documento"),
  status: text("status").default("pending"),
  arquivo_path: text("arquivo_path"),
  observacoes: text("observacoes"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Security audit logs
export const security_audit_logs = sqliteTable("security_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  resource_type: text("resource_type"),
  resource_id: text("resource_id"),
  user_id: text("user_id"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  details: text("details"), // JSON string
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Auth attempts
export const auth_attempts = sqliteTable("auth_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  identifier: text("identifier"),
  email: text("email"),
  attempt_type: text("attempt_type").notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  ip_address: text("ip_address"),
  error_message: text("error_message"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// API rate limits
export const api_rate_limits = sqliteTable("api_rate_limits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip_address: text("ip_address").notNull(),
  endpoint: text("endpoint").notNull(),
  request_count: integer("request_count").default(1),
  window_start: text("window_start").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);
export const insertClienteSchema = createInsertSchema(clientes);
export const selectClienteSchema = createSelectSchema(clientes);
export const insertDocumentoSchema = createInsertSchema(documentos);
export const selectDocumentoSchema = createSelectSchema(documentos);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type Documento = typeof documentos.$inferSelect;
export type InsertDocumento = typeof documentos.$inferInsert;
export type SecurityAuditLog = typeof security_audit_logs.$inferSelect;
export type AuthAttempt = typeof auth_attempts.$inferSelect;
export type ApiRateLimit = typeof api_rate_limits.$inferSelect;

// Helper function to generate IDs
export { generateId };