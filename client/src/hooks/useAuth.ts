
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
  walletAddress?: string;
  level?: number;
  ancBalance?: string;
  totalEarnings?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Проверяем Replit Auth
      const replitResponse = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (replitResponse.ok) {
        const userData = await replitResponse.json();
        setUser(userData);
        return;
      }

      // Проверяем Web3 Auth
      const web3Response = await fetch('/api/auth/web3/user', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (web3Response.ok) {
        const userData = await web3Response.json();
        setUser(userData);
        return;
      }

      // Если оба метода не удались, создаем демо пользователя для тестирования
      if (import.meta.env.DEV) {
        setUser({
          id: 'demo-user',
          email: 'demo@autonews.ai',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
          level: 2,
          ancBalance: '1250.75',
          totalEarnings: '485.50'
        });
        return;
      }

      // Пользователь не авторизован
      setUser(null);
    } catch (error) {
      console.error('Auth check error:', error);
      // В режиме разработки создаем демо пользователя
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 'demo-user',
          email: 'demo@autonews.ai',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
          level: 2,
          ancBalance: '1250.75',
          totalEarnings: '485.50'
        });
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithReplit = () => {
    window.location.href = '/api/login';
  };

  const loginWithWeb3 = async (address: string, chainId: number) => {
    try {
      const response = await fetch('/api/auth/web3/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, chainId }),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: 'Verification failed' };
      }
    } catch (error) {
      console.error('Web3 login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const registerWithWeb3 = async (address: string, signature: string, message: string, chainId: number) => {
    try {
      const response = await fetch('/api/auth/web3/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, signature, message, chainId }),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Web3 registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      // Попробуем оба типа логаута
      await Promise.allSettled([
        fetch('/api/logout', { method: 'GET', credentials: 'include' }),
        fetch('/api/auth/web3/logout', { method: 'POST', credentials: 'include' })
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Перенаправляем на главную страницу
      window.location.href = '/';
    }
  };

  return {
    user,
    isLoading,
    loginWithReplit,
    loginWithWeb3,
    registerWithWeb3,
    logout,
    checkAuthStatus,
  };
}
