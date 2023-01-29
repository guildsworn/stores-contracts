const { utils } = require("ethers");
module.exports = async ({ getNamedAccounts, deployments, network, guildsworn }) => {
    const { log } = deployments;
    const { moderator, backend, player1, player2, player3 } = await getNamedAccounts();
    const confirmations = network.blockConfirmations || 1;

    if (!network.live) {
        log(`Test transactions in progress...`);
        const stableTokenAddress = await guildsworn.getStableTokenAddress();
        const storeAddress = await guildsworn.getCharacterStoreAddress();
        const nftAddress = await guildsworn.getCharacterNftAddress();
        let storeModeratorInstance = await ethers.getContractAt("CharacterStoreContract", storeAddress, moderator);
        let nftModeratorInstance = await ethers.getContractAt("CharacterNftContract", nftAddress, moderator);
        let nftPlayer1Instance = await ethers.getContractAt("CharacterNftContract", nftAddress, player1);
        let nftPlayer2Instance = await ethers.getContractAt("CharacterNftContract", nftAddress, player2);

        let storePlayer1Instance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player1);
        // let storePlayer2Instance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player2);
        // let storePlayer3Instance = await ethers.getContractAt("CharacterStoreContract", storeAddress, player3);

        let stablePlayer1Instance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player1);
        let stablePlayer2Instance = await ethers.getContractAt("ERC20MockContract", stableTokenAddress, player2);
        
        // Create initial store characters
        let character1Name = "Onitaoshi";
        let character1Hash = utils.hashMessage(character1Name);
        let character1Price = utils.parseEther("50");
        let character1Active = true;
        let character1Data = await storeModeratorInstance.getCharacter(character1Hash);
        if (utils.stripZeros(character1Data.characterHash).length == 0)
        {
            let transactionResponse = await storeModeratorInstance.addCharacter(character1Name, character1Hash, character1Price, character1Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character1Name} created`);
        }
        
        let character2Name = "Rangers-Guild Hunter";
        let character2Hash = utils.hashMessage(character2Name);
        let character2Price = utils.parseEther("50");
        let character2Active = true;
        let character2Data = await storeModeratorInstance.getCharacter(character2Hash);
        if (utils.stripZeros(character2Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character2Name, character2Hash, character2Price, character2Active);
            await transactionResponse.wait(confirmations);        
            log(`Character ${character2Name} created`);
        }

        let character3Name = "Expeditionary Hierophant";
        let character3Hash = utils.hashMessage(character3Name);
        let character3Price = utils.parseEther("50");
        let character3Active = true;
        let character3Data = await storeModeratorInstance.getCharacter(character3Hash);
        if (utils.stripZeros(character3Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character3Name, character3Hash, character3Price, character3Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character3Name} created`);
        }

        let character4Name = "Helrin Expatriate";
        let character4Hash = utils.hashMessage(character4Name);
        let character4Price = utils.parseEther("50");
        let character4Active = true;
        let character4Data = await storeModeratorInstance.getCharacter(character4Hash);
        if (utils.stripZeros(character4Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character4Name, character4Hash, character4Price, character4Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character4Name} created`);
        }

        let character5Name = "Taskmage Explorer";
        let character5Hash = utils.hashMessage(character5Name);
        let character5Price = utils.parseEther("50");
        let character5Active = true;
        let character5Data = await storeModeratorInstance.getCharacter(character5Hash);
        if (utils.stripZeros(character5Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character5Name, character5Hash, character5Price, character5Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character5Name} created`);
        }

        let character6Name = "Amazon Gladiatrix";
        let character6Hash = utils.hashMessage(character6Name);
        let character6Price = utils.parseEther("50");
        let character6Active = true;
        let character6Data = await storeModeratorInstance.getCharacter(character6Hash);
        if (utils.stripZeros(character6Data.characterHash).length == 0)
        {
            transactionResponse = await storeModeratorInstance.addCharacter(character6Name, character6Hash, character6Price, character6Active);
            await transactionResponse.wait(confirmations);
            log(`Character ${character6Name} created`);
        }

        // Mint some stable tokens to player 1
        transactionResponse = await stablePlayer1Instance.mint(player1, utils.parseEther("1000"));
        await transactionResponse.wait(confirmations);

        // Player 1 buys character 1
        let characterData = await storePlayer1Instance.getCharacter(character1Hash);
        transactionResponse = await stablePlayer1Instance.approve(storePlayer1Instance.address, characterData.price);
        await transactionResponse.wait(confirmations);

        transactionResponse = await storePlayer1Instance.buyWithStable(character1Hash);
        await transactionResponse.wait(confirmations);
        log(`Character ${character1Name} bought by ${player1}`);

        log(`Creating test data finished.`);
    } 
}
module.exports.tags = ["all", "stage3", "test", "test-data"];
