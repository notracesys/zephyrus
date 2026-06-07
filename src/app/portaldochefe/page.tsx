
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  Eye, TrendingUp, Activity, ShoppingCart, Lock, Loader2, LogOut, Package, 
  Search, CheckCircle2, XCircle, MousePointerClick, BarChart3, Settings, Save,
  Palette, Link2, UserCircle, Type
} from 'lucide-react';
import { format, isSameDay, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

// Auxiliar para converter Hex para HSL (formato do Tailwind CSS)
function hexToHSL(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

// Auxiliar para converter HSL para Hex (para inicializar o picker)
function hslToHex(hslStr: string) {
  const parts = hslStr.split(' ');
  if (parts.length < 3) return "#ffcc00";
  
  let h = parseInt(parts[0]);
  let s = parseInt(parts[1].replace('%', '')) / 100;
  let l = parseInt(parts[2].replace('%', '')) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function PortalDoChefe() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    siteName: '',
    primaryColor: '',
    checkoutUrlPt: '',
    checkoutUrlEnEs: '',
    headerAvatar: '',
    teamAvatar: '',
    ctaText: ''
  });

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
    return query(collection(firestore, 'purchases'), orderBy('timestamp', 'desc'));
  }, [firestore, user]);
  const { data: salesData, isLoading: salesLoading } = useCollection(salesQuery);

  const configDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'config', 'global');
  }, [firestore, user]);
  const { data: configData } = useDoc<any>(configDocRef);

  useEffect(() => {
    setMounted(true);
    if (configData) {
      setConfigForm({
        siteName: configData.siteName || '',
        primaryColor: configData.primaryColor || '',
        checkoutUrlPt: configData.checkoutUrlPt || '',
        checkoutUrlEnEs: configData.checkoutUrlEnEs || '',
        headerAvatar: configData.headerAvatar || '',
        teamAvatar: configData.teamAvatar || '',
        ctaText: configData.ctaText || ''
      });
    }
  }, [configData]);

  const chartData = useMemo(() => {
    if (!visitsData || !clicksData) return [];
    const daysCount = timeRange === '7d' ? 7 : 30;
    const data = [];
    const today = startOfDay(new Date());
    for (let i = daysCount - 1; i >= 0; i--) {
      const currentDay = subDays(today, i);
      const vCount = (visitsData || []).filter(v => v.timestamp?.toDate ? isSameDay(v.timestamp.toDate(), currentDay) : false).length;
      const cCount = (clicksData || []).filter(c => c.timestamp?.toDate ? isSameDay(c.timestamp.toDate(), currentDay) : false).length;
      let name = timeRange === '7d' ? format(currentDay, 'EEE', { locale: ptBR }).replace('.', '').slice(0, 3).toUpperCase() : format(currentDay, 'dd/MM');
      data.push({ name, visits: vCount, checkouts: cCount });
    }
    return data;
  }, [visitsData, clicksData, timeRange]);

  const stats = useMemo(() => {
    const vTotal = visitsData?.length || 0;
    const cTotal = clicksData?.length || 0;
    const sTotal = salesData?.length || 0;
    return { 
      vTotal, cTotal, sTotal, 
      checkoutRate: vTotal > 0 ? (cTotal / vTotal) * 100 : 0,
      salesRate: vTotal > 0 ? (sTotal / vTotal) * 100 : 0,
      closingRate: cTotal > 0 ? (sTotal / cTotal) * 100 : 0
    };
  }, [visitsData, clicksData, salesData]);

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

  const handleSaveConfig = async () => {
    if (!firestore || !user) return;
    setIsSavingConfig(true);
    try {
      await setDoc(doc(firestore, 'config', 'global'), configForm, { merge: true });
      toast({ title: "Configurações salvas!", description: "As mudanças já estão no ar." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar." });
    } finally {
      setIsSavingConfig(false);
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
      } else {
        setSearchResult('not_found');
      }
    } catch (error) { console.error(error); } finally { setIsSearching(false); }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hsl = hexToHSL(e.target.value);
    setConfigForm({ ...configForm, primaryColor: hsl });
  };

  if (!mounted) return null;
  if (isUserLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader className="text-center space-y-2">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Portal do Chefe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="h-12 bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-12 bg-muted/30" />
                </div>
                <Button type="submit" className="w-full font-bold h-14 text-lg" disabled={isLoggingIn}>
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
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-black italic flex items-center gap-3 tracking-tighter uppercase">
            Comando Central <Activity className="text-primary h-6 w-6" />
          </h1>
          <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" /> Sair do Painel
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 rounded-xl h-14">
            <TabsTrigger value="dashboard" className="h-full px-8 text-sm font-bold gap-2">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="h-full px-8 text-sm font-bold gap-2">
              <Settings className="h-4 w-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Acessos</p>
                    <Eye className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-2xl font-black">{visitsLoading ? '...' : stats.vTotal}</div>
                  <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Checkouts</p>
                    <ShoppingCart className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-2xl font-black">{clicksLoading ? '...' : stats.cTotal}</div>
                  <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">{stats.checkoutRate.toFixed(1)}% de conversão</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vendas</p>
                    <Package className="h-3 w-3 text-green-500 group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-green-500">{salesLoading ? '...' : stats.sTotal}</div>
                  <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tighter">{stats.salesRate.toFixed(1)}% do tráfego total</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Eficiência</p>
                    <TrendingUp className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-primary">{stats.closingRate.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">Vendas/Checkouts</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card/40 border-border/50 md:col-span-2 overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">Análise de Tráfego</CardTitle>
                    <p className="text-xs text-muted-foreground">Comparativo diário de visitas e intenções de compra.</p>
                  </div>
                  <Tabs defaultValue="7d" onValueChange={(v) => setTimeRange(v as any)} className="w-full sm:w-auto">
                    <TabsList className="bg-background/50 h-9">
                      <TabsTrigger value="7d" className="text-xs h-7">7D</TabsTrigger>
                      <TabsTrigger value="30d" className="text-xs h-7">30D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid vertical={false} strokeOpacity={0.05} />
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="visits" name="Visitas" radius={[4, 4, 0, 0]} fill="var(--color-visits)" />
                          <Bar dataKey="checkouts" name="Checkouts" radius={[4, 4, 0, 0]} fill="var(--color-checkouts)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 h-fit">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase italic tracking-tighter">
                    <Search className="h-5 w-5 text-primary" /> Consultar ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <form onSubmit={handleSearchId} className="space-y-2">
                    <Input placeholder="ID da transação..." value={searchId} onChange={(e) => setSearchId(e.target.value)} className="h-12 bg-background/50 font-mono text-sm" />
                    <Button type="submit" className="w-full font-bold h-12" disabled={isSearching}>
                      {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : 'LOCALIZAR'}
                    </Button>
                  </form>
                  {searchResult && searchResult !== 'not_found' && (
                    <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 space-y-3 animate-in zoom-in duration-300">
                      <div className="flex items-center gap-2 text-green-500"><CheckCircle2 className="h-4 w-4" /><p className="text-[10px] font-black uppercase">Encontrado</p></div>
                      <div className="text-[10px] space-y-2 pt-2 border-t border-green-500/10">
                        <p className="flex justify-between font-mono"><span>EMAIL:</span> <span className="text-foreground">{searchResult.email}</span></p>
                        <p className="flex justify-between font-mono"><span>STATUS:</span> <span className="text-green-500">{searchResult.status}</span></p>
                        <p className="flex justify-between font-mono"><span>ACESSO:</span> <span>{searchResult.accessed ? '✅ USADO' : '⏳ DISPONÍVEL'}</span></p>
                      </div>
                    </div>
                  )}
                  {searchResult === 'not_found' && (
                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center animate-in zoom-in duration-300">
                      <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase text-destructive">Não encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Type className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-lg">Nome & Identidade</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Nome do Sistema (Ex: Zephyrus)</Label>
                    <Input value={configForm.siteName} onChange={(e) => setConfigForm({...configForm, siteName: e.target.value})} placeholder="Nome que aparece no header e chat" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Texto do Botão CTA Principal</Label>
                    <Input value={configForm.ctaText} onChange={(e) => setConfigForm({...configForm, ctaText: e.target.value})} placeholder="Vazio = Padrão do i18n" className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Palette className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-lg">Cores do Site</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Cor Primária</Label>
                    <div className="flex gap-4 items-center">
                      <div className="relative group overflow-hidden h-14 w-14 rounded-xl border-2 border-border/50 shadow-inner flex items-center justify-center bg-muted shrink-0 transition-transform active:scale-95">
                        <input 
                          type="color" 
                          value={hslToHex(configForm.primaryColor || '48 100% 50%')} 
                          onChange={handleColorChange}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <div 
                          className="h-8 w-8 rounded-full shadow-lg border-2 border-white/20" 
                          style={{ backgroundColor: `hsl(${configForm.primaryColor || '48 100% 50%'})` }}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input 
                          value={configForm.primaryColor} 
                          onChange={(e) => setConfigForm({...configForm, primaryColor: e.target.value})} 
                          placeholder="Ex: 48 100% 50%" 
                          className="bg-muted/30 font-mono text-xs" 
                        />
                        <p className="text-[9px] text-muted-foreground italic uppercase font-bold tracking-widest">HSL Value</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-2">Clique no quadrado à esquerda para abrir o seletor visual.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm md:col-span-2">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Link2 className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-lg">Links de Checkout</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Link Brasil (PushinPay)</Label>
                    <Input value={configForm.checkoutUrlPt} onChange={(e) => setConfigForm({...configForm, checkoutUrlPt: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Link Internacional (Eduzz/Dólar)</Label>
                    <Input value={configForm.checkoutUrlEnEs} onChange={(e) => setConfigForm({...configForm, checkoutUrlEnEs: e.target.value})} className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm md:col-span-2">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><UserCircle className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-lg">Avatares e Fotos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Avatar do Header (URL)</Label>
                    <div className="flex gap-4 items-center">
                      <Input value={configForm.headerAvatar} onChange={(e) => setConfigForm({...configForm, headerAvatar: e.target.value})} placeholder="/eu.png" className="bg-muted/30" />
                      <div className="h-12 w-12 rounded-full border bg-muted shrink-0 overflow-hidden shadow-lg border-primary/20">
                        <img src={configForm.headerAvatar || '/eu.png'} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Avatar da Equipe Chat (URL)</Label>
                    <div className="flex gap-4 items-center">
                      <Input value={configForm.teamAvatar} onChange={(e) => setConfigForm({...configForm, teamAvatar: e.target.value})} placeholder="/equipe.png" className="bg-muted/30" />
                      <div className="h-12 w-12 rounded-full border bg-muted shrink-0 overflow-hidden shadow-lg border-primary/20">
                        <img src={configForm.teamAvatar || '/equipe.png'} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveConfig} disabled={isSavingConfig} size="lg" className="px-10 font-black h-14 text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                {isSavingConfig ? <Loader2 className="animate-spin" /> : <><Save /> SALVAR TODAS AS ALTERAÇÕES</>}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

