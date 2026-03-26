import aiohttp
import json
from typing import AsyncGenerator, Optional
from config import settings


class GroqClient:
    def __init__(self):
        self.base_url = settings.groq_base_url
        self.headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }

    async def chat_stream(
        self,
        messages: list[dict],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        system_prompt: str = None,
    ) -> AsyncGenerator[str, None]:
        model = model or settings.model_smart
        payload_messages = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})
        payload_messages.extend(messages)

        payload = {
            "model": model,
            "messages": payload_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.content:
                    decoded = line.decode("utf-8").strip()
                    if decoded.startswith("data: "):
                        data_str = decoded[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

    async def chat_complete(
        self,
        messages: list[dict],
        model: str = None,
        temperature: float = 0.4,
        max_tokens: int = 2048,
        system_prompt: str = None,
        response_format: Optional[dict] = None,
    ) -> str:
        model = model or settings.model_smart
        payload_messages = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})
        payload_messages.extend(messages)

        payload = {
            "model": model,
            "messages": payload_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if response_format:
            payload["response_format"] = response_format

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                data = await response.json()
                return data["choices"][0]["message"]["content"]

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        form_data = aiohttp.FormData()
        form_data.add_field("file", audio_bytes, filename=filename, content_type="audio/webm")
        form_data.add_field("model", settings.model_stt)
        form_data.add_field("response_format", "text")
        form_data.add_field("language", "hi")

        headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/audio/transcriptions",
                headers=headers,
                data=form_data,
            ) as response:
                response.raise_for_status()
                return await response.text()


groq_client = GroqClient()
