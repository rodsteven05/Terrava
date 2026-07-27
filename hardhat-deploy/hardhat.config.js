require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../server/.env' });

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || '';
const PRIVATE_KEY     = process.env.ETH_PRIVATE_KEY  || '0x0000000000000000000000000000000000000000000000000000000000000001';

module.exports = {
  solidity: '0.8.20',
  networks: {
    sepolia: {
      url:      SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  }
};
