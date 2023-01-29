module.exports = async ({ getNamedAccounts, deployments, guildsworn }) => {
    if (!network.live) {   
        const deploy_script = require("@guildsworn/priceresolver-contracts/deploy/05-set-priceresolver-oracle");
        await deploy_script({getNamedAccounts, deployments, network, guildsworn});
    }
}
module.exports.tags = ["all", "set", "test", "oracle", "priceresolver", "set-test-priceresolver-oracle"];
module.exports.dependencies = ["init-test-priceresolver-oracle"]; 