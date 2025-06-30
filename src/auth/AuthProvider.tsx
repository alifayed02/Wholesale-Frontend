import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext, AuthContextType } from './AuthContext';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = idTokenResult.claims;
          if (claims.role === 'internal') {
            setUser(firebaseUser);
            setIsApproved(true);
            setIsAdmin(claims.admin === true);
          } else {
            setIsApproved(false);
            setIsAdmin(false);
            await signOut(auth);
            setError('Not authorized');
          }
        } catch (e) {
          setError('An error occurred during authentication.');
          await signOut(auth);
        }
      } else {
        setUser(null);
        setIsApproved(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getAuthToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(true);
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    loading,
    isApproved,
    isAdmin,
    error,
    login,
    logout,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 