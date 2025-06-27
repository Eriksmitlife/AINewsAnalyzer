import { useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { i18n } from "@/lib/i18n";
import { themeService } from "@/lib/themes";
import { seoOptimizer } from "@/lib/seoOptimizer";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import News from "@/pages/News";
import Exchange from "@/pages/Exchange";
import Trading from "@/pages/Trading";
import LiveAuctions from "@/pages/LiveAuctions";
import Portfolio from "@/pages/Portfolio";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { user, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize SEO metadata
    const initSEO = () => {
      const currentLang = i18n.getCurrentLanguage();
      const seoData = i18n.translate('seo');

      document.title = seoData.metaTitle || 'AutoNews.AI - AI-Powered News Analysis';
      document.documentElement.setAttribute('lang', currentLang);

      // Update meta tags
      const updateMeta = (name: string, content: string, attribute = 'name') => {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('description', seoData.metaDescription || 'Advanced AI news analysis platform');
      updateMeta('keywords', seoData.keywords || 'AI, news, analysis, NFT, trading');
      updateMeta('og:title', seoData.metaTitle || 'AutoNews.AI', 'property');
      updateMeta('og:description', seoData.metaDescription || 'AI-powered news platform', 'property');
      updateMeta('og:type', 'website', 'property');
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', seoData.metaTitle || 'AutoNews.AI');
      updateMeta('twitter:description', seoData.metaDescription || 'AI news analysis');

      // Add structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AutoNews.AI",
        "description": seoData.metaDescription,
        "url": window.location.origin,
        "applicationCategory": "NewsApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "AutoNews.AI",
          "url": window.location.origin
        }
      };

      let jsonLd = document.querySelector('script[type="application/ld+json"]');
      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.setAttribute('type', 'application/ld+json');
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(structuredData);
    };

    // Initialize theme
    const initTheme = () => {
      const theme = themeService.getCurrentTheme();
      document.documentElement.className = `theme-${theme.id}`;
    };

    initSEO();
    initTheme();

    // Subscribe to language changes
    const unsubscribeLang = i18n.subscribe(initSEO);
    const unsubscribeTheme = themeService.subscribe(initTheme);

    setIsInitialized(true);

    return () => {
      unsubscribeLang();
      unsubscribeTheme();
    };
  }, []);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {i18n.translate('loading') || 'Loading AutoNews.AI...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <Layout>
      <Router>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/news" component={News} />
          <Route path="/exchange" component={Exchange} />
          <Route path="/trading" component={Trading} />
          <Route path="/auctions" component={LiveAuctions} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/profile" component={Profile} />
          <Route path="/system-health" component={SystemHealth} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </Layout>
  );
}

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
}