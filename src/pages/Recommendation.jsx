import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ExternalLink, TrendingUp } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getRecommendationById } from '../utils/dataService';
import { gtmRecommendationView, gtmRecommendationInvest, gtmPageView } from '../utils/gtm';
import '../App.css';

export default function Recommendation() {
  const { id } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('recommendation', user.user_id);
    loadRecommendation();
  }, [id, user, navigate]);

  const loadRecommendation = async () => {
    try {
      const data = await getRecommendationById(id);
      if (data) {
        setRecommendation(data);
        const assets = JSON.parse(data.output_json).assets;
        gtmRecommendationView(user.user_id, data.recommendation_id, assets);
      }
    } catch (error) {
      console.error('Error loading recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestClick = () => {
    gtmRecommendationInvest(user.user_id, recommendation.recommendation_id);
    // Simulate opening XP Investimentos app/website
    window.open('https://www.xpi.com.br', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando recomendação...</div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <p>Recomendação não encontrada</p>
            <Button onClick={() => navigate('/home')} className="mt-4">
              Voltar à Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assets = JSON.parse(recommendation.output_json).assets;

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
              Sua Recomendação Personalizada
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Carteira Recomendada
            </CardTitle>
            <CardDescription>
              Gerada em {new Date(recommendation.request_date).toLocaleDateString('pt-BR')} 
              com base no seu perfil e objetivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{assets.length}</div>
                <div className="text-sm text-gray-600">Ativos Recomendados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Diversificação</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Conservador
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Perfil de Risco</div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleInvestClick} size="lg" className="px-8">
                <ExternalLink className="h-4 w-4 mr-2" />
                Quero Investir na XP
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Composição da Carteira
          </h2>
          
          {assets.map((asset, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {asset.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {asset.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {asset.percentage}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Alocação na carteira</span>
                    <span className="font-medium">{asset.percentage}%</span>
                  </div>
                  <Progress value={asset.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleInvestClick}
            size="lg"
            className="px-8"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Investir na XP Investimentos
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/history')}
            size="lg"
          >
            Ver Histórico
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/chat')}
            size="lg"
          >
            Nova Conversa
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Esta recomendação é baseada nas informações fornecidas 
              e serve apenas como orientação. Consulte sempre um assessor financeiro credenciado 
              antes de tomar decisões de investimento. Rentabilidade passada não garante resultados futuros.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

