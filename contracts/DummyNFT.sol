//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DummyNFT is ERC721 {
	uint public tokenIdIterator = 0;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {

	}

	function mint() public returns (uint tokenId) {
		tokenIdIterator++;
		_mint(msg.sender, tokenIdIterator);
		return (tokenIdIterator);
	}
}