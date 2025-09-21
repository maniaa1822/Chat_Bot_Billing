'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { QuoteDetails } from '@/lib/quote-calculator';
import { QuoteInfoOutput } from '@/ai/flows/extract-quote-info-from-chat';
// Removed generateQuotePDF import
import { TrendingUp, Zap, Sun, Euro, Download, Loader2 } from 'lucide-react';

interface QuoteResultProps {
  quote: QuoteDetails;
  customerData?: QuoteInfoOutput['parsed'];
}

export function QuoteResult({ quote, customerData }: QuoteResultProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const chartData = [
    { name: 'Bolletta attuale', 'Costo (€)': quote.currentMonthlyBill, fill: 'hsl(var(--secondary))' },
    { name: 'Bolletta con FV', 'Costo (€)': quote.newMonthlyBill, fill: 'hsl(var(--primary))' },
  ];

  const chartConfig = {
    'Costo (€)': {
      label: 'Costo (€)',
      color: 'hsl(var(--primary))',
    },
  };

  const handleDownloadPDF = async () => {
    if (!customerData) {
      alert('Dati cliente non disponibili per la generazione del PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteData: quote,
          customerData: customerData,
        }),
      });

      if (response.ok) {
        // Get the PDF blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `preventivo-fotovoltaico-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Errore durante la generazione del PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Errore durante la generazione del PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <Card>
          <CardHeader className="p-2 pb-0">
            <Zap className="h-6 w-6 mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Sistema Raccomandato</p>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-lg font-bold">{quote.systemSizeKW} kWp</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-2 pb-0">
            <Sun className="h-6 w-6 mx-auto text-yellow-500" />
            <p className="text-xs text-muted-foreground">Produzione Annua</p>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-lg font-bold">{quote.annualProductionKWh} kWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-2 pb-0">
            <Euro className="h-6 w-6 mx-auto text-green-600" />
            <p className="text-xs text-muted-foreground">Risparmio Annuo</p>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-lg font-bold">€{quote.annualSavingsEUR.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-2 pb-0">
            <TrendingUp className="h-6 w-6 mx-auto text-accent" />
            <p className="text-xs text-muted-foreground">Autosufficienza</p>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-lg font-bold">{quote.selfSufficiencyPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confronto Costi Mensili</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-48">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 15)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="Costo (€)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* PDF Download Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF || !customerData}
          className="flex items-center gap-2"
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGeneratingPDF ? 'Generazione PDF...' : 'Scarica Preventivo PDF'}
        </Button>
      </div>
    </div>
  );
}
