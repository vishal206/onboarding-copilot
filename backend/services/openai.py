from openai import OpenAI


class OpenAi:
    def __init__(self, prompt: list[dict]):
        self.prompt = prompt
        self.client = OpenAI()
        self.model = "gpt-4o-mini"

    def generate(self) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.prompt,
        )
        return response.choices[0].message.content
