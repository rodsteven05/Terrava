const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying TerravaPayment contract to Sepolia...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  const TerravaPayment = await ethers.getContractFactory('TerravaPayment');
  const contract = await TerravaPayment.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('\n✅ Contract deployed successfully!');
  console.log('CONTRACT_ADDRESS =', address);
  console.log('\nAdd this to your server/.env file:');
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`\nVerify on Etherscan: https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
