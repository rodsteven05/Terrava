const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

const CONTRACT_ABI = [
  "function recordPayment(uint256 _listingId, uint256 _transactionId, string memory _buyerName, string memory _sellerName, uint256 _amountPhp, string memory _paymentMethod) public",
  "function getRecord(uint256 index) public view returns (tuple(uint256 listingId, uint256 transactionId, string buyerName, string sellerName, uint256 amountPhp, string paymentMethod, uint256 timestamp))",
  "function getRecordCount() public view returns (uint256)",
  "event PaymentRecorded(uint256 indexed transactionId, uint256 indexed listingId, string buyerName, uint256 amountPhp, uint256 timestamp)"
];

function getContract() {
  const rpcUrl         = process.env.SEPOLIA_RPC_URL;
  const privateKey     = process.env.ETH_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error('Missing Ethereum env vars: SEPOLIA_RPC_URL, ETH_PRIVATE_KEY, CONTRACT_ADDRESS');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet   = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
}

async function recordPaymentOnChain({ listingId, transactionId, buyerName, sellerName, amountPhp, paymentMethod }) {
  try {
    const contract = getContract();
    const tx = await contract.recordPayment(
      BigInt(listingId),
      BigInt(transactionId),
      buyerName   || 'Unknown',
      sellerName  || 'Unknown',
      BigInt(Math.round(Number(amountPhp))),
      paymentMethod || 'unknown'
    );
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error('[Ethereum] recordPaymentOnChain failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { recordPaymentOnChain };
