module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    if (!network.live) {
        const deploy_script = require("@guildsworn/token-contracts/deploy/04-init-nft");
        await deploy_script({getNamedAccounts, deployments, network, guildsworn});
    }
};

module.exports.tags = ["all", "init", "test", "init-test-nft"];
module.exports.dependencies = ["deploy-test-nft"];