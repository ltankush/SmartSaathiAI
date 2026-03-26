from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gist_client import gist_client
from datetime import datetime, timezone
import uuid

router = APIRouter()


class SessionData(BaseModel):
    session_id: str
    data: dict


class SessionCreate(BaseModel):
    metadata: dict = {}


@router.post("/session/create")
async def create_session(req: SessionCreate):
    session_id = str(uuid.uuid4())
    initial = {
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "profile": req.metadata,
        "bms_score": None,
        "plan": None,
        "tax": None,
        "chat_history": [],
    }
    await gist_client.save_session(session_id, initial)
    return {"session_id": session_id}


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    data = await gist_client.get_session(session_id)
    if not data:
        raise HTTPException(status_code=404, detail="Session not found")
    return data


@router.put("/session/{session_id}")
async def update_session(session_id: str, payload: SessionData):
    existing = await gist_client.get_session(session_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Session not found")
    existing.update(payload.data)
    existing["updated_at"] = datetime.now(timezone.utc).isoformat()
    await gist_client.save_session(session_id, existing)
    return {"status": "updated"}


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    await gist_client.delete_session(session_id)
    return {"status": "deleted"}
