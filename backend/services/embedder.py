from openai import OpenAI


class Embedder:
    def __init__(self, chunks: list[str]):
        self.chunks = chunks

    def embed(self) -> list[list[float]]:
        # returns a list of embeddings, one per chunk
        # call text-embedding-3-small
        model = "text-embedding-3-small"
        client = OpenAI()
        response = client.embeddings.create(input=self.chunks, model=model)
        return [item.embedding for item in response.data]
