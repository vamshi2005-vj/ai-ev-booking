import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetailsPage from './pages/BookingDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ManageEventsPage from './pages/ManageEventsPage'
import EventFormPage from './pages/EventFormPage'
import ManageUsersPage from './pages/ManageUsersPage'
import ManageBookingsPage from './pages/ManageBookingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User & Admin Authenticated Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <EventFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <EventFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['USER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Specific Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ManageEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <EventFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <EventFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ManageBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
