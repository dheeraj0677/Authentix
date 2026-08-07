import axios from 'axios';

// Use environment variable — set VITE_API_BASE_URL in .env
// Falls back to localhost:8000 for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const uploadAndDetect = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Content-Type': 'multipart/form-data',
  };

  const sessionToken = localStorage.getItem('authentix_session_token');
  const walletAddress = localStorage.getItem('authentix_wallet_address');

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  if (walletAddress) {
    headers['X-Wallet-Address'] = walletAddress;
  }

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, { headers });

  return response.data;
};


export const registerOnBackend = async (fileHash, prediction, walletAddress, txHash) => {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    file_hash: fileHash,
    prediction: prediction,
    wallet_address: walletAddress,
    tx_hash: txHash,
  });

  return response.data;
};

export const verifyFileHash = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/verify`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const verifyByHash = async (fileHash) => {
  const response = await axios.get(`${API_BASE_URL}/verify/hash/${fileHash}`);
  return response.data;
};

export const fetchHistory = async (walletAddress) => {
  // Guard against null/undefined wallet — return empty rather than hitting /history/null
  if (!walletAddress || walletAddress === 'null') {
    return [];
  }
  const response = await axios.get(`${API_BASE_URL}/history/${walletAddress}`);
  return response.data;
};

export const fetchVerificationHistory = async (queryParam = 'all') => {
  const response = await axios.get(`${API_BASE_URL}/history/verification/${queryParam}`);
  return response.data;
};

export const fetchDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return response.data;
};

export const fetchProvenanceTimeline = async (fileHash) => {
  const response = await axios.get(`${API_BASE_URL}/provenance/${fileHash}`);
  return response.data;
};

export const fetchAiAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/ai`);
  return response.data;
};

export const getCsvExportUrl = () => {
  return `${API_BASE_URL}/analytics/export/csv`;
};

export const getAuthNonce = async (walletAddress) => {
  const response = await axios.get(`${API_BASE_URL}/auth/nonce/${walletAddress}`);
  return response.data;
};

export const verifyAuthSignature = async (walletAddress, signature, message) => {
  const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
    wallet_address: walletAddress,
    signature,
    message
  });
  return response.data;
};

export const getAuthSession = async (sessionToken) => {
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`
    }
  });
  return response.data;
};

export const logoutAuthSession = async (sessionToken) => {
  const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
    headers: {
      Authorization: `Bearer ${sessionToken}`
    }
  });
  return response.data;
};

export const getGradCamUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

export const getPdfReportUrl = (fileHash) => {
  return `${API_BASE_URL}/report/pdf/${fileHash}`;
};
