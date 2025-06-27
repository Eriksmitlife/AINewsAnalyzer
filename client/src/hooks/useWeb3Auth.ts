import { useState, useEffect } from 'react';
import { createConfig, WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
});

interface Web3User {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance?: string;
  ensName?: string;
}

export function useWeb3Auth() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  
  const [user, setUser] = useState<Web3User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Проверка подключения при загрузке
  useEffect(() => {
    if (isConnected && address) {
      setUser({
        address,
        chainId: chainId || 1,
        isConnected,
      });
      verifyWeb3Auth(address);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [isConnected, address, chainId]);

  // Верификация Web3 авторизации
  const verifyWeb3Auth = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      
      // Проверяем существует ли пользователь с этим адресом
      const response = await apiRequest('POST', '/api/auth/web3/verify', {
        address: walletAddress,
        chainId: chainId || 1
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        
        toast({
          title: "Успешное подключение",
          description: `Добро пожаловать! Адрес: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Web3 auth verification failed:', error);
      // Если пользователь не найден, создаем нового
      await createWeb3User(walletAddress);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание нового Web3 пользователя
  const createWeb3User = async (walletAddress: string) => {
    try {
      const message = `Добро пожаловать в AutoNews.AI!\n\nВойдите с адресом: ${walletAddress}\nВремя: ${new Date().toISOString()}`;
      
      const signature = await signMessageAsync({ message });
      
      const response = await apiRequest('POST', '/api/auth/web3/register', {
        address: walletAddress,
        signature,
        message,
        chainId: chainId || 1
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "Регистрация завершена",
          description: "Ваш Web3 профиль создан успешно!",
        });
      }
    } catch (error) {
      console.error('Web3 user creation failed:', error);
      toast({
        title: "Ошибка регистрации",
        description: "Не удалось создать Web3 профиль",
        variant: "destructive"
      });
    }
  };

  const connectWallet = async (connectorId?: string) => {
    try {
      setIsConnecting(true);

      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) 
        : connectors[0];

      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
       toast({
        title: "Ошибка подключения",
        description: "Не удалось подключить кошелек",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setUser(null);
    setIsAuthenticated(false);
     toast({
      title: "Кошелек отключен",
      description: "Вы успешно вышли из системы",
    });
  };

  return {
    account: address,
    user,
    isLoading: isLoading || isPending,
    isAuthenticated,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    isConnecting: isConnecting || isPending,
    connectors,
    verifyWeb3Auth
  };
}

export { config };