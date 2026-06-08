'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Eye, Activity, ShoppingCart, Lock, Loader2, LogOut, Package, 
  CheckCircle2, BarChart3, Settings, Save,
  Palette, Link2, UserCircle, Type, Upload, Image as ImageIcon, Sparkles, Trash2, TrendingUp
} from 'lucide-react';
import { format, isSameDay, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

function hexToHSL(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max !== min) {
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

function hslToHex(hslStr: string) {
  if (!hslStr) return "#ffcc00";
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

  const headerFileRef = useRef<HTMLInputElement>(null);
  const teamFileRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'headerAvatar' | 'teamAvatar') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800000) {
        toast({ variant: "destructive", title: "Imagem muito grande", description: "Use uma imagem menor que 800KB." });
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setConfigForm(prev => ({ ...prev, [field]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (field: 'headerAvatar' | 'teamAvatar') => {
    setConfigForm(prev => ({ ...prev, [field]: '' }));
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
          <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full px-6">
            <LogOut className="h-4 w-4 mr-2" /> Sair do Painel
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 rounded-2xl h-16 w-full sm:w-auto">
            <TabsTrigger value="dashboard" className="h-full px-10 text-sm font-bold gap-2 rounded-xl data-[state=active]:shadow-lg">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="h-full px-10 text-sm font-bold gap-2 rounded-xl data-[state=active]:shadow-lg">
              <Settings className="h-4 w-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Acessos</p>
                    <Eye className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-3xl font-black tracking-tight">{visitsLoading ? '...' : stats.vTotal}</div>
                  <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Checkouts</p>
                    <ShoppingCart className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-3xl font-black tracking-tight">{clicksLoading ? '...' : stats.cTotal}</div>
                  <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">{stats.checkoutRate.toFixed(1)}% de conversão</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group hover:border-green-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vendas Reais</p>
                    <Package className="h-3 w-3 text-green-500 group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-3xl font-black text-green-500 tracking-tight">{salesLoading ? '...' : stats.sTotal}</div>
                  <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tighter">{stats.salesRate.toFixed(1)}% do tráfego total</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm group hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Eficiência</p>
                    <TrendingUp className="h-3 w-3 text-primary group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="text-3xl font-black text-primary tracking-tight">{stats.closingRate.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">Vendas/Checkouts</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/40 border-border/50 overflow-hidden shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">Análise de Tráfego <Sparkles className="h-4 w-4 text-primary" /></CardTitle>
                  <p className="text-xs text-muted-foreground">Comparativo diário de visitas e intenções de compra.</p>
                </div>
                <Tabs defaultValue="7d" onValueChange={(v) => setTimeRange(v as any)} className="w-full sm:w-auto">
                  <TabsList className="bg-background/50 h-10 p-1 rounded-lg">
                    <TabsTrigger value="7d" className="text-xs h-8 px-4 font-bold">7 DIAS</TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs h-8 px-4 font-bold">30 DIAS</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-6 pt-10">
                <div className="h-[350px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeOpacity={0.05} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} fontBold />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} fontBold />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="visits" name="Visitas" radius={[6, 6, 0, 0]} fill="var(--color-visits)" barSize={30} />
                        <Bar dataKey="checkouts" name="Checkouts" radius={[6, 6, 0, 0]} fill="var(--color-checkouts)" barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl"><Type className="h-6 w-6 text-primary" /></div>
                    <div>
                        <CardTitle className="text-xl">Nome & Identidade</CardTitle>
                        <CardDescription>Configure como o sistema se apresenta.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Nome do Sistema</Label>
                    <Input value={configForm.siteName} onChange={(e) => setConfigForm({...configForm, siteName: e.target.value})} placeholder="Ex: Zephyrus" className="bg-muted/30 h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Texto do Botão CTA Principal</Label>
                    <Input value={configForm.ctaText} onChange={(e) => setConfigForm({...configForm, ctaText: e.target.value})} placeholder="Vazio = Padrão do site" className="bg-muted/30 h-12" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl"><Palette className="h-6 w-6 text-primary" /></div>
                    <div>
                        <CardTitle className="text-xl">Cores do Site</CardTitle>
                        <CardDescription>Selecione a cor primária.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Cor Primária</Label>
                    <div className="flex gap-6 items-center p-4 bg-muted/20 rounded-2xl border border-border/50">
                      <div className="relative group h-20 w-20 rounded-2xl border-2 border-white/10 shadow-2xl flex items-center justify-center bg-background shrink-0">
                        <input 
                          type="color" 
                          value={hslToHex(configForm.primaryColor)} 
                          onChange={(e) => setConfigForm({...configForm, primaryColor: hexToHSL(e.target.value)})}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                        />
                        <div 
                          className="h-12 w-12 rounded-full border-2 border-white/20" 
                          style={{ backgroundColor: `hsl(${configForm.primaryColor || '48 100% 50%'})` }}
                        />
                      </div>
                      <div className="flex-1">
                        <Input value={configForm.primaryColor} onChange={(e) => setConfigForm({...configForm, primaryColor: e.target.value})} placeholder="Ex: 48 100% 50%" className="bg-background/50 font-mono text-sm" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm md:col-span-2 shadow-xl">
                <CardHeader className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl"><Link2 className="h-6 w-6 text-primary" /></div>
                    <div>
                        <CardTitle className="text-xl">Links de Checkout</CardTitle>
                        <CardDescription>Defina os links de pagamento.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Brasil (PT)</Label>
                    <Input value={configForm.checkoutUrlPt} onChange={(e) => setConfigForm({...configForm, checkoutUrlPt: e.target.value})} className="bg-muted/30 h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Internacional (EN/ES)</Label>
                    <Input value={configForm.checkoutUrlEnEs} onChange={(e) => setConfigForm({...configForm, checkoutUrlEnEs: e.target.value})} className="bg-muted/30 h-12" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/50 backdrop-blur-sm md:col-span-2 shadow-xl">
                <CardHeader className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl"><UserCircle className="h-6 w-6 text-primary" /></div>
                    <div>
                        <CardTitle className="text-xl">Avatares & Fotos</CardTitle>
                        <CardDescription>Suba as fotos que aparecerão no site.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Header (Logo)</Label>
                    <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 flex items-center justify-center group overflow-hidden">
                      {configForm.headerAvatar ? (
                         <>
                           <img src={configForm.headerAvatar} alt="Header Preview" className="h-full w-full object-cover" />
                           <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                             <Button size="sm" onClick={() => headerFileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> TROCAR</Button>
                             <Button variant="destructive" size="icon" onClick={() => handleRemovePhoto('headerAvatar')}><Trash2 className="h-4 w-4" /></Button>
                           </div>
                         </>
                      ) : (
                        <Button variant="ghost" className="h-full w-full" onClick={() => headerFileRef.current?.click()}><ImageIcon className="h-8 w-8" /></Button>
                      )}
                      <input type="file" ref={headerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'headerAvatar')} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Equipe (Chat)</Label>
                    <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 flex items-center justify-center group overflow-hidden">
                      {configForm.teamAvatar ? (
                         <>
                           <img src={configForm.teamAvatar} alt="Team Preview" className="h-full w-full object-cover" />
                           <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                             <Button size="sm" onClick={() => teamFileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> TROCAR</Button>
                             <Button variant="destructive" size="icon" onClick={() => handleRemovePhoto('teamAvatar')}><Trash2 className="h-4 w-4" /></Button>
                           </div>
                         </>
                      ) : (
                        <Button variant="ghost" className="h-full w-full" onClick={() => teamFileRef.current?.click()}><ImageIcon className="h-8 w-8" /></Button>
                      )}
                      <input type="file" ref={teamFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'teamAvatar')} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-10 pb-20">
              <Button onClick={handleSaveConfig} disabled={isSavingConfig} size="lg" className="px-16 font-black h-16 text-xl gap-3">
                {isSavingConfig ? <Loader2 className="animate-spin" /> : <><Save /> APLICAR MUDANÇAS</>}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
