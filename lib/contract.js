// Contract interaction utilities
import { ethers } from 'ethers';

// ABI - Simplified version for frontend use
// Full ABI will be generated after contract compilation
export const COINPAY_ABI = [
  "function createPayment(address _recipient, string memory _description) external payable returns (uint256)",
  "function getPayment(uint256 _paymentId) external view returns (tuple(uint256 id, address payer, address recipient, uint256 amount, uint256 timestamp, uint8 status, string description, bool exists))",
  "function getUserPayments(address _user) external view returns (uint256[])",
  "function getPaymentCount() external view returns (uint256)",
  "function refundPayment(uint256 _paymentId) external",
  "function cancelPayment(uint256 _paymentId) external",
  "function platformFeeBps() external view returns (uint256)",
  "function feeRecipient() external view returns (address)",
  "event PaymentCreated(uint256 indexed paymentId, address indexed payer, address indexed recipient, uint256 amount, string description)",
  "event PaymentCompleted(uint256 indexed paymentId, address indexed recipient, uint256 amount)",
  "event PaymentRefunded(uint256 indexed paymentId, address indexed payer, uint256 amount)",
  "event PaymentCancelled(uint256 indexed paymentId, address indexed payer, uint256 amount)",
];

// Get contract instance
export const getCoinPayContract = (provider, contractAddress) => {
  if (!provider || !contractAddress) {
    throw new Error('Provider and contract address are required');
  }
  
  const signer = provider.getSigner ? provider.getSigner() : provider;
  return new ethers.Contract(contractAddress, COINPAY_ABI, signer);
};

// Get contract with read-only provider
export const getCoinPayContractReadOnly = (rpcUrl, contractAddress) => {
  if (!rpcUrl || !contractAddress) {
    throw new Error('RPC URL and contract address are required');
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(contractAddress, COINPAY_ABI, provider);
};

// Create payment via contract
export const createPayment = async (contract, recipient, amount, description = '') => {
  try {
    const tx = await contract.createPayment(recipient, description, {
      value: ethers.parseEther(amount.toString()),
    });
    
    const receipt = await tx.wait();
    
    // Find PaymentCreated event
    const paymentCreatedEvent = receipt.logs.find(
      (log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'PaymentCreated';
        } catch {
          return false;
        }
      }
    );
    
    if (paymentCreatedEvent) {
      const parsed = contract.interface.parseLog(paymentCreatedEvent);
      return {
        txHash: receipt.hash,
        paymentId: parsed.args.paymentId.toString(),
        success: true,
      };
    }
    
    return {
      txHash: receipt.hash,
      success: true,
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Get payment details
export const getPayment = async (contract, paymentId) => {
  try {
    const payment = await contract.getPayment(paymentId);
    return {
      id: payment.id.toString(),
      payer: payment.payer,
      recipient: payment.recipient,
      amount: ethers.formatEther(payment.amount),
      timestamp: payment.timestamp.toString(),
      status: ['Pending', 'Completed', 'Refunded', 'Cancelled'][payment.status],
      description: payment.description,
      exists: payment.exists,
    };
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
};

// Get user payments
export const getUserPayments = async (contract, userAddress) => {
  try {
    const paymentIds = await contract.getUserPayments(userAddress);
    return paymentIds.map(id => id.toString());
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw error;
  }
};

// Refund payment
export const refundPayment = async (contract, paymentId) => {
  try {
    const tx = await contract.refundPayment(paymentId);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      success: true,
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

// Cancel payment
export const cancelPayment = async (contract, paymentId) => {
  try {
    const tx = await contract.cancelPayment(paymentId);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      success: true,
    };
  } catch (error) {
    console.error('Error cancelling payment:', error);
    throw error;
  }
};

// Get platform fee
export const getPlatformFee = async (contract) => {
  try {
    const feeBps = await contract.platformFeeBps();
    return {
      bps: feeBps.toString(),
      percentage: (Number(feeBps) / 100).toFixed(2) + '%',
    };
  } catch (error) {
    console.error('Error getting platform fee:', error);
    throw error;
  }
};

