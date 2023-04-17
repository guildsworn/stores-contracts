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

describe("CharacterStore_4_PUBLIC", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, vault, signer, tester1, tester2, minter1] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("ERC20MockContract");
        TokenInstance = await TokenFactory.deploy();
        await TokenInstance.deployed();

        const StoreFactory = await ethers.getContractFactory("CharacterStoreContract");
        StoreInstance = await StoreFactory.deploy();
        await StoreInstance.deployed();

        const CharacterNftFactory = await ethers.getContractFactory("CharacterNftContract");
        CharacterNftInstance = await CharacterNftFactory.deploy();
        await CharacterNftInstance.deployed();

        const EldtokenFactory = await ethers.getContractFactory("EldfallTokenContract");
        EldTokenInstance = await EldtokenFactory.deploy();
        await EldTokenInstance.deployed();

        // Uniswapv2PairFactory = await ethers.getContractFactory("UniswapV2PairMockContract");
        // UniswapV2PairInstance = await Uniswapv2PairFactory.deploy();
        // await UniswapV2PairInstance.deployed();
        // await UniswapV2PairInstance.init(EldTokenInstance.address, TokenInstance.address, utils.parseEther("10000"), utils.parseEther("1000"));

        const PriceResolverFactory = await ethers.getContractFactory("PriceResolverOracleContract");
        PriceResolverInstance = await PriceResolverFactory.deploy();
        await PriceResolverInstance.deployed();
        // --------------------------
        //   Setting up contracts
        // --------------------------
        defaultAdminHash = await StoreInstance.DEFAULT_ADMIN_ROLE();
        moderatorHash = await StoreInstance.MODERATOR_ROLE();

        await PriceResolverInstance.init(
            defaultAdmin.address,
            moderator.address,
            EldTokenInstance.address,
            TokenInstance.address
        );
        await PriceResolverInstance.connect(moderator).setPrice(utils.parseEther("1"), utils.parseEther("10"));

        await StoreInstance.init(
            defaultAdmin.address,
            moderator.address,
            vault.address,
            PriceResolverInstance.address,
            EldTokenInstance.address,
            CharacterNftInstance.address,
            TokenInstance.address,
            50,
            10                
        );

        await CharacterNftInstance.init(
            defaultAdmin.address,
            moderator.address,
            vault.address,
            [minter1.address, StoreInstance.address],
            10
        );
        await EldTokenInstance.init(
            defaultAdmin.address,
            [minter1.address, StoreInstance.address]
        );

        character1Name = "Character 1";
        character1NameEncoded = ethers.utils.defaultAbiCoder.encode(["string"], [character1Name]);
        character1Hash = utils.hashMessage(character1Name);
        character1Price = utils.parseEther("0.1");
        character1Active = true;        
        await StoreInstance.connect(moderator).addCharacter(character1Name, character1Hash, character1Price, character1Active);

        character2Name = "Character 2";
        character2NameEncoded = ethers.utils.defaultAbiCoder.encode(["string"], [character2Name]);
        character2Hash = utils.hashMessage(character2Name);
        character2Price = utils.parseEther("0.5");
        character2Active = false;
        await StoreInstance.connect(moderator).addCharacter(character2Name, character2Hash, character2Price, character2Active);

        await StoreInstance.connect(moderator).setStoreActive(true);
    });
    it("buyWithStable - Fail if Store is closed!", async function () {
        await StoreInstance.connect(moderator).setStoreActive(false);
        await TokenInstance.connect(moderator).mint(tester1.address, character1Price);
        await TokenInstance.connect(tester1).approve(StoreInstance.address, character1Price);        

        await expect(StoreInstance.connect(tester1).buyWithStable(character1Hash)).to.be.revertedWith('Store is closed!');
    });
    it("buyWithStable - Fail Character does not exist!", async function () {
        await StoreInstance.connect(moderator).removeCharacter(character1Hash);
        await TokenInstance.connect(moderator).mint(tester1.address, character1Price);
        await TokenInstance.connect(tester1).approve(StoreInstance.address, character1Price);        

        await expect(StoreInstance.connect(tester1).buyWithStable(character1Hash)).to.be.revertedWith('Character does not exist!');
    });
    it("buyWithStable - Fail Character is not active!", async function () {
        let newCharacter1ActiveEncoded = ethers.utils.defaultAbiCoder.encode(["bool"], [false]);
        await StoreInstance.connect(moderator).editCharacter(character1Hash, CharacterParams.CHAR_ACTIVE, newCharacter1ActiveEncoded);
        await TokenInstance.connect(moderator).mint(tester1.address, character1Price);
        await TokenInstance.connect(tester1).approve(StoreInstance.address, character1Price);        

        await expect(StoreInstance.connect(tester1).buyWithStable(character1Hash)).to.be.revertedWith('Character is not active!');
    });
    it("buyWithStable - Sucess", async function () {
        await TokenInstance.connect(moderator).mint(tester1.address, character1Price);
        await TokenInstance.connect(tester1).approve(StoreInstance.address, character1Price);        

        await StoreInstance.connect(tester1).buyWithStable(character1Hash);
        expect(await TokenInstance.connect(tester1).balanceOf(vault.address)).to.equal(character1Price);
        expect(await CharacterNftInstance.connect(tester1).balanceOf(tester1.address)).to.equal(1);
        // Character price: 0.1 STABLE
        // 1 STABLE = 10 ELD
        // Kickback: 10
        // Result of kickback: 0.1 ELD
        expect(await EldTokenInstance.connect(tester1).balanceOf(tester1.address)).to.equal(utils.parseEther("0.1"));
    });
    it("buyWithStable - Many items list all", async function () {
        let charTotalPrice = character1Price.mul(5);
        await TokenInstance.connect(moderator).mint(tester1.address, charTotalPrice);
        await TokenInstance.connect(tester1).approve(StoreInstance.address, charTotalPrice);        

        for (let i = 0; i < 5; i++) {
            await StoreInstance.connect(tester1).buyWithStable(character1Hash);
        }

        let myChars = await CharacterNftInstance.connect(tester1).getCharactersByAccount(1, 10, tester1.address);
        expect(myChars.length).to.equal(5);
    });
});