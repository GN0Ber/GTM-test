import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '../utils/auth';
import { saveSuitability } from '../utils/dataService';
import { gtmSuitabilityStart, gtmSuitabilityComplete, gtmPageView, gtmError } from '../utils/gtm';
import '../App.css';

const questions = [
  {
    id: 1,
    question: "Qual é o seu principal objetivo ao investir?",
    options: [
      { value: "preservar", label: "Preservar o capital (não perder dinheiro)", score: 1 },
      { value: "crescer_baixo", label: "Crescimento baixo e estável", score: 2 },
      { value: "crescer_medio", label: "Crescimento moderado", score: 3 },
      { value: "crescer_alto", label: "Crescimento alto (aceito mais risco)", score: 4 }
    ]
  },
  {
    id: 2,
    question: "Por quanto tempo você pretende manter o dinheiro investido?",
    options: [
      { value: "curto", label: "Menos de 1 ano", score: 1 },
      { value: "medio", label: "1 a 3 anos", score: 2 },
      { value: "longo", label: "3 a 5 anos", score: 3 },
      { value: "muito_longo", label: "Mais de 5 anos", score: 4 }
    ]
  },
  {
    id: 3,
    question: "Qual é a sua experiência com investimentos?",
    options: [
      { value: "nenhuma", label: "Nenhuma experiência", score: 1 },
      { value: "basica", label: "Básica (poupança, CDB)", score: 2 },
      { value: "intermediaria", label: "Intermediária (fundos, ações)", score: 3 },
      { value: "avancada", label: "Avançada (derivativos, day trade)", score: 4 }
    ]
  },
  {
    id: 4,
    question: "Como você reagiria se seus investimentos perdessem 20% do valor em um mês?",
    options: [
      { value: "venderia_tudo", label: "Venderia tudo imediatamente", score: 1 },
      { value: "ficaria_preocupado", label: "Ficaria muito preocupado", score: 2 },
      { value: "aguardaria", label: "Aguardaria a recuperação", score: 3 },
      { value: "compraria_mais", label: "Compraria mais (oportunidade)", score: 4 }
    ]
  },
  {
    id: 5,
    question: "Que percentual da sua renda você pode investir mensalmente?",
    options: [
      { value: "ate_5", label: "Até 5%", score: 1 },
      { value: "5_15", label: "5% a 15%", score: 2 },
      { value: "15_30", label: "15% a 30%", score: 3 },
      { value: "acima_30", label: "Acima de 30%", score: 4 }
    ]
  }
];

export default function Suitability() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    gtmPageView('suitability');
    if (user) {
      gtmSuitabilityStart(user.user_id);
    }
  }, [user]);

  const handleAnswer = (questionId, value, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, score }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateProfile = (totalScore) => {
    if (totalScore <= 8) return "Conservador";
    if (totalScore <= 12) return "Moderado";
    if (totalScore <= 16) return "Arrojado";
    return "Agressivo";
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
      const profile = calculateProfile(totalScore);
      
      const suitabilityData = {
        user_id: user.user_id,
        score: totalScore,
        profile: profile,
        json: JSON.stringify(answers)
      };

      await saveSuitability(suitabilityData);
      gtmSuitabilityComplete(user.user_id, profile, totalScore);
      navigate('/home');
    } catch (err) {
      gtmError('suitability_failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Suitability</h1>
          <p className="text-gray-600">
            Vamos conhecer seu perfil de investidor para oferecer as melhores recomendações
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            <CardDescription>
              Selecione a opção que melhor representa sua situação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentAnswer?.value || ""}
              onValueChange={(value) => {
                const option = currentQ.options.find(opt => opt.value === value);
                handleAnswer(currentQ.id, value, option.score);
              }}
              className="space-y-4"
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={!currentAnswer || loading}
              >
                {loading ? 'Finalizando...' : 
                 currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

