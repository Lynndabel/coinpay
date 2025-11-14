'use client';

import { useState, useEffect } from 'react';
import {
  connectWallet,
  disconnectWallet,
  getAccount,
  getProvider,
  initWalletConnect,
} from '../lib/walletconnect';

export default function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    // Initialize WalletConnect on mount
    const initialize = async () => {
      await initWalletConnect();
      
      // Check if already connected
      const provider = getProvider();
      if (provider) {
        const currentAccount = getAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          setChainId(provider.chainId);
        }

        // Listen for account changes
        provider.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });

        // Listen for chain changes
        provider.on('chainChanged', (chainId) => {
          setChainId(parseInt(chainId, 16));
        });

        // Listen for disconnect
        provider.on('disconnect', () => {
          setAccount(null);
          setChainId(null);
        });
      }
    };

    initialize();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { address, chainId } = await connectWallet();
      setAccount(address);
      setChainId(chainId);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectWallet();
      setAccount(null);
      setChainId(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full">
      {!account ? (
        <button
          onClick={handleConnect}
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
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Connected
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Address
              </p>
              <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-2 rounded break-all">
                {account}
              </p>
            </div>
            {chainId && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Chain ID
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {chainId}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}