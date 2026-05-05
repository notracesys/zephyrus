'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Eye, TrendingUp, Activity, ShoppingCart, Lock, LogIn, Loader2, LogOut, Package, UserCheck, Clock } from 'lucide-react';
import { format, isSameDay, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--primary))",
  },
};

export default function PortalDoChefe() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const visitsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'visits');
  }, [firestore, user]);
  const { data: visitsData, isLoading: visitsLoading } = useCollection(visitsQuery);

  const clicksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'checkoutClicks');
  }, [firestore, user]);
  const { data: clicksData, isLoading: clicksLoading } = useCollection(clicksQuery);

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'purchases'), orderBy('timestamp', 'desc'), limit(15));
  }, [firestore, user]);
  const { data: salesData, isLoading: salesLoading } = useCollection(salesQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!visitsData) return [];
    const daysCount = timeRange === '7d' ? 7 : 30;
    const data = [];
    const today = startOfDay(new Date());
    for (let i = daysCount - 1; i >= 0; i--) {
      const currentDay = subDays(today, i);
      const count = visitsData.filter(visit => {
        if (!visit.timestamp) return false;
        const visitDate = visit.timestamp.toDate ? visit.timestamp.toDate() : new Date(visit.timestamp);
        return isSameDay(visitDate, currentDay);
      }).length;
      let name = timeRange === '7d' ? format(currentDay, 'EEE', { locale: ptBR }).replace('.', '').slice(0, 3).toUpperCase() : format(currentDay, 'dd/MM');
      data.push({ name, visits: count, isToday: isSameDay(currentDay, today) });
    }
    return data;
  }, [visitsData, timeRange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Acesso autorizado." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Credenciais inválidas." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!mounted) return null;
  if (isUserLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="mx-auto h-8 w-8 text-primary mb-2" />
              <CardTitle>Portal do Chefe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>Entrar</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">Dashboard <Activity className="text-primary" /></h1>
          <Button variant="outline" size="sm" onClick={() => signOut(auth)}><LogOut className="h-4 w-4 mr-2" /> Sair</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/50"><CardContent className="pt-6"><div className="flex justify-between"><p className="text-xs font-bold uppercase text-muted-foreground">Visitas</p><Eye className="h-4 w-4" /></div><div className="text-2xl font-black">{visitsLoading ? '...' : visitsData?.length}</div></CardContent></Card>
          <Card className="bg-card/50"><CardContent className="pt-6"><div className="flex justify-between"><p className="text-xs font-bold uppercase text-muted-foreground">Checkouts</p><ShoppingCart className="h-4 w-4" /></div><div className="text-2xl font-black">{clicksLoading ? '...' : clicksData?.length}</div></CardContent></Card>
          <Card className="bg-card/50"><CardContent className="pt-6"><div className="flex justify-between"><p className="text-xs font-bold uppercase text-muted-foreground">Vendas</p><Package className="h-4 w-4 text-green-500" /></div><div className="text-2xl font-black">{salesLoading ? '...' : salesData?.length}</div></CardContent></Card>
          <Card className="bg-card/50"><CardContent className="pt-6"><div className="flex justify-between"><p className="text-xs font-bold uppercase text-muted-foreground">Conversão</p><TrendingUp className="h-4 w-4" /></div><div className="text-2xl font-black">{!visitsData?.length ? '0%' : `${((salesData?.length || 0) / visitsData.length * 100).toFixed(1)}%`}</div></CardContent></Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Tráfego</CardTitle><Tabs defaultValue="7d" onValueChange={(v) => setTimeRange(v as any)}><TabsList className="bg-background"><TabsTrigger value="7d" className="text-xs">7d</TabsTrigger><TabsTrigger value="30d" className="text-xs">30d</TabsTrigger></TabsList></Tabs></CardHeader>
            <CardContent className="h-[300px]"><ChartContainer config={chartConfig} className="h-full w-full"><ResponsiveContainer><BarChart data={chartData}><CartesianGrid vertical={false} strokeOpacity={0.1} /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={9} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="visits" radius={[4, 4, 0, 0]}>{chartData.map((e, i) => (<Cell key={i} fill={e.isToday ? 'hsl(var(--primary))' : 'rgba(255,204,0,0.15)'} />))}</Bar></BarChart></ResponsiveContainer></ChartContainer></CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">Vendas e Acessos <Package className="h-4 w-4" /></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 
                 salesData?.length === 0 ? <p className="text-center text-muted-foreground py-10">Nenhuma venda registrada.</p> :
                 salesData?.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/30">
                    <div className="space-y-1">
                      <p className="text-xs font-medium truncate max-w-[140px]">{sale.email}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" /> {sale.timestamp?.toDate ? format(sale.timestamp.toDate(), 'HH:mm') : '--:--'}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {sale.accessed ? (
                        <Badge variant="default" className="bg-green-600 text-[8px] h-4">ACESSOU A ENTREGA</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground">NÃO ACESSOU AINDA</Badge>
                      )}
                      <div className="text-[9px] font-bold text-primary uppercase">APROVADO</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
