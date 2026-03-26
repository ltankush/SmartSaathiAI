from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.groq_client import groq_client
from services.indian_finance import (
    calc_bms_score, compare_tax_regimes, fire_planner,
    calc_sip, match_govt_schemes
)
import json

router = APIRouter()

SYSTEM_PROMPT = """You are SmartSaathi — India's most advanced AI money mentor with real-time calculation abilities. You speak in a friendly mix of English and Hindi (Hinglish), like a trusted elder sibling who knows finance deeply.

Your personality:
- Warm, encouraging, never condescending
- Use Indian examples: ₹, lakhs, crores, SBI, HDFC, Nifty, Sensex, PPF, NPS, ELSS
- Reference Indian realities: Diwali bonus, 15th March advance tax, ITR filing season
- Never suggest foreign instruments; always suggest Indian alternatives
- Always give actionable, specific advice — not vague platitudes
- Use "yaar", "bhai", "dost" occasionally to feel real

IMPORTANT - You have access to REAL financial calculation tools:
- When someone asks about tax comparison, USE the compare_tax_regimes tool with their numbers
- When someone asks about FIRE planning, USE the fire_planner tool
- When someone asks about SIP calculations, USE the calculate_sip tool
- When someone asks about their financial score, USE the calculate_bms_score tool
- When someone asks about govt schemes, USE the match_govt_schemes tool
- ALWAYS use tools when numbers are involved — never estimate manually
- After getting tool results, explain them in simple Hinglish with actionable advice

Rules:
- Format responses with clear sections using markdown
- Always end with 1 specific next action the user should take TODAY
- If asked about stocks, always add: "Investments mein risk hota hai. Past returns guarantee nahi dete."
- Never recommend specific stocks — only mutual fund categories or index funds
- Always suggest consulting a SEBI-registered advisor for large decisions (>₹10L)"""

# Tool definitions for Groq function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "compare_tax_regimes",
            "description": "Compare Old vs New income tax regime for an Indian salaried individual. Returns exact tax under both regimes, deductions breakdown, and which regime saves more. Use this whenever someone asks about tax optimization or regime comparison.",
            "parameters": {
                "type": "object",
                "properties": {
                    "gross_salary": {"type": "number", "description": "Annual gross salary (CTC) in INR"},
                    "hra_exempt": {"type": "number", "description": "HRA exemption claimed (INR)", "default": 0},
                    "section_80c": {"type": "number", "description": "Section 80C investments — PF, PPF, ELSS, LIC (max 150000)", "default": 0},
                    "section_80d": {"type": "number", "description": "Section 80D health insurance premium (max 25000)", "default": 0},
                    "section_80ccd_nps": {"type": "number", "description": "NPS contribution under 80CCD(1B) (max 50000)", "default": 0},
                    "home_loan_interest": {"type": "number", "description": "Home loan interest section 24b (max 200000)", "default": 0},
                },
                "required": ["gross_salary"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fire_planner",
            "description": "Calculate FIRE (Financial Independence Retire Early) plan for India. Returns required corpus, monthly SIP needed, and milestone timeline. Use when someone asks about retirement planning or FIRE.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_age": {"type": "integer", "description": "Current age"},
                    "monthly_income": {"type": "number", "description": "Monthly take-home income in INR"},
                    "monthly_expenses": {"type": "number", "description": "Monthly expenses in INR"},
                    "current_savings": {"type": "number", "description": "Current total savings/investments in INR", "default": 0},
                    "fire_age": {"type": "integer", "description": "Target retirement age", "default": 45},
                },
                "required": ["current_age", "monthly_income", "monthly_expenses"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_sip",
            "description": "Calculate SIP (Systematic Investment Plan) maturity value. Returns total invested, maturity value, and wealth gained. Use when someone asks about SIP returns or investment projections.",
            "parameters": {
                "type": "object",
                "properties": {
                    "monthly_amount": {"type": "number", "description": "Monthly SIP amount in INR"},
                    "years": {"type": "integer", "description": "Investment duration in years"},
                    "annual_return_pct": {"type": "number", "description": "Expected annual return percentage", "default": 12.0},
                },
                "required": ["monthly_amount", "years"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_bms_score",
            "description": "Calculate Bharat Money Score — a 0-100 financial health score across 6 dimensions. Use when someone wants to check their financial health.",
            "parameters": {
                "type": "object",
                "properties": {
                    "monthly_income": {"type": "number", "description": "Monthly income in INR"},
                    "monthly_expenses": {"type": "number", "description": "Monthly expenses in INR"},
                    "emergency_months": {"type": "number", "description": "Months of expenses covered by emergency fund", "default": 0},
                    "has_health_insurance": {"type": "boolean", "description": "Has health insurance", "default": False},
                    "health_cover_lakhs": {"type": "number", "description": "Health cover in lakhs", "default": 0},
                    "has_life_insurance": {"type": "boolean", "description": "Has life/term insurance", "default": False},
                    "life_cover_times_income": {"type": "number", "description": "Life cover as multiple of annual income", "default": 0},
                    "monthly_sip": {"type": "number", "description": "Monthly SIP amount", "default": 0},
                    "emi_to_income_ratio": {"type": "number", "description": "EMI as fraction of income (0-1)", "default": 0},
                    "has_will_or_nomination": {"type": "boolean", "default": False},
                    "age": {"type": "integer", "description": "Age of the user", "default": 30},
                    "has_ppf_or_nps": {"type": "boolean", "default": False},
                    "tax_filing_regular": {"type": "boolean", "default": False},
                },
                "required": ["monthly_income", "monthly_expenses"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "match_govt_schemes",
            "description": "Find government schemes the user is eligible for based on age and profile. Returns matching schemes with descriptions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "age": {"type": "integer", "description": "User's age"},
                    "is_farmer": {"type": "boolean", "default": False},
                    "has_daughter": {"type": "boolean", "default": False},
                },
                "required": ["age"],
            },
        },
    },
]


def _execute_tool(name: str, args: dict) -> str:
    """Execute a tool and return JSON string result."""
    try:
        if name == "compare_tax_regimes":
            result = compare_tax_regimes(
                gross=args.get("gross_salary", 0),
                hra_exempt=args.get("hra_exempt", 0),
                section_80c=args.get("section_80c", 0),
                section_80d=args.get("section_80d", 0),
                section_80ccd_nps=args.get("section_80ccd_nps", 0),
                home_loan_interest=args.get("home_loan_interest", 0),
            )
            return json.dumps({
                "old_regime_tax": result.old_regime_tax,
                "new_regime_tax": result.new_regime_tax,
                "recommended_regime": result.recommended_regime,
                "savings": result.savings,
                "old_deductions": result.old_deductions,
                "breakdown": result.breakdown,
            }, default=str)

        elif name == "fire_planner":
            result = fire_planner(
                current_age=args["current_age"],
                monthly_income=args["monthly_income"],
                monthly_expenses=args["monthly_expenses"],
                current_savings=args.get("current_savings", 0),
                fire_age=args.get("fire_age", 45),
            )
            return json.dumps(result, default=str)

        elif name == "calculate_sip":
            result = calc_sip(
                monthly=args["monthly_amount"],
                years=args["years"],
                annual_return_pct=args.get("annual_return_pct", 12.0),
            )
            return json.dumps({
                "monthly_sip": result.monthly_sip,
                "years": result.years,
                "total_invested": result.total_invested,
                "maturity_value": result.maturity_value,
                "wealth_gained": result.wealth_gained,
                "return_pct": result.expected_return_pct,
            })

        elif name == "calculate_bms_score":
            result = calc_bms_score(
                monthly_income=args["monthly_income"],
                monthly_expenses=args["monthly_expenses"],
                emergency_months=args.get("emergency_months", 0),
                has_health_insurance=args.get("has_health_insurance", False),
                health_cover_lakhs=args.get("health_cover_lakhs", 0),
                has_life_insurance=args.get("has_life_insurance", False),
                life_cover_times_income=args.get("life_cover_times_income", 0),
                monthly_sip=args.get("monthly_sip", 0),
                emi_to_income_ratio=args.get("emi_to_income_ratio", 0),
                has_will_or_nomination=args.get("has_will_or_nomination", False),
                age=args.get("age", 30),
                has_ppf_or_nps=args.get("has_ppf_or_nps", False),
                tax_filing_regular=args.get("tax_filing_regular", False),
            )
            return json.dumps({
                "total_score": result.total,
                "tier": result.tier,
                "emergency": result.emergency,
                "insurance": result.insurance,
                "investments": result.investments,
                "debt": result.debt,
                "tax": result.tax,
                "retirement": result.retirement,
                "advice": result.advice,
            })

        elif name == "match_govt_schemes":
            result = match_govt_schemes(
                age=args["age"],
                is_farmer=args.get("is_farmer", False),
                has_daughter=args.get("has_daughter", False),
            )
            return json.dumps(result)

        else:
            return json.dumps({"error": f"Unknown tool: {name}"})

    except Exception as e:
        return json.dumps({"error": str(e)})


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: str = ""
    context: dict = {}


@router.post("/chat")
async def chat_stream(req: ChatRequest):
    messages = [m.model_dump() for m in req.messages]

    if req.context:
        context_str = json.dumps(req.context, ensure_ascii=False)
        messages.insert(0, {
            "role": "user",
            "content": f"[User financial context for this session: {context_str}]"
        })

    async def event_stream():
        try:
            # Step 1: Try agentic tool call (non-streaming)
            tool_response = await groq_client.chat_with_tools(
                messages=messages,
                tools=TOOLS,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.4,
                max_tokens=1500,
            )

            tool_calls = tool_response.get("tool_calls")

            if tool_calls:
                # Execute all tool calls
                tool_messages = list(messages)
                tool_messages.append(tool_response)

                for tc in tool_calls:
                    fn_name = tc["function"]["name"]
                    fn_args = json.loads(tc["function"]["arguments"])
                    fn_result = _execute_tool(fn_name, fn_args)

                    tool_messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": fn_result,
                    })

                # Step 2: Stream the final response with tool results
                async for token in groq_client.chat_stream(
                    messages=tool_messages,
                    system_prompt=SYSTEM_PROMPT,
                    temperature=0.7,
                    max_tokens=1500,
                ):
                    data = json.dumps({"token": token}, ensure_ascii=False)
                    yield f"data: {data}\n\n"
            else:
                # No tool calls — stream the direct response content
                content = tool_response.get("content", "")
                if content:
                    # Send content in small chunks to simulate streaming
                    words = content.split(" ")
                    for i, word in enumerate(words):
                        token = word if i == 0 else " " + word
                        data = json.dumps({"token": token}, ensure_ascii=False)
                        yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            # Fallback: regular streaming without tools
            try:
                async for token in groq_client.chat_stream(
                    messages=messages,
                    system_prompt=SYSTEM_PROMPT,
                    temperature=0.7,
                    max_tokens=1500,
                ):
                    data = json.dumps({"token": token}, ensure_ascii=False)
                    yield f"data: {data}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e2:
                yield f"data: {json.dumps({'error': str(e2)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
