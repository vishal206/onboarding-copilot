import asyncio
from openai import OpenAI
from typing import AsyncGenerator


class OpenAi:
    def __init__(self, prompt: list[dict], bot_id: str | None = None):
        self.prompt = prompt
        self.bot_id = bot_id
        self.client = OpenAI()
        self.model = "gpt-4o-mini"

    async def generate(self) -> AsyncGenerator:
        response = self.client.chat.completions.create(
            model=self.model, messages=self.prompt, stream=True, stream_options={"include_usage": True}
        )

        input_tokens = 0
        output_tokens = 0

        for chunk in response:
            if chunk.usage:
                input_tokens = chunk.usage.prompt_tokens
                output_tokens = chunk.usage.completion_tokens
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta

        if self.bot_id and (input_tokens or output_tokens):
            from services.usage_tracker import log_usage
            asyncio.create_task(log_usage(self.bot_id, self.model, input_tokens, output_tokens))
