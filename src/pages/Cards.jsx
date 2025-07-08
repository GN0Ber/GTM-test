import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, CreditCard, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getCardsByUserId, saveCard, deleteCard } from '../utils/dataService';
import { gtmCardAdd, gtmCardRemove, gtmPageView, gtmError } from '../utils/gtm';
import '../App.css';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    brand: 'Visa'
  });
  const [addingCard, setAddingCard] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('cards', user.user_id);
    loadCards();
  }, [user, navigate]);

  const loadCards = async () => {
    try {
      const cardsData = await getCardsByUserId(user.user_id);
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
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
    return true;
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setAddingCard(true);
    setError('');

    if (!validateCardData()) {
      setAddingCard(false);
      return;
    }

    try {
      const newCardData = {
        user_id: user.user_id,
        masked_number: '**** **** **** 9999',
        token: `token_${Date.now()}`,
        brand: cardData.brand,
        expiration_date: cardData.expiry
      };

      const savedCard = await saveCard(newCardData);
      setCards(prev => [...prev, savedCard]);
      gtmCardAdd(user.user_id, cardData.brand);
      
      // Reset form
      setCardData({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        brand: 'Visa'
      });
      setShowAddCard(false);
    } catch (err) {
      setError('Erro ao salvar cartão. Tente novamente.');
      gtmError('card_add_failed', err.message, user.user_id);
    } finally {
      setAddingCard(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCard(cardId);
      setCards(prev => prev.filter(card => card.card_id !== cardId));
      gtmCardRemove(user.user_id, cardId);
    } catch (error) {
      console.error('Error deleting card:', error);
      gtmError('card_delete_failed', error.message, user.user_id);
    }
  };

  const getBrandIcon = (brand) => {
    return <CreditCard className="h-6 w-6" />;
  };

  const getBrandColor = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'bg-blue-500';
      case 'mastercard': return 'bg-red-500';
      case 'elo': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div>Carregando cartões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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
                Métodos de Pagamento
              </h1>
            </div>
            <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cartão
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                  <DialogDescription>
                    Adicione um cartão de crédito para facilitar seus pagamentos
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCard} className="space-y-4">
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

                  {/* Test Card Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-blue-900 mb-1">
                          Dados para Teste
                        </h4>
                        <p className="text-xs text-blue-800">
                          <strong>Cartão:</strong> 9999 9999 9999 9999<br />
                          <strong>CVV:</strong> 999 | <strong>Vencimento:</strong> 25/12
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddCard(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addingCard}>
                      {addingCard ? 'Salvando...' : 'Salvar Cartão'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cards List */}
        {cards.length === 0 ? (
          <Card>
            <CardContent className="text-center p-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cartão cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione um cartão de crédito para facilitar seus pagamentos
              </p>
              <Button onClick={() => setShowAddCard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cartão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cartões Salvos ({cards.length})
            </h2>
            
            {cards.map((card) => (
              <Card key={card.card_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getBrandColor(card.brand)} text-white`}>
                        {getBrandIcon(card.brand)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {card.brand} {card.masked_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Vence em {card.expiration_date}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(card.card_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Security Info */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-green-700">
              <p>🔒 Seus dados de cartão são criptografados e armazenados com segurança</p>
              <p>🛡️ Utilizamos tokenização para proteger informações sensíveis</p>
              <p>✅ Conformidade com padrões PCI DSS de segurança</p>
              <p>🔐 Nunca armazenamos o CVV do seu cartão</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/plans')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mb-1" />
                Ver Planos
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mb-1" />
                Histórico de Pagamentos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

