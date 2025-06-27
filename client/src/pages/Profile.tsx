import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Zap, 
  Star, 
  Crown, 
  Diamond, 
  Flame,
  Target,
  Award,
  TrendingUp,
  Users,
  Gift,
  Coins,
  Shield,
  Swords,
  Sparkles,
  Rocket,
  Medal,
  ChevronUp,
  Share2,
  UserPlus,
  Heart,
  MessageCircle,
  ThumbsUp,
  Eye,
  Music
} from "lucide-react";

// Tier configurations
const TIER_CONFIG = {
  bronze: { 
    name: "BRONZE", 
    color: "from-orange-700 to-orange-900", 
    icon: Shield, 
    minLevel: 1,
    benefits: ["5 ANC per challenge", "Basic rewards", "Access to easy challenges"]
  },
  silver: { 
    name: "SILVER", 
    color: "from-gray-400 to-gray-600", 
    icon: Swords, 
    minLevel: 10,
    benefits: ["10 ANC per challenge", "2x XP boost", "Access to medium challenges", "Referral bonuses"]
  },
  gold: { 
    name: "GOLD", 
    color: "from-yellow-400 to-yellow-600", 
    icon: Crown, 
    minLevel: 25,
    benefits: ["20 ANC per challenge", "3x XP boost", "Access to hard challenges", "VIP support", "Special NFT drops"]
  },
  platinum: { 
    name: "PLATINUM", 
    color: "from-gray-300 to-gray-500", 
    icon: Star, 
    minLevel: 50,
    benefits: ["50 ANC per challenge", "5x XP boost", "Exclusive challenges", "Priority features", "Governance rights"]
  },
  diamond: { 
    name: "DIAMOND", 
    color: "from-blue-300 to-blue-500", 
    icon: Diamond, 
    minLevel: 75,
    benefits: ["100 ANC per challenge", "10x XP boost", "Elite status", "Private events", "Revenue sharing"]
  },
  emerald: { 
    name: "EMERALD", 
    color: "from-emerald-400 to-emerald-600", 
    icon: Sparkles, 
    minLevel: 90,
    benefits: ["200 ANC per challenge", "15x XP boost", "Master trader perks", "AI assistant", "NFT royalties"]
  },
  legendary: { 
    name: "LEGENDARY", 
    color: "from-purple-400 via-pink-400 to-cyan-400", 
    icon: Rocket, 
    minLevel: 100,
    benefits: ["500 ANC per challenge", "20x XP boost", "Godlike powers", "Co-founder status", "Lifetime rewards"]
  }
};

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch user level data
  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ["/api/user/level"],
    enabled: !!user,
  });

  // Fetch user challenges
  const { data: userChallenges } = useQuery({
    queryKey: ["/api/user/challenges"],
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: userAchievements } = useQuery({
    queryKey: ["/api/user/achievements"],
    enabled: !!user,
  });

  // Fetch referral data
  const { data: referralData } = useQuery({
    queryKey: ["/api/user/referrals"],
    enabled: !!user,
  });

  // Fetch reward history
  const { data: rewardHistory } = useQuery({
    queryKey: ["/api/user/rewards"],
    enabled: !!user,
  });

  if (authLoading || levelLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-16 h-16"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Please log in to view your profile.</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const currentTier = userLevel?.tier || "bronze";
  const tierConfig = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG];
  const TierIcon = tierConfig.icon;
  const nextTierLevel = Object.values(TIER_CONFIG).find(t => t.minLevel > (userLevel?.level || 1))?.minLevel || 100;
  const levelProgress = ((userLevel?.experience || 0) % 1000) / 10;

  return (
    <Layout>
      <div className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="gaming-card p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar and Tier */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${tierConfig.color} p-1`}>
                  <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                    <TierIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className={`bg-gradient-to-r ${tierConfig.color} text-white border-0 px-3 py-1`}>
                    LVL {userLevel?.level || 1}
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {user.firstName || user.email?.split('@')[0] || 'Player'}
                </h1>
                <div className="flex items-center gap-4 justify-center lg:justify-start mb-4">
                  <Badge className={`bg-gradient-to-r ${tierConfig.color} text-white border-0 text-lg px-4 py-2`}>
                    {tierConfig.name} TIER
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-bold">{userLevel?.powerScore || 0} POWER</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="gaming-card">
                  <CardContent className="p-4 text-center">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold text-yellow-400">{userLevel?.totalEarnings || 0}</div>
                    <div className="text-xs text-gray-500">ANC EARNED</div>
                  </CardContent>
                </Card>
                <Card className="gaming-card">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold text-purple-400">{userLevel?.challengesCompleted || 0}</div>
                    <div className="text-xs text-gray-500">CHALLENGES</div>
                  </CardContent>
                </Card>
                <Card className="gaming-card">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                    <div className="text-2xl font-bold text-pink-400">{userLevel?.achievementPoints || 0}</div>
                    <div className="text-xs text-gray-500">ACHIEVEMENT PTS</div>
                  </CardContent>
                </Card>
                <Card className="gaming-card">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <div className="text-2xl font-bold text-cyan-400">{userLevel?.referralCount || 0}</div>
                    <div className="text-xs text-gray-500">REFERRALS</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Level {userLevel?.level || 1} Progress</span>
                <span className="text-sm text-gray-400">{userLevel?.experience || 0} / {((userLevel?.level || 1) * 1000)} XP</span>
              </div>
              <Progress value={levelProgress} className="h-4 bg-gray-800">
                <div className={`h-full bg-gradient-to-r ${tierConfig.color} rounded-full transition-all duration-500`} />
              </Progress>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Current Tier: {tierConfig.name}</span>
                <span className="text-xs text-gray-500">Next Tier at Level {nextTierLevel}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full bg-black/50 border border-purple-500/30">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/20">Overview</TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-600/20">Challenges</TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600/20">Achievements</TabsTrigger>
              <TabsTrigger value="referrals" className="data-[state=active]:bg-purple-600/20">Referrals</TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-600/20">Rewards</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Tier Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tierConfig.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, i) => {
                      const activity = Math.random() * 100;
                      return (
                        <div key={i} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </div>
                          <div 
                            className="h-20 bg-gray-800 rounded relative overflow-hidden"
                          >
                            <div 
                              className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-pink-600 transition-all duration-500"
                              style={{ height: `${activity}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {userChallenges?.map((challenge: any) => (
                  <Card key={challenge.id} className="gaming-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                          <p className="text-gray-400 text-sm">{challenge.description}</p>
                        </div>
                        <Badge className={`
                          ${challenge.difficulty === 'easy' ? 'bg-green-600' : ''}
                          ${challenge.difficulty === 'medium' ? 'bg-yellow-600' : ''}
                          ${challenge.difficulty === 'hard' ? 'bg-red-600' : ''}
                          ${challenge.difficulty === 'legendary' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                        `}>
                          {challenge.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-bold">{challenge.reward} ANC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 font-bold">{challenge.experiencePoints} XP</span>
                        </div>
                      </div>

                      <Progress value={challenge.progress || 0} className="h-2 mb-4" />

                      <Button 
                        className={`w-full ${
                          challenge.status === 'completed' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'gaming-button'
                        }`}
                        disabled={challenge.status === 'claimed'}
                      >
                        {challenge.status === 'in_progress' && 'Continue Challenge'}
                        {challenge.status === 'completed' && 'Claim Reward'}
                        {challenge.status === 'claimed' && 'Claimed ✓'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {userAchievements?.map((achievement: any) => (
                  <Card key={achievement.id} className={`gaming-card ${achievement.unlocked ? '' : 'opacity-50'}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${
                        achievement.rarity === 'common' ? 'from-gray-400 to-gray-600' :
                        achievement.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
                        achievement.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
                        achievement.rarity === 'legendary' ? 'from-yellow-400 to-yellow-600' :
                        'from-red-400 via-pink-400 to-purple-400'
                      } p-1`}>
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <Trophy className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{achievement.name}</h4>
                      <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{achievement.points} pts</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Your Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6 text-center">
                    <p className="text-3xl font-mono font-bold text-purple-400 mb-4">
                      {user.id?.slice(0, 8).toUpperCase() || 'GENERATE'}
                    </p>
                    <Button className="gaming-button">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Referral Link
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <Card className="bg-black/50 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-green-400">{referralData?.active || 0}</div>
                        <div className="text-xs text-gray-500">Active Referrals</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/50 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-2xl font-bold text-yellow-400">{referralData?.totalEarned || 0}</div>
                        <div className="text-xs text-gray-500">ANC Earned</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/50 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                        <div className="text-2xl font-bold text-purple-400">{referralData?.bonusLevel || 1}</div>
                        <div className="text-xs text-gray-500">Bonus Level</div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>MLM Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralData?.network?.map((level: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                            index === 0 ? 'from-yellow-400 to-yellow-600' :
                            index === 1 ? 'from-gray-400 to-gray-600' :
                            'from-orange-700 to-orange-900'
                          } flex items-center justify-center`}>
                            <span className="font-bold text-white">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-white">Level {index + 1} Network</p>
                            <p className="text-sm text-gray-400">{level.count} referrals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">{level.earnings} ANC</p>
                          <p className="text-xs text-gray-500">{level.percentage}% commission</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Reward History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewardHistory?.map((reward: any) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                            reward.type === 'challenge' ? 'from-purple-400 to-purple-600' :
                            reward.type === 'referral' ? 'from-green-400 to-green-600' :
                            reward.type === 'achievement' ? 'from-yellow-400 to-yellow-600' :
                            reward.type === 'level_up' ? 'from-blue-400 to-blue-600' :
                            'from-pink-400 to-pink-600'
                          } flex items-center justify-center`}>
                            {reward.type === 'challenge' && <Target className="w-5 h-5 text-white" />}
                            {reward.type === 'referral' && <UserPlus className="w-5 h-5 text-white" />}
                            {reward.type === 'achievement' && <Trophy className="w-5 h-5 text-white" />}
                            {reward.type === 'level_up' && <ChevronUp className="w-5 h-5 text-white" />}
                            {reward.type === 'bonus' && <Gift className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">{reward.description}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(reward.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-400">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">ANC</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}