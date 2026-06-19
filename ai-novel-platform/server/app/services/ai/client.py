"""AI 模型 HTTP 客户端 — 兼容 OpenAI 协议，不绑定具体模型"""
import httpx
import json
from typing import AsyncGenerator


class AIClient:
    def __init__(self, base_url: str, api_key: str, model_name: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def chat(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        """非流式调用"""
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def chat_stream(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        """流式调用（SSE）"""
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST", f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                yield delta["content"]
                        except json.JSONDecodeError:
                            continue