
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
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  Eye, Activity, ShoppingCart, Lock, Loader2, LogOut, Package, 
  BarChart3, Settings, Save,
  Palette, Link2, UserCircle, Type, Upload, Image as ImageIcon, Sparkles, Trash2, TrendingUp, Plus, Layout, Copy, Check
} from 'lucide-react';
import { format, isSameDay, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--primary))",
  },
  checkouts: {
    label: "Checkouts",
    color: "hsl(var(--chart-2))",
  },
  conversionRate: {
    label: "Taxa de Conversão (%)",
    color: "hsl(var(--foreground))",
  }
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

async function compressImage(file: File, maxWidth = 400, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export default function PortalDoChefe() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState('global');
  
  const [configForm, setConfigForm] = useState({
    siteName: 'Zephyrus',
    primaryColor: '48 100% 50%',
    ctaTextColor: 'black' as 'black' | 'white',
    checkoutUrlPt: 'https://app.pushinpay.com.br/service/pay/A1B1A8D6-0667-48B5-94D6-CA3E768395D6',
    checkoutUrlEnEs: 'https://chk.eduzz.com/aziwk6nz?currency=USD',
    headerAvatar: '',
    teamAvatar: '',
    ctaText: ''
  });

  const headerFileRef = useRef<HTMLInputElement>(null);
  const teamFileRef = useRef<HTMLInputElement>(null);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const configsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'configs');
  }, [firestore, user]);
  const { data: configsList } = useCollection<any>(configsQuery);

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
    if (!firestore || !user || !selectedConfigId) return null;
    return doc(firestore, 'configs', selectedConfigId);
  }, [firestore, user, selectedConfigId]);
  const { data: configData } = useDoc<any>(configDocRef);

  useEffect(() => {
    setMounted(true);
    if (configData) {
      setConfigForm(prev => ({
        ...prev,
        ...configData
      }));
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
      const conversion = vCount > 0 ? (cCount / vCount) * 100 : 0;
      data.push({ 
        name, 
        visits: vCount, 
        checkouts: cCount,
        conversionRate: parseFloat(conversion.toFixed(1))
      });
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
      await setDoc(doc(firestore, 'configs', selectedConfigId), configForm, { merge: true });
      toast({ title: "Configurações aplicadas!", description: `Perfil "${selectedConfigId}" atualizado.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCreateNewConfig = () => {
    const newId = prompt("Digite um ID para o novo site (ex: site-gaming, premium-box):");
    if (newId) {
      const cleanId = newId.trim().toLowerCase().replace(/\s+/g, '-');
      setSelectedConfigId(cleanId);
      setConfigForm({
        siteName: 'Novo Site',
        primaryColor: '48 100% 50%',
        ctaTextColor: 'black',
        checkoutUrlPt: '',
        checkoutUrlEnEs: '',
        headerAvatar: '',
        teamAvatar: '',
        ctaText: ''
      });
      toast({ title: "Novo perfil criado", description: "Edite e salve para confirmar." });
    }
  };

  const handleDeleteConfig = async () => {
    if (selectedConfigId === 'global') {
      toast({ variant: "destructive", title: "Não permitido", description: "O perfil global não pode ser excluído." });
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o perfil "${selectedConfigId}"?`)) {
      await deleteDoc(doc(firestore, 'configs', selectedConfigId));
      setSelectedConfigId('global');
      toast({ title: "Perfil excluído" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'headerAvatar' | 'teamAvatar') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSavingConfig(true);
      const compressedBase64 = await compressImage(file, 400, 0.7);
      setConfigForm(prev => ({ ...prev, [field]: compressedBase64 }));
      toast({ title: "Imagem carregada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro no upload" });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?s=${selectedConfigId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: "Use este link para o branding deste site." });
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
          <div className="space-y-1">
             <h1 className="text-2xl md:text-3xl font-black italic flex items-center gap-3 tracking-tighter uppercase">
                Comando Central <Activity className="text-primary h-6 w-6" />
             </h1>
             <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Controle de Múltiplos Brandings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => signOut(auth)} className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full px-6">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 rounded-2xl h-16 w-full sm:w-auto">
            <TabsTrigger value="dashboard" className="h-full px-10 text-sm font-bold gap-2 rounded-xl data-[state=active]:shadow-lg">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="h-full px-10 text-sm font-bold gap-2 rounded-xl data-[state=active]:shadow-lg">
              <Settings className="h-4 w-4" /> Configurar Sites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm pt-6 px-4 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Visitas</p>
                    <Eye className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-3xl font-black">{visitsLoading ? '...' : stats.vTotal}</div>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm pt-6 px-4 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Checkouts</p>
                    <ShoppingCart className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-3xl font-black">{clicksLoading ? '...' : stats.cTotal}</div>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm pt-6 px-4 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Vendas</p>
                    <Package className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="text-3xl font-black text-green-500">{salesLoading ? '...' : stats.sTotal}</div>
              </Card>
              <Card className="bg-card/40 border-border/50 backdrop-blur-sm pt-6 px-4 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500">Eficiência</p>
                    <TrendingUp className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-3xl font-black text-primary">{stats.closingRate.toFixed(1)}%</div>
              </Card>
            </div>

            <Card className="bg-card/40 border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/30">
                <CardTitle className="text-lg">Análise de Tráfego Global</CardTitle>
                <Tabs defaultValue="7d" onValueChange={(v) => setTimeRange(v as any)}>
                  <TabsList className="bg-background/50 h-10">
                    <TabsTrigger value="7d" className="text-xs">7 DIAS</TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs">30 DIAS</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="pt-10">
                <div className="h-[350px] w-full">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer>
                      <ComposedChart data={chartData}>
                        <CartesianGrid vertical={false} strokeOpacity={0.05} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar yAxisId="left" dataKey="visits" name="Visitas" radius={[4, 4, 0, 0]} fill="var(--color-visits)" barSize={20} />
                        <Bar yAxisId="left" dataKey="checkouts" name="Checkouts" radius={[4, 4, 0, 0]} fill="var(--color-checkouts)" barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="Taxa de Conversão (%)" stroke="var(--color-conversionRate)" strokeWidth={2} dot />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Selecionar Perfil de Site</Label>
                <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                  <SelectTrigger className="h-14 bg-card/60 border-primary/20 text-lg font-bold italic">
                    <Layout className="w-5 h-5 mr-2 text-primary" />
                    <SelectValue placeholder="Escolha um site" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="global" className="font-bold">🌐 GLOBAL (Padrão)</SelectItem>
                    {configsList?.filter(c => c.id !== 'global').map(config => (
                      <SelectItem key={config.id} value={config.id}>
                        📄 {config.siteName || config.id} ({config.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNewConfig} className="h-14 px-8 font-black gap-2">
                  <Plus className="w-5 h-5" /> NOVO PERFIL
                </Button>
                {selectedConfigId !== 'global' && (
                  <Button variant="destructive" onClick={handleDeleteConfig} className="h-14 w-14">
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
               <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Link2 className="text-primary h-5 w-5" /></div>
                    <p className="text-sm font-bold italic">Link deste Branding: <span className="text-primary font-mono select-all">?s={selectedConfigId}</span></p>
                  </div>
                  <Button variant="secondary" onClick={handleCopyLink} size="sm" className="gap-2 font-bold">
                    <Copy className="h-4 w-4" /> COPIAR LINK COMPLETO
                  </Button>
               </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/40">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="text-lg flex items-center gap-2"><Type className="w-5 h-5" /> Identidade</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Sistema</Label>
                    <Input value={configForm.siteName} onChange={(e) => setConfigForm({...configForm, siteName: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do Botão CTA</Label>
                    <Input value={configForm.ctaText} onChange={(e) => setConfigForm({...configForm, ctaText: e.target.value})} placeholder="Ex: Quero Recuperar" className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5" /> Visual</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Cor Primária (HSL)</Label>
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded border" style={{ backgroundColor: `hsl(${configForm.primaryColor})` }} />
                      <Input value={configForm.primaryColor} onChange={(e) => setConfigForm({...configForm, primaryColor: e.target.value})} className="bg-muted/30 font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Texto nos Botões</Label>
                    <RadioGroup value={configForm.ctaTextColor} onValueChange={(v) => setConfigForm({...configForm, ctaTextColor: v as any})} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="black" id="c-black" /><Label htmlFor="c-black">Preto</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="white" id="c-white" /><Label htmlFor="c-white">Branco</Label></div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 md:col-span-2">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="text-lg">Checkouts</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Link Brasil (PT)</Label>
                    <Input value={configForm.checkoutUrlPt} onChange={(e) => setConfigForm({...configForm, checkoutUrlPt: e.target.value})} className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Link Internacional (EN/ES)</Label>
                    <Input value={configForm.checkoutUrlEnEs} onChange={(e) => setConfigForm({...configForm, checkoutUrlEnEs: e.target.value})} className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 md:col-span-2">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="text-lg">Fotos do Site</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label>Header (Logo)</Label>
                    <div className="h-32 bg-muted/20 rounded border-2 border-dashed flex items-center justify-center relative overflow-hidden">
                       {configForm.headerAvatar ? <img src={configForm.headerAvatar} className="h-full object-contain" /> : <ImageIcon className="text-zinc-600" />}
                       <Button size="sm" className="absolute bottom-2 right-2" onClick={() => headerFileRef.current?.click()}>Alterar</Button>
                    </div>
                    <input type="file" ref={headerFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'headerAvatar')} />
                  </div>
                  <div className="space-y-4">
                    <Label>Equipe (Chat)</Label>
                    <div className="h-32 bg-muted/20 rounded border-2 border-dashed flex items-center justify-center relative overflow-hidden">
                       {configForm.teamAvatar ? <img src={configForm.teamAvatar} className="h-full object-contain" /> : <ImageIcon className="text-zinc-600" />}
                       <Button size="sm" className="absolute bottom-2 right-2" onClick={() => teamFileRef.current?.click()}>Alterar</Button>
                    </div>
                    <input type="file" ref={teamFileRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'teamAvatar')} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-10 pb-20">
              <Button onClick={handleSaveConfig} disabled={isSavingConfig} size="lg" className="px-16 font-black h-16 text-xl gap-3">
                {isSavingConfig ? <Loader2 className="animate-spin" /> : <><Save /> SALVAR ALTERAÇÕES NO PERFIL</>}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
