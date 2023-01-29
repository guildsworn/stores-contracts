// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@guildsworn/token-contracts/contracts/interfaces/ICharacterNftContract.sol";
import "@guildsworn/token-contracts/contracts/interfaces/IEldfallTokenContract.sol";
import "@guildsworn/priceresolver-contracts/contracts/interfaces/IPriceResolverContract.sol";

struct CharacterData {
	string name;
	uint storeId;
	bytes32 characterHash;
	uint256 price;
	bool active;
	bool avaliable;
}

enum CharacterParams {
	CHAR_NAME,
	CHAR_STOREID,
	CHAR_HASH,
	CHAR_PRICE,
	CHAR_ACTIVE
}

contract CharacterStoreContract is ReentrancyGuard, AccessControlEnumerable {
	using SafeERC20 for IERC20;
	using SafeERC20 for IEldfallTokenContract;

	bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

	IPriceResolverContract private _priceResolverInstance;
	IEldfallTokenContract private _eldInstance;
	ICharacterNftContract private _nftInstance;
	address private _vaultAddress;
	IERC20 private _stableInstance;

	uint8 private _eldDiscount;
	uint8 private _eldKickback;
	bool private _storeActive;
	bool private _initialised;

	bytes32[] private _avaliableCharacters;
	mapping(bytes32 => CharacterData) private _characterDataMap;

	constructor() {
		_grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	// **************************************************
	// *************** DEFAULT_ADMIN REGION *************
	// **************************************************
	function init(
		address defaultAdminAddress_,
		address moderatorAddress_,
		address vaultAddress_,
		address priceResolverAddress_,
		address eldAddress_,
		address nftAddress_,
		address stableAddress_,
		uint8 eldDiscount_,
		uint8 eldKickback_
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		require(!_initialised, "Contract is already initialised!");

		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdminAddress_);
		_grantRole(MODERATOR_ROLE, moderatorAddress_);

		_vaultAddress = vaultAddress_;
		_priceResolverInstance = IPriceResolverContract(
			priceResolverAddress_
		);
		_eldInstance = IEldfallTokenContract(eldAddress_);
		_nftInstance = ICharacterNftContract(nftAddress_);
		_stableInstance = IERC20(stableAddress_);
		_eldDiscount = eldDiscount_;
		_eldKickback = eldKickback_;
		_initialised = true;
		_revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	function salvageTokensFromContract(
		address tokenAddress_,
		address to_,
		uint amount_
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		bytes memory callPayload = abi.encodePacked(
			bytes4(keccak256(bytes("transfer(address,uint256)"))),
			abi.encode(to_, amount_)
		);
		(bool success, ) = address(tokenAddress_).call(callPayload);
		require(success, "Call failed!");
		emit TokensSalvaged(tokenAddress_, to_, amount_);
	}

	function killContract() public onlyRole(DEFAULT_ADMIN_ROLE) {
		emit ContractKilled();
		selfdestruct(payable(_msgSender()));
	}

	// **************************************************
	// ***************** MODERATOR REGION ***************
	// **************************************************
	function setVaultAddress(
		address vaultAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(_vaultAddress != vaultAddress_, "Value is already set!");
		emit VaultAddressChanged(_vaultAddress, vaultAddress_);
		_vaultAddress = vaultAddress_;
	}

	function setPriceResolverInstance(
		address priceResolverAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			address(_priceResolverInstance) != priceResolverAddress_,
			"Value is already set!"
		);
		emit PriceResolverInstanceChanged(
			address(_priceResolverInstance),
			priceResolverAddress_
		);
		_priceResolverInstance = IPriceResolverContract(
			priceResolverAddress_
		);
	}

	function setEldInstance(
		address eldAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(address(_eldInstance) != eldAddress_, "Value is already set!");
		emit EldInstanceChanged(address(_eldInstance), eldAddress_);
		_eldInstance = IEldfallTokenContract(eldAddress_);
	}

	function setNftInstance(
		address nftAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(address(_nftInstance) != nftAddress_, "Value is already set!");
		emit NftInstanceChanged(address(_nftInstance), nftAddress_);
		_nftInstance = ICharacterNftContract(nftAddress_);
	}

	function setStableInstance(
		address stableAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			address(_stableInstance) != stableAddress_,
			"Value is already set!"
		);
		emit StableInstanceChanged(address(_stableInstance), stableAddress_);
		_stableInstance = IERC20(stableAddress_);
	}

	function setEldDiscount(
		uint8 eldDiscount_
	) public onlyRole(MODERATOR_ROLE) {
		require(_eldDiscount != eldDiscount_, "Value is already set!");
		require(eldDiscount_ < 100, "Value must be lower than 100!");
		emit EldDiscountChanged(_eldDiscount, eldDiscount_);
		_eldDiscount = eldDiscount_;
	}

	function setEldKickback(
		uint8 eldKickback_
	) public onlyRole(MODERATOR_ROLE) {
		require(_eldKickback != eldKickback_, "Value is already set!");
		require(eldKickback_ < 100, "Value must be lower than 100!");
		emit EldKickbackChanged(_eldKickback, eldKickback_);
		_eldKickback = eldKickback_;
	}

	function setStoreActive(bool active_) public onlyRole(MODERATOR_ROLE) {
		require(_storeActive != active_, "Value is already set!");
		if (active_) {
			require(_initialised, "Contract is not initialised!");
		}
		emit StoreActiveChanged(_storeActive, active_);
		_storeActive = active_;
	}

	function addCharacter(
		string memory name_,
		bytes32 characterHash_,
		uint256 price_,
		bool active_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			!_characterDataMap[characterHash_].avaliable,
			"Character is already avaliable!"
		);
		_characterDataMap[characterHash_] = CharacterData(
			name_,
			_avaliableCharacters.length,
			characterHash_,
			price_,
			active_,
			true
		);
		_avaliableCharacters.push(characterHash_);
		emit CharacterAdded(characterHash_);
	}

	function editCharacter(
		bytes32 characterHash_,
		uint8 paramId_,
		bytes memory paramData_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			_characterDataMap[characterHash_].avaliable,
			"Character does not exist!"
		);

		if (paramId_ == uint256(CharacterParams.CHAR_NAME)) {
			string memory nameNewValue = abi.decode(paramData_, (string));
			bytes memory nameOldValue = abi.encode(
				_characterDataMap[characterHash_].name
			);
			require(
				keccak256(nameOldValue) != keccak256(paramData_),
				"Param is already set!"
			);
			emit CharacterDataUpdated(
				characterHash_,
				paramId_,
				nameOldValue,
				paramData_
			);
			_characterDataMap[characterHash_].name = nameNewValue;
		} else if (paramId_ == uint256(CharacterParams.CHAR_STOREID)) {
			uint256 storeIdNewValue = abi.decode(paramData_, (uint256));
			uint256 storeIdOldValue = _characterDataMap[characterHash_].storeId;
			require(
				storeIdNewValue < _avaliableCharacters.length,
				"New id is out of range!"
			);
			require(
				storeIdNewValue != storeIdOldValue,
				"Param is already set!"
			);
			bytes32 firstChar = _avaliableCharacters[storeIdNewValue];
			bytes32 secondChar = _avaliableCharacters[storeIdOldValue];

			emit CharacterDataUpdated(
				firstChar,
				paramId_,
				abi.encode(storeIdOldValue),
				paramData_
			);
			emit CharacterDataUpdated(
				secondChar,
				paramId_,
				paramData_,
				abi.encode(storeIdOldValue)
			);
			_avaliableCharacters[storeIdOldValue] = firstChar;
			_avaliableCharacters[storeIdNewValue] = secondChar;
			_characterDataMap[firstChar].storeId = storeIdOldValue;
			_characterDataMap[secondChar].storeId = storeIdNewValue;
		} else if (paramId_ == uint256(CharacterParams.CHAR_HASH)) {
			bytes32 charHashNewValue = abi.decode(paramData_, (bytes32));
			require(
				!_characterDataMap[charHashNewValue].avaliable,
				"Character is already avaliable!"
			);
			emit CharacterDataUpdated(
				characterHash_,
				paramId_,
				abi.encode(characterHash_),
				paramData_
			);
			_avaliableCharacters[
				_characterDataMap[characterHash_].storeId
			] = charHashNewValue;
			_characterDataMap[charHashNewValue] = _characterDataMap[
				characterHash_
			];
			_characterDataMap[charHashNewValue]
				.characterHash = charHashNewValue;
			delete _characterDataMap[characterHash_];
		} else if (paramId_ == uint256(CharacterParams.CHAR_PRICE)) {
			uint256 priceNewValue = abi.decode(paramData_, (uint256));
			require(
				priceNewValue != _characterDataMap[characterHash_].price,
				"Param is already set!"
			);
			emit CharacterDataUpdated(
				characterHash_,
				paramId_,
				paramData_,
				abi.encode(_characterDataMap[characterHash_].price)
			);
			_characterDataMap[characterHash_].price = priceNewValue;
		} else if (paramId_ == uint256(CharacterParams.CHAR_ACTIVE)) {
			bool activeNewValue = abi.decode(paramData_, (bool));
			require(
				_characterDataMap[characterHash_].active != activeNewValue,
				"Param is already set!"
			);
			emit CharacterDataUpdated(
				characterHash_,
				paramId_,
				paramData_,
				abi.encode(_characterDataMap[characterHash_].active)
			);
			_characterDataMap[characterHash_].active = activeNewValue;
		} else {
			revert("Param does not exist");
		}
	}

	function removeCharacter(
		bytes32 characterHash_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			_characterDataMap[characterHash_].avaliable,
			"Character does not exist!"
		);
		uint lastId = _avaliableCharacters.length - 1;
		if (_characterDataMap[characterHash_].storeId != lastId) {
			bytes32 lastCharacterHash = _avaliableCharacters[lastId];
			uint currentCharacterId = _characterDataMap[characterHash_].storeId;

			_avaliableCharacters[lastId] = characterHash_;
			_avaliableCharacters[currentCharacterId] = lastCharacterHash;
			_characterDataMap[characterHash_].storeId = lastId;
			_characterDataMap[lastCharacterHash].storeId = currentCharacterId;
			emit CharacterDataUpdated(
				characterHash_,
				1,
				abi.encode(currentCharacterId),
				abi.encode(lastId)
			);
		}
		_avaliableCharacters.pop();
		delete _characterDataMap[characterHash_];
		emit CharacterRemoved(characterHash_);
	}

	// **************************************************
	// ****************** PUBLIC REGION *****************
	// **************************************************
	function buyWithStable(bytes32 characterHash_) public nonReentrant {
		require(_storeActive, "Store is closed!");
		CharacterData memory currentCharacter = _characterDataMap[
			characterHash_
		];
		require(currentCharacter.avaliable, "Character does not exist!");
		require(currentCharacter.active, "Character is not active!");

		//_stableInstance.safeTransferFrom(_msgSender(), _vaultAddress, currentCharacter.price);
		SafeERC20.safeTransferFrom(
			_stableInstance,
			_msgSender(),
			_vaultAddress,
			currentCharacter.price
		);

		_nftInstance.safeMint(_msgSender(), characterHash_);

		emit CharacterBought(
			characterHash_,
			_msgSender(),
			address(_stableInstance),
			currentCharacter.price
		);

		uint256 oneToken = 1 * 10 ** _priceResolverInstance.getStableDecimals();
		uint256 stableToEldPrice = _priceResolverInstance.getStablePrice();
		uint256 tokenAmount = ((uint256(_eldKickback) * currentCharacter.price) / 100) *
			stableToEldPrice;
		tokenAmount = tokenAmount / oneToken;

		console.log("Character price: %s STABLE", currentCharacter.price);
		console.log("1 STABLE = %s ELD", stableToEldPrice);
		console.log("ELD kickback: %s", _eldKickback);
		console.log("Result of kickback: %s ELD", tokenAmount);

		if (tokenAmount > 0) {
			_eldInstance.safeMint(_msgSender(), tokenAmount);
		}
	}

	function buyWithEld(bytes32 characterHash_) public nonReentrant {
		require(_storeActive, "Store is closed!");
		CharacterData memory currentCharacter = _characterDataMap[
			characterHash_
		];
		require(currentCharacter.avaliable, "Character does not exist!");
		require(currentCharacter.active, "Character is not active!");

		uint eldldToStablePrice = _priceResolverInstance.getStablePrice();
		uint priceInEld = (((100 - _eldDiscount) * currentCharacter.price) /
			100) * eldldToStablePrice;
		//_eldInstance.safeTransferFrom(_msgSender(), _vaultAddress, priceInEld);
		SafeERC20.safeTransferFrom(
			IERC20(address(_eldInstance)),
			_msgSender(),
			_vaultAddress,
			priceInEld
		);
		_nftInstance.safeMint(_msgSender(), characterHash_);
		emit CharacterBought(
			characterHash_,
			_msgSender(),
			address(_eldInstance),
			priceInEld
		);

		uint tokenAmount = ((_eldKickback * priceInEld) / 100);
		_eldInstance.safeMint(_msgSender(), tokenAmount);
	}

	// **************************************************
	// ************** PUBLIC GETTERS REGION *************
	// **************************************************
	function getVaultAddress() public view returns (address) {
		return _vaultAddress;
	}

	function getPriceResolverAddress() public view returns (address) {
		return address(_priceResolverInstance);
	}

	function getEldTokenAddress() public view returns (address) {
		return address(_eldInstance);
	}

	function getNftAddress() public view returns (address) {
		return address(_nftInstance);
	}

	function getStableAddress() public view returns (address) {
		return address(_stableInstance);
	}

	function getEldDiscount() public view returns (uint8) {
		return _eldDiscount;
	}

	function getEldKickback() public view returns (uint8) {
		return _eldKickback;
	}

	function getStoreActive() public view returns (bool) {
		return _storeActive;
	}

	function getCharacter(
		bytes32 characterHash_
	) public view returns (CharacterData memory) {
		return _characterDataMap[characterHash_];
	}

	function getAvaliableCharacters() public view returns (bytes32[] memory) {
		return _avaliableCharacters;
	}

	function getAvaliableCharactersData()
		public
		view
		returns (CharacterData[] memory)
	{
		CharacterData[] memory answer = new CharacterData[](
			_avaliableCharacters.length
		);
		for (uint i = 0; i < _avaliableCharacters.length; i++) {
			answer[i] = _characterDataMap[_avaliableCharacters[i]];
		}
		return answer;
	}

	function isInitialised() public view returns (bool) {
		return _initialised;
	}

	// **************************************************
	// ****************** EVENTS REGION *****************
	// **************************************************
	event CharacterBought(
		bytes32 indexed characterHash,
		address indexed buyerAddress,
		address currency,
		uint price
	);

	event StoreActiveChanged(bool oldValue, bool newValue);
	event EldDiscountChanged(uint oldValue, uint newValue);
	event EldKickbackChanged(uint oldValue, uint newValue);

	event CharacterAdded(bytes32 indexed characterHash);
	event CharacterDataUpdated(
		bytes32 indexed characterHash,
		uint indexed paramId,
		bytes oldValue,
		bytes newValue
	);
	event CharacterRemoved(bytes32 indexed characterHash);

	event StableInstanceChanged(address oldValue, address newValue);
	event PriceResolverInstanceChanged(address oldValue, address newValue);
	event EldInstanceChanged(address oldValue, address newValue);
	event VaultAddressChanged(address oldValue, address newValue);
	event NftInstanceChanged(address oldValue, address newValue);
	event TokensSalvaged(
		address indexed tokenAddress,
		address indexed userAddress,
		uint amount
	);
	event ContractKilled();
}
