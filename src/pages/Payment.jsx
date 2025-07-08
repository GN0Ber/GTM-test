import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getCardsByUserId, saveCard, savePayment, saveContract } from '../utils/dataService';
import { gtmPaymentStart, gtmPaymentSuccess, gtmPaymentFailed, gtmCardAdd, gtmPageView, gtmError } from '../utils/gtm';
import '../App.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const selectedPlan = location.state?.selectedPlan;

  const [savedCards, setSavedCards] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('new_card');
  const [selectedCard, setSelectedCard] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    brand: 'Visa'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedPlan) {
      navigate('/plans');
      return;
    }
    
    gtmPageView('payment', user.user_id);
    gtmPaymentStart(user.user_id, selectedPlan.plan_id, selectedPlan.price);
    loadSavedCards();
  }, [user, selectedPlan, navigate]);

  const loadSavedCards = async () => {
    try {
      const cards = await getCardsByUserId(user.user_id);
      setSavedCards(cards);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleCardInputChange = (field, value) => {
    if (field === 'number') {
      // Format card number and validate
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue !== '9999999999999999') {
        setError('Para teste, use apenas o cartão: 9999 9999 9999 9999');
        return;
      }
      const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData(prev => ({ ...prev, [field]: formattedValue }));
      setError('');
    } else if (field === 'expiry') {
      if (value !== '25/12') {
        setError('Para teste, use apenas a data: 25/12');
        return;
      }
      setCardData(prev => ({ ...prev, [field]: value }));
      setError('');
    } else if (field === 'cvv') {
      if (value !== '999') {
        setError('Para teste, use apenas o CVV: 999');
        return;
      }
      setCardData(prev => ({ ...prev, [field]: value }));
      setError('');
    } else {
      setCardData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateCardData = () => {
    if (paymentMethod === 'new_card') {
      if (cardData.number !== '9999 9999 9999 9999') {
        setError('Número do cartão deve ser: 9999 9999 9999 9999');
        return false;
      }
      if (cardData.cvv !== '999') {
        setError('CVV deve ser: 999');
        return false;
      }
      if (cardData.expiry !== '25/12') {
        setError('Data de vencimento deve ser: 25/12');
        return false;
      }
      if (!cardData.name.trim()) {
        setError('Nome do titular é obrigatório');
        return false;
      }
    } else if (paymentMethod === 'saved_card' && !selectedCard) {
      setError('Selecione um cartão salvo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateCardData()) {
      setLoading(false);
      return;
    }

    try {
      // Save new card if needed
      let cardToUse = null;
      if (paymentMethod === 'new_card' && saveCard) {
        const newCardData = {
          user_id: user.user_id,
          masked_number: '**** **** **** 9999',
          token: `token_${Date.now()}`,
          brand: cardData.brand,
          expiration_date: cardData.expiry
        };
        cardToUse = await saveCard(newCardData);
        gtmCardAdd(user.user_id, cardData.brand);
      }

      // Process payment
      const paymentData = {
        user_id: user.user_id,
        plan_id: selectedPlan.plan_id,
        amount: selectedPlan.price,
        payment_method: 'Cartão de Crédito',
        status: 'Aprovado'
      };

      const payment = await savePayment(paymentData);

      // Create contract
      const contractData = {
        user_id: user.user_id,
        plan_id: selectedPlan.plan_id,
        status: 'active',
        expires_at: new Date(Date.now() + (selectedPlan.plan_id === 3 ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      await saveContract(contractData);

      gtmPaymentSuccess(user.user_id, payment.payment_id, selectedPlan.plan_id, selectedPlan.price);
      
      // Redirect to success page
      navigate('/payment-success', { 
        state: { 
          payment: payment,
          plan: selectedPlan 
        } 
      });

    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      gtmPaymentFailed(user.user_id, selectedPlan.plan_id, selectedPlan.price, err.message);
      gtmError('payment_processing_failed', err.message, user.user_id);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return null;
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
              onClick={() => navigate('/plans')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Finalizar Pagamento
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Informações de Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha seu método de pagamento preferido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-4">
                    <Label>Método de Pagamento</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new_card" id="new_card" />
                        <Label htmlFor="new_card">Novo Cartão de Crédito</Label>
                      </div>
                      {savedCards.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="saved_card" id="saved_card" />
                          <Label htmlFor="saved_card">Cartão Salvo</Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  {/* Saved Cards */}
                  {paymentMethod === 'saved_card' && savedCards.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selecionar Cartão</Label>
                      <Select value={selectedCard} onValueChange={setSelectedCard}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um cartão salvo" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedCards.map((card) => (
                            <SelectItem key={card.card_id} value={card.card_id.toString()}>
                              {card.brand} {card.masked_number} - {card.expiration_date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* New Card Form */}
                  {paymentMethod === 'new_card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card_number">Número do Cartão</Label>
                        <Input
                          id="card_number"
                          placeholder="9999 9999 9999 9999"
                          value={cardData.number}
                          onChange={(e) => handleCardInputChange('number', e.target.value)}
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card_name">Nome do Titular</Label>
                        <Input
                          id="card_name"
                          placeholder="Nome como está no cartão"
                          value={cardData.name}
                          onChange={(e) => handleCardInputChange('name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="card_expiry">Vencimento</Label>
                          <Input
                            id="card_expiry"
                            placeholder="25/12"
                            value={cardData.expiry}
                            onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card_cvv">CVV</Label>
                          <Input
                            id="card_cvv"
                            placeholder="999"
                            value={cardData.cvv}
                            onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                            maxLength={3}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card_brand">Bandeira</Label>
                          <Select value={cardData.brand} onValueChange={(value) => handleCardInputChange('brand', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visa">Visa</SelectItem>
                              <SelectItem value="Mastercard">Mastercard</SelectItem>
                              <SelectItem value="Elo">Elo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="save_card"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="save_card" className="text-sm">
                          Salvar cartão para próximas compras
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Test Card Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Dados para Teste
                        </h4>
                        <p className="text-sm text-blue-800">
                          <strong>Cartão:</strong> 9999 9999 9999 9999<br />
                          <strong>CVV:</strong> 999<br />
                          <strong>Vencimento:</strong> 25/12
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processando...' : `Pagar R$ ${selectedPlan.price.toFixed(2).replace('.', ',')}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedPlan.plan_name}</h3>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Desconto</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    Pagamento 100% seguro
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

