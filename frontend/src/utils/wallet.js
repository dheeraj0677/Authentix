import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';

const CONTRACT_ABI = [
  "function registerFile(bytes32 _fileHash, string calldata _prediction) external",
  "function verifyFile(bytes32 _fileHash) external view returns (bool exists, address owner, uint256 timestamp, string memory prediction)",
  "event FileRegistered(bytes32 indexed fileHash, address indexed owner, string prediction, uint256 timestamp)"
];

/**
 * Multi-provider resolution helper (handles MetaMask, multi-extension arrays, and EIP-1193 providers).
 */
export const getEthereumProvider = () => {
  if (typeof window === 'undefined') return null;

  // 1. Check window.ethereum
  if (window.ethereum) {
    // Handle multi-wallet extension arrays (e.g. MetaMask + Phantom + Coinbase)
    if (Array.isArray(window.ethereum.providers)) {
      const metaMaskProvider = window.ethereum.providers.find((p) => p.isMetaMask);
      if (metaMaskProvider) return metaMaskProvider;
      return window.ethereum.providers[0];
    }
    return window.ethereum;
  }

  // 2. Check legacy window.web3 currentProvider
  if (window.web3 && window.web3.currentProvider) {
    return window.web3.currentProvider;
  }

  return null;
};

/**
 * Detects whether MetaMask (or an Ethereum EIP-1193 compatible wallet) is installed.
 */
export const checkMetaMaskInstalled = () => {
  return getEthereumProvider() !== null;
};

/**
 * Automatically detects installed wallets and returns metadata.
 */
export const detectInstalledWallets = () => {
  const provider = getEthereumProvider();
  const isMetaMask = provider && provider.isMetaMask;
  return {
    isMetaMask: !!isMetaMask,
    hasEthereum: !!provider,
    name: isMetaMask ? 'MetaMask' : (provider ? 'Web3 Provider' : 'None')
  };
};

/**
 * Connects to MetaMask and prompts user account selection.
 */
export const connectWallet = async () => {
  const ethProvider = getEthereumProvider();
  if (!ethProvider) {
    throw new Error('MetaMask provider not detected in this browser tab. Please REFRESH the page (F5) so the MetaMask extension can inject window.ethereum.');
  }

  const provider = new ethers.BrowserProvider(ethProvider);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  return {
    account: accounts[0],
    signer,
    provider,
    chainId: network.chainId.toString()
  };
};


/**
 * Prompts user to sign an EIP-191 challenge nonce message for signature verification login.
 */
export const signNonceMessage = async (message) => {
  const { signer } = await connectWallet();
  const signature = await signer.signMessage(message);
  return signature;
};

/**
 * Registers a file on the Ethereum blockchain via MetaMask.
 */
export const registerFileOnChainMetaMask = async (fileHashHex, prediction) => {
  const { signer } = await connectWallet();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  let formattedHash = fileHashHex.startsWith('0x') ? fileHashHex : `0x${fileHashHex}`;

  const tx = await contract.registerFile(formattedHash, prediction);
  console.log('Transaction sent:', tx.hash);

  const receipt = await tx.wait();
  console.log('Transaction mined:', receipt.hash);

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? 'Success' : 'Failed'
  };
};
