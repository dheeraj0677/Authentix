from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ModelMetadata(BaseModel):
    model_name: str
    model_version: str
    dataset_version: str
    training_date: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float

class ProbabilityDistribution(BaseModel):
    real: float
    fake: float

class LayerActivationItem(BaseModel):
    layer_name: str
    mean_activation: float
    feature_maps: int

class ConfidenceRegion(BaseModel):
    x: int
    y: int
    width: int
    height: int
    attention_density: float

class XAIExplanation(BaseModel):
    layer_activations: List[LayerActivationItem]
    confidence_region: ConfidenceRegion
    explanation_text: str

class UploadResponse(BaseModel):
    id: int
    filename: str
    file_hash: str
    prediction: str
    confidence: float
    raw_score: float
    inference_time_ms: Optional[float] = None
    probability_distribution: Optional[ProbabilityDistribution] = None
    heatmap_available: Optional[bool] = True
    gradcam_url: str
    gradcam_failed: Optional[bool] = False  # True if Grad-CAM computation failed (shows original image)
    ipfs_cid: Optional[str] = None
    ipfs_url: Optional[str] = None
    verification_url: Optional[str] = None
    qr_code_base64: Optional[str] = None
    is_on_chain: bool
    tx_hash: Optional[str] = None
    wallet_address: Optional[str] = None
    model_metadata: Optional[ModelMetadata] = None
    xai_explanation: Optional[XAIExplanation] = None

class RegisterRequest(BaseModel):
    file_hash: str
    prediction: str
    wallet_address: str
    tx_hash: str  # Generated on frontend by MetaMask transaction
    ipfs_cid: Optional[str] = None

class AuthNonceResponse(BaseModel):
    wallet_address: str
    message: str

class AuthVerifyRequest(BaseModel):
    wallet_address: str
    signature: str
    message: str

class AuthSessionResponse(BaseModel):
    status: str
    wallet_address: str
    role: str
    session_token: Optional[str] = None
    authenticated: bool

class RegisterResponse(BaseModel):
    status: str
    tx_hash: str
    file_hash: str
    ipfs_cid: Optional[str] = None
    qr_code_base64: Optional[str] = None
    verification_url: Optional[str] = None

class VerifyResponse(BaseModel):
    status: str  # "Authentic", "Modified", or "Not Found"
    file_hash: str
    ipfs_cid: Optional[str] = None
    ipfs_url: Optional[str] = None
    verification_url: Optional[str] = None
    qr_code_base64: Optional[str] = None
    prediction: Optional[str] = None
    on_chain_prediction: Optional[str] = None
    owner: Optional[str] = None
    timestamp: Optional[int] = None
    tx_hash: Optional[str] = None
    message: str

class HistoryItem(BaseModel):
    id: int
    filename: str
    file_hash: str
    prediction: str
    confidence: float
    gradcam_url: str
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    is_on_chain: bool
    timestamp: datetime

    class Config:
        from_attributes = True

class VerificationHistoryItem(BaseModel):
    id: int
    file_hash: str
    filename: Optional[str] = None
    verification_time: datetime
    wallet_address: Optional[str] = None
    prediction: str
    confidence_score: float
    model_version: str
    ip_address: Optional[str] = None
    verification_result: str
    ipfs_cid: Optional[str] = None

    class Config:
        from_attributes = True

class RecentActivityItem(BaseModel):
    id: int
    file_hash: str
    filename: Optional[str] = None
    action: str              # "Registration" or "Verification"
    prediction: str
    confidence: float
    wallet_address: Optional[str] = None
    tx_hash: Optional[str] = None
    timestamp: str

class LatestBlockItem(BaseModel):
    number: int
    hash: str
    timestamp: str
    tx_count: int
    miner: str
    gas_used: int

class SmartContractEventItem(BaseModel):
    event_name: str          # "MediaRegistered", "VerificationCompleted", "OwnershipChanged", "VerificationFailed", "ModelUpdated"
    file_hash: str
    actor: Optional[str] = None
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    model_version: Optional[str] = None
    details: Optional[str] = None
    timestamp: str
    block_number: Optional[int] = None
    tx_hash: Optional[str] = None

class ProvenanceStageItem(BaseModel):
    stage_id: int
    stage_name: str          # "Original Upload", "Verification", "Modification", "Ownership Transfer", "Reverification"
    event_name: str
    file_hash: str
    actor: Optional[str] = None
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    timestamp: str
    details: str

class ProvenanceTimelineResponse(BaseModel):
    file_hash: str
    filename: Optional[str] = None
    current_owner: Optional[str] = None
    is_authentic: bool
    total_stages: int
    timeline: List[ProvenanceStageItem]

class RocPoint(BaseModel):
    fpr: float
    tpr: float
    threshold: float

class ConfusionMatrix(BaseModel):
    true_positive: int   # Predicted REAL, Actual REAL
    false_positive: int  # Predicted REAL, Actual FAKE
    true_negative: int   # Predicted FAKE, Actual FAKE
    false_negative: int  # Predicted FAKE, Actual REAL

class DailyMetricItem(BaseModel):
    date: str
    uploads: int
    predictions: int

class AIAnalyticsStats(BaseModel):
    model_name: str
    model_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: float
    avg_inference_time_ms: float
    total_predictions: int
    real_count: int
    fake_count: int
    roc_curve: List[RocPoint]
    confusion_matrix: ConfusionMatrix
    daily_metrics: List[DailyMetricItem]

class DashboardStats(BaseModel):
    total_uploads: int
    total_verifications: int
    real_images: int
    fake_images: int
    registered_wallets: int
    blockchain_transactions: int
    average_confidence: float
    total_gas_used: int
    avg_gas_per_tx: int
    recent_activities: List[RecentActivityItem]
    latest_blocks: List[LatestBlockItem]
    contract_events: List[SmartContractEventItem]
