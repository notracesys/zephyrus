
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCheck, AlertTriangle, ArrowRight } from 'lucide-react';
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
import Link from 'next/link';
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
        alt="Feedback" 
        className="rounded-2xl border-2 border-primary/20 shadow-2xl w-full h-auto"
    />
  </div>
);

export default function ChatInterface() {
  const { t, isReady, lang } = useLanguage();
  const config = useAppConfig();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  const [showPurchaseButton, setShowPurchaseButton] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatText = (text: string) => {
    return text.replace(/\{siteName\}/g, config.siteName);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const checkoutUrl = lang === 'pt' ? config.checkoutUrlPt : config.checkoutUrlEnEs;

  useEffect(() => {
    if (!isReady) return;

    const initialMessageContent = `${formatText(t.chat_initial_msg)}
${t.chat_label_suspension_time}: ${searchParams.get('suspensionTime') || 'N/A'}.
${t.chat_label_software}: ${searchParams.get('thirdPartySoftware') || 'N/A'}.
${t.chat_label_reason}: ${searchParams.get('banReason') || 'N/A'}.
${t.chat_label_first_offense}: ${searchParams.get('firstOffense') || 'N/A'}.
${t.chat_label_purchases}: ${searchParams.get('hasMadePurchases') || 'N/A'}.
${t.chat_label_warnings}: ${searchParams.get('priorWarnings') || 'N/A'}.

${t.chat_label_description}:
"${searchParams.get('banDescription') || 'N/A'}"
`;

    setMessages(prev => {
        if (prev.length > 0) return prev;
        return [{ id: 'initial-user', sender: 'user', content: initialMessageContent, status: 'read', type: 'text' }];
    });

    const timeouts: NodeJS.Timeout[] = [];

    const t1 = setTimeout(() => {
        setIsTyping(true);
        const t2 = setTimeout(() => {
            const teamResponse: Message = {
                id: 'team-1', sender: 'team',
                content: formatText(t.chat_initial_response),
                type: 'text',
            };
            setMessages((prev) => [...prev, teamResponse]);
            setIsTyping(false);
            
            const t3 = setTimeout(() => {
              setIsTyping(true);
              const t4 = setTimeout(() => {
                const teamResponse2: Message = {
                  id: 'team-2', sender: 'team',
                  content: formatText(t.chat_msg_2),
                  type: 'text',
                };
                setMessages((prev) => [...prev, teamResponse2]);
                setIsTyping(false);
                 const t5 = setTimeout(() => {
                    setIsTyping(true);
                    const t6 = setTimeout(() => {
                        const teamResponse3: Message = {
                            id: 'team-3', sender: 'team',
                            content: formatText(t.chat_msg_3),
                            type: 'text',
                        };
                        setMessages((prev) => [...prev, teamResponse3]);
                        setIsTyping(false);
                        setShowOptions(true);
                    }, 3000); 
                    timeouts.push(t6);
                }, 6000); 
                timeouts.push(t5);
              }, 3000);
              timeouts.push(t4);
            }, 6000);
            timeouts.push(t3);
            
        }, 3000); 
        timeouts.push(t2);
    }, 4000); 

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [searchParams, t, isReady, config.siteName]);

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
        id: generateId(),
        sender: 'user',
        content: option === 'sim' ? t.chat_option_yes : t.chat_option_no,
        status: 'read',
        type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setShowOptions(false);

    if (option === 'sim') {
        const flow = async () => {
            const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

            // Great choice
            await delay(1500);
            setIsTyping(true);
            await delay(3000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_great_choice), type: 'text' }]);
            setIsTyping(false);

            // Unban Story 1
            await delay(4000);
            setIsTyping(true);
            await delay(5000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_unban_story), type: 'text' }]);
            setIsTyping(false);

            // Final Msg (Introduction to email.jpg)
            await delay(6000);
            setIsTyping(true);
            await delay(4000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_final_msg), type: 'text' }]);
            setIsTyping(false);

            // Email Image
            await delay(3000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/email.jpg' } }]);

            // Unban Story 2 (Robots vs Human)
            await delay(6000);
            setIsTyping(true);
            await delay(5000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_final_msg_2), type: 'text' }]);
            setIsTyping(false);

            // Feedback Intro
            await delay(6000);
            setIsTyping(true);
            await delay(4000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_feedback_intro), type: 'text' }]);
            setIsTyping(false);

            // Feedback 1
            await delay(2000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/feedback1.png' } }]);

            // Feedback 2
            await delay(3000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', type: 'feedback', feedbackData: { imageUrl: '/feedback2.png' } }]);

            // Unban Strategy Intro
            await delay(5000);
            setIsTyping(true);
            await delay(4000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_unban_strategy_intro), type: 'text' }]);
            setIsTyping(false);

            // Important Notice Popup
            await delay(2000);
            setShowImportantNotice(true);

            // Pricing Msg
            await delay(3000);
            setIsTyping(true);
            await delay(4000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_final_msg_3), type: 'text' }]);
            setIsTyping(false);

            // Final CTA
            await delay(6000);
            setIsTyping(true);
            await delay(3000);
            setMessages(prev => [...prev, { id: generateId(), sender: 'team', content: formatText(t.chat_final_msg_4), type: 'text' }]);
            setIsTyping(false);
            setShowPurchaseButton(true);
        };

        flow();
    }
  }

  return (
    <>
      <AlertDialog open={showImportantNotice} onOpenChange={setShowImportantNotice}>
        <AlertDialogContent className="w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> {t.chat_warning_title}</AlertDialogTitle>
            <AlertDialogDescription>{t.chat_warning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowImportantNotice(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 h-20 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary"><AvatarImage src={config.teamAvatar} /><AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback></Avatar>
                <div>
                    <h2 className="font-bold text-lg">{formatText(t.chat_team)}</h2>
                    <div className="flex items-center gap-2"><div className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></div><p className="text-sm text-muted-foreground">{t.chat_online}</p></div>
                </div>
            </div>
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((msg, index) => {
                      const isUser = msg.sender === 'user';
                      const isTeam = msg.sender === 'team';
                      const prevMessage = messages[index - 1];
                      const nextMessage = messages[index + 1];

                      return (
                      <div key={msg.id} className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                          {isTeam && (<div className="w-8">{nextMessage?.sender !== 'team' && (<Avatar className="h-8 w-8"><AvatarImage src={config.teamAvatar} /><AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback></Avatar>)}</div>)}
                          
                          {msg.type === 'feedback' && msg.feedbackData ? (
                            <FeedbackCard data={msg.feedbackData} />
                          ) : (
                            <div className={cn('relative p-3 max-w-[85%] md:max-w-lg shadow-md', isUser ? 'bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl' : 'bg-secondary text-secondary-foreground rounded-t-xl rounded-br-xl', (isUser && prevMessage?.sender === 'user') && 'rounded-tr-none', (isUser && nextMessage?.sender === 'user') && 'rounded-bl-none', (isTeam && prevMessage?.sender === 'team') && 'rounded-tl-none', (isTeam && nextMessage?.sender === 'team') && 'rounded-br-none')}>
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                {isUser && (<div className="flex justify-end items-center gap-1 mt-1"><CheckCheck className={cn("h-4 w-4", msg.status === 'read' ? "text-blue-500" : "text-muted-foreground")} /></div>)}
                            </div>
                          )}
                      </div>
                  )})}
                  {isTyping && (<div className="flex items-end gap-2 justify-start"><Avatar className="h-8 w-8"><AvatarImage src={config.teamAvatar} /><AvatarFallback>{config.siteName.slice(0,1)}</AvatarFallback></Avatar><div className="max-w-md rounded-lg p-2 bg-secondary"><TypingIndicator text={t.chat_typing} /></div></div>)}
                   <div ref={chatEndRef} />
              </div>
          </div>
          <div className="bg-card border-t p-4">
              {showOptions && (<div className="flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto animate-in fade-in-50 duration-500"><Button onClick={() => handleOptionClick('sim')} className="flex-1 font-bold h-12">{t.chat_option_yes}</Button><Button onClick={() => handleOptionClick('nao')} variant="secondary" className="flex-1 font-semibold h-12">{t.chat_option_no}</Button></div>)}
              {showPurchaseButton && (
                <div className="flex justify-center max-w-4xl mx-auto animate-in fade-in-50 duration-500">
                  <Button 
                    asChild 
                    size="lg" 
                    onClick={() => handleTrackCheckout(checkoutUrl)} 
                    className="w-full sm:w-auto font-bold relative overflow-hidden bg-primary text-primary-foreground h-14"
                  >
                    <Link href={checkoutUrl} target="_blank">
                      {t.chat_purchase_btn} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
          </div>
      </div>
    </>
  );
}
