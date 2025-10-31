from sqlalchemy import Column, String, Float, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.core.config import settings

Base = declarative_base()


class MOPAnalysisRecord(Base):
    """Database model for MOP analysis records."""
    __tablename__ = "mop_analyses"
    
    analysis_id = Column(String, primary_key=True, index=True)
    category = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Scores
    pre_checks_score = Column(Float)
    operation_steps_score = Column(Float)
    rollback_steps_score = Column(Float)
    overall_score = Column(Float)
    risk_level = Column(String)
    
    # Analysis Details (stored as JSON)
    analysis_data = Column(JSON)
    
    # File path (encrypted)
    file_path = Column(String, nullable=False)


# Database setup
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """Dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
