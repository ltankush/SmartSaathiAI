from fastapi import APIRouter, UploadFile, File, HTTPException
from services.groq_client import groq_client

router = APIRouter()


@router.post("/voice/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    if not audio.content_type or "audio" not in audio.content_type:
        if not audio.filename or not any(
            audio.filename.endswith(ext) for ext in [".webm", ".mp3", ".wav", ".m4a", ".ogg"]
        ):
            raise HTTPException(status_code=400, detail="Invalid audio file format")

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25MB)")

    transcript = await groq_client.transcribe_audio(
        audio_bytes=audio_bytes,
        filename=audio.filename or "audio.webm",
    )

    return {"transcript": transcript.strip()}
