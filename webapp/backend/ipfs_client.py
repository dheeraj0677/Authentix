import os
import requests
import hashlib

# Default IPFS Gateway and API options
# Supports local IPFS daemon (Kubo / IPFS Desktop) or public pinning services like Infura / Pinata
IPFS_API_URL = os.getenv("IPFS_API_URL", "http://127.0.0.1:5001/api/v0/add")
IPFS_GATEWAY_URL = os.getenv("IPFS_GATEWAY_URL", "https://ipfs.io/ipfs/")

def upload_to_ipfs(file_path: str) -> dict:
    """
    Uploads a media file (image/video) to IPFS via local daemon API or fallback pinning service.
    Returns dict with cid, ipfs_url, sha256, and success status.
    
    If local IPFS node is unavailable, returns a deterministic mock CID derived from the content hash
    so that development/testing continues seamlessly without requiring a running node.
    """
    # 1. Compute SHA-256 Hash
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    sha256_hash = "0x" + hasher.hexdigest()

    # 2. Attempt IPFS API Upload (Kubo / IPFS RPC / Infura)
    try:
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f)}
            response = requests.post(IPFS_API_URL, files=files, timeout=5)
            if response.status_code == 200:
                res_json = response.json()
                cid = res_json.get("Hash")
                return {
                    "success": True,
                    "cid": cid,
                    "ipfs_url": f"{IPFS_GATEWAY_URL}{cid}",
                    "sha256": sha256_hash,
                    "is_mock": False
                }
    except Exception as e:
        print(f"[INFO] Local IPFS API unavailable ({e}). Generating IPFS CID fallback.")

    # 3. Fallback: Generate valid IPFS v0 CID representation (Base58 string starting with Qm)
    # Using SHA-256 digest to create a deterministic IPFS fallback CID
    raw_hash_bytes = bytes.fromhex(sha256_hash[2:])
    # Prepend multihash header for sha256 (0x12) + length 32 (0x20)
    multihash_bytes = b'\x12\x20' + raw_hash_bytes
    
    import base58
    try:
        mock_cid = base58.b58encode(multihash_bytes).decode('utf-8')
    except Exception:
        mock_cid = "Qm" + sha256_hash[2:46]

    return {
        "success": True,
        "cid": mock_cid,
        "ipfs_url": f"{IPFS_GATEWAY_URL}{mock_cid}",
        "sha256": sha256_hash,
        "is_mock": True
    }
