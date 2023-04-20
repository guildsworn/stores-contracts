const { ethers, network, guildsworn } = require("hardhat");
const { utils } = require("ethers");
const hre = require("hardhat");

let deployerSigner;
let adminSigner;
let moderatorSigner;
let player1Signer;

let stableTokenAddress;
let storeAddress;
let nftAddress;
let eldfallTokenAddress;
let priceResolverOracleAddress;

let storeDeployerInstance;
let stableDeployerInstance;
let characterNftDeployerInstance;
let eldfallTokenDeployerInstance;
let priceResolverOracleDeployerInstance;

let storeModeratorWriteInstance;

let eldfallTokenAdminInstance;

let storePlayer1WriteInstance;
let stablePlayer1WriteInstance;
let characterNftPlayer1WriteInstance;
let eldfallTokenPlayer1Instance;

async function init() {
    const { deployer, admin, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();

    deployerSigner = await ethers.getSigner(deployer);
    adminSigner = await ethers.getSigner(admin);
    moderatorSigner = await ethers.getSigner(moderator);
    player1Signer = await ethers.getSigner(player1);

    stableTokenAddress = await guildsworn.getStableTokenAddress();
    storeAddress = await guildsworn.getCharacterStoreAddress();
    nftAddress = await guildsworn.getCharacterNftAddress();
    eldfallTokenAddress = await guildsworn.getEldfallTokenAddress();
    priceResolverOracleAddress = await guildsworn.getPriceRosolverOracleAddress();

    storeDeployerInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, deployerSigner);
    stableDeployerInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, deployerSigner);
    characterNftDeployerInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, deployerSigner);
    eldfallTokenDeployerInstance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, deployerSigner);
    priceResolverOracleDeployerInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, deployerSigner);

    storeModeratorWriteInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, moderatorSigner);
    priceResolverOracleModeratorInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, moderatorSigner);

    eldfallTokenAdminInstance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, adminSigner);
    priceResolverOracleAdminInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, adminSigner);

    storePlayer1WriteInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player1Signer);
    stablePlayer1WriteInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player1Signer);
    characterNftPlayer1WriteInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, player1Signer);
    eldfallTokenPlayer1Instance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, player1Signer);
}

async function setMinterOnEltToken(account)
{
    const confirmations = network.config.blockConfirmations || 1;
    let minterRole = await eldfallTokenDeployerInstance.MINTER_ROLE();
    let hasRole = await eldfallTokenDeployerInstance.hasRole(minterRole, account);
    if (!hasRole) {
        let transactionResponse = await eldfallTokenAdminInstance.grantRole(minterRole, account);
        await transactionResponse.wait(confirmations);
        console.log(`Minter ${account} added to EldfallTokenContract.`);
    } else {
        console.log(`Minter ${account} already added to EldfallTokenContract.`);
    }    
}

async function mintEldfallToken(account, amount)
{
    const confirmations = network.config.blockConfirmations || 1;
    let transactionResponse = await eldfallTokenDeployerInstance.safeMint(account, amount);
    await transactionResponse.wait(confirmations);
    console.log(`Minted ${amount} EldfallTokenContract to ${account}.`);
}

async function setKickBack(kickback)
{
    const confirmations = network.config.blockConfirmations || 1;
    let kickbacknow = await storeDeployerInstance.getEldKickback();
    if (kickbacknow != kickback) {
        let transactionResponse = await storeModeratorWriteInstance.setEldKickback(kickback);
        await transactionResponse.wait(confirmations);
        console.log(`Kickback set to ${kickback}.`);
    } else {
        console.log(`Kickback already set to ${kickback}.`);
    }
}

async function setStableInstance(stableAddress)
{
    const confirmations = network.config.blockConfirmations || 1;
    let stablenow = await storeDeployerInstance.getStableAddress();
    if (stablenow != stableAddress) {
        let transactionResponse = await storeModeratorWriteInstance.setStableInstance(stableAddress);
        await transactionResponse.wait(confirmations);
        console.log(`Stable set to ${stableAddress}.`);
    } else {
        console.log(`Stable already set to ${stableAddress}.`);
    }
}

async function removeCharacter(characterHash)
{
    const confirmations = network.config.blockConfirmations || 1;
    try
    {
        let character = await storeDeployerInstance.getCharacter(characterHash);
        let transactionResponse = await storeModeratorWriteInstance.removeCharacter(characterHash);
        await transactionResponse.wait(confirmations);
        console.log(`Character ${characterHash} removed.`);
    }
    catch (e) {
        console.log(`Character ${characterHash} not found.`);
        return;
    }    
}

async function editCharacterPrice(characterHash, priceEth)
{
    const confirmations = network.config.blockConfirmations || 1;
    let price = utils.parseEther(priceEth);
    const CHAR_PRICE = ethers.BigNumber.from(3);
    try
    {
        let character = await storeDeployerInstance.getCharacter(characterHash);
        if (!character.price.eq(price)) {
            let encodedPrice = new ethers.utils.AbiCoder().encode(["uint256"], [price]);
            let transactionResponse = await storeModeratorWriteInstance.editCharacter(characterHash, CHAR_PRICE, encodedPrice);
            await transactionResponse.wait(confirmations);
            console.log(`Character ${characterHash} price set to ${price}.`);
        } else {
            console.log(`Character ${characterHash} price already set to ${price}.`);
        }        
    }
    catch (e) {
        console.log(`Character ${characterHash} not found.`);
        console.error(e);
        return;
    }    
}

async function main() {
    const { deployer, admin, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();
    const eldKickback = process.env.ELD_KICKBACK ? parseInt(process.env.ELD_KICKBACK) : 10;

    await init();
    //await setMinterOnEltToken(deployer);
    //await mintEldfallToken("0x6E73925aF44a6e8DfDd07653d91B1f2AEdd4da3E", utils.parseEther("1000"));
    //await setKickBack(eldKickback);
    //await setStableInstance(ethers.constants.AddressZero);

    // let character6Name = "Amazon Gladiatrix";
    // let character6Hash = utils.hashMessage(character6Name);
    // await removeCharacter(character6Hash);

    let character1Name = "Onitaoshi";
    let character1Hash = utils.hashMessage(character1Name);
    let character1Price = "30";
    await editCharacterPrice(character1Hash, character1Price);

    let character2Name = "Rangers-Guild Hunter";
    let character2Hash = utils.hashMessage(character2Name);
    let character2Price = "30";
    await editCharacterPrice(character2Hash, character2Price);

    let character3Name = "Expeditionary Hierophant";
    let character3Hash = utils.hashMessage(character3Name);
    let character3Price = "30";
    await editCharacterPrice(character3Hash, character3Price);

    let character4Name = "Helrin Expatriate";
    let character4Hash = utils.hashMessage(character4Name);
    let character4Price = "30";
    await editCharacterPrice(character4Hash, character4Price);

    let character5Name = "Taskmage Explorer";
    let character5Hash = utils.hashMessage(character5Name);
    let character5Price = "30";
    await editCharacterPrice(character5Hash, character5Price);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});