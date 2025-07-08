import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, BarChart3, History, User, CreditCard, Settings, LogOut, Menu } from 'lucide-react';
import { getCurrentUser, logout } from '../utils/auth';
import { getSuitabilityByUserId, getRecommendationsByUserId } from '../utils/dataService';
import { gtmPageView, gtmUserLogout } from '../utils/gtm';
import '../App.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [suitability, setSuitability] = useState(null);
  const [lastRecommendation, setLastRecommendation] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    gtmPageView('home', currentUser.user_id);
    loadUserData(currentUser.user_id);
  }, [navigate]);

  const loadUserData = async (userId) => {
    try {
      const suitabilityData = await getSuitabilityByUserId(userId);
      if (suitabilityData.length > 0) {
        setSuitability(suitabilityData[suitabilityData.length - 1]); // Get latest
      }

      const recommendations = await getRecommendationsByUserId(userId);
      if (recommendations.length > 0) {
        setLastRecommendation(recommendations[recommendations.length - 1]); // Get latest
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    if (user) {
      gtmUserLogout(user.user_id);
    }
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: MessageCircle, label: 'Conversar com Assistente', path: '/chat' },
    { icon: BarChart3, label: 'Refazer Suitability', path: '/suitability' },
    { icon: History, label: 'Histórico', path: '/history' },
    { icon: User, label: 'Meu Perfil', path: '/profile' },
    { icon: CreditCard, label: 'Planos e Assinaturas', path: '/plans' },
    { icon: Settings, label: 'Métodos de Pagamento', path: '/cards' },
  ];

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">WiseBuddy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user.name}!
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className={`lg:col-span-1 ${menuOpen ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair do App
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao WiseBuddy!</CardTitle>
                <CardDescription>
                  Seu assistente virtual de investimentos está pronto para ajudá-lo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/chat')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <MessageCircle className="h-6 w-6 mb-2" />
                    Conversar com Assistente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/suitability')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Refazer Suitability
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            {suitability && (
              <Card>
                <CardHeader>
                  <CardTitle>Seu Perfil de Investidor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {suitability.profile}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Pontuação: {suitability.score}/20
                      </p>
                      <p className="text-xs text-gray-500">
                        Avaliado em {new Date(suitability.evaluation_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/suitability')}
                    >
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Last Recommendation */}
            {lastRecommendation && (
              <Card>
                <CardHeader>
                  <CardTitle>Última Recomendação</CardTitle>
                  <CardDescription>
                    Gerada em {new Date(lastRecommendation.request_date).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua carteira personalizada está pronta para visualização
                  </p>
                  <Button
                    onClick={() => navigate(`/recommendation/${lastRecommendation.recommendation_id}`)}
                  >
                    Ver Recomendação
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/history')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <History className="h-5 w-5 mb-2" />
                    <span className="text-sm">Histórico</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <User className="h-5 w-5 mb-2" />
                    <span className="text-sm">Perfil</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/plans')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <CreditCard className="h-5 w-5 mb-2" />
                    <span className="text-sm">Planos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

