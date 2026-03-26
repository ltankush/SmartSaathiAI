from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_client import groq_client

router = APIRouter()


class SpendingRequest(BaseModel):
    monthly_income: float
    categories: dict  # e.g. {"rent": 15000, "food": 8000, ...}
    age: int = 30
    session_id: str = ""


IDEAL_RATIOS = {
    "rent": {"max_pct": 30, "label": "Rent / Housing"},
    "food": {"max_pct": 15, "label": "Food & Groceries"},
    "transport": {"max_pct": 10, "label": "Transport"},
    "utilities": {"max_pct": 8, "label": "Utilities & Bills"},
    "shopping": {"max_pct": 10, "label": "Shopping"},
    "entertainment": {"max_pct": 5, "label": "Entertainment"},
    "emi": {"max_pct": 20, "label": "EMIs / Loans"},
    "health": {"max_pct": 5, "label": "Health & Fitness"},
    "education": {"max_pct": 10, "label": "Education"},
    "other": {"max_pct": 10, "label": "Misc / Other"},
}


@router.post("/spending")
async def analyze_spending(req: SpendingRequest):
    total_spending = sum(req.categories.values())
    savings = req.monthly_income - total_spending
    savings_rate = (savings / req.monthly_income * 100) if req.monthly_income > 0 else 0

    # Category analysis
    breakdown = []
    alerts = []
    for cat, amount in req.categories.items():
        pct = (amount / req.monthly_income * 100) if req.monthly_income > 0 else 0
        ideal = IDEAL_RATIOS.get(cat, {"max_pct": 10, "label": cat.title()})
        is_over = pct > ideal["max_pct"]
        if is_over:
            alerts.append(f"{ideal['label']}: {pct:.0f}% (ideal: ≤{ideal['max_pct']}%). Over by ₹{amount - req.monthly_income * ideal['max_pct'] / 100:,.0f}/month.")

        breakdown.append({
            "category": cat,
            "label": ideal["label"],
            "amount": amount,
            "percentage": round(pct, 1),
            "ideal_max_pct": ideal["max_pct"],
            "is_over_budget": is_over,
        })

    # 50/30/20 rule check
    needs = sum(req.categories.get(k, 0) for k in ["rent", "food", "utilities", "transport", "emi", "health"])
    wants = sum(req.categories.get(k, 0) for k in ["shopping", "entertainment", "other"])
    needs_pct = (needs / req.monthly_income * 100) if req.monthly_income > 0 else 0
    wants_pct = (wants / req.monthly_income * 100) if req.monthly_income > 0 else 0

    rule_503020 = {
        "needs": {"amount": needs, "pct": round(needs_pct, 1), "ideal": 50, "status": "ok" if needs_pct <= 55 else "high"},
        "wants": {"amount": wants, "pct": round(wants_pct, 1), "ideal": 30, "status": "ok" if wants_pct <= 35 else "high"},
        "savings": {"amount": savings, "pct": round(savings_rate, 1), "ideal": 20, "status": "ok" if savings_rate >= 15 else "low"},
    }

    # AI analysis
    cats_str = ", ".join([f"{IDEAL_RATIOS.get(k, {'label': k}).get('label', k)}: ₹{v:,.0f} ({v/req.monthly_income*100:.0f}%)" for k, v in req.categories.items()])
    ai_prompt = f"""Analyze this Indian user's monthly spending:
Income: ₹{req.monthly_income:,.0f}
Total Spending: ₹{total_spending:,.0f}
Savings: ₹{savings:,.0f} ({savings_rate:.0f}%)
Breakdown: {cats_str}
Over-budget areas: {alerts if alerts else 'None'}
50/30/20 rule: Needs {needs_pct:.0f}%, Wants {wants_pct:.0f}%, Savings {savings_rate:.0f}%

Give a 5-sentence spending audit in Hinglish. Be specific:
1. One thing they're doing well
2. Biggest savings opportunity with exact amount
3. Suggest where to redirect savings (SIP, PPF, etc.)
Max 130 words."""

    ai_analysis = await groq_client.chat_complete(
        messages=[{"role": "user", "content": ai_prompt}],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        temperature=0.55,
        max_tokens=220,
    )

    return {
        "total_spending": total_spending,
        "savings": savings,
        "savings_rate": round(savings_rate, 1),
        "breakdown": breakdown,
        "alerts": alerts,
        "rule_503020": rule_503020,
        "ai_analysis": ai_analysis.strip(),
        "chart_data": {
            "labels": [b["label"] for b in breakdown],
            "values": [b["amount"] for b in breakdown],
            "percentages": [b["percentage"] for b in breakdown],
        },
    }
