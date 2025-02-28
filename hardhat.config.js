require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    sonic_blaze_testnet: {
      url: "https://rpc.blaze.soniclabs.com",
      chainId: 57054, // Replace with the correct chain ID
      accounts: [process.env.ACCOUNT1_PRIVATE_KEY] // Use environment variables instead for security
    }
  }
};
