import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface AdminRouteProps {
    children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { currentUser, userRole, authLoading } = useStore();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if the user is logged in and has the custom claims role 'admin'
    const isAdmin = currentUser && userRole === 'admin';

    if (!isAdmin) {
        return <Navigate to="/403" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
