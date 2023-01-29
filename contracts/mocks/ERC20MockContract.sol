// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract ERC20MockContract is ERC20 {
	constructor() ERC20("MockToken", "MCK") {}

	function mint(address to_, uint256 amount_) public {
		_mint(to_, amount_);
	}

	function init(address[] memory tos_, uint[] memory amounts) public {
		for (uint i = 0; i < tos_.length; i++) {
			_mint(tos_[i], amounts[i]);
		}
	}
}
