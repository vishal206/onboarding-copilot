from openai import OpenAI
from typing import Generator


class OpenAi:
    def __init__(self, prompt: list[dict]):
        self.prompt = prompt
        self.client = OpenAI()
        self.model = "gpt-4o-mini"

    def generate(self) -> Generator:
        response = self.client.chat.completions.create(
            model=self.model, messages=self.prompt, stream=True
        )

        for chunk in response:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
