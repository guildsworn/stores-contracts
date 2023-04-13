require("dotenv").config();
require("@oasisprotocol/sapphire-hardhat");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require("hardhat-if-gen");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-gas-reporter");
require("hardhat-docgen");
require("solidity-coverage");
require('@guildsworn/hardhat-guildsworn')

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const MODERATOR_PRIVATE_KEY = process.env.MODERATOR_PRIVATE_KEY;
const PLAYER1_PRIVATE_KEY = process.env.PLAYER1_PRIVATE_KEY;
const PLAYER2_PRIVATE_KEY = process.env.PLAYER2_PRIVATE_KEY;
const PLAYER3_PRIVATE_KEY = process.env.PLAYER3_PRIVATE_KEY;
const REPORT_GAS = process.env.REPORT_GAS;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const ACCOUNTS = [];
if (DEPLOYER_PRIVATE_KEY) {
    ACCOUNTS.push(DEPLOYER_PRIVATE_KEY);
}
if (ADMIN_PRIVATE_KEY) {
    ACCOUNTS.push(ADMIN_PRIVATE_KEY);
}
if (MODERATOR_PRIVATE_KEY) {
    ACCOUNTS.push(MODERATOR_PRIVATE_KEY);
}
if (PLAYER1_PRIVATE_KEY) {
    ACCOUNTS.push(PLAYER1_PRIVATE_KEY);
}
if (PLAYER2_PRIVATE_KEY) {
    ACCOUNTS.push(PLAYER2_PRIVATE_KEY);
}
if (PLAYER3_PRIVATE_KEY) {
    ACCOUNTS.push(PLAYER3_PRIVATE_KEY);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
          chainId: 31337,
          live: false,
          saveDeployments: false,
          tags: ["test", "local"]
      },
      localhost: {
          chainId: 80001,
          live: false,
          saveDeployments: true,
          tags: ["local"]
      },
      oasis_sapphire_testnet: {
        url: `https://testnet.sapphire.oasis.dev`,
        chainId: 23295,
        accounts: ACCOUNTS,
        live: false,
        saveDeployments: true,
        blockConfirmations: 2,
        tags: ["test", "oasis", "testnet"]
      },
      oasis_sapphire_mainnet: {
        url: `https://sapphire.oasis.io`,
        chainId: 23294,
        accounts: ACCOUNTS,
        live: true,
        saveDeployments: true,
        blockConfirmations: 2,
        tags: ["live", "oasis", "mainnet", "production"]
      },
  },
  paths: {
    deploy: './deploy',
    deployments: './deployments',
    imports: './imports',
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  external: {
    contracts: [
      {
        artifacts: "node_modules/@guildsworn/token-contracts/artifacts/contracts",
      },
      {
        artifacts: "node_modules/@guildsworn/priceresolver-contracts/artifacts/contracts",
      }
    ],
    deployments: {
      oasis_sapphire_testnet: ["node_modules/@guildsworn/token-contracts/deployments/oasis_sapphire_testnet", "node_modules/@guildsworn/priceresolver-contracts/deployments/oasis_sapphire_testnet"],
      oasis_sapphire_mainnet: ["node_modules/@guildsworn/token-contracts/deployments/oasis_sapphire_mainnet", "node_modules/@guildsworn/priceresolver-contracts/deployments/oasis_sapphire_mainnet"],
    },
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
  gasReporter: {
		currency: 'USD',
		gasPrice: 100,
		enabled: REPORT_GAS ? true : false,
		coinmarketcap: COINMARKETCAP_API_KEY,
		maxMethodDiff: 10,
	},
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    admin: {
      default: 1,
    },
    moderator: {
      default: 2,
    },
    player1: {
      default: 3,
    },
    player2: {
      default: 4,
    },
    player3: {
      default: 5,
    },
  },
  mocha: {
    timeout: 500000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
};
