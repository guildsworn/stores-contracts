const { utils } = require("ethers");
module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { log } = deployments;
    const { deployer, moderator, backend, player1, player2, player3 } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (!network.live) {
        let deployerSigner = await ethers.getSigner(deployer);
        let moderatorSigner = await ethers.getSigner(moderator);
        let player1Signer = await ethers.getSigner(player1);

        log(`Test transactions in progress...`);
        const stableTokenAddress = await guildsworn.getStableTokenAddress();
        const storeAddress = await guildsworn.getCharacterStoreAddress();
        const nftAddress = await guildsworn.getCharacterNftAddress();
        let storeDeployerInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, deployerSigner);
        let storeModeratorWriteInstance = await storeDeployerInstance.connect(moderatorSigner);
        // let nftModeratorInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, moderator);
        // let nftPlayer1Instance = await ethers.getContractAt("CharacterNftContract", nftAddress, player1);
        // let nftPlayer2Instance = await ethers.getContractAt("CharacterNftContract", nftAddress, player2);

        let storePlayer1WriteInstance = await storeDeployerInstance.connect(player1Signer);
        // let storePlayer2Instance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player2);
        // let storePlayer3Instance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player3);

        let stablePlayer1WriteInstance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player1Signer);
        //let stablePlayer2Instance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player2);
        
        // Create initial store characters
        let character1Name = "Onitaoshi";
        let character1Hash = utils.hashMessage(character1Name);
        let character1Price = utils.parseEther("50");
        let character1Active = true;
        let character1Data = await storeDeployerInstance.getCharacter(character1Hash);
        if (utils.stripZeros(character1Data.characterHash).length == 0)
        {
            let transactionResponse = await storeModeratorWriteInstance.addCharacter(character1Name, character1Hash, character1Price, character1Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character1Name} created`);
        }
        
        let character2Name = "Rangers-Guild Hunter";
        let character2Hash = utils.hashMessage(character2Name);
        let character2Price = utils.parseEther("50");
        let character2Active = true;
        let character2Data = await storeDeployerInstance.getCharacter(character2Hash);
        if (utils.stripZeros(character2Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorWriteInstance.addCharacter(character2Name, character2Hash, character2Price, character2Active);
            await transactionResponse.wait(confirmations);        
            log(`Character ${character2Name} created`);
        }

        let character3Name = "Expeditionary Hierophant";
        let character3Hash = utils.hashMessage(character3Name);
        let character3Price = utils.parseEther("50");
        let character3Active = true;
        let character3Data = await storeDeployerInstance.getCharacter(character3Hash);
        if (utils.stripZeros(character3Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorWriteInstance.addCharacter(character3Name, character3Hash, character3Price, character3Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character3Name} created`);
        }

        let character4Name = "Helrin Expatriate";
        let character4Hash = utils.hashMessage(character4Name);
        let character4Price = utils.parseEther("50");
        let character4Active = true;
        let character4Data = await storeDeployerInstance.getCharacter(character4Hash);
        if (utils.stripZeros(character4Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorWriteInstance.addCharacter(character4Name, character4Hash, character4Price, character4Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character4Name} created`);
        }

        let character5Name = "Taskmage Explorer";
        let character5Hash = utils.hashMessage(character5Name);
        let character5Price = utils.parseEther("50");
        let character5Active = true;
        let character5Data = await storeDeployerInstance.getCharacter(character5Hash);
        if (utils.stripZeros(character5Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorWriteInstance.addCharacter(character5Name, character5Hash, character5Price, character5Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character5Name} created`);
        }

        let character6Name = "Amazon Gladiatrix";
        let character6Hash = utils.hashMessage(character6Name);
        let character6Price = utils.parseEther("50");
        let character6Active = true;
        let character6Data = await storeDeployerInstance.getCharacter(character6Hash);
        if (utils.stripZeros(character6Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorWriteInstance.addCharacter(character6Name, character6Hash, character6Price, character6Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character6Name} created`);
        }

        // Mint some stable tokens to player 1
        transactionResponse = await stablePlayer1WriteInstance.mint(player1, utils.parseEther("1000"));
        await transactionResponse.wait(confirmations);

        // Player 1 buys character 1
        let characterData = await storeDeployerInstance.getCharacter(character1Hash);
        transactionResponse = await stablePlayer1WriteInstance.approve(storeDeployerInstance.address, characterData.price);
        await transactionResponse.wait(confirmations);

        transactionResponse = await storePlayer1WriteInstance.buyWithStable(character1Hash);
        await transactionResponse.wait(confirmations);
        log(`Character ${character1Name} bought by ${player1}`);

        log(`Creating test data finished.`);
    } 
}
module.exports.tags = ["all", "stage3", "test", "test-data"];
