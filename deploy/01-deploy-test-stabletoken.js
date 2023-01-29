module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const deploy_script = require("@guildsworn/token-contracts/deploy/02-deploy-stabletoken");
    await deploy_script({getNamedAccounts, deployments, network, guildsworn});
}
module.exports.tags = ["all", "deploy", "test", "deploy-test-stabletoken"];