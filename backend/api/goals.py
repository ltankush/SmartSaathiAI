from fastapi import APIRouter
from pydantic import BaseModel
from services.indian_finance import calc_sip
from services.groq_client import groq_client
import json

router = APIRouter()


class Goal(BaseModel):
    name: str
    target_amount: float
    years: int
    current_savings: float = 0
    priority: str = "medium"  # low, medium, high


class GoalsRequest(BaseModel):
    goals: list[Goal]
    monthly_income: float = 0
    age: int = 30
    session_id: str = ""


@router.post("/goals")
async def calculate_goals(req: GoalsRequest):
    results = []
    total_sip_needed = 0

    for goal in req.goals:
        gap = max(0, goal.target_amount - goal.current_savings)
        # Conservative 10% return for goal-based investing
        annual_return = 10.0 if goal.years <= 5 else 12.0
        r_monthly = annual_return / 100 / 12
        n = goal.years * 12

        if r_monthly > 0 and n > 0:
            sip_needed = gap * r_monthly / (((1 + r_monthly) ** n - 1) * (1 + r_monthly))
        else:
            sip_needed = gap / max(n, 1)

        sip_needed = max(0, round(sip_needed, 0))
        total_sip_needed += sip_needed

        # Project maturity
        proj = calc_sip(sip_needed, goal.years, annual_return)

        results.append({
            "name": goal.name,
            "target": goal.target_amount,
            "current_savings": goal.current_savings,
            "gap": gap,
            "years": goal.years,
            "monthly_sip_needed": sip_needed,
            "projected_value": proj.maturity_value + goal.current_savings * ((1 + annual_return / 100) ** goal.years),
            "annual_return_assumed": annual_return,
            "priority": goal.priority,
            "achievable": True,
        })

    # AI narrative
    goals_summary = "\n".join([
        f"- {r['name']}: Target ₹{r['target']:,.0f} in {r['years']} years, needs ₹{r['monthly_sip_needed']:,.0f}/month SIP"
        for r in results
    ])

    ai_prompt = f"""User has these financial goals:
{goals_summary}
Total monthly SIP needed: ₹{total_sip_needed:,.0f}
Monthly income: ₹{req.monthly_income:,.0f}
Age: {req.age}

Give 4-5 sentence advice in Hinglish about how to prioritize and achieve these goals.
Suggest which goals to focus on first and which can wait.
Mention specific Indian instruments for each timeline.
Max 150 words."""

    ai_narrative = await groq_client.chat_complete(
        messages=[{"role": "user", "content": ai_prompt}],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        temperature=0.65,
        max_tokens=250,
    )

    return {
        "goals": results,
        "total_monthly_sip": total_sip_needed,
        "ai_narrative": ai_narrative.strip(),
        "chart_data": {
            "labels": [r["name"] for r in results],
            "targets": [r["target"] for r in results],
            "sips": [r["monthly_sip_needed"] for r in results],
        },
    }
