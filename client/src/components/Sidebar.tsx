import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Briefcase,
  DollarSign,
  Gavel,
  Home,
  LineChart,
  MessageSquare,
  Newspaper,
  TrendingUp,
  User,
  Activity,
  Globe,
  Palette,
  Settings,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { i18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { themeService, THEMES } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, key: "nav.dashboard" },
  { name: "News", href: "/news", icon: Newspaper, key: "nav.news" },
  { name: "Exchange", href: "/exchange", icon: DollarSign, key: "nav.exchange" },
  { name: "Trading", href: "/trading", icon: LineChart, key: "nav.trading" },
  { name: "Live Auctions", href: "/auctions", icon: Gavel, key: "nav.auctions" },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase, key: "nav.portfolio" },
  { name: "AutoNews Coin", href: "/cryptocurrency", icon: Zap, key: "nav.cryptocurrency" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, key: "nav.analytics" },
  { name: "System Health", href: "/system-health", icon: Activity, key: "nav.systemHealth" },
  { name: "Profile", href: "/profile", icon: User, key: "nav.profile" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [currentLang, setCurrentLang] = useState(i18n.getCurrentLanguage());
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  useEffect(() => {
    const unsubscribeLang = i18n.subscribe(() => {
      setCurrentLang(i18n.getCurrentLanguage());
    });

    const unsubscribeTheme = themeService.subscribe(() => {
      setCurrentTheme(themeService.getCurrentTheme());
    });

    return () => {
      unsubscribeLang();
      unsubscribeTheme();
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.setLanguage(langCode);
    setIsLanguageExpanded(false);
  };

  const handleThemeChange = (themeId: string) => {
    themeService.setTheme(themeId);
    setIsThemeExpanded(false);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLang);

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light': return "☀️";
      case 'dark': return "🌙";
      case 'neon': return "⚡";
      default: return "🎨";
    }
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 theme-surface">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white title-responsive">
              AutoNews.AI
            </span>
            <Badge variant="outline" className="text-xs">
              v2.0
            </Badge>
          </div>
        </div>

        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const translatedName = item.key ? i18n.translate(item.key) : item.name;

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-r-2 border-blue-600"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 hover:translate-x-1"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? "text-blue-500 dark:text-blue-300"
                          : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                        "mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110"
                      )}
                    />
                    {translatedName}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4 mx-2" />

          {/* Language Selector */}
          <div className="px-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
            >
              <Globe className="mr-2 h-4 w-4" />
              <span className="flex-1">
                {currentLanguage?.flag} {currentLanguage?.name}
              </span>
              <span className="text-xs opacity-60">
                {currentLang.toUpperCase()}
              </span>
            </Button>

            {isLanguageExpanded && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <Button
                    key={language.code}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left pl-8",
                      language.code === currentLang && "bg-accent"
                    )}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <span className="mr-2">{language.flag}</span>
                    <span className="flex-1">{language.name}</span>
                    {language.code === currentLang && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="px-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setIsThemeExpanded(!isThemeExpanded)}
            >
              <Palette className="mr-2 h-4 w-4" />
              <span className="flex-1">
                {getThemeIcon(currentTheme.id)} {currentTheme.name}
              </span>
            </Button>

            {isThemeExpanded && (
              <div className="mt-2 space-y-1">
                {THEMES.map((theme) => (
                  <Button
                    key={theme.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left pl-8",
                      theme.id === currentTheme.id && "bg-accent"
                    )}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <span className="mr-2">{getThemeIcon(theme.id)}</span>
                    <div className="flex-1">
                      <p className="font-medium">{theme.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                    {theme.id === currentTheme.id && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Traffic Stats */}
          <div className="px-2 mb-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-green-800 dark:text-green-200">
                  LIVE TRAFFIC
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Users Online:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">
                    {Math.floor(Math.random() * 2500) + 500}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Articles Read:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {Math.floor(Math.random() * 150) + 50}/min
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>NFTs Created:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    {Math.floor(Math.random() * 20) + 5}/hour
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-2 pb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>System Status:</span>
                <span className="text-green-600 font-semibold">✓ Online</span>
              </div>
              <div className="flex justify-between">
                <span>AI Analysis:</span>
                <span className="text-blue-600 font-semibold">94.7%</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Hit:</span>
                <span className="text-orange-600 font-semibold">89.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}