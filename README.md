# EventSphere

EventSphere is a production-style event management and ticket booking platform with a Spring Boot backend, MySQL persistence, JWT security, and a React + Vite frontend.

## Features

- User registration and login with JWT
- Browse, search, and filter events
- Book tickets with overbooking protection
- View and cancel bookings
- Admin event, user, booking, and dashboard management
- Responsive React frontend for desktop, tablet, and mobile

## Tech Stack

- Backend: Java 25, Spring Boot 3.5.16, Spring MVC, Spring Security, JWT, Spring Data JPA, Hibernate, Bean Validation, Maven, MySQL
- Frontend: React, Vite, JavaScript, Axios, React Router, CSS

## Project Structure

- `backend/` Spring Boot API
- `frontend/` React client

## Run Backend

1. Configure MySQL and JWT values in `backend/src/main/resources/application.yml` or via environment variables.
2. Run `mvn spring-boot:run` from the `backend` directory.

## Run Frontend

1. Install dependencies in `frontend/`.
2. Run `npm run dev`.

## Default Admin

Use environment variables for the initial admin account:

- `EVENTSPHERE_ADMIN_NAME`
- `EVENTSPHERE_ADMIN_EMAIL`
- `EVENTSPHERE_ADMIN_PASSWORD`
