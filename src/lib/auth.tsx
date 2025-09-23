
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

function AuthLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login';

  useEffect(() => {
    if (!loading) {
      if (isProtectedRoute && !user) {
        router.push('/login');
      }
      if (isAuthRoute && user) {
        router.push('/dashboard');
      }
    }
  }, [loading, user, isProtectedRoute, isAuthRoute, router]);

  if (loading || (isProtectedRoute && !user) || (isAuthRoute && user)) {
    return <AuthLoadingSkeleton />;
  }
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
