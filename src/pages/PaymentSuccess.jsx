import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, MessageCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { gtmPageView } from '../utils/gtm';
import '../App.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { payment, plan } = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!payment || !plan) {
      navigate('/plans');
      return;
    }
    
    gtmPageView('payment_success', user.user_id);
  }, [user, payment, plan, navigate]);

  if (!payment || !plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription>
            Seu plano foi ativado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Plano:</span>
              <span>{plan.plan_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Valor:</span>
              <span>R$ {plan.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">ID do Pagamento:</span>
              <span>#{payment.payment_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Data:</span>
              <span>{new Date(payment.payment_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-medium">{payment.status}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Próximos Passos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Seu plano está ativo e pronto para uso</li>
              <li>✓ Acesso liberado a todas as funcionalidades</li>
              <li>✓ Comece conversando com o assistente virtual</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/chat')}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Conversar com Assistente
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/home')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>
              Dúvidas? Entre em contato com nosso suporte.<br />
              Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

