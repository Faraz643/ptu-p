import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: tokenResponse.access_token }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        picture: data.picture
      }));

      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    // Initialize Google Authentication
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: 'http://772993112256-7h9249ganirq97a54e3t97ovja85lftt.apps.googleusercontent.com', // Replace with your Google client ID
          callback: handleGoogleSuccess, // Your callback function
        });

       
      } else {
        console.error('Google Sign-In API is not loaded properly');
      }
    };
    document.body.appendChild(script); // Append the script to the body
  }, []);



  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google login failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(isLogin ? {} : { name: formData.name }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (!data.success || !data.token) {
        throw new Error(data.message || 'Invalid server response');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name || formData.name,
        email: formData.email,
      }));

      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {(error || message) && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            error ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
            'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          }`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{error || message}</span>
          </div>
        )}

        <button
          onClick={() => login()}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 mb-4 relative group transition-all duration-200"
        >
          <div className="absolute left-4 group-hover:scale-110 transition-transform duration-200">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <span className="ml-2">Continue with Google</span>
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="John Doe"
                  minLength={2}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="••••••••"
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium 
              text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Please wait...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="text-sm text-center">
            <span className="text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={handleToggleMode}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}