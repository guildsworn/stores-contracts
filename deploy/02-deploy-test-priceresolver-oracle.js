module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    if (!network.live) {
        const deploy_script = require("@guildsworn/priceresolver-contracts/deploy/02-deploy-priceresolver-oracle");
        await deploy_script({getNamedAccounts, deployments, network, guildsworn});
    }
};

module.exports.tags = ["all", "deploy", "test", "priceresolver", "deploy-test-priceresolver-oracle"];