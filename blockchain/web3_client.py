import os
import json
import hashlib
from web3 import Web3

# Contract ABI definition
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"},
            {"internalType": "string", "name": "_prediction", "type": "string"}
        ],
        "name": "registerFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"}
        ],
        "name": "verifyFile",
        "outputs": [
            {"internalType": "bool", "name": "exists", "type": "bool"},
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "string", "name": "prediction", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "owner", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "prediction", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "FileRegistered",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "owner", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "fileType", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "filename", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "fileSizeBytes", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "MediaRegistered",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "prediction", "type": "string"},
            {"indexed": False, "internalType": "uint8", "name": "confidenceScore", "type": "uint8"},
            {"indexed": False, "internalType": "string", "name": "modelVersion", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "VerificationCompleted",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "previousOwner", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "newOwner", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "OwnershipChanged",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "reason", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "VerificationFailed",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "originalFileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "bytes32", "name": "modifiedFileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "actor", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "modificationType", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "MediaModified",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "prediction", "type": "string"},
            {"indexed": False, "internalType": "uint8", "name": "confidenceScore", "type": "uint8"},
            {"indexed": False, "internalType": "uint256", "name": "reverificationCount", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "MediaReverified",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "string", "name": "modelVersion", "type": "string"},
            {"indexed": True, "internalType": "string", "name": "datasetVersion", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "ModelUpdated",
        "type": "event"
    }
]

def compute_sha256(file_path):
    """Computes SHA-256 hash of a file and returns hex string with '0x' prefix for Web3 bytes32."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return "0x" + hasher.hexdigest()

class Web3Client:
    def __init__(self, rpc_url="http://127.0.0.1:8545", contract_address=None):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Load contract address
        if contract_address is None:
            address_file = os.path.join(os.path.dirname(__file__), "deployed_address.json")
            if os.path.exists(address_file):
                with open(address_file, "r") as f:
                    data = json.load(f)
                    contract_address = data.get("address")
            else:
                contract_address = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" # Default RegistryController address

        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=CONTRACT_ABI)

    def verify_on_chain(self, file_hash_hex):
        """Queries smart contract to check if SHA-256 hash is registered on-chain."""
        if not file_hash_hex.startswith("0x"):
            file_hash_hex = "0x" + file_hash_hex

        try:
            bytes32_hash = bytes.fromhex(file_hash_hex[2:])
            exists, owner, timestamp, prediction = self.contract.functions.verifyFile(bytes32_hash).call()
            return {
                "exists": exists,
                "owner": owner if exists else None,
                "timestamp": timestamp if exists else 0,
                "prediction": prediction if exists else None,
                "file_hash": file_hash_hex
            }
        except Exception as e:
            return {"exists": False, "error": str(e), "file_hash": file_hash_hex}

    def register_on_chain(self, file_hash_hex, prediction, private_key):
        """Submits transaction to register file hash on-chain using private key."""
        if not file_hash_hex.startswith("0x"):
            file_hash_hex = "0x" + file_hash_hex

        account = self.w3.eth.account.from_key(private_key)
        bytes32_hash = bytes.fromhex(file_hash_hex[2:])

        tx = self.contract.functions.registerFile(bytes32_hash, prediction).build_transaction({
            "from": account.address,
            "nonce": self.w3.eth.get_transaction_count(account.address),
            "gas": 200000,
            "gasPrice": self.w3.eth.gas_price
        })

        signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return self.w3.to_hex(tx_hash)

    def get_recent_blockchain_events(self, from_block=0, limit=20):
        """
        Backend Event Listener: Queries indexed events from the Ethereum blockchain.
        Supports searching by FileRegistered, MediaRegistered, VerificationCompleted,
        OwnershipChanged, VerificationFailed, and ModelUpdated.
        """
        events_list = []
        if not self.w3.is_connected():
            return events_list

        try:
            latest_block = self.w3.eth.block_number
            start_block = max(0, latest_block - 1000) if from_block == 0 else from_block

            # 1. Fetch FileRegistered events
            reg_filter = self.contract.events.FileRegistered.create_filter(from_block=start_block, to_block="latest")
            for evt in reg_filter.get_all_entries():
                events_list.append({
                    "event_name": "FileRegistered",
                    "file_hash": "0x" + evt.args.fileHash.hex(),
                    "actor": evt.args.owner,
                    "prediction": evt.args.prediction,
                    "timestamp": evt.args.timestamp,
                    "block_number": evt.blockNumber,
                    "tx_hash": evt.transactionHash.hex()
                })

            # 2. Fetch MediaRegistered events
            media_filter = self.contract.events.MediaRegistered.create_filter(from_block=start_block, to_block="latest")
            for evt in media_filter.get_all_entries():
                events_list.append({
                    "event_name": "MediaRegistered",
                    "file_hash": "0x" + evt.args.fileHash.hex(),
                    "actor": evt.args.owner,
                    "details": f"{evt.args.filename} ({evt.args.fileType}, {evt.args.fileSizeBytes} B)",
                    "timestamp": evt.args.timestamp,
                    "block_number": evt.blockNumber,
                    "tx_hash": evt.transactionHash.hex()
                })

            # 3. Fetch VerificationCompleted events
            ver_filter = self.contract.events.VerificationCompleted.create_filter(from_block=start_block, to_block="latest")
            for evt in ver_filter.get_all_entries():
                events_list.append({
                    "event_name": "VerificationCompleted",
                    "file_hash": "0x" + evt.args.fileHash.hex(),
                    "actor": evt.args.verifier,
                    "prediction": evt.args.prediction,
                    "confidence": evt.args.confidenceScore,
                    "model_version": evt.args.modelVersion,
                    "timestamp": evt.args.timestamp,
                    "block_number": evt.blockNumber,
                    "tx_hash": evt.transactionHash.hex()
                })

            # 4. Fetch MediaModified events
            mod_filter = self.contract.events.MediaModified.create_filter(from_block=start_block, to_block="latest")
            for evt in mod_filter.get_all_entries():
                events_list.append({
                    "event_name": "MediaModified",
                    "file_hash": "0x" + evt.args.originalFileHash.hex(),
                    "actor": evt.args.actor,
                    "details": f"Modified Hash: 0x{evt.args.modifiedFileHash.hex()[:10]}... ({evt.args.modificationType})",
                    "timestamp": evt.args.timestamp,
                    "block_number": evt.blockNumber,
                    "tx_hash": evt.transactionHash.hex()
                })

            # 5. Fetch OwnershipChanged events
            own_filter = self.contract.events.OwnershipChanged.create_filter(from_block=start_block, to_block="latest")
            for evt in own_filter.get_all_entries():
                events_list.append({
                    "event_name": "OwnershipChanged",
                    "file_hash": "0x" + evt.args.fileHash.hex(),
                    "actor": evt.args.previousOwner,
                    "details": f"Transferred to {evt.args.newOwner[:6]}...{evt.args.newOwner[-4:]}",
                    "timestamp": evt.args.timestamp,
                    "block_number": evt.blockNumber,
                    "tx_hash": evt.transactionHash.hex()
                })
        except Exception as e:
            print(f"[WARN] Error fetching smart contract events: {e}")

        # Sort descending by block number / timestamp
        events_list.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        return events_list[:limit]
