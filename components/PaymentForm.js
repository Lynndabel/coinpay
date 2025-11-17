'use client';

import { useState, useEffect } from 'react';
import { getAccount, getProvider } from '../lib/walletconnect';
import { getCoinPayContract, createPayment } from '../lib/contract';

export default function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [error, setError] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [useContract, setUseContract] = useState(true);

  useEffect(() => {
    // Get contract address from environment or use default
    const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    setContractAddress(address);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);
    setPaymentId(null);

    const account = getAccount();
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || !recipient) {
      setError('Please fill in all fields');
      return;
    }

    if (useContract && !contractAddress) {
      setError('Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS');
      return;
    }

    setLoading(true);

    try {
      const { ethers } = await import('ethers');
      const provider = getProvider();
      
      if (!provider) {
        throw new Error('Wallet provider not available');
      }

      if (useContract && contractAddress) {
        // Use smart contract for payment
        const contract = getCoinPayContract(provider, contractAddress);
        const result = await createPayment(contract, recipient, amount, description);
        
        setTxHash(result.txHash);
        if (result.paymentId) {
          setPaymentId(result.paymentId);
        }
      } else {
        // Fallback to direct transaction
        const amountInWei = ethers.parseEther(amount);
        const transaction = {
          from: account,
          to: recipient,
          value: ethers.toBeHex(amountInWei),
          gas: ethers.toBeHex(21000),
        };

        const hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        setTxHash(hash);
      }
      
      setAmount('');
      setRecipient('');
      setDescription('');
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const getExplorerUrl = () => {
    if (!txHash) return '#';
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1';
    
    if (chainId === '8453' || chainId === '84532') {
      // Base mainnet or testnet
      const baseUrl = chainId === '8453' 
        ? 'https://basescan.org' 
        : 'https://sepolia.basescan.org';
      return `${baseUrl}/tx/${txHash}`;
    }
    
    // Ethereum or other networks
    const ethUrl = chainId === '1' 
      ? 'https://etherscan.io' 
      : 'https://sepolia.etherscan.io';
    return `${ethUrl}/tx/${txHash}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Send Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            required
          />
        </div>

        {useContract && contractAddress && (
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        )}

        {contractAddress && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useContract"
              checked={useContract}
              onChange={(e) => setUseContract(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="useContract"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Use smart contract (recommended)
            </label>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {txHash && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
            <p className="font-medium mb-2">Transaction successful!</p>
            {paymentId && (
              <p className="text-sm mb-2">Payment ID: {paymentId}</p>
            )}
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline hover:no-underline block"
            >
              View on Explorer: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            'Send Payment'
          )}
        </button>
      </form>
    </div>
  );
}