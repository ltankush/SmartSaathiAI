from dataclasses import dataclass, field
from typing import Optional
import math


@dataclass
class TaxResult:
    old_regime_tax: float
    new_regime_tax: float
    old_deductions: dict
    new_deductions: dict
    recommended_regime: str
    savings: float
    breakdown: dict


@dataclass
class SIPProjection:
    monthly_sip: float
    years: int
    expected_return_pct: float
    total_invested: float
    maturity_value: float
    wealth_gained: float


@dataclass
class BMSScore:
    total: int
    emergency: int
    insurance: int
    investments: int
    debt: int
    tax: int
    retirement: int
    tier: str
    tier_color: str
    advice: list[str]


SLAB_OLD_2526 = [
    (250000, 0.00),
    (500000, 0.05),
    (1000000, 0.20),
    (float("inf"), 0.30),
]

SLAB_NEW_2526 = [
    (300000, 0.00),
    (600000, 0.05),
    (900000, 0.10),
    (1200000, 0.15),
    (1500000, 0.20),
    (float("inf"), 0.30),
]


def _calc_slab_tax(income: float, slabs: list) -> float:
    tax = 0.0
    prev = 0.0
    for limit, rate in slabs:
        if income <= prev:
            break
        taxable = min(income, limit) - prev
        tax += taxable * rate
        prev = limit
    return tax


def _cess(tax: float) -> float:
    return tax * 0.04


def calculate_old_regime(
    gross: float,
    hra_exempt: float = 0,
    section_80c: float = 0,
    section_80d: float = 0,
    section_80ccd_nps: float = 0,
    home_loan_interest: float = 0,
    standard_deduction: float = 50000,
    lta: float = 0,
    other_deductions: float = 0,
) -> dict:
    deductions = {
        "Standard deduction": min(standard_deduction, 50000),
        "HRA exemption": min(hra_exempt, gross * 0.50),
        "80C (PF, ELSS, LIC, PPF)": min(section_80c, 150000),
        "80D (health insurance)": min(section_80d, 25000),
        "80CCD(1B) NPS": min(section_80ccd_nps, 50000),
        "24(b) home loan interest": min(home_loan_interest, 200000),
        "LTA": min(lta, 30000),
        "Others": other_deductions,
    }
    total_deductions = sum(deductions.values())
    taxable = max(0, gross - total_deductions)
    base_tax = _calc_slab_tax(taxable, SLAB_OLD_2526)
    if taxable <= 500000:
        base_tax = max(0, base_tax - 12500)
    total_tax = base_tax + _cess(base_tax)
    return {
        "gross": gross,
        "total_deductions": total_deductions,
        "taxable_income": taxable,
        "base_tax": round(base_tax, 2),
        "cess": round(_cess(base_tax), 2),
        "total_tax": round(total_tax, 2),
        "deductions_breakdown": deductions,
        "effective_rate": round(total_tax / gross * 100, 2) if gross > 0 else 0,
    }


def calculate_new_regime(gross: float) -> dict:
    standard_deduction = 75000
    taxable = max(0, gross - standard_deduction)
    base_tax = _calc_slab_tax(taxable, SLAB_NEW_2526)
    if taxable <= 700000:
        base_tax = max(0, base_tax - 25000)
    total_tax = base_tax + _cess(base_tax)
    return {
        "gross": gross,
        "total_deductions": standard_deduction,
        "taxable_income": taxable,
        "base_tax": round(base_tax, 2),
        "cess": round(_cess(base_tax), 2),
        "total_tax": round(total_tax, 2),
        "deductions_breakdown": {"Standard deduction (new)": standard_deduction},
        "effective_rate": round(total_tax / gross * 100, 2) if gross > 0 else 0,
    }


def compare_tax_regimes(gross: float, **old_kwargs) -> TaxResult:
    old = calculate_old_regime(gross, **old_kwargs)
    new = calculate_new_regime(gross)
    recommended = "old" if old["total_tax"] < new["total_tax"] else "new"
    savings = abs(old["total_tax"] - new["total_tax"])
    return TaxResult(
        old_regime_tax=old["total_tax"],
        new_regime_tax=new["total_tax"],
        old_deductions=old["deductions_breakdown"],
        new_deductions=new["deductions_breakdown"],
        recommended_regime=recommended,
        savings=round(savings, 2),
        breakdown={"old": old, "new": new},
    )


def calc_sip(monthly: float, years: int, annual_return_pct: float = 12.0) -> SIPProjection:
    r = annual_return_pct / 100 / 12
    n = years * 12
    if r == 0:
        maturity = monthly * n
    else:
        maturity = monthly * (((1 + r) ** n - 1) / r) * (1 + r)
    invested = monthly * n
    return SIPProjection(
        monthly_sip=monthly,
        years=years,
        expected_return_pct=annual_return_pct,
        total_invested=round(invested, 2),
        maturity_value=round(maturity, 2),
        wealth_gained=round(maturity - invested, 2),
    )


def fire_planner(
    current_age: int,
    monthly_income: float,
    monthly_expenses: float,
    current_savings: float,
    fire_age: int = 45,
    inflation_rate: float = 6.0,
    equity_return: float = 12.0,
    debt_return: float = 7.0,
) -> dict:
    years_to_fire = fire_age - current_age
    monthly_surplus = monthly_income - monthly_expenses
    annual_expenses = monthly_expenses * 12

    future_annual_expenses = annual_expenses * ((1 + inflation_rate / 100) ** years_to_fire)
    fire_corpus = future_annual_expenses * 25

    r_monthly = equity_return / 100 / 12
    n = years_to_fire * 12
    future_savings = current_savings * ((1 + equity_return / 100) ** years_to_fire)

    if r_monthly > 0:
        sip_needed = max(0, (fire_corpus - future_savings) * r_monthly / (((1 + r_monthly) ** n - 1) * (1 + r_monthly)))
    else:
        sip_needed = max(0, (fire_corpus - future_savings) / n)

    sip_needed = round(sip_needed, 0)

    age_allocation = []
    for age in range(current_age, fire_age + 1):
        years_left = fire_age - age
        equity_pct = max(30, min(90, 100 - age))
        debt_pct = 100 - equity_pct
        age_allocation.append({"age": age, "equity": equity_pct, "debt": debt_pct})

    milestones = []
    for yr in [1, 3, 5, 10, years_to_fire]:
        if yr <= years_to_fire:
            proj = calc_sip(sip_needed, yr, equity_return)
            corpus_at = proj.maturity_value + current_savings * ((1 + equity_return / 100) ** yr)
            milestones.append({
                "year": yr,
                "age": current_age + yr,
                "corpus": round(corpus_at, 0),
                "target_pct": round(corpus_at / fire_corpus * 100, 1),
            })

    return {
        "fire_corpus_needed": round(fire_corpus, 0),
        "monthly_sip_needed": round(sip_needed, 0),
        "years_to_fire": years_to_fire,
        "monthly_surplus": round(monthly_surplus, 0),
        "future_monthly_expenses": round(future_annual_expenses / 12, 0),
        "age_allocation": age_allocation,
        "milestones": milestones,
        "is_achievable": sip_needed <= monthly_surplus * 0.7,
    }


def calc_bms_score(
    monthly_income: float,
    emergency_months: float,
    has_health_insurance: bool,
    health_cover_lakhs: float,
    has_life_insurance: bool,
    life_cover_times_income: float,
    monthly_sip: float,
    emi_to_income_ratio: float,
    has_will_or_nomination: bool,
    age: int,
    has_ppf_or_nps: bool,
    tax_filing_regular: bool,
) -> BMSScore:
    scores = {}

    em = min(100, int(emergency_months / 6 * 100))
    scores["emergency"] = em

    ins_score = 0
    if has_health_insurance:
        ins_score += 40
        if health_cover_lakhs >= 10:
            ins_score += 30
        elif health_cover_lakhs >= 5:
            ins_score += 15
    if has_life_insurance:
        ins_score += 20
        if life_cover_times_income >= 10:
            ins_score += 10
    scores["insurance"] = min(100, ins_score)

    inv_score = 0
    sip_ratio = monthly_sip / monthly_income if monthly_income > 0 else 0
    if sip_ratio >= 0.20:
        inv_score = 100
    elif sip_ratio >= 0.10:
        inv_score = 70
    elif sip_ratio >= 0.05:
        inv_score = 40
    else:
        inv_score = 10
    scores["investments"] = inv_score

    debt_score = 100
    if emi_to_income_ratio > 0.50:
        debt_score = 10
    elif emi_to_income_ratio > 0.40:
        debt_score = 30
    elif emi_to_income_ratio > 0.30:
        debt_score = 55
    elif emi_to_income_ratio > 0.20:
        debt_score = 75
    scores["debt"] = debt_score

    tax_score = 50
    if tax_filing_regular:
        tax_score += 30
    if monthly_income * 12 > 500000 and tax_filing_regular:
        tax_score = 90
    scores["tax"] = min(100, tax_score)

    ret_score = 0
    if has_ppf_or_nps:
        ret_score += 50
    retirement_savings_ratio = (monthly_sip * 12) / (monthly_income * 12) if monthly_income > 0 else 0
    if retirement_savings_ratio >= 0.15:
        ret_score += 50
    elif retirement_savings_ratio >= 0.08:
        ret_score += 25
    scores["retirement"] = min(100, ret_score)

    weights = {"emergency": 0.20, "insurance": 0.20, "investments": 0.20, "debt": 0.15, "tax": 0.10, "retirement": 0.15}
    total = int(sum(scores[k] * weights[k] for k in scores))

    if total >= 80:
        tier, color = "Wealth Builder", "#22c55e"
    elif total >= 60:
        tier, color = "On Track", "#3b82f6"
    elif total >= 40:
        tier, color = "Needs Attention", "#f59e0b"
    else:
        tier, color = "Financial SOS", "#ef4444"

    advice = []
    if scores["emergency"] < 60:
        advice.append(f"Build emergency fund to cover at least 6 months of expenses (₹{int(monthly_income * 6):,})")
    if scores["insurance"] < 60:
        advice.append("Get a family floater health insurance of ₹10L+ immediately. Try Star Health or Niva Bupa.")
    if scores["investments"] < 60:
        advice.append(f"Start SIP of at least ₹{int(monthly_income * 0.10):,}/month in index funds (Nifty 50 ETF).")
    if scores["debt"] < 60:
        advice.append("Your EMI burden is high. Avoid new loans and consider prepaying high-interest debt first.")
    if scores["retirement"] < 60:
        advice.append("Open an NPS account via eNPS. Employer contribution + 80CCD(1B) gives ₹50,000 extra deduction.")

    return BMSScore(
        total=total,
        emergency=scores["emergency"],
        insurance=scores["insurance"],
        investments=scores["investments"],
        debt=scores["debt"],
        tax=scores["tax"],
        retirement=scores["retirement"],
        tier=tier,
        tier_color=color,
        advice=advice,
    )


GOVT_SCHEMES = [
    {"name": "Atal Pension Yojana", "min_age": 18, "max_age": 40, "max_income": None, "desc": "Pension of ₹1000-₹5000/month after 60. Govt co-contributes for low-income earners."},
    {"name": "PM Jan Suraksha Bima Yojana", "min_age": 18, "max_age": 70, "max_income": None, "desc": "Accident insurance ₹2L cover for just ₹20/year."},
    {"name": "PM Jeevan Jyoti Bima Yojana", "min_age": 18, "max_age": 50, "max_income": None, "desc": "Life insurance ₹2L cover for ₹436/year."},
    {"name": "PM Mudra Yojana", "min_age": 18, "max_age": None, "max_income": None, "desc": "Business loans up to ₹10L without collateral for small businesses."},
    {"name": "Sukanya Samriddhi Yojana", "min_age": None, "max_age": None, "max_income": None, "desc": "For girl children — 8.2% tax-free returns, 80C eligible."},
    {"name": "PM Kisan Samman Nidhi", "min_age": 18, "max_age": None, "max_income": None, "desc": "₹6,000/year direct transfer for farmers owning <2 hectares."},
    {"name": "Senior Citizen Saving Scheme", "min_age": 60, "max_age": None, "max_income": None, "desc": "8.2% interest, 80C eligible, best safe investment for seniors."},
]


def match_govt_schemes(age: int, is_farmer: bool = False, has_daughter: bool = False) -> list[dict]:
    matched = []
    for scheme in GOVT_SCHEMES:
        min_a = scheme.get("min_age") or 0
        max_a = scheme.get("max_age") or 200
        if min_a <= age <= max_a:
            if "Kisan" in scheme["name"] and not is_farmer:
                continue
            if "Sukanya" in scheme["name"] and not has_daughter:
                continue
            matched.append(scheme)
    return matched
