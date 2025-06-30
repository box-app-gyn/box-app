import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <div>
      {/* Wrapper para páginas privadas (admin) */}
      {children}
    </div>
  );
} 