import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, Zap } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getPlans } from '../utils/dataService';
import { gtmPlanView, gtmPlanSelect, gtmPageView } from '../utils/gtm';
import '../App.css';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('plans', user.user_id);
    loadPlans();
  }, [user, navigate]);

  const loadPlans = async () => {
    try {
      const plansData = await getPlans();
      setPlans(plansData);
      
      // Track plan views
      plansData.forEach(plan => {
        gtmPlanView(user.user_id, plan.plan_id, plan.plan_name);
      });
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    gtmPlanSelect(user.user_id, plan.plan_id, plan.plan_name, plan.price);
    navigate('/payment', { state: { selectedPlan: plan } });
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 1: return <Zap className="h-6 w-6" />;
      case 2: return <Star className="h-6 w-6" />;
      case 3: return <Star className="h-6 w-6" />;
      default: return <Check className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 1: return 'border-blue-200 hover:border-blue-300';
      case 2: return 'border-green-200 hover:border-green-300 ring-2 ring-green-500';
      case 3: return 'border-purple-200 hover:border-purple-300';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Planos e Assinaturas
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tenha acesso ao assistente virtual de investimentos e receba recomendações 
            personalizadas baseadas no seu perfil
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.plan_id} 
              className={`relative transition-all duration-200 ${getPlanColor(plan.plan_id)}`}
            >
              {plan.plan_id === 2 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.plan_id === 1 ? 'bg-blue-100 text-blue-600' :
                    plan.plan_id === 2 ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getPlanIcon(plan.plan_id)}
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{plan.plan_name}</CardTitle>
                <CardDescription className="text-sm mb-4">
                  {plan.description}
                </CardDescription>
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  {plan.plan_id === 3 && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">R$ 959,88</span>
                      <span className="text-green-600 font-medium ml-2">Economize R$ 159,98</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full ${
                    plan.plan_id === 2 ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  variant={plan.plan_id === 2 ? 'default' : 'outline'}
                >
                  {plan.plan_id === 1 ? 'Comprar Agora' : 'Assinar Plano'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comparação de Recursos</CardTitle>
            <CardDescription>
              Veja todos os recursos incluídos em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Recursos</th>
                    <th className="text-center py-3 px-4">Avulsa</th>
                    <th className="text-center py-3 px-4">Mensal</th>
                    <th className="text-center py-3 px-4">Anual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Sessões de chat</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">Ilimitadas</td>
                    <td className="text-center py-3 px-4">Ilimitadas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Recomendações personalizadas</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">Ilimitadas</td>
                    <td className="text-center py-3 px-4">Ilimitadas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Refazer suitability</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Suporte prioritário</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Relatórios mensais</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Posso cancelar minha assinatura a qualquer momento?</h4>
                <p className="text-sm text-gray-600">
                  Sim, você pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo até o final do período pago.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">As recomendações são garantidas?</h4>
                <p className="text-sm text-gray-600">
                  As recomendações são baseadas em análises técnicas e seu perfil de investidor, mas não garantem rentabilidade. Sempre consulte um assessor financeiro.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Posso mudar de plano depois?</h4>
                <p className="text-sm text-gray-600">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento através da área de configurações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

