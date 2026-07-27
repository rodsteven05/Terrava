const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying LandChainPayment to Sepolia...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  const LandChainPayment = await ethers.getContractFactory('LandChainPayment');
  const contract = await LandChainPayment.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('\n✅ Contract deployed successfully!');
  console.log('CONTRACT_ADDRESS =', address);
  console.log('\nAdd this to your server/.env:');
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`\nVerify: https://sepolia.etherscan.io/address/${address}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

