# Replit Configuration for DETRAN Digital Platform

## Overview

This is a full-stack web application for DETRAN (Brazilian vehicle registration authority) services, specifically designed for vehicle documentation and transfer processes between Brazilian states (RJ, SP, ES, MG). The platform serves as a digital despachante (vehicle documentation service) offering streamlined, online processes for vehicle transfers, licensing, and documentation services.

The application combines a modern React frontend with an Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations. It features comprehensive security measures, rate limiting, audit logging, and role-based access control for both administrators and clients.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Library**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: React Router for client-side navigation with dedicated routes for login, dashboard, and public pages
- **Design System**: Professional blue theme optimized for trust and government-style branding

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API structure with comprehensive security middleware
- **Session Management**: Stateless JWT tokens with role-based access control

### Database Schema Design
The system uses a comprehensive PostgreSQL schema with the following key entities:
- **Users**: Basic authentication credentials
- **Profiles**: Extended user information with role-based permissions (admin/cliente)
- **Clientes**: Customer data including vehicle information and contact details
- **Documentos**: Document management system for vehicle paperwork
- **Security Tables**: Audit logs, rate limiting, and security monitoring

### Security Architecture
- **Advanced Rate Limiting**: IP-based throttling with threat detection capabilities
- **Security Audit Logging**: Comprehensive logging of all security events and user actions
- **PII Protection**: Data masking and sanitization for sensitive information
- **Authentication Security**: Multi-layered protection against brute force attacks and unauthorized access
- **CORS Configuration**: Properly configured cross-origin resource sharing

### Business Logic Architecture
The application handles several core vehicle documentation processes:
- **Vehicle Transfer Services**: Inter-state vehicle ownership transfers
- **Digital Licensing**: Online vehicle licensing and renewal
- **Document Management**: CNH renewal, duplicate documents, and vehicle conversions
- **Consultation Services**: Vehicle verification and status checking through external APIs

## External Dependencies

### Database Services
- **NeonDB**: PostgreSQL hosting service for production database
- **Drizzle ORM**: Type-safe database toolkit for schema management and migrations

### Authentication & Security
- **bcryptjs**: Password hashing library for secure credential storage
- **jsonwebtoken**: JWT token generation and validation for session management
- **connect-pg-simple**: PostgreSQL session store integration

### Frontend UI Framework
- **Radix UI**: Comprehensive component library providing accessible, unstyled UI primitives
- **shadcn/ui**: Pre-styled component system built on top of Radix UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Development Tools
- **Vite**: Fast development server and build tool optimized for modern web development
- **TypeScript**: Static type checking across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production builds

### External APIs
- **Vehicle Consultation Services**: Integration with SENATRA and DETRAN APIs for vehicle data verification
- **Payment Processing**: Mercado Pago integration for online payment processing
- **WhatsApp Integration**: Direct customer communication through WhatsApp Business API