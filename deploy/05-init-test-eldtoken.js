module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const deploy_script = require("@guildsworn/priceresolver-contracts/deploy/03-init-test-eldtoken");
    await deploy_script({getNamedAccounts, deployments, network, guildsworn});
};

module.exports.tags = ["all", "init", "test", "init-test-eldtoken"];
module.exports.dependencies = ["deploy-test-eldtoken"];