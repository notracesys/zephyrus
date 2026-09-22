'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCheck, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/lib/i18n';
import { useAppConfig } from '@/components/config-provider';

type FeedbackData = {
  imageUrl: string;
};

type Message = {
  id: string | number;
  sender: 'user' | 'team';
  content?: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'feedback';
  feedbackData?: FeedbackData;
};

const TypingIndicator = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-1 p-3 rounded-lg">
    <span className="text-muted-foreground text-sm">{text}</span>
    <div className="flex space-x-1">
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
    </div>
  </div>
);

const FeedbackCard = ({ data }: { data: FeedbackData }) => (
  <div className="animate-in zoom-in-95 duration-500 w-full max-w-[280px]">
    <img 
        src={data.imageUrl} 
        alt="Visual" 
        className="rounded-2xl border-2 border-primary/20 shadow-2xl w-full h-auto"
    />
  </div>
);

export default function ChatInterface() {
  const { t, lang, isReady } = useLanguage();
  const config = useAppConfig();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setIsTypingText] = useState('');
  
  // Controle de estados do fluxo sequencial
  const [stepPhase, setStepPhase] = useState<number>(1);
  const [showNextButtonPhase1, setShowNextButtonPhase1] = useState(false);
  const [showNextButtonPhase2, setShowNextButtonPhase2] = useState(false);
  const [showFinalCheckoutBtn, setShowFinalCheckoutBtn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatText = (text: string) => {
    let result = text.replace(/\{siteName\}/g, config.siteName);
    const rawReason = searchParams.get('banReason') || 'motivo não especificado';
    const cleanReason = rawReason.toLowerCase();
    result = result.replace(/\{banReason\}/g, cleanReason);
    return result;
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const formatted = formatText(text);
    const parts = formatted.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Primeira fase do chat (Mensagens 1 a 4)
  useEffect(() => {
    if (!isReady || stepPhase !== 1) return;

    const runPhase1 = async () => {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      const rawReason = searchParams.get('banReason') || 'motivo não identificado';
      
      // Mensagem inicial do usuário enviando os dados do formulário
      const initialMessageContent = `Dados para análise:\nTempo de suspensão: ${searchParams.get('suspensionTime') || 'N/A'}.\nUsou software terceiro: ${searchParams.get('thirdPartySoftware') || 'N/A'}.\nMotivo listado: ${rawReason}.\nPrimeira infração: ${searchParams.get('firstOffense') || 'N/A'}.`;
      setMessages([{ id: 'initial-user', sender: 'user', content: initialMessageContent, status: 'read', type: 'text' }]);
      
      await delay(2000);
      
      // Chat 1
      setIsTypingText(t.chat_typing || 'Digitando');
      setIsTyping(true);
      await delay(4000); // Pausa inicial
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: 'team',
        content: `Entendi perfeitamente sua situação, vi que você foi banido por **${rawReason.toLowerCase()}**. Mas preste muita atenção antes de fazer qualquer coisa: **NÃO sai mandando mensagem de qualquer jeito pro suporte agora.**`
      }]);
      setIsTyping(false);
      
      await delay(3000);
      
      // Chat 2
      setIsTyping(true);
      await delay(8000);
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: 'team',
        content: `A maioria das pessoas quando leva ban entra em total desespero, copia qualquer texto genérico da internet, manda um "por favor, devolve minha conta" e acha que isso vai milagrosamente resolver 🤣`
      }]);
      setIsTyping(false);

      await delay(3500);

      // Chat 3
      setIsTyping(true);
      await delay(8000);
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: 'team',
        content: `Aí vem aquela mesma resposta robótica padrão deles. Até você já deve ter recebido algo parecido, acertei?`
      }]);
      setIsTyping(false);

      await delay(3000);

      // Chat 4
      setIsTyping(true);
      await delay(5000);
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: 'team',
        content: `Só que foi justamente analisando esse comportamento que percebi uma coisa fundamental: O problema real **É COMO** a pessoa tenta falar com o suporte técnico.`
      }]);
      setIsTyping(false);
      
      await delay(1000);
      setShowNextButtonPhase1(true);
    };

    runPhase1();
  }, [isReady, stepPhase]);

  // Ação ao clicar no botão 1: QUERO ENTENDER ISSO!
  const triggerPhase2 = async () => {
    setShowNextButtonPhase1(false);
    setMessages(prev => [...prev, { id: generateId(), sender: 'user', content: '🔥 QUERO ENTENDER ISSO!', status: 'read', type: 'text' }]);
    setStepPhase(2);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1500);

    // Chat 5
    setIsTyping(true);
    await delay(2000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Boa! Então presta muita atenção porque essa parte aqui é extremamente importante:` }]);
    setIsTyping(false);

    await delay(2500);

    // Chat 6
    setIsTyping(true);
    await delay(4000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Se você mandar qualquer coisa de qualquer jeito, explicar mal, copiar texto manjado ou sair insistindo sem estratégia nenhuma, você só vira mais uma solicitação ignorada no meio de milhares.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 7
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `E adivinha o que costuma vir logo em seguida?` }]);
    setIsTyping(false);

    await delay(2000);

    // MOSTRA IMAGEM EMAIL.JPG
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/email.jpg' } }]);

    await delay(2000);

    // Chat 8
    setIsTyping(true);
    await delay(2000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Exatamente. A mesma resposta automática e sem coração de sempre.` }]);
    setIsTyping(false);

    await delay(3500);

    // Chat 9
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Essa é a resposta de negação que todo mundo recebe tentando do jeito básico. Só que eu descobri uma brecha certa de como estruturar o pedido de revisão humana.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 10
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Foi exatamente aí que nasceu o **Método Unban Strategy**.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 11
    setIsTyping(true);
    await delay(5000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `E agora vem o ponto chave que você precisa entender bem: Se eu fosse você, de verdade, eu não deixaria para resolver isso depois.` }]);
    setIsTyping(false);

    await delay(3500);

    // Chat 12
    setIsTyping(true);
    await delay(7000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Quem fica enrolando demais normalmente volta quando já mudaram tudo no servidor. Se o jogo atualizar novamente nas próximas horas, já era, a conta é deletada definitivamente!` }]);
    setIsTyping(false);

    await delay(1000);
    setShowNextButtonPhase2(true);
  };

  // Ação ao clicar no botão 2: QUERO VER ANTES QUE MUDE
  const triggerFinalPhase = async () => {
    setShowNextButtonPhase2(false);
    setMessages(prev => [...prev, { id: generateId(), sender: 'user', content: '🚨 QUERO VER ANTES QUE MUDE', status: 'read', type: 'text' }]);
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1500);

    // Chat 13
    setIsTyping(true);
    await delay(3000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Antes de te mostrar como pegar o acesso completo, dá uma olhada nisso aqui.` }]);
    setIsTyping(false);

    await delay(2500);

    // Chat 14
    setIsTyping(true);
    await delay(3000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Tinha uma galera que estava exatamente na mesma situação ruim que você está passando:` }]);
    setIsTyping(false);

    await delay(1000);
    // MOSTRAR IMAGEM FEEDBACK1.JPG
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/feedback1.jpg' } }]);

    await delay(4000);

    // Chat 15 (A)
    setIsTyping(true);
    await delay(1000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `E olha essa outra conta recuperada aqui também:` }]);
    setIsTyping(false);

    await delay(1000);
    // MOSTRAR IMAGEM FEEDBACK2.JPG
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/feedback2.jpg' } }]);

    await delay(4000);

    // Chat 15 (B)
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Estou te mostrando esses casos reais pra te provar que tentar do jeito estruturado faz muito mais sentido do que continuar jogando mensagens aleatórias e torcendo por milagre.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 16
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `E agora deixa eu te mandar a real sobre a liberação desse acesso estratégico.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 17
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Isso daqui deu muito trabalho e dor de cabeça e não foi feito pra ser distribuído como qualquer hackzinho barato e inútil da internet.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 18
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Nós sabemos muito bem que você colocou meses ou anos de esforço, pegou skins raras, passes antigos e investiu dinheiro e tempo real dentro dessa conta.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 19
    setIsTyping(true);
    await delay(4000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Então sim, pela importância gigante do que está em jogo aqui, esse método poderia facilmente custar R$ 100 ou R$ 150. Mas eu não vou cobrar isso de você.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 20
    setIsTyping(true);
    await delay(6000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Eu quero colocar o máximo possível de jogadores legítimos para dentro enquanto essa versão do sistema ainda está rodando perfeitamente.` }]);
    setIsTyping(false);

    await delay(3000);

    // Chat 21
    setIsTyping(true);
    await delay(5000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Então, exclusivamente para o dia de hoje, o acesso completo ao método seguro está por apenas:\n\n🔥 **R$ 29,90**\n\nSó isso mesmo.` }]);
    setIsTyping(false);

    await delay(2000);
    setShowFinalCheckoutBtn(true);

    await delay(2000);
    // Chat 22
    setIsTyping(true);
    await delay(2000);
    setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: `Se você realmente quer ter a chance real de ter sua conta ativa de volta, eu não enrolaria nem mais um segundo.` }]);
    setIsTyping(false);
  };

  const handlePurchaseInitiation = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    
    const tracking = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
      src: searchParams.get('src') || 'chat_flow_real',
    };

    const baseCheckoutUrl = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;
    
    try {
      const checkoutUrl = new URL(baseCheckoutUrl);
      Object.entries(tracking).forEach(([key, value]) => {
        if (value) checkoutUrl.searchParams.append(key, value);
      });

      if (firestore) {
        addDoc(collection(firestore, 'checkoutClicks'), {
          timestamp: serverTimestamp(),
          source: 'chat-direct-redirect',
          siteId: sessionStorage.getItem('active_site_id') || 'global',
          url: checkoutUrl.toString()
        });
      }

      window.location.href = checkoutUrl.toString();
    } catch (e) {
      window.location.href = baseCheckoutUrl;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 h-20 flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={config.teamAvatar} />
                <AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                  <h2 className="font-bold text-lg">{formatText(t.chat_team)}</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.chat_online}</p>
                  </div>
              </div>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const isTeam = msg.sender === 'team';
                    const nextMessage = messages[index + 1];

                    return (
                    <div key={msg.id} className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                        {isTeam && (
                          <div className="w-8">
                            {nextMessage?.sender !== 'team' && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={config.teamAvatar} />
                                <AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        {msg.type === 'feedback' && msg.feedbackData ? (
                          <FeedbackCard data={msg.feedbackData} />
                        ) : (
                          <div className={cn('relative p-3 max-w-[85%] md:max-w-lg shadow-md', isUser ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl' : 'bg-secondary text-secondary-foreground rounded-t-xl rounded-br-xl')}>
                              <div className="text-sm whitespace-pre-wrap break-words">
                                  {renderContent(msg.content || '')}
                              </div>
                              {isUser && (
                                <div className="flex justify-end items-center gap-1 mt-1">
                                  <CheckCheck className={cn("h-4 w-4", msg.status === 'read' ? "text-blue-500" : "text-muted-foreground")} />
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                )})}
                
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={config.teamAvatar} />
                      <AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg p-2 bg-secondary">
                      <TypingIndicator text={typingText} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>

        <div className="bg-card border-t p-4">
            {showNextButtonPhase1 && (
              <div className="flex justify-center max-w-4xl mx-auto animate-in fade-in-50 duration-500">
                <Button onClick={triggerPhase2} className="w-full font-black italic h-14 text-lg bg-primary text-primary-foreground">
                  🔥 QUERO ENTENDER ISSO! <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {showNextButtonPhase2 && (
              <div className="flex justify-center max-w-4xl mx-auto animate-in fade-in-50 duration-500">
                <Button onClick={triggerFinalPhase} className="w-full font-black italic h-14 text-lg bg-primary text-primary-foreground">
                  🚨 QUERO VER ANTES QUE MUDE <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {showFinalCheckoutBtn && (
              <div className="flex justify-center max-w-4xl mx-auto animate-in fade-in-50 duration-500">
                <Button 
                  disabled={isRedirecting}
                  onClick={handlePurchaseInitiation} 
                  className="w-full font-black italic bg-gradient-to-r from-green-500 to-emerald-600 text-white h-16 text-xl shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
                >
                  {isRedirecting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecionando para o pagamento...</>
                  ) : (
                    <>{t.chat_purchase_btn || 'SALVAR MINHA CONTA AGORA'} <ArrowRight className="ml-2 h-6 w-6" /></>
                  )}
                </Button>
              </div>
            )}
        </div>
    </div>
  );
}
