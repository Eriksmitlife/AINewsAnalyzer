import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NFTCard from "@/components/NFTCard";
import { Filter, Palette, TrendingUp, Activity } from "lucide-react";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Recently Created" },
  { value: "price", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" }
];

export default function NFTMarketplace() {
  const [forSaleOnly, setForSaleOnly] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: nfts, isLoading, error } = useQuery({
    queryKey: ["/api/nfts", {
      forSaleOnly,
      limit,
      offset: page * limit
    }],
    retry: false,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["/api/nfts/transactions?limit=5"],
    retry: false,
  });

  const { data: topNfts } = useQuery({
    queryKey: ["/api/nfts?limit=3&sortBy=price&sortOrder=desc"],
    retry: false,
  });

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NFT Marketplace</h1>
            <p className="text-gray-600 dark:text-gray-300">Discover and trade unique NFTs generated from news articles</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="badge-verified">
              <Activity className="w-3 h-3 mr-1" />
              Live Market
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Select value={forSaleOnly ? "for-sale" : "all"} onValueChange={(value) => setForSaleOnly(value === "for-sale")}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All NFTs</SelectItem>
                  <SelectItem value="for-sale">For Sale Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="btn-primary">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load NFTs. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : nfts && nfts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft: any) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page + 1}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!nfts || nfts.length < limit}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No NFTs found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later as new NFTs are generated from trending articles.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Priced NFTs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Priced
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {topNfts && topNfts.length > 0 ? (
                  <div className="space-y-4">
                    {topNfts.map((nft: any, index: number) => (
                      <div key={nft.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {nft.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {nft.price} ETH
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No NFTs available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {recentTransactions && recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Sale #{transaction.id.slice(0, 8)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {transaction.price} ETH
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent transactions
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume</span>
                    <span className="text-sm font-semibold">127.5 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Floor Price</span>
                    <span className="text-sm font-semibold">0.05 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="text-sm font-semibold">{nfts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Owners</span>
                    <span className="text-sm font-semibold">342</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create NFT */}
            <Card className="gradient-primary text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Create NFT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-white/90">
                  Generate unique NFTs from trending news articles with AI-powered metadata.
                </p>
                <Button
                  variant="secondary"
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Generate NFT
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
