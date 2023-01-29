module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    if (!network.live) {        
        const deploy_script = require("@guildsworn/token-contracts/deploy/00-deploy-eldtoken");
        await deploy_script({getNamedAccounts, deployments, network, guildsworn});
    }
};

module.exports.tags = ["all", "deploy", "test", "deploy-test-eldtoken"];