import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Save } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '../utils/auth';
import { gtmPageView } from '../utils/gtm';
import '../App.css';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    income_range: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('profile', user.user_id);
    
    // Load current user data
    setFormData({
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
      income_range: user.income_range || ''
    });
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in localStorage
      const updatedUser = { ...user, ...formData };
      setCurrentUser(updatedUser);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
              Meu Perfil
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Mantenha seus dados atualizados para receber recomendações mais precisas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Faixa de Renda</Label>
                <Select 
                  value={formData.income_range} 
                  onValueChange={(value) => handleInputChange('income_range', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua faixa de renda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Até R$ 2.000">Até R$ 2.000</SelectItem>
                    <SelectItem value="R$ 2.000 - R$ 5.000">R$ 2.000 - R$ 5.000</SelectItem>
                    <SelectItem value="R$ 5.000 - R$ 10.000">R$ 5.000 - R$ 10.000</SelectItem>
                    <SelectItem value="R$ 10.000 - R$ 20.000">R$ 10.000 - R$ 20.000</SelectItem>
                    <SelectItem value="Acima de R$ 20.000">Acima de R$ 20.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Perfil atualizado com sucesso!
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/home')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Data de Cadastro</span>
                <span className="text-sm text-gray-600">
                  {user?.sign_on_date ? new Date(user.sign_on_date).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">ID do Usuário</span>
                <span className="text-sm text-gray-600">#{user?.user_id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Status da Conta</span>
                <span className="text-sm text-green-600 font-medium">Ativa</span>
              </div>
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
                onClick={() => navigate('/suitability')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <User className="h-5 w-5 mb-1" />
                Refazer Suitability
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/plans')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <Save className="h-5 w-5 mb-1" />
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

