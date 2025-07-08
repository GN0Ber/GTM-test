import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, TrendingUp, Calendar } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getSessionsByUserId, getRecommendationsByUserId } from '../utils/dataService';
import { gtmPageView } from '../utils/gtm';
import '../App.css';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('history', user.user_id);
    loadHistory();
  }, [user, navigate]);

  const loadHistory = async () => {
    try {
      const [sessionsData, recommendationsData] = await Promise.all([
        getSessionsByUserId(user.user_id),
        getRecommendationsByUserId(user.user_id)
      ]);
      
      setSessions(sessionsData.sort((a, b) => new Date(b.session_date) - new Date(a.session_date)));
      setRecommendations(recommendationsData.sort((a, b) => new Date(b.request_date) - new Date(a.request_date)));
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Histórico
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sessions')}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas ({sessions.length})
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('recommendations')}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Recomendações ({recommendations.length})
          </Button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhuma conversa encontrada</p>
                  <Button onClick={() => navigate('/chat')}>
                    Iniciar Nova Conversa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.session_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Conversa #{session.session_id}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.session_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {session.session_compiled}
                    </p>
                    <div className="flex items-center justify-between">
                      {session.recommendation_id ? (
                        <Badge variant="secondary">
                          Recomendação Gerada
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Sem Recomendação
                        </Badge>
                      )}
                      <div className="space-x-2">
                        {session.recommendation_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/recommendation/${session.recommendation_id}`)}
                          >
                            Ver Recomendação
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/chat')}
                        >
                          Nova Conversa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhuma recomendação encontrada</p>
                  <Button onClick={() => navigate('/chat')}>
                    Conversar com Assistente
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((recommendation) => {
                const assets = JSON.parse(recommendation.output_json).assets;
                return (
                  <Card key={recommendation.recommendation_id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Recomendação #{recommendation.recommendation_id}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(recommendation.request_date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <CardDescription>
                        {assets.length} ativos recomendados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {assets.slice(0, 2).map((asset, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{asset.name}</span>
                            <Badge variant="outline">{asset.percentage}%</Badge>
                          </div>
                        ))}
                        {assets.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{assets.length - 2} outros ativos
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">
                          Carteira Diversificada
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recommendation/${recommendation.recommendation_id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/chat')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mb-1" />
                Nova Conversa
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/suitability')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <TrendingUp className="h-5 w-5 mb-1" />
                Refazer Suitability
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

