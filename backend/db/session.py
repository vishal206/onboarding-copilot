import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# The engine is the actual connection to your database
engine = create_async_engine(DATABASE_URL, echo=True)

# A session is like a conversation with the database
# You open one, do your queries, then close it
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Base class that all your models will inherit from
class Base(DeclarativeBase):
    pass


# Dependency for FastAPI routes — gives each request its own DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
