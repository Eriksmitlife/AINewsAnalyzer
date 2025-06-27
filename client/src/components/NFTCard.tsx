import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Edit, 
  Eye, 
  Palette,
  Check,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NFTCardProps {
  nft: any;
  compact?: boolean;
  showOwnerActions?: boolean;
}

export default function NFTCard({ nft, compact = false, showOwnerActions = false }: NFTCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(nft.price || "");

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/nfts/${nft.id}/purchase`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });
      toast({
        title: "Success",
        description: "NFT purchased successfully!",
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
        description: error instanceof Error ? error.message : "Failed to purchase NFT",
        variant: "destructive",
      });
    },
  });

  const updateNftMutation = useMutation({
    mutationFn: async (data: { price?: string; isForSale?: boolean }) => {
      await apiRequest('PATCH', `/api/nfts/${nft.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "NFT updated successfully!",
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
        description: "Failed to update NFT",
        variant: "destructive",
      });
    },
  });

  const handlePriceUpdate = () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    updateNftMutation.mutate({ price: newPrice });
  };

  const toggleSaleStatus = () => {
    updateNftMutation.mutate({ isForSale: !nft.isForSale });
  };

  const getChainBadgeColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      polygon: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      solana: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[chain] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const isOwner = user?.id === nft.ownerId;
  const canPurchase = nft.isForSale && !isOwner;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <img 
          src={nft.imageUrl || "/placeholder-nft.png"} 
          alt={nft.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
            {nft.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {nft.price} ETH
          </p>
        </div>
        <Button 
          size="sm" 
          className="btn-primary"
          onClick={() => canPurchase && purchaseMutation.mutate()}
          disabled={!canPurchase || purchaseMutation.isPending}
        >
          {canPurchase ? 'Buy' : 'View'}
        </Button>
      </div>
    );
  }

  return (
    <div className="card-modern hover-lift">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={nft.imageUrl || "/placeholder-nft.png"} 
          alt={nft.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2">
          <Badge className={`${getChainBadgeColor(nft.chain)} backdrop-blur-sm`}>
            {nft.chain?.toUpperCase()}
          </Badge>
        </div>
        {nft.isForSale && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
              Для продажи
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
            {nft.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {nft.description}
          </p>
        </div>

        {nft.metadata?.attributes && (
          <div className="flex flex-wrap gap-2">
            {nft.metadata.attributes.slice(0, 3).map((attr: any, index: number) => (
              <Badge key={index} className="badge-modern text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-20 h-8 text-sm"
                    placeholder="0.0"
                  />
                  <span className="text-sm font-medium">ETH</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePriceUpdate}
                    disabled={updateNftMutation.isPending}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {nft.price} ETH
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {canPurchase && (
              <Button
                className="btn-primary flex-1"
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {purchaseMutation.isPending ? 'Purchasing...' : 'Buy Now'}
              </Button>
            )}

            {showOwnerActions && isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSaleStatus}
                  disabled={updateNftMutation.isPending}
                >
                  {nft.isForSale ? 'Remove Sale' : 'Put for Sale'}
                </Button>
              </>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{nft.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <img 
                    src={nft.imageUrl || "/placeholder-nft.png"} 
                    alt={nft.name}
                    className="w-full rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {nft.description}
                    </p>
                  </div>
                  {nft.metadata?.attributes && (
                    <div>
                      <h4 className="font-medium mb-2">Attributes</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {nft.metadata.attributes.map((attr: any, index: number) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                            <p className="text-sm font-medium">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
      </div>
    </div>
  );
}
