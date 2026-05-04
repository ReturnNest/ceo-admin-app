import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export const AdminProtectedRoute: React.FC = () => {
    const { isAdmin, loading } = useAdmin();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950 font-sans">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
                    <p className="text-slate-400">Authenticating Admin...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};
