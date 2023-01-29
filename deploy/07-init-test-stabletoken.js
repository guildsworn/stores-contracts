module.exports = async ({ getNamedAccounts, deployments, network, guildsworn}) => {
    const deploy_script = require("@guildsworn/token-contracts/deploy/05-init-stabletoken");
    await deploy_script({getNamedAccounts, deployments, network, guildsworn});
}
module.exports.tags = ["all", "init", "test", "init-test-stabletoken"];