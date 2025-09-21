import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { quoteData, customerData } = await request.json();

    // Create PDF document
    const pdf = new jsPDF();

    // Add title
    pdf.setFontSize(20);
    pdf.setTextColor(37, 99, 235); // Primary blue
    pdf.text('Preventivo Impianto Fotovoltaico', 20, 30);

    // Add generation date
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128); // Gray
    pdf.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 20, 40);

    // Customer Information Section
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55); // Dark gray
    pdf.text('Informazioni Cliente', 20, 60);

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    let yPos = 70;

    if (customerData.cap) {
      pdf.text(`CAP: ${customerData.cap}`, 20, yPos);
      yPos += 10;
    }

    if (customerData.dwelling) {
      const dwellingText = customerData.dwelling === 'casa_singola' ? 'Casa Singola' :
                          customerData.dwelling === 'appartamento' ? 'Appartamento' :
                          customerData.dwelling === 'azienda' ? 'Azienda' : 'N/A';
      pdf.text(`Tipo Abitazione: ${dwellingText}`, 20, yPos);
      yPos += 10;
    }

    if (customerData.monthly_kwh) {
      pdf.text(`Consumo Mensile: ${customerData.monthly_kwh.toLocaleString('it-IT')} kWh`, 20, yPos);
      yPos += 10;
    }

    if (customerData.bill_eur) {
      pdf.text(`Bolletta Mensile: €${customerData.bill_eur.toLocaleString('it-IT')}`, 20, yPos);
      yPos += 20;
    }

    // System Details Section
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Dettagli Impianto Consigliato', 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Potenza Impianto: ${quoteData.systemSizeKW.toFixed(1)} kWp`, 20, yPos);
    yPos += 10;
    pdf.text(`Produzione Annuale Stimata: ${quoteData.annualProductionKWh.toLocaleString('it-IT')} kWh`, 20, yPos);
    yPos += 10;
    pdf.text(`Autosufficienza Energetica: ${quoteData.selfSufficiencyPercentage.toFixed(1)}%`, 20, yPos);
    yPos += 20;

    // Savings Highlight Box
    pdf.setFillColor(219, 234, 254); // Light blue background
    pdf.rect(20, yPos, 170, 20, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 64, 175); // Blue text
    pdf.text(`Risparmio Annuale Stimato: €${quoteData.annualSavingsEUR.toLocaleString('it-IT')}`, 30, yPos + 12);
    yPos += 35;

    // Financial Analysis Section
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Analisi Economica', 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Bolletta Attuale (mensile): €${quoteData.currentMonthlyBill.toLocaleString('it-IT')}`, 20, yPos);
    yPos += 10;
    pdf.text(`Bolletta con Fotovoltaico (mensile): €${quoteData.newMonthlyBill.toLocaleString('it-IT')}`, 20, yPos);
    yPos += 10;
    pdf.text(`Risparmio Mensile: €${(quoteData.currentMonthlyBill - quoteData.newMonthlyBill).toLocaleString('it-IT')}`, 20, yPos);
    yPos += 10;
    pdf.text(`Risparmio Annuale: €${quoteData.annualSavingsEUR.toLocaleString('it-IT')}`, 20, yPos);
    yPos += 20;

    // Storage Preferences
    if (customerData.storage_pref) {
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Preferenze Cliente', 20, yPos);
      yPos += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const storageText = customerData.storage_pref === 'si' ? 'Interessato' :
                         customerData.storage_pref === 'no' ? 'Non Interessato' :
                         customerData.storage_pref === 'non_so' ? 'Da Valutare' : 'N/A';
      pdf.text(`Sistema di Accumulo: ${storageText}`, 20, yPos);
      yPos += 20;
    }

    // Assumptions Section
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Assunzioni di Calcolo', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    const assumptions = [
      '• Produzione annuale: 1.350 kWh per kWp installato (media Italia)',
      '• Costo energia elettrica: €0,25/kWh',
      '• Autoconsumo: 60% dell\'energia prodotta',
      '• Tariffa cessione eccedenze: €0,11/kWh',
      '• I calcoli sono indicativi e basati su dati medi nazionali'
    ];

    assumptions.forEach(assumption => {
      pdf.text(assumption, 20, yPos);
      yPos += 8;
    });

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Preventivo generato automaticamente - Per informazioni dettagliate contattare il nostro team commerciale', 20, 280);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="preventivo-fotovoltaico-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}