//SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Waifuswap {

  	struct TradeOffer {
        address[] contracts1;
        uint[] items1;
        address[] contracts2;
        uint[] items2;
		address creatingParty;
		address otherParty;
		uint maxTime;
    }
	
	uint public tradeOffersIterator = 0;
	address public nullAddress = address(0);

	mapping(uint => TradeOffer) public tradeOffers;

	event tradeOfferCreated(address creatingParty, address otherParty, uint tradeOfferId);
	event tradeOfferCompleted(address creatingParty, address otherParty, uint tradeOfferId);

	function addOffer(address[] memory contracts1, uint[] memory items1, address[] memory contracts2, uint[] memory items2, address otherParty, uint maxTime) public {
		// There should be a lot of checks here but you can just do non critical checks off chain
		tradeOffersIterator++;
		uint currentTradeOfferId = tradeOffersIterator;

		TradeOffer storage newTradeOffer = tradeOffers[currentTradeOfferId];
		newTradeOffer.contracts1 = contracts1;
		newTradeOffer.items1 = items1;
		newTradeOffer.contracts2 = contracts2;
		newTradeOffer.items2 = items2;
		newTradeOffer.creatingParty = msg.sender;
		newTradeOffer.otherParty = otherParty;
		newTradeOffer.maxTime = maxTime;

		tradeOffers[currentTradeOfferId] = newTradeOffer;

		emit tradeOfferCreated(msg.sender, otherParty, currentTradeOfferId);
    }

	function removeOffer(uint tradeOfferId) public {
		require(tradeOffers[tradeOfferId].creatingParty == msg.sender, "msg.sender did not create this offer");
		delete tradeOffers[tradeOfferId];
	}

	function takeOffer(uint tradeOfferId) public {
		require(tradeOffers[tradeOfferId].contracts1.length == tradeOffers[tradeOfferId].items1.length && tradeOffers[tradeOfferId].contracts2.length == tradeOffers[tradeOfferId].items2.length, "non matching array lenghts");
		require(tradeOffers[tradeOfferId].maxTime > block.timestamp, "trade offer expired");
		require(msg.sender == tradeOffers[tradeOfferId].otherParty || tradeOffers[tradeOfferId].otherParty == nullAddress, "trade offer not for msg.sender");

		TradeOffer memory tradeOffer = tradeOffers[tradeOfferId];

		for (uint i=0; i<tradeOffer.contracts2.length; i++) {
			IERC721(tradeOffer.contracts2[i]).transferFrom(msg.sender, tradeOffer.creatingParty, tradeOffer.items2[i]);
		}
		
		for (uint i=0; i<tradeOffer.contracts1.length; i++) {
			IERC721(tradeOffer.contracts1[i]).transferFrom(tradeOffer.creatingParty, msg.sender, tradeOffer.items1[i]);
		}
		
		emit tradeOfferCompleted(tradeOffer.creatingParty, msg.sender, tradeOfferId);
	}
}
