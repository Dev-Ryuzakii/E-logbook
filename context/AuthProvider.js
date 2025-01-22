import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      setError(null);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.message);
      setError(error.message);
      Alert.alert('Login Error', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth().signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error.message);
      setError(error.message);
      Alert.alert('Logout Error', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Registration failed:", error.message);
      setError(error.message);
      Alert.alert('Registration Error', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error("Password reset failed:", error.message);
      setError(error.message);
      Alert.alert('Password Reset Error', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user email is verified
  const isEmailVerified = () => {
    return user?.emailVerified ?? false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        isLoading,
        error,
        login,
        logout,
        register,
        resetPassword,
        isEmailVerified,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};