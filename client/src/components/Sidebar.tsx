import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Newspaper, 
  TrendingUp, 
  Palette, 
  Heart, 
  Wallet,
  BarChart3,
  Microchip,
  Coins,
  Rocket,
  FlaskRound
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "News Feed", href: "/news", icon: Newspaper },
  { name: "Trending", href: "/news?category=trending", icon: TrendingUp },
  { name: "NFT Marketplace", href: "/nft-marketplace", icon: Palette },
  { name: "Favorites", href: "/profile?tab=favorites", icon: Heart },
  { name: "My Portfolio", href: "/profile?tab=nfts", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const categories = [
  { name: "AI & Technology", href: "/news?category=AI%20%26%20Technology", icon: Microchip, color: "text-blue-600" },
  { name: "Finance & Crypto", href: "/news?category=Finance%20%26%20Crypto", icon: Coins, color: "text-green-600" },
  { name: "Startups", href: "/news?category=Startups", icon: Rocket, color: "text-purple-600" },
  { name: "Science", href: "/news?category=Science", icon: FlaskRound, color: "text-orange-600" },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href.split("?")[0]);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "sidebar-link w-full",
                  active ? "sidebar-link-active" : "sidebar-link-inactive"
                )}
              >
                <Icon className="mr-3 w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Categories
          </h3>
          <div className="mt-2 space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = isActive(category.href);
              return (
                <button
                  key={category.name}
                  onClick={() => setLocation(category.href)}
                  className={cn(
                    "sidebar-link w-full",
                    active ? "sidebar-link-active" : "sidebar-link-inactive"
                  )}
                >
                  <Icon className={cn("mr-3 w-5 h-5", category.color)} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
