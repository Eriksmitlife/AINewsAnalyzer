import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from './lib/web3Config';
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import News from "@/pages/News";
import NFTMarketplace from "@/pages/NFTMarketplace";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Exchange from "@/pages/Exchange";
import Trading from "@/pages/Trading";
import LiveAuctions from "@/pages/LiveAuctions";
import Portfolio from "@/pages/Portfolio";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

// Создание Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  enableAnalytics: true,
});

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/news" component={News} />
          <Route path="/nft-marketplace" component={NFTMarketplace} />
          <Route path="/exchange" component={Exchange} />
          <Route path="/trading" component={Trading} />
          <Route path="/auctions" component={LiveAuctions} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/profile" component={Profile} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
