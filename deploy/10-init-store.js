module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { log } = deployments;
    const { deployer, admin, moderator } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;
    
    let characterStoreAddress = await guildsworn.getCharacterStoreAddress();
    let storeInstance = await ethers.getContractAt("CharacterStoreContract", characterStoreAddress, deployer);    
    let isInitialised = await storeInstance.isInitialised();
    if (!isInitialised) { 
        // Initialization
        const vaultAddress = process.env.STORE_VAULT ? process.env.STORE_VAULT : "0x0000000000000000000000000000000000000000";
        const eldDiscount = process.env.ELD_DISCAUNT ? parseInt(process.env.ELD_DISCAUNT) : 50;
        const eldKickback = process.env.ELD_KICKBACK ? parseInt(process.env.ELD_KICKBACK) : 10;

        const stableCoinAddress = await guildsworn.getStableTokenAddress();
        const eldCoinAddress = await guildsworn.getEldfallTokenAddress();
        const nftCharacterAddress = await guildsworn.getCharacterNftAddress();
        const priceResolverOracleAddress = await guildsworn.getPriceRosolverOracleAddress();

        let eldCoinInstance = await ethers.getContractAt("EldfallTokenContract", eldCoinAddress, admin);
        let nftCharacterInstance = await ethers.getContractAt("CharacterNftContract", nftCharacterAddress, admin);
        let priceResolverInstance = await ethers.getContractAt("PriceResolverOracleContract", priceResolverOracleAddress, moderator);
        
        let transactionResponse = await storeInstance.init(admin, moderator, vaultAddress, priceResolverInstance.address, eldCoinInstance.address, nftCharacterInstance.address, stableCoinAddress, eldDiscount, eldKickback);
        await transactionResponse.wait(confirmations);
        log(`Initialization of CharacterStoreContract Instance at ${storeInstance.address} finished.`);

        log(`Setting up CharacterStoreContract Instance at ${storeInstance.address}...`);
        storeInstance = await ethers.getContractAt("CharacterStoreContract", characterStoreAddress, moderator);

        log(`Setting up CharacterStoreContract setStoreActive to true`);
        transactionResponse = await storeInstance.setStoreActive(true);
        await transactionResponse.wait(confirmations);
        log(`Setting up CharacterStoreContract Instance at ${storeInstance.address} finished.`);

        log(`Setting up CharacterNftContract Instance at ${nftCharacterInstance.address}...`);
        log(`Adding store contract ${storeInstance.address} as minter on nft contract at ${nftCharacterInstance.address}`)
        transactionResponse = await nftCharacterInstance.grantRole(await nftCharacterInstance.MINTER_ROLE(), storeInstance.address);
        await transactionResponse.wait(confirmations);
        log(`Setting up CharacterNftContract Instance at ${nftCharacterInstance.address} finished.`);

        log(`Setting up EldfallTokenContract Instance at ${eldCoinInstance.address}...`);
        log(`Adding store contract ${storeInstance.address} as minter on elt token contract at ${eldCoinInstance.address}`)
        transactionResponse = await eldCoinInstance.grantRole(await eldCoinInstance.MINTER_ROLE(), storeInstance.address);
        await transactionResponse.wait(confirmations);
        log(`Setting up EldfallTokenContract Instance at ${eldCoinInstance.address} finished.`);

    } else {
        log(`Initialization of CharacterStoreContract already finished.`);
    }
}
module.exports.tags = ["all", "init", "store", "init-store"];