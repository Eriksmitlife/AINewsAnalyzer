import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Bell, LogOut, Settings, User, Globe, Palette, Moon, Sun, Zap } from "lucide-react";
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

export default function Header() {
  const { user, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState(i18n.getCurrentLanguage());
  const [currentTheme, setCurrentTheme] = useState(themeService.getCurrentTheme());

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
  };

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
    <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                AutoNews.AI
              </span>
              <Badge variant="secondary" className="text-xs">
                BETA
              </Badge>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
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

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                {getThemeIcon(currentTheme.id)}
                <span className="ml-1 text-sm font-medium">
                  {i18n.translate(`themes.${currentTheme.id}`)}
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
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
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

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      ID: {user.id}
                    </p>
                  </div>
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <a href="/api/login">Login</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}