let EthereumProvider = null;
let provider = null;

// Lazy load WalletConnect to avoid SSR issues
const getEthereumProvider = async () => {
  if (typeof window === 'undefined') return null;
  
  if (!EthereumProvider) {
    try {
      const module = await import('@walletconnect/ethereum-provider');
      EthereumProvider = module.EthereumProvider;
    } catch (error) {
      console.error('Failed to load WalletConnect:', error);
      return null;
    }
  }
  
  return EthereumProvider;
};

export const initWalletConnect = async () => {
  if (typeof window === 'undefined') return null;

  const Provider = await getEthereumProvider();
  if (!Provider) {
    console.warn('WalletConnect not available');
    return null;
  }

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId || projectId === 'your_project_id_here') {
    console.warn('WalletConnect Project ID not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
    return null;
  }

  try {
    provider = await Provider.init({
      projectId: projectId,
      chains: [parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1')],
      showQrModal: true,
      metadata: {
        name: 'CoinPay',
        description: 'Cryptocurrency Payment Gateway',
        url: window.location.origin,
        icons: [`${window.location.origin}/walletconnect.svg`],
      },
    });

    return provider;
  } catch (error) {
    console.error('Error initializing WalletConnect:', error);
    return null;
  }
};

export const connectWallet = async () => {
  if (!provider) {
    provider = await initWalletConnect();
  }

  if (!provider) {
    throw new Error('Failed to initialize WalletConnect');
  }

  try {
    await provider.enable();
    const accounts = provider.accounts;
    return {
      address: accounts[0],
      chainId: provider.chainId,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  if (provider) {
    await provider.disconnect();
    provider = null;
  }
};

export const getProvider = () => provider;

export const getAccount = () => {
  if (!provider) return null;
  return provider.accounts?.[0] || null;
};

export const signMessage = async (message) => {
  if (!provider) {
    throw new Error('Wallet not connected');
  }

  try {
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, provider.accounts[0]],
    });
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

export const sendTransaction = async (transaction) => {
  if (!provider) {
    throw new Error('Wallet not connected');
  }

  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
    return txHash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};