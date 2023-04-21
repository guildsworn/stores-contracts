const { ethers, network, guildsworn } = require("hardhat");
const { utils } = require("ethers");
const hre = require("hardhat");
const confirmations = network.config.blockConfirmations || 1;

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

let storeModeratorInstance;

let storeAdminInstance;
let characterNftAdminInstance;
let eldfallTokenAdminInstance;
let priceResolverOracleAdminInstance;

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

    storeModeratorInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, moderatorSigner);
    priceResolverOracleModeratorInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, moderatorSigner);

    storeAdminInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, adminSigner);
    characterNftAdminInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, adminSigner);
    eldfallTokenAdminInstance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, adminSigner);
    priceResolverOracleAdminInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, adminSigner);

    storePlayer1WriteInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player1Signer);
    stablePlayer1WriteInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player1Signer);
    characterNftPlayer1WriteInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, player1Signer);
    eldfallTokenPlayer1Instance = await ethers.getContractAt("EldfallTokenContract", eldfallTokenAddress, player1Signer);
}

async function eldfallTokenRevokeMinterRole(account)
{
    let minterRole = await eldfallTokenDeployerInstance.MINTER_ROLE();
    let hasRole = await eldfallTokenDeployerInstance.hasRole(minterRole, account);
    if (hasRole) {
        let transactionResponse = await eldfallTokenAdminInstance.revokeRole(minterRole, account);
        await transactionResponse.wait(confirmations);
        console.log(`Minter ${account} removed from EldfallTokenContract.`);
    } else {
        console.log(`Minter ${account} already removed from EldfallTokenContract.`);
    }    
}

async function eldfallTokenGrantMinterRole(account)
{
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

async function characterNftContractRevokeMinterRole(account)
{
    let minterRole = await characterNftDeployerInstance.MINTER_ROLE();
    let hasRole = await characterNftDeployerInstance.hasRole(minterRole, account);
    if (hasRole) {
        let transactionResponse = await characterNftAdminInstance.revokeRole(minterRole, account);
        await transactionResponse.wait(confirmations);
        console.log(`Minter ${account} removed from CharacterNftContract.`);
    } else {
        console.log(`Minter ${account} already removed from CharacterNftContract.`);
    }    
}

async function eldfallTokenMint(account, amount)
{
    let transactionResponse = await eldfallTokenDeployerInstance.safeMint(account, amount);
    await transactionResponse.wait(confirmations);
    console.log(`Minted ${amount} EldfallTokenContract to ${account}.`);
}

async function characterStoreSetEldKickback(kickback)
{
    let kickbacknow = await storeDeployerInstance.getEldKickback();
    if (kickbacknow != kickback) {
        let transactionResponse = await storeModeratorInstance.setEldKickback(kickback);
        await transactionResponse.wait(confirmations);
        console.log(`Kickback set to ${kickback}.`);
    } else {
        console.log(`Kickback already set to ${kickback}.`);
    }
}

async function characterStoreSetStableInstance(stableAddress)
{
    let stablenow = await storeDeployerInstance.getStableAddress();
    if (stablenow != stableAddress) {
        let transactionResponse = await storeModeratorInstance.characterStoreSetStableInstance(stableAddress);
        await transactionResponse.wait(confirmations);
        console.log(`Stable set to ${stableAddress}.`);
    } else {
        console.log(`Stable already set to ${stableAddress}.`);
    }
}

async function characterStoreRemoveCharacter(characterHash)
{
    try
    {
        let character = await storeDeployerInstance.getCharacter(characterHash);
        let transactionResponse = await storeModeratorInstance.characterStoreRemoveCharacter(characterHash);
        await transactionResponse.wait(confirmations);
        console.log(`Character ${characterHash} removed.`);
    }
    catch (e) {
        console.log(`Character ${characterHash} not found.`);
        return;
    }    
}

async function characterStoreEditCharacterPrice(characterHash, priceEth)
{
    let price = utils.parseEther(priceEth);
    const CHAR_PRICE = ethers.BigNumber.from(3);
    try
    {
        let character = await storeDeployerInstance.getCharacter(characterHash);
        if (!character.price.eq(price)) {
            let encodedPrice = new ethers.utils.AbiCoder().encode(["uint256"], [price]);
            let transactionResponse = await storeModeratorInstance.editCharacter(characterHash, CHAR_PRICE, encodedPrice);
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

async function characterStoreKillContract(storeAddressForKill){
    let killStoreAdminInstance = await ethers.getContractAt("CharacterStoreContract", storeAddressForKill, adminSigner);
    let transactionResponse = await killStoreAdminInstance.killContract();
    await transactionResponse.wait(confirmations);
    console.log(`Store contract killed.`);
}

async function main() {
    const { deployer, admin, moderator, backend, player1, player2, player3 } = await hre.getNamedAccounts();
    //const eldKickback = process.env.ELD_KICKBACK ? parseInt(process.env.ELD_KICKBACK) : 10;

    await init();
    //await eldfallTokenGrantMinterRole(deployer);
    //await eldfallTokenMint("0x6E73925aF44a6e8DfDd07653d91B1f2AEdd4da3E", utils.parseEther("1000"));
    //await characterStoreSetEldKickback(eldKickback);
    //await characterStoreSetStableInstance(ethers.constants.AddressZero);

    // let character6Name = "Amazon Gladiatrix";
    // let character6Hash = utils.hashMessage(character6Name);
    // await characterStoreRemoveCharacter(character6Hash);

    // let character1Name = "Onitaoshi";
    // let character1Hash = utils.hashMessage(character1Name);
    // let character1Price = "30";
    // await characterStoreEditCharacterPrice(character1Hash, character1Price);

    // let character2Name = "Rangers-Guild Hunter";
    // let character2Hash = utils.hashMessage(character2Name);
    // let character2Price = "30";
    // await characterStoreEditCharacterPrice(character2Hash, character2Price);

    // let character3Name = "Expeditionary Hierophant";
    // let character3Hash = utils.hashMessage(character3Name);
    // let character3Price = "30";
    // await characterStoreEditCharacterPrice(character3Hash, character3Price);

    // let character4Name = "Helrin Expatriate";
    // let character4Hash = utils.hashMessage(character4Name);
    // let character4Price = "30";
    // await characterStoreEditCharacterPrice(character4Hash, character4Price);

    // let character5Name = "Taskmage Explorer";
    // let character5Hash = utils.hashMessage(character5Name);
    // let character5Price = "30";
    // await characterStoreEditCharacterPrice(character5Hash, character5Price);

    // Delete old Store contract
    // let oldStoreContract = "0xf73f3A708fa983310C218B25464E8B499788d314";
    // await characterNftContractRevokeMinterRole(oldStoreContract);
    // await eldfallTokenRevokeMinterRole(oldStoreContract);
    // await characterStoreKillContract(oldStoreContract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});