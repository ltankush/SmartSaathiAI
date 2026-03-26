import aiohttp
import json
import re
from pathlib import Path
from config import settings


GIST_FILENAME = "smartsaathi_sessions.json"
ENV_FILE = Path(__file__).parent.parent / ".env"


class GistClient:
    def __init__(self):
        self.base_url = settings.github_api_url
        self.headers = {
            "Authorization": f"token {settings.github_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        self._gist_id: str = settings.github_gist_id or ""

    async def _ensure_gist(self) -> str:
        if self._gist_id:
            return self._gist_id

        payload = {
            "description": "SmartSaathiAI - Private Session Store",
            "public": False,
            "files": {
                GIST_FILENAME: {
                    "content": json.dumps({"sessions": {}}, indent=2)
                }
            },
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/gists",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                data = await response.json()
                self._gist_id = data["id"]
                self._save_gist_id_to_env(self._gist_id)
                print(f"[SmartSaathiAI] Created new Gist: {self._gist_id}")
                return self._gist_id

    def _save_gist_id_to_env(self, gist_id: str):
        if ENV_FILE.exists():
            content = ENV_FILE.read_text()
            if "GITHUB_GIST_ID=" in content:
                content = re.sub(r"GITHUB_GIST_ID=.*", f"GITHUB_GIST_ID={gist_id}", content)
            else:
                content += f"\nGITHUB_GIST_ID={gist_id}\n"
            ENV_FILE.write_text(content)
        settings.github_gist_id = gist_id

    async def _read_all(self) -> dict:
        gist_id = await self._ensure_gist()
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/gists/{gist_id}",
                headers=self.headers,
            ) as response:
                response.raise_for_status()
                data = await response.json()
                raw = data["files"][GIST_FILENAME]["content"]
                return json.loads(raw)

    async def _write_all(self, store: dict):
        gist_id = await self._ensure_gist()
        payload = {
            "files": {
                GIST_FILENAME: {
                    "content": json.dumps(store, indent=2, ensure_ascii=False)
                }
            }
        }
        async with aiohttp.ClientSession() as session:
            async with session.patch(
                f"{self.base_url}/gists/{gist_id}",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()

    async def get_session(self, session_id: str) -> dict:
        store = await self._read_all()
        return store.get("sessions", {}).get(session_id, {})

    async def save_session(self, session_id: str, data: dict):
        store = await self._read_all()
        if "sessions" not in store:
            store["sessions"] = {}
        store["sessions"][session_id] = data
        await self._write_all(store)

    async def delete_session(self, session_id: str):
        store = await self._read_all()
        store.get("sessions", {}).pop(session_id, None)
        await self._write_all(store)


gist_client = GistClient()
