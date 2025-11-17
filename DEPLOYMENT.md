# 🚀 Smart Contract Deployment Guide

This guide will walk you through deploying the CoinPay smart contract to Base Mainnet.

## Prerequisites

1. **Node.js** 18+ installed
2. **Hardhat** installed (via npm install)
3. **Base ETH** in your wallet for gas fees
4. **Private Key** from your wallet (MetaMask, etc.)
5. **BaseScan API Key** (optional, for contract verification)

## Step 1: Install Dependencies

```bash
npm install
```

This will install Hardhat and all required dependencies.

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# Base Mainnet RPC URL
BASE_RPC_URL=https://mainnet.base.org

# Your wallet's private key (for deployment)
PRIVATE_KEY=0x...

# Fee recipient address (optional - defaults to deployer)
FEE_RECIPIENT=0x...

# BaseScan API key for verification (optional)
BASE_EXPLORER_API_KEY=your_api_key_here
```

⚠️ **Important**: Never commit your `.env` file to git! It contains your private key.

## Step 3: Compile the Contract

```bash
npm run compile
```

This will compile the Solidity contract and generate the ABI in the `artifacts` folder.

## Step 4: Deploy to Base Mainnet

### Option A: Deploy with npm script

```bash
npm run deploy:base
```

### Option B: Deploy with Hardhat directly

```bash
npx hardhat run scripts/deploy.js --network base
```

The deployment script will:
1. Deploy the contract to Base Mainnet
2. Save deployment info to `deployments/base.json`
3. Verify the contract on BaseScan (if API key is provided)

## Step 5: Update Frontend Configuration

After deployment, update your `.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # The deployed contract address
NEXT_PUBLIC_CHAIN_ID=8453 # Base Mainnet chain ID
```

Restart your Next.js development server:

```bash
npm run dev
```

## Step 6: Verify Contract on BaseScan (Optional)

If automatic verification failed, you can verify manually:

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <FEE_RECIPIENT>
```

Example:
```bash
npx hardhat verify --network base 0x1234567890abcdef... 0xabcdef1234567890...
```

## Deployment Info

After successful deployment, the script creates a `deployments/base.json` file with:

```json
{
  "network": "base",
  "chainId": "8453",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "feeRecipient": "0x...",
  "timestamp": "2024-...",
  "blockNumber": "..."
}
```

## Testing on Base Sepolia (Testnet)

Before deploying to mainnet, test on Base Sepolia:

1. **Get testnet ETH** from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

2. **Deploy to testnet**:
   ```bash
   npm run deploy:base-sepolia
   ```

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Testnet contract address
   NEXT_PUBLIC_CHAIN_ID=84532 # Base Sepolia chain ID
   ```

4. **Test the contract** with testnet ETH

## Contract Features

The CoinPay contract includes:

- ✅ **Payment Processing**: Create and process payments
- ✅ **Fee Management**: Platform fee (default: 0.25%)
- ✅ **Refund Functionality**: Refund payments if needed
- ✅ **Payment Tracking**: Track all payments by user
- ✅ **Owner Functions**: Update fees, emergency withdrawal
- ✅ **Events**: Emit events for payment creation, completion, refunds

## Security Considerations

1. **Private Key Security**: Never share or commit your private key
2. **Fee Recipient**: Set a secure address for fee collection
3. **Gas Fees**: Ensure you have enough Base ETH for deployment
4. **Contract Verification**: Verify contract on BaseScan for transparency
5. **Testing**: Always test on testnet before mainnet deployment

## Troubleshooting

### Error: Insufficient funds
- Ensure you have Base ETH in your wallet for gas fees
- Check that `PRIVATE_KEY` corresponds to the funded wallet

### Error: Contract verification failed
- Ensure `BASE_EXPLORER_API_KEY` is set correctly
- Try manual verification using BaseScan UI

### Error: Network not found
- Check that `BASE_RPC_URL` is correct
- Ensure Hardhat network configuration matches

## Next Steps

After deployment:

1. ✅ Update frontend `.env.local` with contract address
2. ✅ Test payment functionality
3. ✅ Monitor contract on [BaseScan](https://basescan.org)
4. ✅ Set up fee recipient wallet for fee collection
5. ✅ Configure any additional contract parameters

## Support

For issues or questions:
- Check [Base Documentation](https://docs.base.org/)
- Review [Hardhat Documentation](https://hardhat.org/docs)
- Open an issue on GitHub

---

**Ready to deploy!** 🚀

