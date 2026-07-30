# Graph Report - .  (2026-07-15)

## Corpus Check
- 138 files · ~67,764 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 420 nodes · 640 edges · 42 communities (31 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Auth and API Client
- Applications and Jobs
- Frontend Dependencies
- Backend Routes
- Messaging API
- iOS App Shell
- Messaging UI
- Backend Dependencies
- Job Controller
- Stripe Connect
- Server Configuration
- Job Images
- Supporting Components
- Supporting Components
- PWA Manifest
- Service Configuration
- Supporting Components
- Application Routes
- Auth Routes
- Payment Routes
- Supporting Components
- Supporting Components
- Supporting Components
- Supporting Components
- Supporting Components
- Supporting Components
- Supporting Components
- Supporting Components

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 23 edges
2. `Dashboard()` - 14 edges
3. `JobDetail()` - 12 edges
4. `AppDelegate` - 10 edges
5. `apiClient` - 9 edges
6. `scripts` - 7 edges
7. `ChatWindow()` - 6 edges
8. `MessageCenter()` - 6 edges
9. `syncAccountStatus()` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `JobDetail()` --calls--> `getJobImages()`  [EXTRACTED]
  client/src/pages/JobDetail.js → client/src/api/jobApi.js
- `JobDetail()` --calls--> `sendMessage()`  [EXTRACTED]
  client/src/pages/JobDetail.js → client/src/api/messageApi.js
- `ChatWindow()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/ChatWindow.js → client/src/context/AuthContext.js
- `StartConversation()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/StartConversation.js → client/src/context/AuthContext.js
- `CreateJob()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/CreateJob.js → client/src/context/AuthContext.js

## Import Cycles
- None detected.

## Communities (42 total, 11 thin omitted)

### Community 0 - "Auth and API Client"
Cohesion: 0.06
Nodes (31): apiClient, forgotPassword(), loginUser(), registerUser(), resetPassword(), connectApi, getUnreadCount(), App() (+23 more)

### Community 1 - "Applications and Jobs"
Cohesion: 0.11
Nodes (29): react, acceptApplication(), createApplication(), getApplicationsForJob(), getMyApplications(), rejectApplication(), withdrawApplication(), completeJob() (+21 more)

### Community 2 - "Frontend Dependencies"
Cohesion: 0.06
Nodes (33): browserslist, development, production, dependencies, axios, browser-image-compression, @capacitor/cli, @capacitor/core (+25 more)

### Community 3 - "Backend Routes"
Cohesion: 0.07
Nodes (23): { prisma }, allowedOrigins, app, applicationRoutes, authRoutes, connectRoutes, cors, { createClient } (+15 more)

### Community 4 - "Messaging API"
Cohesion: 0.14
Nodes (18): getConversationMessages(), getConversations(), { getUserPhoneNumber, sendSMS }, markConversationAsRead(), markMessageAsRead(), { prisma }, sendMessage(), auth (+10 more)

### Community 5 - "iOS App Shell"
Cohesion: 0.13
Nodes (13): Any, Bool, Capacitor, AppDelegate, NSUserActivity, UIApplication, UIApplicationDelegate, UIKit (+5 more)

### Community 6 - "Messaging UI"
Cohesion: 0.19
Nodes (12): createConversation(), getConversationMessages(), getConversations(), markConversationAsRead(), sendMessage(), ChatWindow(), TODO: Show error toast, ConversationList() (+4 more)

### Community 7 - "Backend Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, pg, postman, prisma, @prisma/client, stripe, twilio, devDependencies (+10 more)

### Community 8 - "Job Controller"
Cohesion: 0.11
Nodes (5): {
  prisma,
  JobStatus,
  ApplicationStatus,
  DepositStatus,
  supabase,
}, authMiddleware, express, jobController, router

### Community 9 - "Stripe Connect"
Cohesion: 0.16
Nodes (14): getStatus(), { prisma, stripeClient }, refreshStatus(), syncAccountStatus(), handleAccountDeauthorized(), handleAccountUpdated(), handleCapabilityUpdated(), handleStripeWebhook() (+6 more)

### Community 10 - "Server Configuration"
Cohesion: 0.11
Nodes (17): dependencies, cors, dotenv, express, @prisma/client, stripe, @supabase/supabase-js, twilio (+9 more)

### Community 11 - "Job Images"
Cohesion: 0.27
Nodes (9): addJobImage(), createJob(), getJobImages(), getJobs(), uploadImageToBase64(), ImageUpload(), LazyJobImage(), CreateJob() (+1 more)

### Community 14 - "PWA Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 15 - "Service Configuration"
Cohesion: 0.25
Nodes (7): { createClient }, dotenv, {
  JobStatus,
  PaymentStatus,
  ApplicationStatus,
  DepositStatus,
}, { PrismaClient }, requiredEnvVars, sanitizedSecretKey, stripe

### Community 17 - "Application Routes"
Cohesion: 0.40
Nodes (4): applicationController, authMiddleware, express, router

### Community 18 - "Auth Routes"
Cohesion: 0.40
Nodes (4): authController, authMiddleware, express, router

### Community 19 - "Payment Routes"
Cohesion: 0.40
Nodes (4): authMiddleware, express, paymentController, router

## Knowledge Gaps
- **144 isolated node(s):** `config`, `UIKit`, `Capacitor`, `PackageDescription`, `name` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Frontend Dependencies` to `Applications and Jobs`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `react` connect `Applications and Jobs` to `Frontend Dependencies`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `config`, `UIKit`, `Capacitor` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth and API Client` be split into smaller, more focused modules?**
  _Cohesion score 0.056189640035118525 - nodes in this community are weakly interconnected._
- **Should `Applications and Jobs` be split into smaller, more focused modules?**
  _Cohesion score 0.11282051282051282 - nodes in this community are weakly interconnected._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Backend Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._