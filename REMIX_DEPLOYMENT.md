# 🚀 Deploy to Base Mainnet using Remix IDE

This guide will walk you through deploying the CoinPay smart contract to Base Mainnet using Remix IDE.

## Prerequisites

1. **Remix IDE**: Open [remix.ethereum.org](https://remix.ethereum.org)
2. **MetaMask** or another Web3 wallet installed
3. **Base ETH** in your wallet for gas fees
4. **Contract source code** (`contracts/CoinPay.sol`)

## Step 1: Prepare Contract in Remix

1. **Open Remix IDE**: Go to [remix.ethereum.org](https://remix.ethereum.org)

2. **Create new file**: 
   - Click the `+` icon in the File Explorer
   - Name it `CoinPay.sol`

3. **Copy contract code**:
   - Open `contracts/CoinPay.sol` from this project
   - Copy the entire file content
   - Paste it into the Remix editor

4. **Set compiler version**:
   - Go to the "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.20` or higher
   - Click "Compile CoinPay.sol"

## Step 2: Configure Base Mainnet in MetaMask

1. **Add Base Network** (if not already added):
   - Open MetaMask
   - Click the network dropdown
   - Select "Add network" or "Add a network manually"
   - Enter the following details:
   
   ```
   Network Name: Base Mainnet
   RPC URL: https://mainnet.base.org
   Chain ID: 8453
   Currency Symbol: ETH
   Block Explorer URL: https://basescan.org
   ```

2. **Switch to Base Mainnet**:
   - Select "Base Mainnet" in MetaMask
   - Ensure you have ETH for gas fees

## Step 3: Connect Remix to MetaMask

1. **Open Deploy tab**:
   - Click "Deploy & Run Transactions" in the left sidebar
   - Under "ENVIRONMENT", select "Injected Provider - MetaMask"
   - Click "Connect" if prompted
   - Approve the connection in MetaMask

2. **Verify connection**:
   - You should see your wallet address in Remix
   - Ensure "Base Mainnet" network is selected in MetaMask

## Step 4: Deploy the Contract

1. **Select contract**:
   - In the "Deploy" section, find "CoinPay" in the dropdown
   - This is the contract you compiled earlier

2. **Set constructor parameter**:
   - You'll see a field labeled `_feeRecipient` (constructor parameter)
   - Enter the address where platform fees should be sent
   - This can be:
     - Your own address
     - A dedicated fee collection address
     - Format: `0x...` (your address)

3. **Deploy**:
   - Click the orange "Deploy" button
   - MetaMask will pop up asking you to confirm the transaction
   - Review the gas fee (should be reasonable on Base)
   - Click "Confirm" in MetaMask

4. **Wait for deployment**:
   - The transaction will appear in Remix's terminal
   - Wait for confirmation (usually 1-2 blocks on Base)
   - Once confirmed, the contract will appear under "Deployed Contracts"

## Step 5: Get Contract Address

1. **Find deployed contract**:
   - Scroll down in the "Deploy & Run Transactions" tab
   - Under "Deployed Contracts", you'll see "CoinPay at 0x..."
   - Click the copy icon next to the address
   - **Save this address** - you'll need it!

2. **Verify on BaseScan** (Optional but recommended):
   - Go to [basescan.org](https://basescan.org)
   - Paste your contract address in the search bar
   - Click "Contract" tab
   - Click "Verify and Publish"
   - Select:
     - Compiler Type: `Solidity (Single file)`
     - Compiler Version: `0.8.20`
     - License: `MIT`
   - Paste your contract source code
   - Enter constructor arguments (your fee recipient address)
   - Click "Verify and Publish"

## Step 6: Update Frontend Configuration

1. **Add contract address to `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
   NEXT_PUBLIC_CHAIN_ID=8453 # Base Mainnet chain ID
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

2. **Update WalletConnect chain**:
   - Make sure your WalletConnect configuration supports Base Mainnet
   - Chain ID: `8453`

3. **Restart Next.js dev server**:
   ```bash
   npm run dev
   ```

## Step 7: Test the Contract

1. **Connect wallet** to your app
2. **Switch to Base Mainnet** in your wallet
3. **Send a test payment** using the frontend
4. **Verify on BaseScan**:
   - Transaction appears in BaseScan
   - Contract interactions are visible

## Contract ABI (for reference)

If you need the ABI for frontend integration, you can get it from:

1. **Remix**:
   - After compilation, click the ABI icon next to the contract name
   - Copy the JSON ABI
   - Use it in `lib/contract.js` or update the ABI there

2. **BaseScan** (after verification):
   - Contract page → Code tab → ABI section

## Troubleshooting

### Error: "insufficient funds for gas"
- **Solution**: Add more ETH to your wallet on Base Mainnet
- Get ETH from a Base-compatible exchange or bridge

### Error: "nonce too high"
- **Solution**: Reset your MetaMask account nonce
- Or wait for pending transactions to complete

### Contract not verifying on BaseScan
- **Solution**: Double-check:
  - Compiler version matches (0.8.20)
  - Constructor arguments are correct (fee recipient address)
  - Contract source code is exactly as compiled

### Can't connect Remix to MetaMask
- **Solution**: 
  - Make sure MetaMask is unlocked
  - Refresh Remix page
  - Try a different browser
  - Clear browser cache

## Alternative: Deploy to Base Sepolia (Testnet)

For testing, deploy to Base Sepolia first:

1. **Add Base Sepolia to MetaMask**:
   ```
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer URL: https://sepolia.basescan.org
   ```

2. **Get testnet ETH**: 
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Request testnet ETH

3. **Follow same steps** but select Base Sepolia network

4. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Testnet address
   NEXT_PUBLIC_CHAIN_ID=84532 # Base Sepolia
   ```

## Contract Functions

After deployment, you can interact with the contract in Remix:

- **createPayment**: Create a new payment
- **getPayment**: Get payment details by ID
- **getUserPayments**: Get all payment IDs for a user
- **refundPayment**: Refund a payment
- **cancelPayment**: Cancel a pending payment
- **updatePlatformFee**: (Owner only) Update platform fee
- **updateFeeRecipient**: (Owner only) Update fee recipient

## Security Notes

- ✅ **Fee Recipient**: Set a secure address for fee collection
- ✅ **Verify Contract**: Always verify on BaseScan for transparency
- ✅ **Test First**: Test on testnet before mainnet deployment
- ✅ **Save Address**: Save your contract address securely
- ⚠️ **Private Keys**: Never share your private key or seed phrase

## Next Steps

1. ✅ Deploy contract to Base Mainnet
2. ✅ Verify contract on BaseScan
3. ✅ Update frontend `.env.local` with contract address
4. ✅ Test payment functionality
5. ✅ Monitor contract on BaseScan

---

**Ready to deploy!** 🚀

