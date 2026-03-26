from fastapi import APIRouter
from pydantic import BaseModel
from services.indian_finance import fire_planner, calc_sip
from services.groq_client import groq_client

router = APIRouter()


class PlannerRequest(BaseModel):
    current_age: int
    monthly_income: float
    monthly_expenses: float
    current_savings: float = 0
    fire_age: int = 45
    inflation_rate: float = 6.0
    equity_return: float = 12.0
    session_id: str = ""


@router.post("/planner")
async def fire_plan(req: PlannerRequest):
    plan = fire_planner(
        current_age=req.current_age,
        monthly_income=req.monthly_income,
        monthly_expenses=req.monthly_expenses,
        current_savings=req.current_savings,
        fire_age=req.fire_age,
        inflation_rate=req.inflation_rate,
        equity_return=req.equity_return,
    )

    sip_nifty = calc_sip(plan["monthly_sip_needed"] * 0.60, req.fire_age - req.current_age, 12.0)
    sip_ppf = calc_sip(plan["monthly_sip_needed"] * 0.20, req.fire_age - req.current_age, 7.1)
    sip_nps = calc_sip(plan["monthly_sip_needed"] * 0.20, req.fire_age - req.current_age, 9.0)

    allocation = {
        "Nifty 50 Index Fund (60%)": {
            "monthly": round(plan["monthly_sip_needed"] * 0.60, 0),
            "projected": sip_nifty.maturity_value,
            "rationale": "Core equity growth, market-beating long term"
        },
        "PPF (20%)": {
            "monthly": round(plan["monthly_sip_needed"] * 0.20, 0),
            "projected": sip_ppf.maturity_value,
            "rationale": "Tax-free, 7.1% guaranteed, 80C eligible"
        },
        "NPS Tier-1 (20%)": {
            "monthly": round(plan["monthly_sip_needed"] * 0.20, 0),
            "projected": sip_nps.maturity_value,
            "rationale": "Extra ₹50,000 deduction under 80CCD(1B)"
        },
    }

    ai_prompt = f"""
User FIRE Plan:
- Age: {req.current_age}, Target FIRE age: {req.fire_age}
- Monthly income: ₹{req.monthly_income:,.0f}, Expenses: ₹{req.monthly_expenses:,.0f}
- FIRE corpus needed: ₹{plan['fire_corpus_needed']:,.0f}
- Monthly SIP needed: ₹{plan['monthly_sip_needed']:,.0f}
- Currently achievable: {'Yes' if plan['is_achievable'] else 'Needs adjustment'}

Write a 4-5 sentence motivating roadmap in Hinglish. Be specific about Indian instruments.
Mention at least one lesser-known tip. End with an inspiring line. Max 150 words.
"""

    ai_narrative = await groq_client.chat_complete(
        messages=[{"role": "user", "content": ai_prompt}],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        temperature=0.75,
        max_tokens=250,
    )

    return {
        "plan": plan,
        "allocation": allocation,
        "ai_narrative": ai_narrative.strip(),
        "chart_data": {
            "labels": [str(m["age"]) for m in plan["milestones"]],
            "corpus": [m["corpus"] for m in plan["milestones"]],
            "target": [plan["fire_corpus_needed"]] * len(plan["milestones"]),
        },
    }
