import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      console.log('Setting up auth state listener...'); // Debug log
      unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user'); // Debug log
          setUser(user);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Auth state error:', error); // Debug log
          setError(error.message);
          setLoading(false);
        }
      );
    } catch (error: any) {
      console.error('Error setting up auth listener:', error); // Debug log
      setError(error.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting login...'); // Debug log
      await authService.login(email, password);
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting logout...'); // Debug log
      await authService.logout();
    } catch (error: any) {
      console.error('Logout error:', error); // Debug log
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {error ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            <h2 className="text-lg font-medium">Authentication Error</h2>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
