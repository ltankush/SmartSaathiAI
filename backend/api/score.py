from fastapi import APIRouter
from pydantic import BaseModel
from services.indian_finance import calc_bms_score, match_govt_schemes
from services.groq_client import groq_client
import json

router = APIRouter()


class ScoreRequest(BaseModel):
    monthly_income: float
    monthly_expenses: float
    emergency_months: float = 0
    has_health_insurance: bool = False
    health_cover_lakhs: float = 0
    has_life_insurance: bool = False
    life_cover_times_income: float = 0
    monthly_sip: float = 0
    emi_to_income_ratio: float = 0
    has_will_or_nomination: bool = False
    age: int = 30
    has_ppf_or_nps: bool = False
    tax_filing_regular: bool = False
    is_farmer: bool = False
    has_daughter: bool = False
    session_id: str = ""


@router.post("/score")
async def calculate_score(req: ScoreRequest):
    bms = calc_bms_score(
        monthly_income=req.monthly_income,
        monthly_expenses=req.monthly_expenses,
        emergency_months=req.emergency_months,
        has_health_insurance=req.has_health_insurance,
        health_cover_lakhs=req.health_cover_lakhs,
        has_life_insurance=req.has_life_insurance,
        life_cover_times_income=req.life_cover_times_income,
        monthly_sip=req.monthly_sip,
        emi_to_income_ratio=req.emi_to_income_ratio,
        has_will_or_nomination=req.has_will_or_nomination,
        age=req.age,
        has_ppf_or_nps=req.has_ppf_or_nps,
        tax_filing_regular=req.tax_filing_regular,
    )

    schemes = match_govt_schemes(
        age=req.age,
        is_farmer=req.is_farmer,
        has_daughter=req.has_daughter,
    )

    ai_summary_prompt = f"""
A user has the following Bharat Money Score:
- Total Score: {bms.total}/100 — {bms.tier}
- Emergency Fund: {bms.emergency}/100
- Insurance: {bms.insurance}/100
- Investments: {bms.investments}/100
- Debt Health: {bms.debt}/100
- Tax Efficiency: {bms.tax}/100
- Retirement: {bms.retirement}/100
- Age: {req.age}, Monthly Income: ₹{req.monthly_income:,.0f}

Write a 3-sentence personalized summary in Hinglish. Be direct, warm, and specific.
Then give the single most impactful action they should take this week.
Keep total under 120 words. No markdown headers.
"""

    ai_summary = await groq_client.chat_complete(
        messages=[{"role": "user", "content": ai_summary_prompt}],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        temperature=0.6,
        max_tokens=200,
    )

    return {
        "score": {
            "total": bms.total,
            "tier": bms.tier,
            "tier_color": bms.tier_color,
            "dimensions": {
                "emergency": bms.emergency,
                "insurance": bms.insurance,
                "investments": bms.investments,
                "debt": bms.debt,
                "tax": bms.tax,
                "retirement": bms.retirement,
            },
        },
        "advice": bms.advice,
        "ai_summary": ai_summary.strip(),
        "govt_schemes": schemes,
    }
