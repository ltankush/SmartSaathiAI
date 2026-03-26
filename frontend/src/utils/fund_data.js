// ─── Indian Mutual Fund & ETF Recommendations (Static Data) ─────────────────
// Last updated: March 2026

export const INDEX_FUNDS = [
  {
    name: 'UTI Nifty 50 Index Fund',
    type: 'Index Fund',
    expense_ratio: 0.18,
    min_sip: 500,
    rating: 5,
    returns_5yr: 14.2,
    amc: 'UTI AMC',
    category: 'Large Cap',
    link: 'https://www.utimf.com',
  },
  {
    name: 'Nippon India Nifty 50 BeES',
    type: 'ETF',
    expense_ratio: 0.04,
    min_sip: null,
    rating: 5,
    returns_5yr: 14.3,
    amc: 'Nippon India',
    category: 'Large Cap',
    link: 'https://www.nipponindiamf.com',
  },
  {
    name: 'HDFC Index Fund - Nifty 50 Plan',
    type: 'Index Fund',
    expense_ratio: 0.20,
    min_sip: 500,
    rating: 4,
    returns_5yr: 13.9,
    amc: 'HDFC AMC',
    category: 'Large Cap',
    link: 'https://www.hdfcfund.com',
  },
  {
    name: 'Motilal Oswal Nifty Next 50 Index Fund',
    type: 'Index Fund',
    expense_ratio: 0.30,
    min_sip: 500,
    rating: 4,
    returns_5yr: 16.1,
    amc: 'Motilal Oswal',
    category: 'Mid Cap',
    link: 'https://www.motilaloswalmf.com',
  },
  {
    name: 'Parag Parikh Flexi Cap Fund',
    type: 'Active Fund',
    expense_ratio: 0.63,
    min_sip: 1000,
    rating: 5,
    returns_5yr: 18.4,
    amc: 'PPFAS',
    category: 'Flexi Cap',
    link: 'https://amc.ppfas.com',
  },
]

export const ELSS_FUNDS = [
  {
    name: 'Mirae Asset Tax Saver Fund',
    type: 'ELSS',
    expense_ratio: 0.58,
    min_sip: 500,
    rating: 5,
    returns_5yr: 16.8,
    tax_benefit: '80C — up to ₹1.5L',
    lock_in: '3 years',
  },
  {
    name: 'Quant Tax Plan',
    type: 'ELSS',
    expense_ratio: 0.57,
    min_sip: 500,
    rating: 4,
    returns_5yr: 22.1,
    tax_benefit: '80C — up to ₹1.5L',
    lock_in: '3 years',
  },
]

export const SAFE_INSTRUMENTS = [
  {
    name: 'Public Provident Fund (PPF)',
    type: 'Govt',
    current_rate: 7.1,
    min_investment: 500,
    max_investment: 150000,
    lock_in: '15 years',
    tax: 'EEE — fully tax free',
    benefit_80c: true,
  },
  {
    name: 'National Pension System (NPS)',
    type: 'Govt',
    current_rate: '9-12% (equity-linked)',
    min_investment: 500,
    max_investment: null,
    lock_in: 'Until 60',
    tax: 'Extra ₹50,000 under 80CCD(1B)',
    benefit_80c: true,
  },
  {
    name: 'Sukanya Samriddhi Yojana (SSY)',
    type: 'Govt',
    current_rate: 8.2,
    min_investment: 250,
    max_investment: 150000,
    lock_in: '21 years',
    tax: 'EEE — fully tax free',
    benefit_80c: true,
    note: "Only for girl children under 10",
  },
  {
    name: 'Senior Citizen Savings Scheme (SCSS)',
    type: 'Govt',
    current_rate: 8.2,
    min_investment: 1000,
    max_investment: 3000000,
    lock_in: '5 years',
    tax: '80C eligible, interest taxable',
    benefit_80c: true,
    note: "For 60+ age",
  },
]

export const NPS_FUND_MANAGERS = [
  { name: 'SBI Pension Funds', equity_return_5yr: 14.2, rating: 4 },
  { name: 'HDFC Pension Management', equity_return_5yr: 15.1, rating: 5 },
  { name: 'ICICI Pru Pension Fund', equity_return_5yr: 13.8, rating: 4 },
  { name: 'Kotak Pension Fund', equity_return_5yr: 14.5, rating: 4 },
  { name: 'UTI Retirement Solutions', equity_return_5yr: 13.2, rating: 3 },
]

export function getRecommendedFunds(investorAge, riskProfile = 'moderate') {
  const funds = []
  if (investorAge < 35) {
    // Aggressive: more equity
    funds.push(INDEX_FUNDS[0]) // Nifty 50
    funds.push(INDEX_FUNDS[3]) // Nifty Next 50
    funds.push(INDEX_FUNDS[4]) // Flexi Cap
  } else if (investorAge < 50) {
    // Moderate
    funds.push(INDEX_FUNDS[0]) // Nifty 50
    funds.push(INDEX_FUNDS[2]) // HDFC Index
    funds.push(SAFE_INSTRUMENTS[0]) // PPF
  } else {
    // Conservative
    funds.push(INDEX_FUNDS[0])
    funds.push(SAFE_INSTRUMENTS[0])
    funds.push(SAFE_INSTRUMENTS[3]) // SCSS
  }
  return funds
}
