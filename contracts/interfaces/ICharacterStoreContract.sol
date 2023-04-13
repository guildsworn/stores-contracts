// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface ICharacterStoreContract {
  struct CharacterData {
    string name;
    uint storeId;
    bytes32 characterHash;
    uint256 price;
    bool active;
    bool avaliable;
  }

  struct CharacterDataResult {
    string name;
    uint storeId;
    bytes32 characterHash;
    uint256 price;
    bool active;
  }

  enum CharacterParams {
    CHAR_NAME,
    CHAR_STOREID,
    CHAR_HASH,
    CHAR_PRICE,
    CHAR_ACTIVE
  }

  function MODERATOR_ROLE (  ) external view returns ( bytes32 );
  function addCharacter ( string memory name_, bytes32 characterHash_, uint256 price_, bool active_ ) external;
  function buyWithEld ( bytes32 characterHash_ ) external;
  function buyWithStable ( bytes32 characterHash_ ) external;
  function editCharacter ( bytes32 characterHash_, uint8 paramId_, bytes memory paramData_ ) external;
  function getAvaliableCharacters (  ) external view returns ( bytes32[] memory );
  function getCharacter ( bytes32 characterHash_ ) external view returns ( CharacterDataResult memory );
  function getCharacters(uint256 page_, uint256 pageSize_, bool activeOnly_) external view returns (CharacterDataResult[] memory);
  function getEldDiscount (  ) external view returns ( uint8 );
  function getEldKickback (  ) external view returns ( uint8 );
  function getEldTokenAddress (  ) external view returns ( address );
  function getNftAddress (  ) external view returns ( address );
  function getPriceResolverAddress (  ) external view returns ( address );
  function getStableAddress (  ) external view returns ( address );
  function getStoreActive (  ) external view returns ( bool );
  function getVaultAddress (  ) external view returns ( address );
  function init ( address defaultAdminAddress_, address moderatorAddress_, address vaultAddress_, address priceResolverAddress_, address eldAddress_, address nftAddress_, address stableAddress_, uint8 eldDiscount_, uint8 eldKickback_ ) external;
  function isInitialised (  ) external view returns ( bool );
  function killContract (  ) external;
  function removeCharacter ( bytes32 characterHash_ ) external;
  function salvageTokensFromContract ( address tokenAddress_, address to_, uint256 amount_ ) external;
  function setEldDiscount ( uint8 eldDiscount_ ) external;
  function setEldInstance ( address eldAddress_ ) external;
  function setEldKickback ( uint8 eldKickback_ ) external;
  function setNftInstance ( address nftAddress_ ) external;
  function setPriceResolverInstance ( address priceResolverAddress_ ) external;
  function setStableInstance ( address stableAddress_ ) external;
  function setStoreActive ( bool active_ ) external;
  function setVaultAddress ( address vaultAddress_ ) external;
}
