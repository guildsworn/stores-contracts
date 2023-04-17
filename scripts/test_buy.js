const { ethers, network, guildsworn } = require("hardhat");
const { utils } = require("ethers");
const hre = require("hardhat");

let deployerSigner;
let moderatorSigner;
let player1Signer;

let stableTokenAddress;
let storeAddress;
let nftAddress;
let eldfallTokenAddress;

let storeDeployerInstance;
let stableDeployerInstance;
let characterNftDeployerInstance;
let eldfallTokenDeployerInstance;

let storeModeratorWriteInstance;

let storePlayer1WriteInstance;
let stablePlayer1WriteInstance;
let characterNftPlayer1WriteInstance;
let eldfallTokenPlayer1Instance;

async function setStoreActive(active) {
    const { deployer, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();
    const confirmations = network.config.blockConfirmations || 1;

    let nowStoreActive = await storeDeployerInstance.getStoreActive();
    console.log(`Store is now ${nowStoreActive}...`);
    let transactionResponse = await storeModeratorWriteInstance.setStoreActive(active);
    await transactionResponse.wait(confirmations);

    let afterStoreActive = await storeDeployerInstance.getStoreActive();
    console.log(`Store active set to ${afterStoreActive}`);
}

async function init() {
    const { deployer, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();

    deployerSigner = await ethers.getSigner(deployer);
    moderatorSigner = await ethers.getSigner(moderator);
    player1Signer = await ethers.getSigner(player1);

    stableTokenAddress = await guildsworn.getStableTokenAddress();
    storeAddress = await guildsworn.getCharacterStoreAddress();
    nftAddress = await guildsworn.getCharacterNftAddress();
    eldfallTokenAddress = await guildsworn.getEldfallTokenAddress();

    storeDeployerInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, deployerSigner);
    stableDeployerInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, deployerSigner);
    characterNftDeployerInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, deployerSigner);
    eldfallTokenDeployerInstance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, deployerSigner);

    storeModeratorWriteInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, moderatorSigner);

    storePlayer1WriteInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player1Signer);
    stablePlayer1WriteInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player1Signer);
    characterNftPlayer1WriteInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, player1Signer);
    eldfallTokenPlayer1Instance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, player1Signer);
}

async function basicInfo() {
    const { deployer, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();

    console.log("stableTokenAddress: " + stableTokenAddress);
    console.log("storeAddress: " + storeAddress);
    console.log("nftAddress: " + nftAddress);
    console.log("eldfallTokenAddress: " + eldfallTokenAddress);
    console.log("---------------------------------"); 

    // Print basic info on start
    console.log("Player1: " + player1);
    console.log("Balance: " + (await player1Signer.getBalance()).toString());
    console.log("Stable Balance: " + (await stableDeployerInstance.balanceOf(player1)).toString());
    console.log("Eldfall Balance: " + (await eldfallTokenDeployerInstance.balanceOf(player1)).toString());
    console.log("Character NFT Balance: " + (await characterNftDeployerInstance.balanceOf(player1)).toString());
    // Print Character NFT items that player1 owns
    let player1Characters = await characterNftDeployerInstance.getCharactersByAccount(1, 1000, player1);
    console.log("Character NFTs");
    //console.table(player1Characters);
    console.log("---------------------------------");
}

async function approveStable(price) {
    const confirmations = network.config.blockConfirmations || 1;
    transactionResponse = await stablePlayer1WriteInstance.approve(storeDeployerInstance.address, price);
    await transactionResponse.wait(confirmations);
}

async function buyCharacter() {
    const { deployer, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();
    const confirmations = network.config.blockConfirmations || 1;

    // Buy a character
    let character1Name = "Onitaoshi";
    let character1Hash = utils.hashMessage(character1Name);

    // Player 1 buys character 1
    let characterData = await storeDeployerInstance.getCharacter(character1Hash);
    //await approveStable(characterData.price);

    transactionResponse = await storePlayer1WriteInstance.buyWithStable(character1Hash);
    await transactionResponse.wait(confirmations);
    console.log(`Character ${character1Name} bought by ${player1}`);
}

async function main() {
    await init();
    //await setStoreActive(true);
    await basicInfo();
    await buyCharacter();
    await basicInfo();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});