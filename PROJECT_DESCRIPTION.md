# EventSphere - Complete Project Documentation

**EventSphere** is an enterprise-grade, full-stack event management and ticket reservation platform designed to streamline live experience discovery, host event creation, and concurrent ticket booking with real-time inventory management.

---

## 1. Project Overview & Problem Statement

### The Problem
Traditional event ticketing systems face common critical challenges:
1. **Concurrency & Overbooking**: High-demand events often suffer from race conditions where multiple users attempt to reserve the last available seats simultaneously, resulting in overbooking.
2. **Heavy Payload Latency**: Event hosts uploading raw high-resolution smartphone images (5–10MB each) create severe network latency, excessive bandwidth consumption, and server CPU bottlenecks.
3. **Complex Infrastructure Requirements**: Many applications rely on expensive third-party cloud file storage (e.g., AWS S3) and separate frontend/backend deployments that complicate on-premise or local deployments.

### The Solution: EventSphere
EventSphere solves these challenges by combining a high-performance **React 18 (Vite)** frontend with a robust, statically typed **Spring Boot 3.5 (Java 25)** backend and a **MySQL** relational database:
* **ACID-Compliant Booking**: Uses database transactions and inventory constraints to prevent overbooking.
* **Client-Side Image Optimization**: Uses HTML5 Canvas to downscale and compress multiple local photos on the fly before upload (reducing image size by up to 98%).
* **Unified Single-Port Deployment**: The React single-page app is built directly into Spring Boot's static resource layer, allowing the entire application to be served from a single port (`8080`) without CORS overhead.

---

## 2. User Roles & Capabilities

The platform implements Role-Based Access Control (RBAC) with two primary roles:

### 1. Attendees (Registered Users)
* **Discover**: Browse events with real-time keyword search, category filters, and city filters.
* **Attend / Book**: Select ticket quantities through an interactive confirmation dialog with dynamic price calculations.
* **Self-Service Ticketing**: View complete booking receipts, reference codes (`EVS-XXXXXXXX`), and payment statuses.
* **Cancellations**: Cancel bookings within the allowable cancellation window, automatically releasing seats back to the public inventory.
* **Profile Management**: Update user display names and security credentials.

### 2. Event Hosts / Organizers (Any Registered User)
* **Publish Events**: Create events with title, description, category, venue, city, date, start/end times, capacity, and pricing (including Free Admission).
* **Multi-Photo Upload**: Select multiple event photos directly from their computer with live previews and cover photo designation.
* **Edit & Manage**: Update event details or cancel hosted events.

### 3. Administrators (`ADMIN` Role)
* **Analytics Dashboard**: Real-time platform metrics (Total Users, Total Events, Total Bookings, Total Gross Revenue).
* **Event Oversight**: Moderate, edit, or delete any event listed on the platform.
* **Booking Auditing**: View all platform reservations and manage cancellations.
* **User Management**: Inspect registered users and toggle account statuses (Active / Disabled).

---

## 3. Technology Stack & Architectural Justifications

| Component | Technology | Rationale & Tradeoffs |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18** | Virtual DOM, declarative component state, and responsive single-page UX without jarring browser refreshes. |
| **Build & Dev Tool** | **Vite 5** | Sub-second cold startup, native browser ES Modules (ESM), and instant Hot Module Replacement (HMR) replacing legacy Create React App. |
| **Client Routing** | **React Router v6** | Client-side routing with protected route guards enforcing authentication and role privileges. |
| **HTTP Client** | **Axios** | Centralized API client with interceptors that automatically attach JWT tokens and handle `401 Unauthorized` responses. |
| **Backend Engine** | **Spring Boot 3.5.16 (Java 25)** | Enterprise-grade framework offering declarative transactions, robust concurrency control, and dependency injection. |
| **Security** | **Spring Security + JWT** | Stateless authentication using HMAC-SHA signed tokens and BCrypt password hashing; allows horizontal scaling without session replication. |
| **ORM / Data Access** | **Spring Data JPA / Hibernate** | Type-safe repository abstraction, relational entity mapping, and automated timestamp auditing (`AuditableEntity`). |
| **Database** | **MySQL 8.0** | Relational ACID compliance, foreign key integrity, row locking, and `LONGTEXT` support for serialized image arrays. |

---

## 4. System Architecture

EventSphere follows a **3-Tier Layered Architecture**:

```
 [ Presentation Tier ]  React 18 Single Page Application (Client Browser)
          │  HTTP REST (JSON) + Bearer JWT Token
          ▼
 [  Application Tier ]  Spring Boot REST Controllers & Security Filter
          │  Method calls to Service layer
          ▼
 [  Business Logic   ]  Transactional Services (Seat availability, calculations)
          │  Spring Data JPA Repositories
          ▼
 [ Persistence Tier  ]  MySQL Relational Database (users, events, bookings)
```

### Key Architectural Mechanisms

1. **Unified Path Prefixing**: A custom `WebConfig` dynamically prefixes all `@RestController` beans with `/api/` (e.g., `/api/events`, `/api/bookings`), separating backend data endpoints from frontend client routes.
2. **SPA Client Routing Fallback**: A `SpaForwardController` intercepts browser requests to non-API URLs (e.g., `/events/12`, `/dashboard`) and forwards them to `index.html`, allowing React Router to handle page rendering without `404 Not Found` errors on refresh.
3. **Stateless Authentication**: Login issues a signed JWT stored in `localStorage`. The backend server keeps no session state in memory, allowing completely stateless API verification.
4. **Client-Side Image Optimization**: An in-browser HTML5 `<canvas>` resizing pipeline scales large photos down to a maximum dimension of 1200px and exports them as compressed JPEG data URLs (~120KB each), allowing multiple photos to be saved directly in MySQL without external cloud storage.

---

## 5. Database Schema & Relational Design

The database schema is structured around three core domain entities extending an auditable base:

### `AuditableEntity` (Mapped Superclass)
* `created_at` (DATETIME): Timestamp when record was created.
* `updated_at` (DATETIME): Timestamp when record was last modified.

### 1. `users` Table
* `id` (BIGINT, Primary Key, Auto-Increment)
* `name` (VARCHAR): User display name.
* `email` (VARCHAR, Unique, Indexed): User login email.
* `password` (VARCHAR): BCrypt-hashed password.
* `role` (VARCHAR): `USER` or `ADMIN`.
* `active` (BIT): Account activation status.

### 2. `events` Table
* `id` (BIGINT, Primary Key, Auto-Increment)
* `event_name` (VARCHAR): Title of the event.
* `description` (TEXT): Detailed event description and itinerary.
* `category` (VARCHAR): Event category (Technology, Music, Business, etc.).
* `event_date` (DATE): Scheduled date of the event.
* `start_time` (TIME), `end_time` (TIME): Operating hours.
* `venue` (VARCHAR), `city` (VARCHAR): Location details.
* `organizer_name` (VARCHAR): Host or organization name.
* `ticket_price` (DECIMAL 12,2): Cost per ticket (0.00 for Free Entry).
* `capacity` (INT): Total available seats.
* `available_seats` (INT): Real-time remaining seats.
* `image_url` (LONGTEXT): Serialized JSON array of compressed base64 images.
* `status` (VARCHAR): `ACTIVE`, `SOLD_OUT`, `CANCELLED`, `COMPLETED`.
* `version` (BIGINT): Optimistic locking version field.

### 3. `bookings` Table
* `id` (BIGINT, Primary Key, Auto-Increment)
* `booking_reference` (VARCHAR, Unique): E.g., `EVS-A1B2C3D4`.
* `user_id` (BIGINT, Foreign Key $\rightarrow$ `users.id`): Attendee reference.
* `event_id` (BIGINT, Foreign Key $\rightarrow$ `events.id`): Reserved event reference.
* `number_of_tickets` (INT): Quantity of tickets reserved.
* `total_amount` (DECIMAL 12,2): Total transaction cost.
* `booking_date` (DATETIME): Timestamp of confirmation.
* `booking_status` (VARCHAR): `CONFIRMED`, `CANCELLED`.
* `payment_status` (VARCHAR): `PAID`, `REFUNDED`, `FAILED`.

---

## 6. Key REST API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create a new customer account.
* `POST /api/auth/login` — Authenticate and receive a signed JWT token.

### Events (`/api/events`)
* `GET /api/events` — Query and filter active events (keyword, category, city, date, sort).
* `GET /api/events/{id}` — Fetch detailed information for a single event.
* `POST /api/events` — Create and publish a new event (Authenticated users & admins).
* `PUT /api/events/{id}` — Update event details (Organizer or Admin).
* `DELETE /api/events/{id}` — Remove an event from the platform.

### Bookings (`/api/bookings`)
* `POST /api/bookings` — Reserve tickets with concurrency checks and seat deduction.
* `GET /api/bookings/my` — Retrieve all bookings belonging to the authenticated user.
* `GET /api/bookings/{id}` — Retrieve detailed ticket receipt.
* `PUT /api/bookings/{id}/cancel` — Cancel reservation and return seats to inventory.

### Administration (`/api/admin`)
* `GET /api/admin/dashboard` — Platform overview metrics (Users, Events, Bookings, Gross Revenue).
* `GET /api/admin/bookings` — View all platform bookings.
* `GET /api/admin/users` — List registered users.
* `PUT /api/admin/users/{id}/status` — Enable or disable a user account.

---

## 7. How to Run the Application

### Prerequisites
* Java Development Kit (JDK 21 or 25)
* MySQL Server (running on port `3306`)
* Node.js (v18+)

### Startup via Helper Scripts (Windows)
1. **Full-Stack (Backend + Frontend Dev)**: Run `start-all.bat`
2. **Backend Server (Serving Combined App on :8080)**: Run `start-backend.bat`

### Manual Startup via Terminal
```powershell
# 1. Start Backend (Runs on http://localhost:8080)
cd backend
mvn spring-boot:run

# 2. Start Frontend Dev Server (Optional for live HMR on http://localhost:5173)
cd frontend
npm run dev
```

### Default Credentials
* **Admin Email**: `admin@eventsphere.com`
* **Admin Password**: `Admin@12345`

---

## 8. Future Roadmap & Extensibility

1. **Interactive Visual Seat Mapping**: Support assigned seating (Row A–F, Seat 1–10) with interactive seat selection maps for auditoriums and cinemas.
2. **Payment Gateway Integration**: Webhook-driven checkout flows using Stripe or Razorpay.
3. **Automated Ticket Delivery**: Asynchronous PDF ticket generation with verifiable QR codes emailed via JavaMailSender.
4. **Containerization**: Single-command deployment via `docker-compose.yml` encapsulating MySQL, Spring Boot, and Nginx.
