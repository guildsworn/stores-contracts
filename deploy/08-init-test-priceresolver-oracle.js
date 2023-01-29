module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    if (!network.live) {   
        const deploy_script = require("@guildsworn/priceresolver-contracts/deploy/04-init-priceresolver-oracle");
        await deploy_script({getNamedAccounts, deployments, network, guildsworn});
    }
};

module.exports.tags = ["all", "init", "test", "priceresolver", "init-test-priceresolver-oracle"];
module.exports.dependencies = ["deploy-test-priceresolver-oracle"]; 