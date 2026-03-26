from fastapi import APIRouter
from pydantic import BaseModel
from services.indian_finance import compare_tax_regimes
from services.groq_client import groq_client

router = APIRouter()


class TaxRequest(BaseModel):
    gross_salary: float
    hra_exempt: float = 0
    section_80c: float = 0
    section_80d: float = 0
    section_80ccd_nps: float = 0
    home_loan_interest: float = 0
    lta: float = 0
    other_deductions: float = 0
    session_id: str = ""


@router.post("/tax")
async def tax_optimize(req: TaxRequest):
    result = compare_tax_regimes(
        gross=req.gross_salary,
        hra_exempt=req.hra_exempt,
        section_80c=req.section_80c,
        section_80d=req.section_80d,
        section_80ccd_nps=req.section_80ccd_nps,
        home_loan_interest=req.home_loan_interest,
        lta=req.lta,
        other_deductions=req.other_deductions,
    )

    old = result.breakdown["old"]
    new = result.breakdown["new"]

    missed = []
    if req.section_80c < 150000:
        gap = 150000 - req.section_80c
        missed.append(f"80C gap: ₹{gap:,.0f} unused. Add ELSS or PPF to save ₹{gap*0.30:,.0f} in tax.")
    if req.section_80d < 25000:
        missed.append(f"80D: Health insurance premium up to ₹25,000 deductible. You've used only ₹{req.section_80d:,.0f}.")
    if req.section_80ccd_nps < 50000:
        gap = 50000 - req.section_80ccd_nps
        missed.append(f"80CCD(1B) NPS: ₹{gap:,.0f} unused. Open NPS to save additional ₹{gap*0.30:,.0f}.")
    if req.home_loan_interest == 0 and req.gross_salary > 500000:
        missed.append("Consider a home loan — interest up to ₹2L deductible under Section 24(b).")

    ai_prompt = f"""
Tax comparison for Indian salaried individual:
- Gross Salary: ₹{req.gross_salary:,.0f}
- Old Regime Tax: ₹{old['total_tax']:,.0f} (effective rate: {old['effective_rate']}%)
- New Regime Tax: ₹{new['total_tax']:,.0f} (effective rate: {new['effective_rate']}%)
- Recommended: {result.recommended_regime.upper()} regime
- You save: ₹{result.savings:,.0f} by choosing the right regime
- Missed deductions: {missed}

In 4-5 sentences Hinglish, explain which regime to choose and why. 
Give 2 specific action items for next financial year. Be crisp and practical.
Max 130 words.
"""

    ai_advice = await groq_client.chat_complete(
        messages=[{"role": "user", "content": ai_prompt}],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        temperature=0.5,
        max_tokens=200,
    )

    return {
        "old_regime": {
            "total_tax": old["total_tax"],
            "taxable_income": old["taxable_income"],
            "effective_rate": old["effective_rate"],
            "deductions": old["deductions_breakdown"],
            "total_deductions": old["total_deductions"],
        },
        "new_regime": {
            "total_tax": new["total_tax"],
            "taxable_income": new["taxable_income"],
            "effective_rate": new["effective_rate"],
            "deductions": new["deductions_breakdown"],
            "total_deductions": new["total_deductions"],
        },
        "recommended": result.recommended_regime,
        "savings": result.savings,
        "missed_deductions": missed,
        "ai_advice": ai_advice.strip(),
        "chart_data": {
            "labels": ["Old Regime", "New Regime"],
            "tax": [old["total_tax"], new["total_tax"]],
            "take_home": [
                req.gross_salary - old["total_tax"],
                req.gross_salary - new["total_tax"],
            ],
        },
    }
