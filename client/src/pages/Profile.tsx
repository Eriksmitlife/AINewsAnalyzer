import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsCard from "@/components/NewsCard";
import NFTCard from "@/components/NFTCard";
import { Heart, Palette, TrendingUp, LogOut, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    retry: false,
  });

  const { data: userNfts, isLoading: nftsLoading } = useQuery({
    queryKey: ["/api/nfts", { ownerId: user?.id }],
    retry: false,
    enabled: !!user?.id,
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/nfts/transactions", { userId: user?.id }],
    retry: false,
    enabled: !!user?.id,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await apiRequest('DELETE', `/api/favorites/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Success",
        description: "Article removed from favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, userLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={user.profileImageUrl || undefined} 
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'User'
                      }
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        <User className="w-3 h-3 mr-1" />
                        {user.role || 'User'}
                      </Badge>
                      <Badge className="badge-verified">Active Member</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stats-card">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favorites?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="stats-card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NFTs Owned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userNfts?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="stats-card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="nfts">My NFTs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="space-y-6">
            {favoritesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="loading-spinner"></div>
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((article: any) => (
                  <div key={article.id} className="relative">
                    <NewsCard article={article} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                      onClick={() => removeFavoriteMutation.mutate(article.id)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start exploring news articles and add them to your favorites.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="nfts" className="space-y-6">
            {nftsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="loading-spinner"></div>
              </div>
            ) : userNfts && userNfts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNfts.map((nft: any) => (
                  <NFTCard key={nft.id} nft={nft} showOwnerActions />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No NFTs owned
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Visit the marketplace to purchase NFTs or generate them from articles.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.type === 'mint' ? 'NFT Minted' : 
                             transaction.type === 'sale' ? 'NFT Sale' : 'NFT Transfer'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {transaction.price ? `${transaction.price} ETH` : 'Free'}
                          </p>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your NFT transactions will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
