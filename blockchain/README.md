# Authentix — Blockchain Registry (`blockchain`)

Smart contract module for recording SHA-256 media file hashes and Deep Learning predictions on Ethereum blockchain networks using Hardhat and Solidity.

---

## 📜 Smart Contract Overview (`AuthenticityRegistry.sol`)

- **`registerFile(bytes32 _fileHash, string _prediction)`**: Stores file hash and DL verdict on-chain. Reverts if duplicate hash is registered.
- **`verifyFile(bytes32 _fileHash)`**: Read-only function returning `(exists, owner, timestamp, prediction)`.
- **`FileRegistered` Event**: Emits event upon successful registration.

---

## 🚀 Local Development Setup

1. Install Node dependencies:
```bash
npm install
```

2. Start local Hardhat Ethereum node:
```bash
npx hardhat node
```

3. Deploy smart contract to local network (in a separate terminal):
```bash
npm run deploy:local
```

4. Run smart contract unit test suite:
```bash
npm test
```

---

## 🐍 Python `web3.py` Bridge (`web3_client.py`)

Python backend interacts with the smart contract directly using `web3_client.py`:
```python
from web3_client import Web3Client, compute_sha256

client = Web3Client(rpc_url="http://127.0.0.1:8545")
file_hash = compute_sha256("path/to/image.jpg")

# Verify on-chain status
status = client.verify_on_chain(file_hash)
print(status)
```
