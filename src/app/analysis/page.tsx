'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/header';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n';

const quizSchema = z.object({
  suspensionTime: z.string().min(1),
  thirdPartySoftware: z.string().min(1),
  banReason: z.string().min(1),
  firstOffense: z.string().min(1),
  hasMadePurchases: z.string().min(1),
  priorWarnings: z.string().min(1),
  banDescription: z.string().min(10),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function AnalysisPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
  });

  function onSubmit(data: QuizFormValues) {
    const query = new URLSearchParams(data).toString();
    router.push(`/chat?${query}`);
  }

  function onError(errors: any) {
    toast({
        variant: "destructive",
        title: t.analysis_error_title,
        description: t.analysis_error_desc,
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <section className="text-center mb-12 animate-in fade-in-50 duration-1000">
            <h1 className="font-headline text-3xl md:text-4xl font-bold">{t.analysis_title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                {t.analysis_desc}
            </p>
        </section>

        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-1000">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                    {t.analysis_questions.map((question, index) => (
                    <FormField
                        key={question.id}
                        control={form.control}
                        name={question.id as keyof QuizFormValues}
                        render={({ field }) => (
                            <Card className="w-full">
                                <CardHeader className="bg-card-foreground/5 rounded-t-lg border-b p-4">
                                <CardTitle className="font-bold text-base flex items-center">
                                    <span className="bg-primary text-primary-foreground rounded-full h-6 flex items-center justify-center text-sm mr-2 min-w-[1.5rem] px-1">{index + 1}</span> 
                                    {question.label}
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                    >
                                    {question.options.map((option) => (
                                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={option} />
                                            </FormControl>
                                            <FormLabel className="font-normal text-base">
                                                {option}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                                </CardContent>
                            </Card>
                        )}
                    />
                    ))}

                    <FormField
                        control={form.control}
                        name="banDescription"
                        render={({ field }) => (
                            <Card className="w-full">
                                <CardHeader className="bg-card-foreground/5 rounded-t-lg border-b p-4">
                                <CardTitle className="font-bold text-base flex items-center">
                                    <span className="bg-primary text-primary-foreground rounded-full h-6 flex items-center justify-center text-sm mr-2 min-w-[1.5rem] px-1">{t.analysis_questions.length + 1}</span> 
                                    {t.analysis_q_text_label}
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                <FormControl>
                                    <Textarea
                                        placeholder={t.analysis_q_text_placeholder}
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                </CardContent>
                            </Card>
                        )}
                    />

                    <div className="flex justify-center pt-4">
                        <Button type="submit" size="lg" className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                            {t.analysis_send}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
      </main>
    </div>
  );
}
