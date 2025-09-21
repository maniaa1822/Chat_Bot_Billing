'use client';

import type { QuoteInfoOutput } from '@/ai/flows/extract-quote-info-from-chat';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Factory,
  Building,
  MapPin,
  Zap,
  CircleDollarSign,
  Battery,
  Sparkles,
} from 'lucide-react';

type InfoSummaryProps = {
  data: QuoteInfoOutput['parsed'] | null;
};

const iconMap = {
  cap: MapPin,
  dwelling: Home,
  monthly_kwh: Zap,
  bill_eur: CircleDollarSign,
  storage_pref: Battery,
  incentives: Sparkles,
};

const dwellingIconMap = {
  casa_singola: Home,
  appartamento: Building,
  azienda: Factory,
};

const dwellingLabels: { [key: string]: string } = {
  casa_singola: 'Casa Singola',
  appartamento: 'Appartamento',
  azienda: 'Azienda',
};

const preferenceLabels: { [key: string]: string } = {
  si: 'Sì',
  no: 'No',
  non_so: 'Non so',
};

export function InfoSummary({ data }: InfoSummaryProps) {
  const summaryItems = [
    { key: 'cap', label: 'CAP', value: data?.cap, Icon: iconMap.cap },
    {
      key: 'dwelling',
      label: 'Abitazione',
      value: data?.dwelling ? dwellingLabels[data.dwelling] : null,
      Icon: data?.dwelling ? dwellingIconMap[data.dwelling] : iconMap.dwelling,
    },
    {
      key: 'monthly_kwh',
      label: 'Consumo',
      value: data?.monthly_kwh ? `${data.monthly_kwh} kWh/mese` : null,
      Icon: iconMap.monthly_kwh,
    },
    {
      key: 'bill_eur',
      label: 'Bolletta',
      value: data?.bill_eur ? `€${data.bill_eur}/mese` : null,
      Icon: iconMap.bill_eur,
    },
    {
      key: 'storage_pref',
      label: 'Accumulo',
      value: data?.storage_pref ? preferenceLabels[data.storage_pref] : null,
      Icon: iconMap.storage_pref,
    },
    {
      key: 'incentives',
      label: 'Incentivi',
      value: data?.incentives ? preferenceLabels[data.incentives] : null,
      Icon: iconMap.incentives,
    },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (summaryItems.length === 0) {
    return (
      <p className="text-sm text-center text-muted-foreground h-6 flex items-center justify-center">
        Inizia la conversazione per vedere qui le informazioni raccolte.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center h-6">
      {summaryItems.map((item) => (
        <Badge key={item.key} variant="secondary" className="text-sm py-1 px-3">
          <item.Icon className="mr-2 h-4 w-4" />
          {item.label}: <span className="font-semibold ml-1">{item.value}</span>
        </Badge>
      ))}
    </div>
  );
}
