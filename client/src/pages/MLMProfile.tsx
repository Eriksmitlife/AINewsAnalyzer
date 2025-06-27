import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trophy, Star, Users, Gift, TrendingUp, Calendar,
  Crown, Flame, BookOpen, Sparkles, Share2, Coins,
  Copy, Check, ExternalLink, Zap, Target, Award,
  ChevronRight, Wallet, ArrowUp, Clock, DollarSign
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
  level: number;
  experience: number;
  ancBalance: string;
  totalEarnings: string;
  achievementPoints: number;
  currentTitle: string;
  referralCode: string;
  dailyLoginStreak: number;
  lastActive: string;
}

interface Challenge {
  id: number;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  type: string;
  category: string;
  requirements: any;
  rewards: any;
  difficulty: number;
  icon: string;
  color: string;
  isActive: boolean;
}

interface UserChallenge {
  id: number;
  challengeId: number;
  status: string;
  currentValue: number;
  targetValue: number;
  challenge: Challenge;
}

interface Achievement {
  id: number;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  category: string;
  rarity: string;
  icon: string;
  color: string;
  isNew?: boolean;
}

interface LevelInfo {
  level: number;
  name: string;
  nameRu: string;
  experienceRequired: number;
  ancReward: string;
  benefits: any;
  color: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  thisMonthEarnings: string;
  referralNetwork: any[];
}

const iconMap: { [key: string]: any } = {
  trophy: Trophy, 
  star: Star, 
  users: Users, 
  gift: Gift, 
  trending: TrendingUp, 
  calendar: Calendar,
  crown: Crown, 
  flame: Flame, 
  book: BookOpen, 
  sparkles: Sparkles, 
  share: Share2, 
  coins: Coins,
  award: Award, 
  target: Target, 
  zap: Zap, 
  external: ExternalLink,
  handshake: Users,
  dollar: DollarSign,
  check: Check
};

function MLMProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/mlm/profile'],
    retry: false,
  });

  // Fetch user challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery<UserChallenge[]>({
    queryKey: ['/api/mlm/challenges'],
    retry: false,
  });

  // Fetch user achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/mlm/achievements'],
    retry: false,
  });

  // Fetch current level info
  const { data: currentLevel } = useQuery<LevelInfo>({
    queryKey: ['/api/mlm/level', profile?.level],
    enabled: !!profile?.level,
    retry: false,
  });

  // Fetch next level info
  const { data: nextLevel } = useQuery<LevelInfo>({
    queryKey: ['/api/mlm/level', (profile?.level || 1) + 1],
    enabled: !!profile?.level,
    retry: false,
  });

  // Fetch referral stats
  const { data: referralStats } = useQuery<ReferralStats>({
    queryKey: ['/api/mlm/referrals/stats'],
    retry: false,
  });

  // Claim challenge reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return apiRequest('POST', `/api/mlm/challenges/${challengeId}/claim`);
    },
    onSuccess: () => {
      toast({
        title: "Награда получена!",
        description: "Вы успешно получили награду за выполнение вызова.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mlm/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mlm/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось получить награду",
        variant: "destructive",
      });
    },
  });

  // Daily login mutation
  const dailyLoginMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/mlm/daily-login');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Ежедневный бонус!",
        description: `Получено ${data.ancReward} ANC и ${data.experienceReward} опыта!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mlm/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mlm/challenges'] });
    },
  });

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      toast({
        title: "Скопировано!",
        description: "Реферальный код скопирован в буфер обмена",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Trophy;
    return IconComponent;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-orange-500';
      case 'mythic': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressPercentage = () => {
    if (!profile || !nextLevel) return 0;
    const currentExp = profile.experience;
    const currentLevelExp = currentLevel?.experienceRequired || 0;
    const nextLevelExp = nextLevel.experienceRequired;
    const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <p className="text-slate-300">Профиль не найден</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-800 to-purple-800 border-slate-700 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-purple-500">
                <AvatarImage src={profile.profileImageUrl} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge 
                    className="text-sm px-3 py-1"
                    style={{ backgroundColor: currentLevel?.color, color: 'white' }}
                  >
                    {currentLevel?.nameRu || profile.currentTitle} • Уровень {profile.level}
                  </Badge>
                  <Badge variant="outline" className="text-purple-300 border-purple-400">
                    {profile.achievementPoints} очков достижений
                  </Badge>
                  <Badge variant="outline" className="text-green-300 border-green-400">
                    {profile.dailyLoginStreak} дней подряд
                  </Badge>
                </div>
                
                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>Опыт: {profile.experience}</span>
                    <span>До следующего уровня: {nextLevel ? nextLevel.experienceRequired - profile.experience : 0}</span>
                  </div>
                  <Progress 
                    value={getProgressPercentage()} 
                    className="h-3 bg-slate-700"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                    <Coins className="w-6 h-6" />
                    {parseFloat(profile.ancBalance).toLocaleString()} ANC
                  </div>
                  <div className="text-sm text-slate-400">
                    Всего заработано: {parseFloat(profile.totalEarnings).toLocaleString()} ANC
                  </div>
                </div>
                <Button 
                  onClick={() => dailyLoginMutation.mutate()}
                  disabled={dailyLoginMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ежедневный бонус
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Обзор
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-600">
              Вызовы
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
              Достижения
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-purple-600">
              Рефералы
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <Card className="bg-gradient-to-br from-green-800 to-emerald-800 border-green-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Баланс
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {parseFloat(profile.ancBalance).toLocaleString()} ANC
                  </div>
                  <div className="text-green-200 text-sm">
                    Всего заработано: {parseFloat(profile.totalEarnings).toLocaleString()} ANC
                  </div>
                </CardContent>
              </Card>

              {/* Level Card */}
              <Card className="bg-gradient-to-br from-purple-800 to-pink-800 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Уровень
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {profile.level}
                  </div>
                  <div className="text-purple-200 text-sm">
                    {currentLevel?.nameRu || profile.currentTitle}
                  </div>
                  <div className="text-purple-200 text-sm">
                    {profile.experience} / {nextLevel?.experienceRequired || 0} опыта
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card className="bg-gradient-to-br from-orange-800 to-red-800 border-orange-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Достижения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {achievements.length}
                  </div>
                  <div className="text-orange-200 text-sm">
                    {profile.achievementPoints} очков достижений
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Недавние достижения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.slice(0, 6).map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                      <div 
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-700 border border-slate-600"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: achievement.color }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {achievement.titleRu}
                          </div>
                          <div className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity.toUpperCase()}
                          </div>
                        </div>
                        {achievement.isNew && (
                          <Badge className="bg-red-500 text-white text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((userChallenge) => {
                const challenge = userChallenge.challenge;
                const IconComponent = getIconComponent(challenge.icon);
                const progress = (userChallenge.currentValue / userChallenge.targetValue) * 100;
                const isCompleted = userChallenge.status === 'completed';
                const isClaimed = userChallenge.status === 'claimed';
                
                return (
                  <Card 
                    key={userChallenge.id}
                    className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: challenge.color }}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">
                              {challenge.titleRu}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {challenge.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {challenge.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: challenge.difficulty }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4">
                        {challenge.descriptionRu}
                      </p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                          <span>Прогресс</span>
                          <span>
                            {userChallenge.currentValue} / {userChallenge.targetValue}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-700" />
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-green-400">
                            <Coins className="w-4 h-4" />
                            {challenge.rewards.anc} ANC
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <Zap className="w-4 h-4" />
                            {challenge.rewards.xp} XP
                          </div>
                        </div>
                        
                        {isCompleted && !isClaimed && (
                          <Button
                            size="sm"
                            onClick={() => claimRewardMutation.mutate(userChallenge.challengeId)}
                            disabled={claimRewardMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Получить
                          </Button>
                        )}
                        
                        {isClaimed && (
                          <Badge className="bg-green-600 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Получено
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon);
                
                return (
                  <Card 
                    key={achievement.id}
                    className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: achievement.color }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">
                            {achievement.titleRu}
                            {achievement.isNew && (
                              <Badge className="ml-2 bg-red-500 text-white text-xs">
                                NEW
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {achievement.descriptionRu}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Реферальная программа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Referral Code */}
                <div>
                  <Label className="text-slate-300 mb-2 block">
                    Ваш реферальный код
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile.referralCode || ''}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={copyReferralCode}
                      variant="outline"
                      className="border-slate-600"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Приглашайте друзей и получайте 10% от их заработков навсегда!
                  </p>
                </div>

                {/* Referral Stats */}
                {referralStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {referralStats.totalReferrals}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Всего рефералов
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {referralStats.activeReferrals}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Активных
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {parseFloat(referralStats.totalEarnings).toLocaleString()}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Всего заработано ANC
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {parseFloat(referralStats.thisMonthEarnings).toLocaleString()}
                      </div>
                      <div className="text-slate-400 text-sm">
                        За этот месяц ANC
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MLMProfile;