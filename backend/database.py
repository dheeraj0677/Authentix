import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "authentix.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UploadRecord(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_hash = Column(String, unique=True, index=True)
    prediction = Column(String)  # "REAL" or "FAKE"
    confidence = Column(Float)   # e.g. 98.45
    raw_score = Column(Float)
    gradcam_url = Column(String)
    ipfs_cid = Column(String, nullable=True, index=True)
    ipfs_url = Column(String, nullable=True)
    wallet_address = Column(String, nullable=True, index=True)
    tx_hash = Column(String, nullable=True)
    is_on_chain = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class VerificationHistoryRecord(Base):
    __tablename__ = "verification_history"

    id = Column(Integer, primary_key=True, index=True)
    file_hash = Column(String, index=True)
    filename = Column(String, nullable=True)
    verification_time = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    wallet_address = Column(String, nullable=True, index=True)
    prediction = Column(String)            # "REAL" or "FAKE"
    confidence_score = Column(Float)      # e.g. 98.45
    model_version = Column(String, default="EfficientNetB0-v1.0.0")
    ip_address = Column(String, nullable=True)
    verification_result = Column(String)   # "Authentic", "Modified", or "Not Found"
    ipfs_cid = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
