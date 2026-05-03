
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, AlertTriangle, ArrowRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Message = {
  id: number;
  sender: 'user' | 'team';
  content: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'feedback';
};

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-3 rounded-lg">
    <span className="text-muted-foreground text-sm">Digitando</span>
    <div className="flex space-x-1">
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
    </div>
  </div>
);

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  const [showPurchaseButton, setShowPurchaseButton] = useState(false);
  const [showFinalOptions, setShowFinalOptions] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const initialMessageContent = `Olá Equipe Zephyrus.
Minha conta foi banida há: ${searchParams.get('suspensionTime') || 'Não informado'}.
Usei software de terceiros: ${searchParams.get('thirdPartySoftware') || 'Não informado'}.
O motivo do banimento foi: ${searchParams.get('banReason') || 'Não informado'}.
É minha primeira suspensão: ${searchParams.get('firstOffense') || 'Não informado'}.
Já fiz compras na conta: ${searchParams.get('hasMadePurchases') || 'Não informado'}.
Recebi avisos prévios: ${searchParams.get('priorWarnings') || 'Não informado'}.

Descrição do ocorrido:
"${searchParams.get('banDescription') || 'Nenhuma descrição fornecida.'}"
`;

    const userMessage: Message = { id: 1, sender: 'user', content: initialMessageContent, status: 'read', type: 'text' };
    setMessages([userMessage]);

    setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
            const teamResponse: Message = {
                id: 2, sender: 'team',
                content: '👋 Olá! Recebemos suas informações. Após uma análise preliminar, identificamos que seu caso tem características de um banimento automático, o que significa que existem chances reais de recuperação. Nossa equipe pode preparar uma defesa técnica detalhada para você. 📄',
                type: 'text',
            };
            setMessages((prev) => [...prev, teamResponse]);
            setIsTyping(false);
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                const teamResponse2: Message = {
                  id: 3, sender: 'team',
                  content: `🤔 Muitos banimentos acontecem sem análise humana detalhada.\nQuando o caso é apresentado da forma certa, a plataforma pode reavaliar a decisão.💡\n\nÉ exatamente nesse ponto que a Equipe Zephyrus atua. 💪`,
                   type: 'text',
                };
                setMessages((prev) => [...prev, teamResponse2]);
                setIsTyping(false);
                 setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        const teamResponse3: Message = {
                            id: 4, sender: 'team',
                            content: 'Você deseja que a Equipe Zephyrus inicie a análise completa do seu caso? 🤔',
                            type: 'text',
                        };
                        setMessages((prev) => [...prev, teamResponse3]);
                        setIsTyping(false);
                        setShowOptions(true);
                    }, 3000); 
                }, 6000); 
              }, 3000);
            }, 6000);
        }, 3000); 
    }, 6000); 
  }, [searchParams]);

  const handleTrackCheckout = (url: string) => {
    if (!firestore) return;
    addDoc(collection(firestore, 'checkoutClicks'), {
      timestamp: serverTimestamp(),
      source: 'chat',
      url: url
    });
  };

  const handleOptionClick = (option: 'sim' | 'nao') => {
    const userMessage: Message = {
        id: Date.now(),
        sender: 'user',
        content: option === 'sim' ? 'Sim, quero tentar recuperar minha conta 👍' : 'Não, apenas estou me informando',
        status: 'read',
        type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setShowOptions(false);
    setShowFinalOptions(false);

    if (option === 'sim') {
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Ótima escolha. ✅\n\nVocê está dando o passo que a maioria não dá: recorrer da forma correta. 🚀', type: 'text' }]);
                setIsTyping(false);
                setTimeout(() => {
                    setShowImportantNotice(true);
                    setTimeout(() => {
                        setIsTyping(true);
                        setTimeout(() => {
                            setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Agora é o seguinte 👇\nSeu caso não é comum. Ele apresenta sinais claros de banimento automático: e esses são exatamente os casos que ainda valem a tentativa. ⚠️', type: 'text' }]);
                            setIsTyping(false);
                            setTimeout(() => {
                              setIsTyping(true);
                              setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Várias pessoas chegaram até nós com o mesmo problema, achando que tinham perdido tudo.\nApós a análise e o processo feito pela Equipe Zephyrus, muitas conseguiram recuperar suas contas. ✨', type: 'text' }]);
                                setIsTyping(false);
                                setTimeout(() => {
                                    setIsTyping(true);
                                    setTimeout(() => {
                                        setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Veja alguns feedbacks 👇', type: 'feedback' }]);
                                        setIsTyping(false);
                                        setTimeout(() => {
                                            setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: '', type: 'feedback' }]);
                                            setTimeout(() => {
                                                setIsTyping(true);
                                                setTimeout(() => {
                                                    setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'A diferença não foi sorte.\nFoi recorrer do jeito certo, com quem sabe o que está fazendo. 💪', type: 'text' }]);
                                                    setIsTyping(false);
                                                    setTimeout(() => {
                                                        setIsTyping(true);
                                                        setTimeout(() => {
                                                            setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Se você quer tentar recuperar sua conta enquanto ainda existe chance, esse é o momento. ⏳', type: 'text' }]);
                                                            setIsTyping(false);
                                                            setShowPurchaseButton(true);
                                                        }, 3000);
                                                    }, 6000);
                                                }, 3000)
                                            }, 6000)
                                        }, 3000);
                                    }, 3000)
                                }, 6000)
                              }, 3000);
                            }, 6000);
                        }, 3000);
                    }, 6000);
                }, 2000);
            }, 3000);
        }, 6000);
    } else {
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), sender: 'team', content: 'Você tem certeza? Essa pode ser uma decisão irreversível. É crucial que você entenda uma coisa: banimentos automáticos são como uma sentença de culpa.', type: 'text' }]);
                setIsTyping(false);
                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'team', content: 'Quando você NÃO RECORRE, o sistema entende que você está ACEITANDO A PUNIÇÃO. Ele marca seu caso como "resolvido", e suas chances de recuperação despencam para quase ZERO.', type: 'text' }]);
                        setIsTyping(false);
                        setTimeout(() => {
                            setIsTyping(true);
                            setTimeout(() => {
                                setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'team', content: 'Não agir é a pior escolha. O tempo corre contra você. Esta é sua última chance real.', type: 'text' }]);
                                setIsTyping(false);
                                setShowFinalOptions(true);
                            }, 3000);
                        }, 6000);
                    }, 3000);
                }, 6000);
            }, 3000);
        }, 6000);
    }
  }

  return (
    <>
      <AlertDialog open={showImportantNotice} onOpenChange={setShowImportantNotice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Importante:</AlertDialogTitle>
            <AlertDialogDescription>Em casos de banimento automático, o tempo é um fator decisivo. Quanto antes o processo é iniciado, maiores são as chances de sucesso.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowImportantNotice(false)} className="bg-primary hover:bg-primary/90">Fechar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 h-20 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary"><AvatarImage src="/equipe.png" /><AvatarFallback>Z</AvatarFallback></Avatar>
                <div>
                    <h2 className="font-bold text-lg">Equipe Zephyrus</h2>
                    <div className="flex items-center gap-2"><div className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></div><p className="text-sm text-muted-foreground">Online</p></div>
                </div>
            </div>
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((msg, index) => {
                      if (msg.type === 'feedback') {
                        return (
                            <div key={msg.id} className="ml-10 pt-2 flex flex-col items-start space-y-4 animate-in fade-in-50 duration-500">
                                <Image src="/feedback1.jpg" alt="Feedback 1" width={300} height={600} className="rounded-lg shadow-md" />
                                <Image src="/feedback2.jpg" alt="Feedback 2" width={300} height={600} className="rounded-lg shadow-md" />
                            </div>
                        )
                      }
                      const isUser = msg.sender === 'user';
                      const isTeam = msg.sender === 'team';
                      const prevMessage = messages[index - 1];
                      const nextMessage = messages[index + 1];

                      return (
                      <div key={msg.id} className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                          {isTeam && (<div className="w-8">{nextMessage?.sender !== 'team' && (<Avatar className="h-8 w-8"><AvatarImage src="/equipe.png" /><AvatarFallback>Z</AvatarFallback></Avatar>)}</div>)}
                          <div className={cn('relative p-3 max-w-[85%] md:max-w-lg shadow-md', isUser ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl' : 'bg-secondary text-secondary-foreground rounded-t-xl rounded-br-xl', (isUser && prevMessage?.sender === 'user') && 'rounded-tr-none', (isUser && nextMessage?.sender === 'user') && 'rounded-bl-none', (isTeam && prevMessage?.sender === 'team') && 'rounded-tl-none', (isTeam && nextMessage?.sender === 'team') && 'rounded-br-none')}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              {isUser && (<div className="flex justify-end items-center gap-1 mt-1"><CheckCheck className={cn("h-4 w-4", msg.status === 'read' ? "text-blue-500" : "text-muted-foreground")} /></div>)}
                          </div>
                      </div>
                  )})}
                  {isTyping && (<div className="flex items-end gap-2 justify-start"><Avatar className="h-8 w-8"><AvatarImage src="/equipe.png" /><AvatarFallback>Z</AvatarFallback></Avatar><div className="max-w-md rounded-lg p-2 bg-secondary"><TypingIndicator /></div></div>)}
                   <div ref={chatEndRef} />
              </div>
          </div>
          <div className="bg-card border-t p-4">
              {showOptions && (<div className="flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto animate-in fade-in-50 duration-500"><Button onClick={() => handleOptionClick('sim')} className="flex-1 font-bold">Sim, quero tentar recuperar minha conta 👍</Button><Button onClick={() => handleOptionClick('nao')} variant="secondary" className="flex-1 font-semibold">Não, apenas estou me informando</Button></div>)}
              {showPurchaseButton && (<div className="flex justify-center max-w-4xl mx-auto animate-in fade-in-50 duration-500"><Button asChild size="lg" onClick={() => handleTrackCheckout('https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6')} className="w-full sm:w-auto font-bold animate-shine bg-primary text-primary-foreground"><Link href="https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6" target="_blank">Quero Recuperar Minha Conta <ArrowRight className="ml-2 h-5 w-5" /></Link></Button></div>)}
               {showFinalOptions && (<div className="flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto animate-in fade-in-50 duration-500"><Button onClick={() => handleOptionClick('sim')} className="font-bold flex-1">Me Arrependi, quero recuperar! <ArrowRight className="ml-2 h-5 w-5" /></Button><Button asChild variant="outline" className="flex-1"><Link href="/"><Home className="mr-2 h-4 w-4" /> Desistir e Perder a Conta</Link></Button></div>)}
          </div>
      </div>
    </>
  );
}
