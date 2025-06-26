import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NewsCard from "@/components/NewsCard";
import { Search, Filter, TrendingUp, Clock, Eye } from "lucide-react";

const CATEGORIES = [
  "All",
  "AI & Technology",
  "Finance & Crypto", 
  "Startups",
  "Science",
  "Business",
  "Health"
];

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Latest" },
  { value: "aiScore", label: "AI Score" },
  { value: "viewCount", label: "Most Viewed" },
  { value: "trendingScore", label: "Trending" }
];

export default function News() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["/api/news", { 
      search: search || undefined,
      category: category !== "All" ? category : undefined,
      sortBy,
      sortOrder: "desc",
      limit,
      offset: page * limit
    }],
    retry: false,
  });

  const { data: trendingArticles } = useQuery({
    queryKey: ["/api/news/trending?limit=5"],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("publishedAt");
    setPage(0);
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Feed</h1>
            <p className="text-gray-600 dark:text-gray-300">Stay updated with AI-analyzed news from trusted sources</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="badge-verified">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live Updates
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search news, articles, or topics..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-32">
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

                <Button type="submit" className="btn-primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load articles. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : articles && articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article: any) => (
                    <NewsCard key={article.id} article={article} />
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
                    disabled={!articles || articles.length < limit}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria or check back later for new content.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {trendingArticles && trendingArticles.length > 0 ? (
                  <div className="space-y-4">
                    {trendingArticles.map((article: any, index: number) => (
                      <div key={article.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-orange-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              {article.viewCount || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No trending articles available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {CATEGORIES.slice(1).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setPage(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        category === cat
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      News collection completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      AI analysis updated
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      New NFT generated
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
