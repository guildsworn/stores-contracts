module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    let characterStoreAddress = await guildsworn.getCharacterStoreAddress(false);
    if (!characterStoreAddress || characterStoreAddress == "0x0000000000000000000000000000000000000000") {
        // Deployer for CharacterStoreContract
        let args = []
        const deployContract = await deploy("CharacterStoreContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: confirmations, // variable from config
        });
        log(`Store Instance at ${deployContract.address}`);
    } else {
        log(`Store Instance already at ${characterStoreAddress}`);
    }
}
module.exports.tags = ["all", "deploy", "store", "deploy-store"];