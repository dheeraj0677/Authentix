import os
import time
import secrets
from typing import Dict, Optional
from eth_account.messages import encode_defunct
from web3 import Web3

# Role Enums
class Role:
    ADMIN = "Admin"
    RESEARCHER = "Researcher"
    MEDIA_OWNER = "Media Owner"
    PUBLIC_USER = "Public User"

# Admin & Researcher list configuration (enables designated admin wallets)
# Environment variables support comma-separated wallet addresses
ADMIN_WALLETS = {w.lower() for w in os.getenv("ADMIN_WALLETS", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266").split(",") if w}
RESEARCHER_WALLETS = {w.lower() for w in os.getenv("RESEARCHER_WALLETS", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8").split(",") if w}

# Dynamic wallet role assignments cache
_ROLE_CACHE: Dict[str, str] = {}

# In-memory challenge nonces and session token storage
_NONCE_CACHE: Dict[str, dict] = {}
_SESSION_CACHE: Dict[str, dict] = {}
NONCE_EXPIRY_SEC = 300       # Nonce challenge valid for 5 minutes
SESSION_EXPIRY_SEC = 86400   # Session token valid for 24 hours

def get_role_for_wallet(wallet_address: Optional[str]) -> str:
    """
    Resolves the RBAC role for a given wallet address:
      - Admin: Contract/system deployer wallet or designated admin address
      - Researcher: Designated researcher wallets
      - Media Owner: Authenticated wallet address
      - Public User: Anonymous / unauthenticated guest
    """
    if not wallet_address:
        return Role.PUBLIC_USER

    w_lower = wallet_address.lower()
    if w_lower in _ROLE_CACHE:
        return _ROLE_CACHE[w_lower]

    if w_lower in ADMIN_WALLETS:
        return Role.ADMIN

    if w_lower in RESEARCHER_WALLETS:
        return Role.RESEARCHER

    return Role.MEDIA_OWNER

def set_wallet_role(wallet_address: str, role: str) -> str:
    """Assigns or overrides a wallet address role."""
    clean_addr = Web3.to_checksum_address(wallet_address)
    _ROLE_CACHE[clean_addr.lower()] = role
    return role

def generate_nonce_for_wallet(wallet_address: str) -> str:
    """
    Generates a cryptographically secure random nonce challenge for a wallet address.
    Stores the challenge temporarily in memory to prevent replay attacks.
    """
    clean_address = Web3.to_checksum_address(wallet_address)
    nonce = f"Sign in to Authentix DeepFake Verification Platform.\nNonce: {secrets.token_hex(16)}\nTimestamp: {int(time.time())}"
    
    _NONCE_CACHE[clean_address.lower()] = {
        "nonce": nonce,
        "timestamp": time.time()
    }
    return nonce

def verify_wallet_signature(wallet_address: str, signature: str, message: str) -> Optional[str]:
    """
    Verifies that a cryptographic signature was produced by the specified Ethereum wallet address.
    Checks nonce validity and recovers the signer address using eth_account.
    Returns session token if valid, None if invalid.
    """
    clean_address = Web3.to_checksum_address(wallet_address)
    cached = _NONCE_CACHE.get(clean_address.lower())

    if not cached:
        print(f"[WARN] No active challenge nonce found for {clean_address}")
        return None

    # Check nonce expiration
    if time.time() - cached["timestamp"] > NONCE_EXPIRY_SEC:
        print(f"[WARN] Nonce expired for {clean_address}")
        del _NONCE_CACHE[clean_address.lower()]
        return None

    # Verify message matches cached nonce
    if cached["nonce"] != message:
        print(f"[WARN] Message does not match cached nonce for {clean_address}")
        return None

    try:
        w3 = Web3()
        # Encode message per EIP-191 standard
        encoded_msg = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(encoded_msg, signature=signature)
        
        if recovered_address.lower() == clean_address.lower():
            # Signature valid! Delete consumed nonce and issue session token
            del _NONCE_CACHE[clean_address.lower()]
            session_token = f"auth_sess_{secrets.token_hex(32)}"
            user_role = get_role_for_wallet(clean_address)
            _SESSION_CACHE[session_token] = {
                "wallet_address": clean_address,
                "role": user_role,
                "created_at": time.time()
            }
            return session_token
        else:
            print(f"[WARN] Recovered address {recovered_address} does not match {clean_address}")
            return None
    except Exception as e:
        print(f"[ERROR] Cryptographic signature verification failed: {e}")
        return None

def validate_session(session_token: str) -> Optional[str]:
    """Validates an active session token and returns the authenticated wallet address."""
    sess = _SESSION_CACHE.get(session_token)
    if not sess:
        return None
    
    if time.time() - sess["created_at"] > SESSION_EXPIRY_SEC:
        del _SESSION_CACHE[session_token]
        return None
        
    return sess["wallet_address"]

def revoke_session(session_token: str) -> bool:
    """Revokes (disconnects) a wallet session token."""
    if session_token in _SESSION_CACHE:
        del _SESSION_CACHE[session_token]
        return True
    return False
