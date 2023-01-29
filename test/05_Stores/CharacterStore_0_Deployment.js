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

describe("CharacterStore_0_Deployment", function () {
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
    });
    describe("Deployment", function () {
        it("Check if default admin was set to deployer", async function () {            
            expect(await StoreInstance.hasRole(defaultAdminHash, deployer.address)).to.be.true;
        });
        it("Check if contract is not Initialised", async function () {            
            expect(await StoreInstance.isInitialised()).to.be.false;
        });
        it("Check if contract is not active", async function () {
            expect(await StoreInstance.getStoreActive()).to.be.false;
        });
        it("Contract can't be activated until initialised", async function () {
            await StoreInstance.grantRole(moderatorHash, moderator.address);
            await expect(StoreInstance.connect(moderator).setStoreActive(true)).to.be.revertedWith('Contract is not initialised!');
        });
        it("Check if init fails if not called from defaulAdmin", async function () {
            await expect(
                StoreInstance.connect(tester1).init(
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
        it("Check if init goes through", async function () {
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
    });
});