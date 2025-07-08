import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerUser } from '../utils/dataService';
import { setCurrentUser } from '../utils/auth';
import { gtmUserRegister, gtmPageView, gtmError } from '../utils/gtm';
import { useEffect } from 'react';
import '../App.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    income_range: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    gtmPageView('register');
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newUser = await registerUser(formData);
      setCurrentUser(newUser);
      gtmUserRegister(newUser.user_id, newUser.email);
      navigate('/suitability');
    } catch (err) {
      setError(err.message);
      gtmError('register_failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se para começar a investir com segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="João"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Sobrenome</Label>
                <Input
                  id="surname"
                  placeholder="Silva"
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
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha segura"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Faixa de Renda</Label>
              <Select onValueChange={(value) => handleInputChange('income_range', value)}>
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
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Faça login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

