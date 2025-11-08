'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-(--color-surface) border-b border-(--color-border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-(--color-primary)">InfraVoice</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-(--color-text) hover:text-(--color-primary) transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/deploy"
                className="text-(--color-text) hover:text-(--color-primary) transition-colors"
              >
                Deploy
              </Link>
              <Link
                href="/deployments"
                className="text-(--color-text) hover:text-(--color-primary) transition-colors"
              >
                Deployments
              </Link>
              <Link
                href="/settings"
                className="text-(--color-text) hover:text-(--color-primary) transition-colors"
              >
                Settings
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm">
                  <div className="text-(--color-text)">{user.username}</div>
                  <div className="text-(--color-text-secondary) text-xs">
                    {user.api_calls_used}/{user.api_quota} API calls
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-(--color-text) hover:text-(--color-error) transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-(--color-text) hover:text-(--color-primary)">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-hover) transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
