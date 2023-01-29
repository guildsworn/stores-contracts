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

let StoreInstance;

describe("CharacterStore_1_Initialization", function () {
    beforeEach("deploy the contract instance first", async function () {
        [deployer, defaultAdmin, moderator, locker, eldToken, priceResolver, vault, signer, tester1, tester2] = await ethers.getSigners();

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
    describe("Initialization", function () {
        it("Check if init fails if it is called again", async function () {
            await expect(
                StoreInstance.init(
                    defaultAdmin.address,
                    moderator.address,
                    vault.address,
                    priceResolver.address,
                    eldToken.address,
                    tester1.address,
                    tester2.address,
                    50,
                    10                
                )
            ).to.be.reverted;
        });
        it("Check if contract is not active", async function () {
            expect(await StoreInstance.getStoreActive()).to.be.false;
        });
        it("Check if contract is Initialised", async function () {
            expect(await StoreInstance.isInitialised()).to.be.true;
        });
        it("Check if default admin was set to admin", async function () {
            expect(await StoreInstance.hasRole(defaultAdminHash, defaultAdmin.address)).to.be.true;
        });
        it("Check if deployer is not longer default admin", async function () {
            expect(await StoreInstance.hasRole(defaultAdminHash, deployer.address)).to.be.false;
        });
        it("Check if moderator was set to moderator", async function () {
            expect(await StoreInstance.hasRole(moderatorHash, moderator.address)).to.be.true;
        });
        it("Check if vault was set to vault", async function () {
            expect(await StoreInstance.getVaultAddress()).to.equal(vault.address);
        });
        it("Check if priceResolver was set to priceResolver", async function () {
            expect(await StoreInstance.getPriceResolverAddress()).to.equal(priceResolver.address);
        });        
        it("Check if eldToken was set to eldToken", async function () {
            expect(await StoreInstance.getEldTokenAddress()).to.equal(eldToken.address);
        });
        it("Check if NFTToken was set", async function () {
            expect(await StoreInstance.getNftAddress()).to.equal(tester1.address);
        });
        it("Check if Stable was set", async function () {
            expect(await StoreInstance.getStableAddress()).to.equal(tester2.address);
        });        
        it("Check if EldDiscount was set to 50", async function () {
            expect(await StoreInstance.getEldDiscount()).to.equal(50);
        });
        it("Check if EldKickback was set to 10", async function () {
            expect(await StoreInstance.getEldKickback()).to.equal(10);
        });
    });
});