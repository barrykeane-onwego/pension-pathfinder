// 2025/26 rates
export const CLASS_2_WEEKLY = 3.45; // GBP per week
export const CLASS_3_WEEKLY = 17.45; // GBP per week
export const WEEKS_PER_YEAR = 52;
export const FULL_PENSION_WEEKLY_GBP = 221.20; // 2024/25 full new state pension
export const FULL_PENSION_YEARS = 35;
export const GBP_TO_EUR = 1.17; // approximate rate

// Triple lock: average ~3.5% annual increase historically
export const TRIPLE_LOCK_RATE = 0.035;

export const UK_STATE_PENSION_AGE = 67;

export interface CalculatorInputs {
  currentYears: number;
  yearsToBuyBack: number;
  contributionClass: "class2" | "class3";
  currentAge: number;
  retirementAge: number;
}

export interface CalculatorResults {
  costGBP: number;
  costEUR: number;
  costClass3GBP: number;
  costClass3EUR: number;
  additionalWeeklyPensionGBP: number;
  additionalAnnualPensionGBP: number;
  additionalAnnualPensionEUR: number;
  breakEvenMonths: number;
  breakEvenMonthsTripleLock: number;
  breakEvenMonthsBuybackTripleLock: number;
  yearsUntilPension: number;
  retirementDuration: number;
  lifetimeROI10: number;
  lifetimeROI20: number;
  savingsVsClass3EUR: number;
  savingsPercentage: number;
  // Future contribution fields
  totalYearsAfterBuyback: number;
  yearsStillNeeded: number;
  futureYearsToContribute: number;
  futureContributionCostGBP: number;
  futureContributionCostEUR: number;
  totalInvestmentGBP: number;
  totalInvestmentEUR: number;
  projectedTotalYears: number;
  projectedPensionPercentage: number;
  projectedWeeklyPensionGBP: number;
  // Total additional years (buyback + future)
  totalAdditionalYears: number;
  totalAdditionalAnnualPensionEUR: number;
  totalAdditionalAnnualPensionAtClaimEUR: number;
  chartData: { year: number; cumulativeEarnings: number; cost: number; cumulativeEarningsTripleLock: number }[];
}

export function calculatePension(inputs: CalculatorInputs): CalculatorResults {
  const { currentYears, yearsToBuyBack, contributionClass, currentAge, retirementAge } = inputs;

  const weeklyRate = contributionClass === "class2" ? CLASS_2_WEEKLY : CLASS_3_WEEKLY;
  const costPerYear = weeklyRate * WEEKS_PER_YEAR;
  const costGBP = costPerYear * yearsToBuyBack;
  const costEUR = costGBP * GBP_TO_EUR;

  const costClass3GBP = CLASS_3_WEEKLY * WEEKS_PER_YEAR * yearsToBuyBack;
  const costClass3EUR = costClass3GBP * GBP_TO_EUR;

  // Each qualifying year = 1/35th of full pension (buyback only)
  const additionalWeeklyPensionGBP = (FULL_PENSION_WEEKLY_GBP / FULL_PENSION_YEARS) * yearsToBuyBack;
  const additionalAnnualPensionGBP = additionalWeeklyPensionGBP * WEEKS_PER_YEAR;
  const additionalAnnualPensionEUR = additionalAnnualPensionGBP * GBP_TO_EUR;

  // Flat break-even (buyback only, no triple lock)
  const breakEvenMonths = additionalAnnualPensionEUR > 0
    ? Math.ceil((costEUR / additionalAnnualPensionEUR) * 12)
    : 0;

  const pensionAge = Math.max(retirementAge, UK_STATE_PENSION_AGE);
  const yearsUntilPension = Math.max(0, pensionAge - currentAge);
  const retirementDuration = Math.max(0, 90 - pensionAge);

  // Future contribution calculations
  const totalYearsAfterBuyback = currentYears + yearsToBuyBack;
  const yearsStillNeeded = Math.max(0, FULL_PENSION_YEARS - totalYearsAfterBuyback);
  const futureYearsContributable = Math.max(0, pensionAge - currentAge);
  const futureYearsToContribute = Math.min(yearsStillNeeded, futureYearsContributable);
  const futureContributionCostGBP = futureYearsToContribute * CLASS_3_WEEKLY * WEEKS_PER_YEAR;
  const futureContributionCostEUR = futureContributionCostGBP * GBP_TO_EUR;
  const totalInvestmentGBP = costGBP + futureContributionCostGBP;
  const totalInvestmentEUR = costEUR + futureContributionCostEUR;
  const projectedTotalYears = Math.min(FULL_PENSION_YEARS, currentYears + yearsToBuyBack + futureYearsToContribute);
  const projectedPensionPercentage = projectedTotalYears / FULL_PENSION_YEARS;
  const projectedWeeklyPensionGBP = FULL_PENSION_WEEKLY_GBP * projectedPensionPercentage;

  // Total additional years and pension (buyback + future)
  const totalAdditionalYears = yearsToBuyBack + futureYearsToContribute;
  const totalAdditionalWeeklyGBP = (FULL_PENSION_WEEKLY_GBP / FULL_PENSION_YEARS) * totalAdditionalYears;
  const totalAdditionalAnnualPensionEUR = totalAdditionalWeeklyGBP * WEEKS_PER_YEAR * GBP_TO_EUR;

  // Triple-lock-adjusted annual pension at claim time
  const tripleLockMultiplier = Math.pow(1 + TRIPLE_LOCK_RATE, yearsUntilPension);
  const totalAdditionalAnnualPensionAtClaimEUR = totalAdditionalAnnualPensionEUR * tripleLockMultiplier;
  const buybackAnnualPensionAtClaimEUR = additionalAnnualPensionEUR * tripleLockMultiplier;

  // Triple-lock break-even: total investment vs total additional pension at claim rates
  let breakEvenMonthsTripleLock = 0;
  if (totalAdditionalAnnualPensionAtClaimEUR > 0) {
    let cum = 0;
    for (let m = 1; m <= 600; m++) {
      cum += totalAdditionalAnnualPensionAtClaimEUR / 12;
      if (cum >= totalInvestmentEUR) {
        breakEvenMonthsTripleLock = m;
        break;
      }
    }
  }

  // Triple-lock break-even: buyback only cost vs buyback pension at claim rates
  let breakEvenMonthsBuybackTripleLock = 0;
  if (buybackAnnualPensionAtClaimEUR > 0) {
    let cum = 0;
    for (let m = 1; m <= 600; m++) {
      cum += buybackAnnualPensionAtClaimEUR / 12;
      if (cum >= costEUR) {
        breakEvenMonthsBuybackTripleLock = m;
        break;
      }
    }
  }

  // Lifetime ROI with triple lock
  const calcROI = (years: number) => {
    let total = 0;
    for (let i = 0; i < years; i++) {
      total += totalAdditionalAnnualPensionEUR * Math.pow(1 + TRIPLE_LOCK_RATE, yearsUntilPension + i);
    }
    return total;
  };

  const lifetimeROI10 = calcROI(10);
  const lifetimeROI20 = calcROI(20);

  const savingsVsClass3EUR = costClass3EUR - costEUR;
  const savingsPercentage = costClass3EUR > 0 ? (savingsVsClass3EUR / costClass3EUR) * 100 : 0;

  // Chart data: uses total additional pension (buyback + future) vs total investment
  const chartData = [];
  let cumEarnings = 0;
  let cumEarningsTripleLock = 0;
  for (let y = 0; y <= 25; y++) {
    cumEarnings += totalAdditionalAnnualPensionEUR;
    cumEarningsTripleLock += totalAdditionalAnnualPensionAtClaimEUR;
    chartData.push({
      year: y,
      cumulativeEarnings: Math.round(cumEarnings),
      cost: Math.round(totalInvestmentEUR),
      cumulativeEarningsTripleLock: Math.round(cumEarningsTripleLock),
    });
  }

  return {
    costGBP,
    costEUR,
    costClass3GBP,
    costClass3EUR,
    additionalWeeklyPensionGBP,
    additionalAnnualPensionGBP,
    additionalAnnualPensionEUR,
    breakEvenMonths,
    breakEvenMonthsTripleLock,
    breakEvenMonthsBuybackTripleLock,
    yearsUntilPension,
    retirementDuration,
    lifetimeROI10,
    lifetimeROI20,
    savingsVsClass3EUR,
    savingsPercentage,
    totalYearsAfterBuyback,
    yearsStillNeeded,
    futureYearsToContribute,
    futureContributionCostGBP,
    futureContributionCostEUR,
    totalInvestmentGBP,
    totalInvestmentEUR,
    projectedTotalYears,
    projectedPensionPercentage,
    projectedWeeklyPensionGBP,
    totalAdditionalYears,
    totalAdditionalAnnualPensionEUR,
    totalAdditionalAnnualPensionAtClaimEUR,
    chartData,
  };
}
