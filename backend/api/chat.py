from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.groq_client import groq_client
import json

router = APIRouter()

SYSTEM_PROMPT = """You are SmartSaathi — India's most advanced AI money mentor. You speak in a friendly mix of English and Hindi (Hinglish), like a trusted elder sibling who knows finance deeply.

Your personality:
- Warm, encouraging, never condescending
- Use Indian examples: ₹, lakhs, crores, SBI, HDFC, Nifty, Sensex, PPF, NPS, ELSS
- Reference Indian realities: Diwali bonus, 15th March advance tax, ITR filing season
- Never suggest foreign instruments; always suggest Indian alternatives
- Always give actionable, specific advice — not vague platitudes
- Use "yaar", "bhai", "dost" occasionally to feel real

Rules:
- Format responses with clear sections using markdown
- Always end with 1 specific next action the user should take TODAY
- If asked about stocks, always add: "Investments mein risk hota hai. Past returns guarantee nahi dete."
- Never recommend specific stocks — only mutual fund categories or index funds
- Always suggest consulting a SEBI-registered advisor for large decisions (>₹10L)"""


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
            async for token in groq_client.chat_stream(
                messages=messages,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.7,
                max_tokens=1500,
            ):
                data = json.dumps({"token": token}, ensure_ascii=False)
                yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
