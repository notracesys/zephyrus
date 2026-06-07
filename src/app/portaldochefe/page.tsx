
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
  CartesianGrid
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Eye, TrendingUp, Activity, ShoppingCart, Lock, Loader2, LogOut, Package, Search, CheckCircle2, XCircle } from 'lucide-react';
import { format, isSameDay, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--primary))",
  },
  checkouts: {
    label: "Checkouts",
    color: "hsl(var(--chart-2))",
  },
};

export default function PortalDoChefe() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Queries sem limites para contagem total real
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
    return query(collection(firestore, 'purchases'), orderBy('timestamp', 'desc'));
  }, [firestore, user]);
  const { data: salesData, isLoading: salesLoading } = useCollection(salesQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!visitsData || !clicksData) return [];
    const daysCount = timeRange === '7d' ? 7 : 30;
    const data = [];
    const today = startOfDay(new Date());
    for (let i = daysCount - 1; i >= 0; i--) {
      const currentDay = subDays(today, i);
      
      const vCount = (visitsData || []).filter(visit => {
        if (!visit.timestamp) return false;
        const visitDate = visit.timestamp.toDate ? visit.timestamp.toDate() : new Date(visit.timestamp);
        return isSameDay(visitDate, currentDay);
      }).length;

      const cCount = (clicksData || []).filter(click => {
        if (!click.timestamp) return false;
        const clickDate = click.timestamp.toDate ? click.timestamp.toDate() : new Date(click.timestamp);
        return isSameDay(clickDate, currentDay);
      }).length;

      let name = timeRange === '7d' ? format(currentDay, 'EEE', { locale: ptBR }).replace('.', '').slice(0, 3).toUpperCase() : format(currentDay, 'dd/MM');
      data.push({ 
        name, 
        visits: vCount, 
        checkouts: cCount
      });
    }
    return data;
  }, [visitsData, clicksData, timeRange]);

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

  const handleSearchId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId || !firestore) return;
    setIsSearching(true);
    try {
      const docRef = doc(firestore, 'purchases', searchId.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSearchResult({ ...docSnap.data(), id: docSnap.id });
        toast({ title: "ID encontrado!" });
      } else {
        setSearchResult('not_found');
        toast({ variant: "destructive", title: "ID não encontrado." });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!mounted) return null;
  if (isUserLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardHeader className="text-center space-y-2">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black italic">PORTAL DO CHEFE</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-muted/50" />
                </div>
                <Button type="submit" className="w-full font-bold h-12" disabled={isLoggingIn}>
                  {isLoggingIn ? <Loader2 className="animate-spin" /> : 'ACESSAR DASHBOARD'}
                </Button>
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
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-black italic flex items-center gap-2 tracking-tighter uppercase">
            Dashboard <Activity className="text-primary h-5 w-5" />
          </h1>
          <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="w-full sm:w-auto border-destructive/50 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" /> Sair do Painel
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-card/40 border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Visitas</p>
                <Eye className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-xl md:text-2xl font-black">{visitsLoading ? '...' : (visitsData?.length || 0)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Checkouts</p>
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-xl md:text-2xl font-black">{clicksLoading ? '...' : (clicksData?.length || 0)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vendas</p>
                <Package className="h-3 w-3 text-green-500" />
              </div>
              <div className="text-xl md:text-2xl font-black text-green-500">{salesLoading ? '...' : (salesData?.length || 0)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Conversão</p>
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-black text-primary">
                {!visitsData?.length ? '0%' : `${((salesData?.length || 0) / (visitsData.length || 1) * 100).toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Gráfico de Tráfego e Funil */}
          <Card className="bg-card/40 border-border/50 md:col-span-2 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Análise de Tráfego e Funil
              </CardTitle>
              <Tabs defaultValue="7d" onValueChange={(v) => setTimeRange(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-2 w-full bg-background/50">
                  <TabsTrigger value="7d" className="text-xs h-8">7 Dias</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs h-8">30 Dias</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <div className="h-[250px] md:h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeOpacity={0.05} />
                      <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis fontSize={8} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="visits" name="Visitas" radius={[2, 2, 0, 0]} fill="var(--color-visits)" />
                      <Bar dataKey="checkouts" name="Checkouts" radius={[2, 2, 0, 0]} fill="var(--color-checkouts)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Verificar ID de Transação */}
          <Card className="bg-card/40 border-border/50 h-fit">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase italic tracking-tighter">
                <Search className="h-5 w-5 text-primary" /> Consultar Transação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <form onSubmit={handleSearchId} className="flex flex-col gap-2">
                <Input 
                  placeholder="ID da transação..." 
                  value={searchId} 
                  onChange={(e) => setSearchId(e.target.value)} 
                  className="h-11 text-sm bg-background/50 font-mono" 
                />
                <Button type="submit" className="w-full font-bold h-11" disabled={isSearching}>
                  {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : 'CONSULTAR'}
                </Button>
              </form>
              
              {searchResult === 'not_found' && (
                <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-center animate-in fade-in zoom-in duration-300">
                  <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest text-destructive">Não encontrado</p>
                </div>
              )}

              {searchResult && searchResult !== 'not_found' && (
                <div className="p-4 rounded-xl border border-green-500/50 bg-green-500/10 space-y-3 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-widest">Encontrado</p>
                  </div>
                  <div className="text-[10px] space-y-2 pt-2 border-t border-green-500/20">
                    <p className="flex justify-between"><span className="text-muted-foreground font-bold">E-MAIL:</span> <span className="font-mono">{searchResult.email}</span></p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground font-bold">ACESSO:</span> 
                      {searchResult.accessed ? 
                        <span className="text-destructive font-bold uppercase">✅ JÁ UTILIZADO</span> : 
                        <span className="text-green-500 font-bold uppercase animate-pulse">⏳ DISPONÍVEL</span>
                      }
                    </p>
                    <p className="flex justify-between"><span className="text-muted-foreground font-bold">DATA:</span> <span>{searchResult.timestamp?.toDate ? format(searchResult.timestamp.toDate(), 'dd/MM/yy HH:mm') : 'N/A'}</span></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
