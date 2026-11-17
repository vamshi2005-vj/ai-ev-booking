# EventSphere - Interview Preparation Guide

This guide contains everything you need to confidently explain the **EventSphere** full-stack project in an interview.

---

## 1. The 30-Second Elevator Pitch

> "I built **EventSphere**, a production-style full-stack event discovery and ticket booking platform. It features a **React and Vite** frontend and a **Spring Boot 3.5 (Java 25)** REST backend powered by **MySQL**.
> 
> The platform allows attendees to browse events, host their own events with multiple photo uploads from their computer, and reserve tickets with real-time seat tracking and overbooking protection. It also includes stateless **JWT authentication**, role-based access control for Users and Admins, and full administrative management controls."

---

## 2. Tech Stack Justifications (Why did you choose this stack?)

### A. Spring Boot & Java (Backend)
* **ACID Transactions**: Ticket booking requires declarative `@Transactional` management to guarantee atomic operations: if booking, seat deduction, or payment fail midway, everything rolls back.
* **Production-Grade Security**: Spring Security provides stateless JWT filtering, BCrypt password hashing, and role-based route guards (`USER` vs `ADMIN`).
* **Strict Type Safety**: Statically typed domain models and DTOs catch errors at compile time.

### B. MySQL (Database)
* **Zero Tolerance for Inconsistency**: Unlike NoSQL's eventual consistency, relational databases guarantee strict row-level locking and ACID compliance, which is essential to prevent overbooking.
* **Relational Integrity**: Foreign keys strictly connect `users`, `events`, and `bookings` so records are never orphaned.

### C. React & Vite (Frontend)
* **Single Page Application (SPA)**: Smooth page transitions and dynamic modals with zero full-page reloads.
* **Component Architecture**: Reusable UI cards, steppers, and filters.
* **Vite over Create React App (CRA)**: CRA is deprecated and slow. Vite uses native browser ES Modules (ESM) and Go-based `esbuild`, starting the dev server in under 1 second with instant Hot Module Replacement (HMR).

### D. JWT (JSON Web Tokens)
* **Stateless Scalability**: The server stores no session data in memory. The token carries user claims (`role`, `email`, `id`) cryptographically signed with HMAC-SHA256, allowing horizontal scaling behind a load balancer without sticky sessions.

---

## 3. Top 3 Engineering Challenges You Solved

### Story A: Preventing Overbooking & Race Conditions
* **Problem**: When an event has 2 tickets remaining and multiple attendees click "Book" at the same instant, race conditions can cause overbooking.
* **Solution**: Handled inside a Spring `@Transactional` service method. Before persisting a booking, the method checks real-time seat inventory, decrements the event's available seats, and automatically sets the event status to `SOLD_OUT` when seats reach zero. If an error occurs, the entire transaction rolls back cleanly.

### Story B: Client-Side Image Compression (Canvas API)
* **Problem**: Smartphone photos are 8–12 MB each. Uploading multiple raw photos wastes bandwidth, causes upload lag, and bloats the database.
* **Solution**: Implemented in-browser image optimization using HTML5 Canvas and the FileReader API. When an organizer selects photos from their PC, the browser calculates the aspect ratio, downscales the image to a max dimension of 1200px, and compresses it at 85% JPEG quality. This reduces file sizes from 10 MB to ~120 KB (a 98% reduction) in under 50 milliseconds with zero server CPU load.

### Story C: Single-Page Application (SPA) Routing in Spring Boot
* **Problem**: When combining React with Spring Boot, refreshing a client-side route like `/events/12` causes Spring Boot to return a `404 Not Found`.
* **Solution**: Implemented a `SpaForwardController` that forwards non-API browser paths back to `index.html`. In addition, implemented a `WebConfig` using `PathMatchConfigurer` to automatically prefix all REST controllers with `/api/`, clearly separating frontend routes from backend data endpoints.

---

## 4. Key Architectural Diagram

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

---

## 5. Quick Questions & Answers

* **Q: How does authentication work?**
  * *A: The client sends credentials to `/api/auth/login`. Spring Boot verifies the password with BCrypt, generates a signed JWT token, and returns it. Axios interceptors attach this token as `Authorization: Bearer <token>` to all subsequent requests.*

* **Q: How do you handle multiple photos without AWS S3?**
  * *A: Each image is compressed on the client into a compact base64 data URL. The array of images is serialized as JSON and stored directly in MySQL's `LONGTEXT` column, eliminating cloud bucket costs and configuration complexity during development.*

* **Q: What would you add next?**
  * *A: An interactive visual seating map (auditorium rows A–F with clickable seats) and an integrated payment gateway (Razorpay/Stripe).*
