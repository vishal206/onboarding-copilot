from openai import OpenAI
from typing import AsyncGenerator, Generator


class OpenAi:
    def __init__(self, prompt: list[dict]):
        self.prompt = prompt
        self.client = OpenAI()
        self.model = "gpt-4o-mini"

    async def generate(self) -> AsyncGenerator:
        response = self.client.chat.completions.create(
            model=self.model, messages=self.prompt, stream=True
        )

        for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
