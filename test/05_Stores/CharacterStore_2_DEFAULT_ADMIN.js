const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

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

let TokenInstance;
let StoreInstance;

describe("CharacterStore_2_DEFAULT_ADMIN", function () {
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
            tester2.address,
            50,
            10                
        );
    });
    describe("Salvaging tokens", function () {
        let tokenAmount = ethers.utils.parseEther("1337");
        it("Should be able to salvage tokens", async function () {
            await TokenInstance.mint(StoreInstance.address, tokenAmount);
            expect(await TokenInstance.balanceOf(StoreInstance.address)).to.equal(tokenAmount);
            await StoreInstance.connect(defaultAdmin).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount);
            expect(await TokenInstance.balanceOf(StoreInstance.address)).to.equal("0");
            expect(await TokenInstance.balanceOf(defaultAdmin.address)).to.equal(tokenAmount);
        });
        it("Should fail if not called from default admin", async function () {
            await TokenInstance.mint(StoreInstance.address, tokenAmount);
            await expect(StoreInstance.connect(moderator).salvageTokensFromContract(TokenInstance.address, defaultAdmin.address, tokenAmount)).to.be.reverted;
        });
    });

    describe("Killing smart contract", function () {
        it("Should fail if not called from default admin", async function () {
            await expect(StoreInstance.connect(moderator).killContract()).to.be.reverted;
        });
        it("Should be able to kill the contract", async function () {
            await StoreInstance.connect(defaultAdmin).killContract();
        });
    });
});