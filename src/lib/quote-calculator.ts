import { QuoteInfoOutput } from "@/ai/flows/extract-quote-info-from-chat";

export interface QuoteDetails {
  systemSizeKW: number;
  annualProductionKWh: number;
  annualSavingsEUR: number;
  selfSufficiencyPercentage: number;
  currentMonthlyBill: number;
  newMonthlyBill: number;
}

// Constants for calculation
const KWH_PER_KWP_YEAR_ITALY = 1350; // Average annual kWh produced per kWp installed in Italy
const AVG_ELECTRICITY_COST_EUR_PER_KWH = 0.25; // Average cost of electricity
const SELF_CONSUMPTION_RATE = 0.6; // Average percentage of solar energy consumed directly
const GRID_FEED_IN_TARIFFE_EUR_PER_KWH = 0.11; // Average tariff for selling excess energy to the grid

export function calculateQuote(parsedData: QuoteInfoOutput['parsed']): QuoteDetails {
  let monthlyKwh = parsedData.monthly_kwh;
  let monthlyBill = parsedData.bill_eur;

  // Estimate missing values if possible
  if (!monthlyKwh && monthlyBill) {
    monthlyKwh = monthlyBill / AVG_ELECTRICITY_COST_EUR_PER_KWH;
  }
  if (!monthlyBill && monthlyKwh) {
    monthlyBill = monthlyKwh * AVG_ELECTRICITY_COST_EUR_PER_KWH;
  }

  // Fallback if no data is available
  if (!monthlyKwh || !monthlyBill) {
    // Return a default quote or throw an error
    return {
      systemSizeKW: 0,
      annualProductionKWh: 0,
      annualSavingsEUR: 0,
      selfSufficiencyPercentage: 0,
      currentMonthlyBill: 0,
      newMonthlyBill: 0,
    };
  }

  const annualKwhConsumption = monthlyKwh * 12;

  // Calculate the recommended system size.
  // Aim to cover the annual consumption.
  let systemSizeKW = annualKwhConsumption / KWH_PER_KWP_YEAR_ITALY;
  // Round to nearest 0.5 kWp
  systemSizeKW = Math.round(systemSizeKW * 2) / 2;
  // Ensure a minimum size for practical installations
  systemSizeKW = Math.max(systemSizeKW, 3);


  const annualProductionKWh = systemSizeKW * KWH_PER_KWP_YEAR_ITALY;

  // Calculate savings
  const energyConsumedFromSolar = annualProductionKWh * SELF_CONSUMPTION_RATE;
  const energyExportedToGrid = annualProductionKWh * (1 - SELF_CONSUMPTION_RATE);

  const savingsFromSelfConsumption = energyConsumedFromSolar * AVG_ELECTRICITY_COST_EUR_PER_KWH;
  const earningsFromGridFeedIn = energyExportedToGrid * GRID_FEED_IN_TARIFFE_EUR_PER_KWH;

  const annualSavingsEUR = savingsFromSelfConsumption + earningsFromGridFeedIn;
  
  const currentAnnualBill = monthlyBill * 12;
  const newAnnualBill = Math.max(0, currentAnnualBill - annualSavingsEUR);
  const newMonthlyBill = newAnnualBill / 12;

  // Calculate self-sufficiency
  const selfSufficiencyPercentage = Math.min(100, Math.round((energyConsumedFromSolar / annualKwhConsumption) * 100));


  return {
    systemSizeKW: parseFloat(systemSizeKW.toFixed(1)),
    annualProductionKWh: Math.round(annualProductionKWh),
    annualSavingsEUR: parseFloat(annualSavingsEUR.toFixed(2)),
    selfSufficiencyPercentage: selfSufficiencyPercentage,
    currentMonthlyBill: Math.round(monthlyBill),
    newMonthlyBill: Math.round(newMonthlyBill),
  };
}
