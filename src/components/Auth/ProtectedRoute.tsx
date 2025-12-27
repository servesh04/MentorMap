import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import RoleSelectionModal from '../Onboarding/RoleSelectionModal';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, authLoading, userRole } = useStore();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If user is authenticated but has no role, show onboarding modal overlay
    // The children are still rendered in background or we could hide them. 
    // Here we render children but overlay the modal.
    return (
        <>
            {!userRole && <RoleSelectionModal />}
            {children}
        </>
    );
};

export default ProtectedRoute;
