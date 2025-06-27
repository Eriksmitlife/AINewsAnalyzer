import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import News from "@/pages/News";
import NFTMarketplace from "@/pages/NFTMarketplace";
import Exchange from "@/pages/Exchange";
import Trading from "@/pages/Trading";
import LiveAuctions from "@/pages/LiveAuctions";
import Portfolio from "@/pages/Portfolio";
import Profile from "@/pages/Profile";
import Analytics from "@/pages/Analytics";
import SystemHealth from "@/pages/SystemHealth";
import AutomationControl from "@/pages/AutomationControl";
import NotFound from "@/pages/not-found";

import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/themes";
import { I18nProvider } from "@/lib/i18n";
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/web3Config';

function App() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/news" element={<News />} />
      <Route path="/nft-marketplace" element={<NFTMarketplace />} />
      <Route path="/exchange" element={<Exchange />} />
      <Route path="/trading" element={<Trading />} />
      <Route path="/live-auctions" element={<LiveAuctions />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/system-health" element={<SystemHealth />} />
      <Route path="/automation" element={<AutomationControl />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/news" element={<News />} />
        <Route path="/nft-marketplace" element={<NFTMarketplace />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/live-auctions" element={<LiveAuctions />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/system-health" element={<SystemHealth />} />
        <Route path="/automation" element={<AutomationControl />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function AppWrapper() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <Router>
              <AppContent />
            </Router>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}