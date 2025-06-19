
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FuelTransaction } from '@/pages/Index';

interface UserContextType {
  isGuest: boolean;
  setIsGuest: (guest: boolean) => void;
  syncToGoogleDrive: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  googleUser: any | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [isGuest, setIsGuest] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any | null>(null);

  // Load user mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('userMode');
    const savedUser = localStorage.getItem('googleUser');
    
    if (savedMode === 'registered') {
      setIsGuest(false);
    }
    
    if (savedUser) {
      setGoogleUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user mode to localStorage
  useEffect(() => {
    localStorage.setItem('userMode', isGuest ? 'guest' : 'registered');
  }, [isGuest]);

  const signInWithGoogle = async () => {
    try {
      // Simulate Google Sign-In (in real app, use Google Identity Services)
      const mockUser = {
        id: 'user_123',
        name: 'Người dùng Google',
        email: 'user@gmail.com',
        picture: 'https://via.placeholder.com/40'
      };
      
      setGoogleUser(mockUser);
      setIsGuest(false);
      localStorage.setItem('googleUser', JSON.stringify(mockUser));
      
      console.log('Đăng nhập Google thành công:', mockUser);
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error);
    }
  };

  const signOut = async () => {
    try {
      setGoogleUser(null);
      setIsGuest(true);
      localStorage.removeItem('googleUser');
      localStorage.removeItem('lastSyncTime');
      setLastSyncTime(null);
      
      console.log('Đăng xuất thành công');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  const syncToGoogleDrive = async () => {
    if (isGuest || !googleUser) return;
    
    setIsSyncing(true);
    try {
      // Simulate Google Drive sync with user account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactions = localStorage.getItem('fuelTransactions');
      if (transactions) {
        // In a real implementation, this would sync to user's Google Drive
        console.log(`Đồng bộ dữ liệu cho tài khoản ${googleUser.email}:`, JSON.parse(transactions));
        const syncTime = new Date().toLocaleString('vi-VN');
        setLastSyncTime(syncTime);
        localStorage.setItem('lastSyncTime', syncTime);
      }
    } catch (error) {
      console.error('Đồng bộ thất bại:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const value: UserContextType = {
    isGuest,
    setIsGuest,
    syncToGoogleDrive,
    isSyncing,
    lastSyncTime,
    googleUser,
    signInWithGoogle,
    signOut,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
