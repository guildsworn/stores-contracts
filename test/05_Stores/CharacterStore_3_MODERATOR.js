const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");

let deployer;
let defaultAdmin;
let defaultAdminHash;
let moderator;
let moderatorHash;
let locker;
let lockerHash;
let vault;
let signer;
let tester1;
let tester2;
let character1Name;
let character1Hash;
let character1Price;
let character1Active;
let character2Name;
let character2Hash;
let character2Price;
let character2Active;

let TokenInstance;
let StoreInstance;

const CharacterParams = {
	CHAR_NAME: 0,
	CHAR_STOREID: 1,
	CHAR_HASH: 2,
	CHAR_PRICE: 3,
    CHAR_ACTIVE: 4,
    NOT_EXISTS: 5
}

describe("CharacterStore_3_MODERATOR", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester1, tester2] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("ERC20MockContract");
        TokenInstance = await TokenFactory.deploy();
        await TokenInstance.deployed();

        const StoreFactory = await ethers.getContractFactory("CharacterStoreContract");
        StoreInstance = await StoreFactory.deploy();
        await StoreInstance.deployed();

        // --------------------------
        //   Setting up contracts
        // --------------------------
        defaultAdminHash = await StoreInstance.DEFAULT_ADMIN_ROLE();
        moderatorHash = await StoreInstance.MODERATOR_ROLE();

        await StoreInstance.init(
            defaultAdmin.address,
            moderator.address,
            vault.address,
            priceResolver.address,
            eldToken.address,
            tester1.address,
            TokenInstance.address,
            50,
            10                
        );

        character1Name = "Character 1";
        character1NameEncoded = ethers.utils.defaultAbiCoder.encode(["string"], [character1Name]);
        character1Hash = utils.hashMessage(character1Name);
        character1Price = utils.parseEther("0.1");
        character1Active = true;        

        character2Name = "Character 2";
        character2NameEncoded = ethers.utils.defaultAbiCoder.encode(["string"], [character2Name]);
        character2Hash = utils.hashMessage(character2Name);
        character2Price = utils.parseEther("0.5");
        character2Active = false;
    });
    it("setVaultAddress - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setVaultAddress(tester2.address)).to.be.reverted;
    });
    it("setVaultAddress - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setVaultAddress(vault.address)).to.be.revertedWith('Value is already set!');
    });
    it("setVaultAddress - Sucess", async function () {
        await StoreInstance.connect(moderator).setVaultAddress(tester2.address);
        expect(await StoreInstance.getVaultAddress()).to.equal(tester2.address);
    });

    it("setPriceResolverInstance - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setPriceResolverInstance(tester2.address)).to.be.reverted;
    });
    it("setPriceResolverInstance - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setPriceResolverInstance(priceResolver.address)).to.be.revertedWith('Value is already set!');
    });
    it("setPriceResolverInstance - Sucess", async function () {
        await StoreInstance.connect(moderator).setPriceResolverInstance(tester2.address);
        expect(await StoreInstance.getPriceResolverAddress()).to.equal(tester2.address);
    });

    it("setEldInstance - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setEldInstance(tester2.address)).to.be.reverted;
    });
    it("setEldInstance - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setEldInstance(eldToken.address)).to.be.revertedWith('Value is already set!');
    });
    it("setEldInstance - Sucess", async function () {
        await StoreInstance.connect(moderator).setEldInstance(tester2.address);
        expect(await StoreInstance.getEldTokenAddress()).to.equal(tester2.address);
    });

    it("setNftInstance - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setNftInstance(tester2.address)).to.be.reverted;
    });
    it("setNftInstance - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setNftInstance(tester1.address)).to.be.revertedWith('Value is already set!');
    });
    it("setNftInstance - Sucess", async function () {
        await StoreInstance.connect(moderator).setNftInstance(tester2.address);
        expect(await StoreInstance.getNftAddress()).to.equal(tester2.address);
    });

    it("setStableInstance - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setStableInstance(tester2.address)).to.be.reverted;
    });
    it("setStableInstance - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setStableInstance(TokenInstance.address)).to.be.revertedWith('Value is already set!');
    });
    it("setStableInstance - Sucess", async function () {
        await StoreInstance.connect(moderator).setStableInstance(tester2.address);
        expect(await StoreInstance.getStableAddress()).to.equal(tester2.address);
    });

    it("setEldDiscount - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setEldDiscount(9)).to.be.reverted;
    });
    it("setEldDiscount - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setEldDiscount(50)).to.be.revertedWith('Value is already set!');
    });
    it("setEldDiscount - Sucess", async function () {
        await StoreInstance.connect(moderator).setEldDiscount(9);
        expect(await StoreInstance.getEldDiscount()).to.equal(9);
    });

    it("setEldKickback - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setEldKickback(20)).to.be.reverted;
    });
    it("setEldKickback - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setEldKickback(10)).to.be.revertedWith('Value is already set!');
    });
    it("setEldKickback - Sucess", async function () {
        await StoreInstance.connect(moderator).setEldKickback(20);
        expect(await StoreInstance.getEldKickback()).to.equal(20);
    });

    it("setStoreActive - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).setStoreActive(true)).to.be.reverted;
    });
    it("setStoreActive - Fail if same value", async function () {
        await expect(StoreInstance.connect(moderator).setStoreActive(false)).to.be.revertedWith('Value is already set!');
    });
    it("setStoreActive - Sucess", async function () {
        await StoreInstance.connect(moderator).setStoreActive(true);
        expect(await StoreInstance.getStoreActive()).to.be.true;
    });

    it("setStoreActive - Fail if not called from moderator", async function () {
        await expect(StoreInstance.connect(tester1).addCharacter(character1Name, character1Hash, character1Price, character1Active)).to.be.reverted;
    });
    it("addCharacter - Fail if same value", async function () {        
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await expect(StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active)).to.be.revertedWith('Character is already avaliable!');
    });
    it("addCharacter - Sucess", async function () {        
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let characterData = await StoreInstance.getCharacter(character1Hash);
        expect(characterData.name).to.equal(character1Name);
        expect(characterData.characterHash).to.equal(character1Hash);
        expect(characterData.price.eq(character1Price)).to.be.true;
        expect(characterData.active).to.equal(character1Active);
    });

    it("editCharacter - Fail if not called from moderator", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await expect(StoreInstance.connect(tester1).editCharacter(character1Hash, CharacterParams.CHAR_NAME, character2NameEncoded)).to.be.reverted;
    });
    it("editCharacter - Fail if not exists", async function () {
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_NAME, character2NameEncoded)).to.be.revertedWith('Character does not exist!');
    });
    it("editCharacter Character Name - Fail if same value", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);    
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_NAME, character1NameEncoded)).to.be.revertedWith('Param is already set!');
    });
    it("editCharacter Character Name - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_NAME, character2NameEncoded);
        let characterData = await StoreInstance.getCharacter(character1Hash);
        expect(characterData.name).to.equal(character2Name);
        expect(characterData.characterHash).to.equal(character1Hash);
        expect(characterData.price.eq(character1Price)).to.be.true;
        expect(characterData.active).to.equal(character1Active);
    });

    it("editCharacter Character StoreId - Fail if same value", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter1StoreId = 0;
        let newCharacter1StoreIdEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [newCharacter1StoreId]);
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_STOREID, newCharacter1StoreIdEncoded)).to.be.revertedWith('Param is already set!');
    });
    it("editCharacter Character StoreId - New id is out of range!", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter2StoreId = 1;
        let newCharacter2StoreIdEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [newCharacter2StoreId]);
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_STOREID, newCharacter2StoreIdEncoded)).to.be.revertedWith('New id is out of range!');
    });
    it("editCharacter Character StoreId - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, character2Active);
        let newCharacter2StoreId = 1;
        let newCharacter2StoreIdEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [newCharacter2StoreId]);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_STOREID, newCharacter2StoreIdEncoded);
        let characterData = await StoreInstance.getCharacter(character1Hash);
        expect(characterData.name).to.equal(character1Name);
        expect(characterData.storeId).to.equal(newCharacter2StoreId);
        expect(characterData.characterHash).to.equal(character1Hash);
        expect(characterData.price.eq(character1Price)).to.be.true;
        expect(characterData.active).to.equal(character1Active);
    });

    it("editCharacter Character Hash - Character is already avaliable!", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, character2Active);
        let newCharacter2HashEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [character2Hash]);
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_HASH, newCharacter2HashEncoded)).to.be.revertedWith('Character is already avaliable!');
    });
    it("editCharacter Character Hash - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, character2Active);
        await StoreInstance.connect(moderator).removeCharacter(character2Hash);
        let newCharacter2HashEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [character2Hash]);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_HASH, newCharacter2HashEncoded);
        let characterData = await StoreInstance.getCharacter(character2Hash);
        expect(characterData.name).to.equal(character1Name);
        expect(characterData.characterHash).to.equal(character2Hash);
        expect(characterData.price.eq(character1Price)).to.be.true;
        expect(characterData.active).to.equal(character1Active);
    });

    it("editCharacter Character Price - Param is already set!", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter1PriceEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [character1Price]);
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_PRICE, newCharacter1PriceEncoded)).to.be.revertedWith('Param is already set!');
    });
    it("editCharacter Character Price - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter2PriceEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [character2Price]);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_PRICE, newCharacter2PriceEncoded);
        let characterData = await StoreInstance.getCharacter(character1Hash);
        expect(characterData.name).to.equal(character1Name);
        expect(characterData.characterHash).to.equal(character1Hash);
        expect(characterData.price.eq(character2Price)).to.be.true;
        expect(characterData.active).to.equal(character1Active);
    });

    it("editCharacter Character Active - Param is already set!", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter1ActiveEncoded = ethers.utils.defaultAbiCoder.encode(["bool"], [character1Active]);
        await expect(StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_ACTIVE, newCharacter1ActiveEncoded)).to.be.revertedWith('Param is already set!');
    });
    it("editCharacter Character Active - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        let newCharacter1ActiveEncoded = ethers.utils.defaultAbiCoder.encode(["bool"], [false]);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_ACTIVE, newCharacter1ActiveEncoded);
        let characterData = await StoreInstance.getCharacter(character1Hash);
        expect(characterData.name).to.equal(character1Name);
        expect(characterData.characterHash).to.equal(character1Hash);
        expect(characterData.price.eq(character1Price)).to.be.true;
        expect(characterData.active).to.be.false;
    });

    it("removeCharacter - Character class does not exist!", async function () {
        await expect(StoreInstance.connect(moderator).removeCharacter(character1Hash)).to.be.revertedWith('Character class does not exist!');
    });
    it("removeCharacter remove last - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).removeCharacter(character1Hash);
        await expect(StoreInstance.getCharacter(character1Hash)).to.be.revertedWith('Character class does not exist!');
    });
    it("removeCharacter remove first - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, !character2Active);
        await StoreInstance.connect(moderator).removeCharacter(character1Hash);
        await expect(StoreInstance.getCharacter(character1Hash)).to.be.revertedWith('Character does not exist!');
        // let characterData = await StoreInstance.getCharacter(character1Hash);
        // expect(characterData.name).to.be.empty;
        // expect(characterData.characterHash).to.equal(ethers.constants.Zero);
        // expect(characterData.price.eq(0)).to.be.true;
        // expect(characterData.active).to.be.false;

        characterData = await StoreInstance.getCharacter(character2Hash);
        expect(characterData.name).to.equal(character2Name);
        expect(characterData.storeId.eq(0)).to.be.true;
        expect(characterData.characterHash).to.equal(character2Hash);
        expect(characterData.price.eq(character2Price)).to.be.true;
        expect(characterData.active).to.be.true;
    });
    it("getCharacters - No records", async function () {
        let charactersData = await StoreInstance.getCharacters(1, 10, true);
        expect(charactersData.length).to.equal(0);

        let charactersData2 = await StoreInstance.getCharacters(1, 10, false);
        expect(charactersData2.length).to.equal(0);
    });
    it("getCharacters - Sucess", async function () {
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, character2Active);

        let charactersData = await StoreInstance.getCharacters(1, 10, true);
        expect(charactersData.length).to.equal(1);

        let charactersData2 = await StoreInstance.getCharacters(1, 10, false);
        expect(charactersData2.length).to.equal(2);
    });
});