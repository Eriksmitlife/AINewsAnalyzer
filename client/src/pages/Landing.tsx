import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Trophy, 
  Rocket, 
  Sparkles,
  Shield,
  Globe,
  Play,
  TrendingUp,
  Star,
  Gamepad2,
  Sword,
  Crown,
  Diamond,
  Flame,
  CheckCircle
} from "lucide-react";

export default function Landing() {
  const [progressValue, setProgressValue] = useState(0);
  const [stats, setStats] = useState([0, 0, 0]);
  const [powerLevel, setPowerLevel] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats([
        Math.floor(Math.random() * 1000) + 10000,
        Math.floor(Math.random() * 500) + 5000, 
        Math.floor(Math.random() * 50) + 100
      ]);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgressValue((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);

    const powerInterval = setInterval(() => {
      setPowerLevel((prev) => (prev >= 9999 ? 0 : prev + Math.floor(Math.random() * 100) + 50));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearInterval(powerInterval);
    };
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Epic Gaming Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 rgb-grid"></div>

        {/* Animated RGB Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/30 rounded-full blur-[128px] animate-pulse delay-2000"></div>
      </div>



      {/* Epic Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center animate-glow">
                  <Brain className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  AUTONEWS.AI
                </h1>
                <p className="text-xs text-purple-400 font-bold tracking-[0.3em] uppercase">
                  Quantum News Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-orange-400 font-bold">POWER: {powerLevel}</span>
              </div>
              <Button 
                onClick={handleLogin}
                className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  PLAY NOW
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Achievement Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-full border border-purple-500/50 backdrop-blur-xl mb-8">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">🔥 TOP #1 AI NEWS PLATFORM 2025</span>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>

            {/* Epic Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 gaming-text animate-gradient-x">
                ENTER THE MATRIX
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 gaming-text">
                OF QUANTUM NEWS
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Level up your news game with <span className="text-purple-400 font-bold">AI-powered analysis</span>, 
              mint <span className="text-pink-400 font-bold">legendary NFTs</span>, and dominate the 
              <span className="text-cyan-400 font-bold"> information metaverse</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={handleLogin}
                className="group relative px-12 py-6 text-xl font-black rounded-xl overflow-hidden transform hover:scale-110 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 animate-gradient-x"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20"></div>
                <span className="relative z-10 flex items-center gap-3">
                  <Rocket className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                  START ADVENTURE
                  <Sparkles className="w-6 h-6" />
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </Button>

              <Button 
                variant="outline"
                className="px-12 py-6 text-xl font-bold rounded-xl bg-black/50 border-2 border-purple-500/50 text-purple-400 hover:border-purple-400 hover:bg-purple-950/50 transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                WATCH GAMEPLAY
              </Button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Crown, label: "ACTIVE PLAYERS", value: stats[0].toLocaleString() + "+", color: "from-yellow-400 to-orange-400" },
                { icon: Diamond, label: "NFTs MINTED", value: stats[1].toLocaleString() + "+", color: "from-purple-400 to-pink-400" },
                { icon: Zap, label: "AI ANALYSES", value: stats[2] + "M+", color: "from-cyan-400 to-blue-400" },
                { icon: Sword, label: "SYSTEM POWER", value: progressValue + "%", color: "from-red-400 to-pink-400" }
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`} />
                    <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 animate-float">
          <Star className="w-8 h-8 text-yellow-400 opacity-50" />
        </div>
        <div className="absolute top-3/4 right-10 animate-float delay-1000">
          <Star className="w-6 h-6 text-purple-400 opacity-50" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 animate-float delay-2000">
          <Star className="w-10 h-10 text-pink-400 opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              LEGENDARY FEATURES
            </h2>
            <p className="text-xl text-gray-400">
              Unlock godlike powers in the news metaverse
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "QUANTUM AI CORE",
                description: "4 AI personalities analyze news with 99.9% accuracy",
                badge: "LEGENDARY",
                color: "from-purple-600 to-pink-600"
              },
              {
                icon: Globe,
                title: "METAVERSE HUB",
                description: "5 virtual worlds with AI companions and events",
                badge: "EPIC",
                color: "from-blue-600 to-cyan-600"
              },
              {
                icon: TrendingUp,
                title: "MARKET ORACLE",
                description: "Predict global economy with quantum algorithms",
                badge: "MYTHIC",
                color: "from-green-600 to-emerald-600"
              },
              {
                icon: Shield,
                title: "BLOCKCHAIN ARMOR",
                description: "Military-grade security with ANC cryptocurrency",
                badge: "RARE",
                color: "from-red-600 to-orange-600"
              },
              {
                icon: Rocket,
                title: "AUTO EVOLUTION",
                description: "Self-improving AI that gets smarter every second",
                badge: "UNIQUE",
                color: "from-indigo-600 to-purple-600"
              },
              {
                icon: Trophy,
                title: "ACHIEVEMENT SYSTEM",
                description: "Earn rewards, unlock features, dominate leaderboards",
                badge: "NEW",
                color: "from-yellow-600 to-orange-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="relative group bg-black/50 backdrop-blur-xl border-purple-500/30 overflow-hidden hover:scale-105 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardContent className="p-8 relative">
                  <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center animate-glow`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0`}>
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
              ТАРИФНЫЕ ПЛАНЫ
            </h2>
            <p className="text-xl text-gray-400">
              Выберите свой путь к доминированию
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "STARTER",
                price: "FREE",
                period: "Навсегда",
                features: ["5 AI анализов в день", "Базовые NFT", "Доступ к маркетплейсу", "Сообщество"],
                color: "from-gray-600 to-gray-800",
                popular: false
              },
              {
                name: "PRO",
                price: "$29",
                period: "в месяц",
                features: ["Безлимитные AI анализы", "Премиум NFT", "Приоритетная поддержка", "Расширенная аналитика", "VIP доступ"],
                color: "from-purple-600 to-pink-600",
                popular: true
              },
              {
                name: "LEGEND",
                price: "$99",
                period: "в месяц",
                features: ["Все возможности PRO", "Квантовый ИИ анализ", "Белый лейбл", "Личный менеджер", "API доступ"],
                color: "from-yellow-500 to-orange-500",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      🔥 ПОПУЛЯРНЫЙ
                    </Badge>
                  </div>
                )}
                <div className={`bg-black/30 backdrop-blur-xl border-2 ${plan.popular ? 'border-purple-500' : 'border-gray-700'} rounded-2xl p-8 text-center`}>
                  <h3 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${plan.color} mb-4`}>
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-lg">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleLogin}
                    className={`w-full py-3 bg-gradient-to-r ${plan.color} text-white font-bold rounded-lg hover:scale-105 transition-all duration-300`}
                  >
                    ВЫБРАТЬ ПЛАН
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
              ЧАСТЫЕ ВОПРОСЫ
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Что такое AutoNews.AI?",
                a: "AutoNews.AI - это революционная платформа, которая использует квантовый ИИ для анализа новостей и автоматического создания NFT из актуальной информации."
              },
              {
                q: "Как работает создание NFT из новостей?",
                a: "Наша система анализирует новости в реальном времени, оценивает их важность и вирусный потенциал, а затем автоматически создает уникальные NFT с метаданными и визуализацией."
              },
              {
                q: "Можно ли зарабатывать на платформе?",
                a: "Да! Пользователи зарабатывают через торговлю NFT, участие в аукционах, стейкинг ANC токенов и реферальную программу."
              },
              {
                q: "Что такое квантовый ИИ анализ?",
                a: "Это передовая технология анализа, использующая 4 ИИ-личности для многомерной оценки новостей по эмоциональному, социальному, экономическому, временному и технологическому измерениям."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-black/30 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-3">{faq.q}</h4>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-8">
            ГОТОВЫ СТАТЬ ЛЕГЕНДОЙ?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Присоединяйтесь к элитному отряду новостных воинов и покорите информационную эпоху
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handleLogin}
              className="group relative px-16 py-8 text-2xl font-black rounded-xl overflow-hidden transform hover:scale-110 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 animate-gradient-x"></div>
              <span className="relative z-10 flex items-center gap-3">
                <Crown className="w-8 h-8" />
                ЗАХВАТИТЬ ТРОН
                <Crown className="w-8 h-8" />
              </span>
            </Button>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">✅ Бесплатная регистрация</div>
              <div className="text-gray-400">✅ Без скрытых платежей</div>
              <div className="text-gray-400">✅ Начните зарабатывать сегодня</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}