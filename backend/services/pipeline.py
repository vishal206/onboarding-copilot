from services.embedder import Embedder
from services.chunker import Chunker
from db.models import Document, DocumentChunk
from db.session import AsyncSessionLocal


async def process_document(document_id: str):
    async with AsyncSessionLocal() as db:
        doc = await db.get(Document, document_id)

        if not doc:
            return

        try:
            chunks = Chunker(doc.raw_text).chunk()
            embeddings = Embedder(chunks).embed()

            for idx, chunk in enumerate(chunks):
                chunk_record = DocumentChunk(
                    document_id=document_id,
                    content=chunk,
                    chunk_index=idx,
                    embedding=embeddings[idx],
                )
                db.add(chunk_record)

            doc.status = "indexed"
            await db.commit()
        except Exception as e:
            doc.status = "indexing failed"
            await db.commit()
