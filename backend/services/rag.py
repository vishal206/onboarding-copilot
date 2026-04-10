import json

from services.embedder import Embedder
from sqlalchemy import text
from db.session import AsyncSessionLocal


class RAGPipeline:
    def __init__(self, bot_id: str):
        self.bot_id = bot_id

    async def query(self, question: str) -> list[dict]:
        # Embeds the question using text-embedding-3-small
        embeddings = Embedder([question]).embed()[0]
        # Runs a pgvector similarity search against document_chunks filtered by bot_id (via the documents table)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                text(
                    """
                SELECT dc.content, d.filename, dc.embedding <=> :query_vector AS distance
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.bot_id = :bot_id
                ORDER BY distance ASC
                LIMIT 5
            """
                ),
                {"query_vector": json.dumps(embeddings), "bot_id": self.bot_id},
            )

            rows = result.fetchall()
            # Returns the top 5 most similar chunks with their content and similarity score
            return [
                {
                    "content": row.content,
                    "filename": row.filename,
                    "similarity": row.distance,
                }
                for row in rows
            ]
