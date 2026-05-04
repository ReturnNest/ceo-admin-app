import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCreateListing } from './pages/admin/AdminCreateListing';
import { ListingModeration } from './pages/admin/ListingModeration';
import { SellerManagement } from './pages/admin/SellerManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { BillingManagement } from './pages/admin/BillingManagement';
import { MessageHistory } from './pages/admin/MessageHistory';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminPrivateListings } from './pages/admin/AdminPrivateListings';

function App() {
  return (
    <Routes>
      {/* Root redirection to admin for this specific app */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="create-listing" element={<AdminCreateListing />} />
          <Route path="moderation" element={<ListingModeration />} />
          <Route path="private-records" element={<AdminPrivateListings />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="messages" element={<MessageHistory />} />
          <Route path="sellers" element={<SellerManagement />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
          <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
          <p className="text-slate-400 mb-8">Page Not Found</p>
          <a href="/admin" className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-500 transition-colors">
            Return to Dashboard
          </a>
        </div>
      } />
    </Routes>
  );
}

export default App;
