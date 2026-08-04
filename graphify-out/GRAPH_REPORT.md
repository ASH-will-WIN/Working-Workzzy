# Graph Report - .  (2026-08-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 775 nodes · 968 edges · 64 communities (54 shown, 10 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `efe437e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dashboard.js
- useAuth
- paymentController.js
- Stripe Connect Onboarding Fix - Implementation Summary
- Working-Workzzy Codebase Analysis
- Icon Size Reduction Design Document
- dependencies
- Stripe Connect Onboarding Fix Design
- Codebase Bug Fixes Design Document
- Babel Parser Syntax Error Fix
- Job Application Interface Enhancement Design
- SVG Icon Scaling Debug Design
- messageController.js
- index.js
- AppDelegate
- dependencies
- jobController.js
- dependencies
- Job Image Feature - Complete Implementation Summary
- App.js
- Learn More
- webhookController.js
- authController.js
- connectApi.js
- applicationController.js
- review.js
- auth.js
- manifest.json
- report.js
- db.js
- Staging.js
- connect.js
- Data Flow and Control Flow
- webhook.js
- test-basic-stripe.js
- test-connection.js
- test-stripe-live.js
- capacitor.config.ts
- Package.swift
- README.md
- verify-stripe-key.js
- test_workflow.sh script

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `Working-Workzzy Codebase Analysis` - 14 edges
3. `Dashboard()` - 13 edges
4. `JobDetail()` - 13 edges
5. `Stripe Connect Onboarding Fix - Implementation Summary` - 13 edges
6. `Icon Size Reduction Design Document` - 11 edges
7. `Stripe Connect Onboarding Fix Design` - 11 edges
8. `AppDelegate` - 10 edges
9. `apiClient` - 10 edges
10. `Codebase Bug Fixes Design Document` - 10 edges

## Surprising Connections (you probably didn't know these)
- `JobDetail()` --calls--> `sendMessage()`  [EXTRACTED]
  client/src/pages/JobDetail.js → client/src/api/messageApi.js
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/ProtectedRoute.js → client/src/context/AuthContext.js
- `StartConversation()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/StartConversation.js → client/src/context/AuthContext.js
- `CreateJob()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/CreateJob.js → client/src/context/AuthContext.js
- `Dashboard()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/Dashboard.js → client/src/context/AuthContext.js

## Import Cycles
- None detected.

## Communities (64 total, 10 thin omitted)

### Community 0 - "Dashboard.js"
Cohesion: 0.07
Nodes (42): react, apiClient, acceptApplication(), createApplication(), getApplicationsForJob(), getMyApplications(), rejectApplication(), withdrawApplication() (+34 more)

### Community 1 - "useAuth"
Cohesion: 0.08
Nodes (27): forgotPassword(), loginUser(), registerUser(), resetPassword(), getConversationMessages(), getConversations(), getUnreadCount(), markConversationAsRead() (+19 more)

### Community 2 - "paymentController.js"
Cohesion: 0.07
Nodes (30): AUDIENCES, enroll(), getActiveLeaderboard(), { getActiveSeason }, getMyLeaderboardStatus(), { prisma }, prizes, publicEntry() (+22 more)

### Community 3 - "Stripe Connect Onboarding Fix - Implementation Summary"
Cohesion: 0.05
Nodes (40): 1. Database Migration, 1. Database Schema Updates, 1. Registration/Login, 2. Backend API Consolidation, 2. Dashboard Status Check, 2. Start Services, 3. Onboarding Process, 3. Test Flow (+32 more)

### Community 4 - "Working-Workzzy Codebase Analysis"
Cohesion: 0.06
Nodes (36): API Client Architecture, API Integration Layer, API Modules Structure, API Request Interceptors, Application Processing Logic, Architecture Limitations, Architecture Strengths, Authentication & Authorization (+28 more)

### Community 5 - "Icon Size Reduction Design Document"
Cohesion: 0.05
Nodes (36): Accessibility Considerations, Application Status Indicators, Component-Specific Changes, Connect Flow Icons, Cross-Platform Testing, Current Icon Size Issues, Dashboard Component Icons, Empty State Improvements (+28 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): browserslist, development, production, dependencies, axios, browser-image-compression, @capacitor/cli, @capacitor/core (+26 more)

### Community 7 - "Stripe Connect Onboarding Fix Design"
Cohesion: 0.06
Nodes (30): API Endpoints Reference, Architecture, Business Logic Layer, Component Architecture, Component Hierarchy, Connect Service Architecture, Consolidated Connect API, Core Business Rules (+22 more)

### Community 8 - "Codebase Bug Fixes Design Document"
Cohesion: 0.07
Nodes (29): 1. Authentication Middleware - Duplicate Property Assignment, 2. Payment Controller - Missing Field Validation, 3. Application Controller - Debug Code Left in Production, 4. API Client - Missing Error Handling and Token Management, 5. Database Schema - Missing Indexes and Constraints, 6. Job Controller - Inconsistent Authentication Pattern, 7. Frontend Authentication Context - Token Persistence Issues, Additional Security Measures (+21 more)

### Community 9 - "Babel Parser Syntax Error Fix"
Cohesion: 0.07
Nodes (28): 1. Immediate Fix Strategy, 2. File-Specific Corrections, 3. Validation Process, 4. Prevention Measures, Affected Components, Architecture, Babel Parser Syntax Error Fix, Build Process Flow (+20 more)

### Community 10 - "Job Application Interface Enhancement Design"
Cohesion: 0.08
Nodes (23): Better Application Management, Better Job Cards, Better Job Detail Page (JobDetail.js), Button Styles, Cleaner Application Cards, Cleaner Application Form, Enhanced Dashboard Experience, Enhanced Job Information Display (+15 more)

### Community 11 - "SVG Icon Scaling Debug Design"
Cohesion: 0.09
Nodes (22): Configuration Fix Strategy, Icon Sizing Standards, Implementation Approach, Implementation Guidelines, Implementation Steps, Overview, Phase 1: Configuration Fix, Phase 2: Icon Audit (+14 more)

### Community 12 - "messageController.js"
Cohesion: 0.14
Nodes (18): getConversationMessages(), getConversations(), { getUserPhoneNumber, sendSMS }, markConversationAsRead(), markMessageAsRead(), { prisma }, sendMessage(), auth (+10 more)

### Community 13 - "index.js"
Cohesion: 0.09
Nodes (21): allowedOrigins, app, applicationRoutes, authRoutes, connectRoutes, cors, { createClient }, express (+13 more)

### Community 14 - "AppDelegate"
Cohesion: 0.13
Nodes (13): Any, Bool, Capacitor, AppDelegate, NSUserActivity, UIApplication, UIApplicationDelegate, UIKit (+5 more)

### Community 15 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, pg, postman, prisma, @prisma/client, stripe, twilio, devDependencies (+10 more)

### Community 16 - "jobController.js"
Cohesion: 0.11
Nodes (5): {
  prisma,
  JobStatus,
  ApplicationStatus,
  DepositStatus,
  supabase,
}, authMiddleware, express, jobController, router

### Community 17 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, cors, dotenv, express, @prisma/client, socket.io, stripe, @supabase/supabase-js (+10 more)

### Community 18 - "Job Image Feature - Complete Implementation Summary"
Cohesion: 0.11
Nodes (17): 1. **Enhanced Job Listing Page** (`client/src/pages/JobsList.js`), 2. **Improved Job Creation Flow** (`client/src/pages/CreateJob.js`), 3. **Enhanced Backend Job Listing** (`server/controllers/jobController.js`), 4. **Added CSS Utilities** (`client/src/index.css`), API Endpoints, Database Storage, For Job Applicants (Workers):, For Job Posters (Hirers): (+9 more)

### Community 19 - "App.js"
Cohesion: 0.24
Nodes (9): enrollInLeaderboard(), getActiveLeaderboard(), getMyLeaderboardStatus(), App(), Navbar(), AUDIENCES, formatCountdown(), Leaderboard() (+1 more)

### Community 20 - "Learn More"
Cohesion: 0.14
Nodes (13): Advanced Configuration, Analyzing the Bundle Size, Available Scripts, Code Splitting, Deployment, Getting Started with Create React App, Learn More, Making a Progressive Web App (+5 more)

### Community 21 - "webhookController.js"
Cohesion: 0.26
Nodes (10): getStatus(), { prisma, stripeClient }, refreshStatus(), syncAccountStatus(), handleAccountDeauthorized(), handleAccountUpdated(), handleCapabilityUpdated(), handleStripeWebhook() (+2 more)

### Community 22 - "authController.js"
Cohesion: 0.17
Nodes (5): { supabase, prisma }, authController, authMiddleware, express, router

### Community 25 - "review.js"
Cohesion: 0.22
Nodes (5): { prisma, JobStatus, ApplicationStatus }, authMiddleware, express, reviewController, router

### Community 26 - "auth.js"
Cohesion: 0.22
Nodes (6): supabase, { supabase }, applicationController, authMiddleware, express, router

### Community 27 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 28 - "report.js"
Cohesion: 0.25
Nodes (5): { prisma }, authMiddleware, express, reportController, router

### Community 29 - "db.js"
Cohesion: 0.25
Nodes (7): { createClient }, dotenv, {
  JobStatus,
  PaymentStatus,
  ApplicationStatus,
  DepositStatus,
}, { PrismaClient }, requiredEnvVars, sanitizedSecretKey, stripe

### Community 30 - "Staging.js"
Cohesion: 0.33
Nodes (3): cases, faqs, testimonials

### Community 31 - "connect.js"
Cohesion: 0.40
Nodes (4): authMiddleware, connectController, express, router

### Community 32 - "Data Flow and Control Flow"
Cohesion: 0.50
Nodes (3): Control Flow, Data Flow, Data Flow and Control Flow

### Community 33 - "webhook.js"
Cohesion: 0.50
Nodes (3): express, router, webhookController

## Knowledge Gaps
- **366 isolated node(s):** `config`, `UIKit`, `Capacitor`, `PackageDescription`, `name` (+361 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `Dashboard.js`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `react` connect `Dashboard.js` to `dependencies`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `UIKit`, `Capacitor` to the rest of the system?**
  _367 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07490079365079365 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.07529411764705882 - nodes in this community are weakly interconnected._
- **Should `paymentController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06755260243632337 - nodes in this community are weakly interconnected._
- **Should `Stripe Connect Onboarding Fix - Implementation Summary` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._