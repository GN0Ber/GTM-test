import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Mic, MicOff } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { saveSession, saveRecommendation } from '../utils/dataService';
import { gtmChatStart, gtmChatMessage, gtmChatEnd, gtmRecommendationRequest, gtmPageView } from '../utils/gtm';
import '../App.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    gtmPageView('chat', user.user_id);
    gtmChatStart(user.user_id);
    
    // Initial assistant message
    setMessages([{
      id: 1,
      type: 'assistant',
      content: `Olá, ${user.name}! Estou aqui para te ajudar a encontrar os melhores caminhos para investir com segurança. Me conta um pouco: por que você quer investir agora?`,
      timestamp: new Date()
    }]);
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sessionEnded) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    gtmChatMessage(user.user_id, 'user');
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantResponse = generateAssistantResponse(inputMessage);
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      gtmChatMessage(user.user_id, 'assistant');
    }, 1000);

    setInputMessage('');
  };

  const generateAssistantResponse = (userMessage) => {
    const responses = [
      "Entendo. Que valor você tem disponível para investir agora?",
      "Interessante! Você pretende investir todo o valor de uma vez ou aos poucos?",
      "Perfeito! Já teve alguma experiência com renda fixa ou variável?",
      "Ótimo! Você acompanha o mercado ou prefere não se preocupar com isso?",
      "Muito bem! Com base no que você me contou, posso gerar uma recomendação personalizada. Gostaria de encerrar nossa conversa por agora?",
      "Obrigado pelas informações! Vou processar tudo que conversamos para criar sua recomendação personalizada."
    ];
    
    return responses[Math.min(messages.filter(m => m.type === 'user').length, responses.length - 1)];
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      // Compile session data
      const sessionCompiled = messages
        .filter(m => m.type === 'user')
        .map(m => m.content)
        .join('. ');

      const sessionData = {
        user_id: user.user_id,
        session_compiled: sessionCompiled
      };

      const savedSession = await saveSession(sessionData);
      gtmChatEnd(user.user_id, savedSession.session_id);
      setSessionEnded(true);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'assistant',
        content: 'Sessão encerrada! Agora você pode solicitar uma recomendação personalizada baseada em nossa conversa.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecommendation = async () => {
    setLoading(true);
    try {
      gtmRecommendationRequest(user.user_id, messages.length);
      
      // Simulate recommendation generation
      const recommendationData = {
        user_id: user.user_id,
        session_id: messages.length,
        suitability_id: 1, // Would get from user's latest suitability
        input_json: JSON.stringify({ session: messages }),
        output_json: JSON.stringify({
          assets: [
            { name: "Tesouro Selic 2029", percentage: 40, description: "Título público com liquidez diária" },
            { name: "CDB Banco XP", percentage: 35, description: "Certificado com proteção do FGC" },
            { name: "Fundo DI", percentage: 25, description: "Fundo de renda fixa conservador" }
          ]
        })
      };

      const savedRecommendation = await saveRecommendation(recommendationData);
      navigate(`/recommendation/${savedRecommendation.recommendation_id}`);
    } catch (error) {
      console.error('Error requesting recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop speech recognition
    if (!isRecording) {
      // Simulate voice input
      setTimeout(() => {
        setInputMessage("Esta é uma mensagem simulada por voz");
        setIsRecording(false);
      }, 2000);
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
              Chat com Assistente
            </h1>
            {sessionEnded && (
              <Badge variant="secondary" className="ml-auto">
                Sessão Encerrada
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            {!sessionEnded ? (
              <div className="flex space-x-2">
                <div className="flex-1 flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleRecording}
                    className={isRecording ? 'bg-red-100 text-red-600' : ''}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || loading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleEndSession}
                  disabled={loading || messages.filter(m => m.type === 'user').length < 2}
                >
                  {loading ? 'Encerrando...' : 'Encerrar Conversa'}
                </Button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleRequestRecommendation}
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? 'Gerando...' : 'Solicitar Recomendação'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/home')}
                >
                  Voltar à Home
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

