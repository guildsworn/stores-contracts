// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract PriceResolverMockContract  {
	uint256 private _tokenPrice; // How much cost 1 ELD token in stable tokens
	uint256 private _stablePrice; // How much cost 1 stable token in ELD tokens

	constructor() {
	}

	/// @notice Calculate how much cost 1 ELD token in stable tokens
	function getTokenPrice() public view returns (uint256) {
		return _tokenPrice;
	}

	/// @notice Calculate how much cost 1 stable token in ELD tokens
	function getStablePrice() public view returns (uint256) {
		return _stablePrice;	
	}

	function setTokenPrice(uint256 tokenPrice_) public {		
		_tokenPrice = tokenPrice_;
	}

    function setStablePrice(uint256 stablePrice_) public {
        _stablePrice = stablePrice_;
    }

	function setPrice(uint256 tokenPrice_, uint256 stablePrice_) public {
		setTokenPrice(tokenPrice_);
		setStablePrice(stablePrice_);
	}
}
