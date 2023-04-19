# guildsworn-stores-contracts


## Installing the package
```shell
npm install @guildsworn/stores-contracts
```
or via yarn
```shell
yarn add @guildsworn/stores-contracts
```

# Compiling, building
Try running some of the following tasks:

```shell
yarn install
yarn clean
yarn compile
yarn test
yarn coverage
yarn docs
```
## Updating interfaces
```shell
npx hardhat generate-interface [Contract name]
cp contracts/[Contract name] contracts/interfaces/
```

# Smart Contract deploy
## Before deploy
1. Create `.env` file in root folder or copy and check `.env.example`

Available extra env variables:
- `STABLE_TOKEN_ADDRESS` for general, or use `STABLE_TOKEN_ADDRESS_[ChainId]` for network specific settings
- `ELDFALL_TOKEN_ADDRESS` for general, or use `ELDFALL_TOKEN_ADDRESS_[ChainId]` for network specific settings
- `CHARACTER_NFT_ADDRESS` for general, or use `CHARACTER_NFT_ADDRESS_[ChainId]` for network specific settings
- `PRICE_RESOLVER_ORACLE_ADDRESS` for general, or use `PRICE_RESOLVER_ORACLE_ADDRESS_[ChainId]` for network specific settings
- `CHARACTER_STORE_ADDRESS` for general, or use `CHARACTER_STORE_ADDRESS_[ChainId]` for network specific settings


### [Deploy parameters](https://github.com/wighawag/hardhat-deploy#1-hardhat-deploy)

## Deploy on hardhat local network, reset deployment if exists and generate deployment files
```shell
npx hardhat deploy --write true --reset
```

## Deploy on Oasis Sapphire Testnet, generate deployment files
```shell
npx hardhat deploy --write true --network oasis_sapphire_testnet
```

## Deploy on Oasis Sapphire Mestnet, generate deployment files
```shell
npx hardhat deploy --write true --network oasis_sapphire_mainnet
```

## Verify contract for testnet
```shell
yarn hardhat --network oasis_sapphire_testnet sourcify
```

## Verify contract for mainnet
```shell
yarn hardhat --network oasis_sapphire_mainnet sourcify
```

# Publish the NPM package
```shell
yarn publish
```