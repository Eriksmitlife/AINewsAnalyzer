import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { 
  Bell, LogOut, Settings, User, Globe, Palette, Moon, Sun, Zap,
  Menu, X, Home, Newspaper, ShoppingCart, TrendingUp, Gavel, 
  Briefcase, BarChart3, HeartPulse, Cpu, Bitcoin, UserCircle, Brain, Trophy, UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { i18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { themeService, THEMES } from "@/lib/themes";
import { AuthModal } from "@/components/AuthModal";

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const [location] = useLocation();
  const [currentLang, setCurrentLang] = useState(i18n.getCurrentLanguage());
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  };

  const handleThemeChange = (themeId: string) => {
    themeService.setTheme(themeId);
    // Принудительно обновляем состояние компонента
    setCurrentTheme(themeService.getCurrentTheme());
  };

  const navigationGroups = {
    main: [
      { href: '/', label: 'Главная', icon: Home },
      { href: '/news', label: 'Новости', icon: Newspaper },
      { href: '/marketplace', label: 'NFT Маркет', icon: ShoppingCart },
    ],
    trading: [
      { href: '/exchange', label: 'Биржа', icon: TrendingUp },
      { href: '/trading', label: 'Торговля', icon: BarChart3 },
      { href: '/auctions', label: 'Аукционы', icon: Gavel },
    ],
    personal: [
      { href: '/portfolio', label: 'Портфель', icon: Briefcase },
      { href: '/mlm-profile', label: 'MLM Профиль', icon: Trophy },
      { href: '/profile', label: 'Профиль', icon: UserCircle },
    ],
    advanced: [
      { href: '/cryptocurrency', label: 'ANC Coin', icon: Bitcoin },
      { href: '/quantum-ai', label: 'Квантовый ИИ', icon: Brain },
      { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
    ],
  };

  const allNavigationItems = [
    ...navigationGroups.main,
    ...navigationGroups.trading,
    ...navigationGroups.personal,
    ...navigationGroups.advanced,
  ];

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLang);

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'neon': return <Zap className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <header className="cyber-glass border-b border-cyan-500/30 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 cyber-logo-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform cyber-glow-cyan">
                  <span className="text-white font-bold text-xs sm:text-sm font-orbitron">AI</span>
                </div>
                <span className="font-bold text-lg sm:text-xl cyber-text-gradient font-orbitron group-hover:animate-pulse hidden sm:block">
                  AutoNews.AI
                </span>
                <Badge className="cyber-badge-premium text-xs hidden md:flex">
                  <Zap className="w-3 h-3 mr-1" />
                  NEURAL
                </Badge>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation */}
            {navigationGroups.main.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-9 px-3 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all ${
                      isActive ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-700 mx-1" />

            {/* Trading Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-cyan-500/10 hover:text-cyan-400">
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Торговля</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {navigationGroups.trading.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={`flex items-center ${isActive ? 'bg-cyan-500/20' : ''}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Personal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-cyan-500/10 hover:text-cyan-400">
                  <User className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Личное</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {navigationGroups.personal.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={`flex items-center ${isActive ? 'bg-cyan-500/20' : ''}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Advanced Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-cyan-500/10 hover:text-cyan-400">
                  <Zap className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Продвинутое</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {navigationGroups.advanced.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={`flex items-center ${isActive ? 'bg-cyan-500/20' : ''}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector - Hidden on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 hidden sm:flex">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {i18n.translate('selectLanguage')}
                  </p>
                </div>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex items-center justify-between ${
                      language.code === currentLang ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{language.flag}</span>
                      <span>{language.name}</span>
                    </div>
                    {language.code === currentLang && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector - Visible on all devices */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 flex">
                  {getThemeIcon(currentTheme.id)}
                  <span className="ml-1 text-sm font-medium hidden lg:inline">
                    {currentTheme.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Choose Theme
                  </p>
                </div>
                {THEMES.map((theme) => (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`flex items-center justify-between ${
                      theme.id === currentTheme.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {getThemeIcon(theme.id)}
                      <div className="ml-2">
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      </div>
                    </div>
                    {theme.id === currentTheme.id && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Уведомления */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* Баланс ANC */}
                {user.ancBalance && (
                  <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                    <Bitcoin className="h-3 w-3 text-yellow-500" />
                    {parseFloat(user.ancBalance).toFixed(2)} ANC
                  </Badge>
                )}

                {/* Профиль пользователя */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        ID: {user.id}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>{i18n.translate('nav.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AuthModal>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Регистрация
                  </Button>
                </AuthModal>
                <AuthModal>
                  <Button size="sm">
                    Войти
                  </Button>
                </AuthModal>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 xl:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-cyan-500/30 py-4">
            <nav className="flex flex-col space-y-1">
              {allNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-10 px-4 hover:bg-cyan-500/10 hover:text-cyan-400 ${
                        isActive ? 'bg-cyan-500/20 text-cyan-400' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile Theme and Language Options */}
              <div className="border-t border-cyan-500/20 mt-4 pt-4 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const languages = ['en', 'ru', 'es', 'zh', 'ja'];
                      const currentIndex = languages.indexOf(currentLang);
                      const nextIndex = (currentIndex + 1) % languages.length;
                      handleLanguageChange(languages[nextIndex]);
                    }}
                  >
                    {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const themes = ['light', 'dark', 'neon'];
                      const currentIndex = themes.indexOf(currentTheme.id);
                      const nextIndex = (currentIndex + 1) % themes.length;
                      handleThemeChange(themes[nextIndex]);
                    }}
                  >
                    {getThemeIcon(currentTheme.id)}
                    <span className="ml-2">{currentTheme.name}</span>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}