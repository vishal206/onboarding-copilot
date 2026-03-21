import tiktoken


class Chunker:
    def __init__(self, raw_text: str, chunk_size: int = 512, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.raw_text = raw_text

    def chunk(self) -> list[str]:
        encoding = tiktoken.get_encoding("cl100k_base")
        tokens = encoding.encode(self.raw_text)
        num_tokens = len(tokens)
        chunks = []
        for i in range(0, num_tokens, self.chunk_size - self.overlap):
            chunk_tokens = tokens[i : i + self.chunk_size]
            chunk_text = encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
        return chunks
