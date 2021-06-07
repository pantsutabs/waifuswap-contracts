const { expect } = require("chai");
const { waffle } = require("hardhat");

describe("Successful trade test", function() {
  	it("Should complete a trade", async function() {
		const provider = waffle.provider;
		const [owner, addr1, addr2, addr3] = await ethers.getSigners();
		const addr1raw = await addr1.getAddress();
		const addr2raw = await addr2.getAddress();
		const addr3raw = await addr3.getAddress();
		const DummyNFT = await hre.ethers.getContractFactory("DummyNFT");
		const dummyNFT1 = await DummyNFT.deploy("DummyNFT1", "DUM1");
		const dummyNFT2 = await DummyNFT.deploy("DummyNFT2", "DUM2");
		const Waifuswap = await hre.ethers.getContractFactory("Waifuswap");
		const waifuswap = await Waifuswap.deploy();

		await dummyNFT1.deployed();
		await dummyNFT2.deployed();
		await waifuswap.deployed();

		// mint 2 DUM1s and 2 DUM2s for addr1, same for addr2
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();

		// addr1 and addr2 will give approvals to waifuswap
		await dummyNFT1.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT1.connect(addr2).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlockTx = await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlock = await provider.getBlock(tempBlockTx.blockNumber);

		// create a trade offer, addr1 will offer its 2 DUM1s, and 1 DUM2, for addr2's 2 DUM2s and 1 DUM1
		await waifuswap.connect(addr1).addOffer(
			[dummyNFT1.address, dummyNFT1.address, dummyNFT2.address],
			[1,2,1],
			[dummyNFT2.address, dummyNFT2.address, dummyNFT1.address],
			[3,4,3],
			"0x0000000000000000000000000000000000000000",
			tempBlock.timestamp + 60
		);

		// addr2 will take the trade
		await waifuswap.connect(addr2).takeOffer(1);

		// varify that addr1 has 1 DUM1, 3 DUM2s, and addr2 has 3 DUM1s, and 1 DUM2
		let balance_addr1_dum1 = await dummyNFT1.balanceOf(addr1raw);
		let balance_addr1_dum2 = await dummyNFT2.balanceOf(addr1raw);
		let balance_addr2_dum1 = await dummyNFT1.balanceOf(addr2raw);
		let balance_addr2_dum2 = await dummyNFT2.balanceOf(addr2raw);

		expect(await dummyNFT1.balanceOf(addr1raw)).to.equal(ethers.BigNumber.from("1"));
		expect(await dummyNFT2.balanceOf(addr1raw)).to.equal(ethers.BigNumber.from("3"));
		expect(await dummyNFT1.balanceOf(addr2raw)).to.equal(ethers.BigNumber.from("3"));
		expect(await dummyNFT2.balanceOf(addr2raw)).to.equal(ethers.BigNumber.from("1"));
  	});
});

describe("Failed trades test", function() {
  	it("Should fail on lacking approvals", async function() {
	  	const provider = waffle.provider;
		const [owner, addr1, addr2, addr3] = await ethers.getSigners();
		const addr1raw = await addr1.getAddress();
		const addr2raw = await addr2.getAddress();
		const addr3raw = await addr3.getAddress();
		const DummyNFT = await hre.ethers.getContractFactory("DummyNFT");
		const dummyNFT1 = await DummyNFT.deploy("DummyNFT1", "DUM1");
		const dummyNFT2 = await DummyNFT.deploy("DummyNFT2", "DUM2");
		const Waifuswap = await hre.ethers.getContractFactory("Waifuswap");
		const waifuswap = await Waifuswap.deploy();

		await dummyNFT1.deployed();
		await dummyNFT2.deployed();
		await waifuswap.deployed();

		// mint 2 DUM1s and 2 DUM2s for addr1, same for addr2
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();

		// addr1 and addr2 will give approvals to waifuswap
		await dummyNFT1.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr1).setApprovalForAll(waifuswap.address, true);
		//await dummyNFT1.connect(addr2).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlockTx = await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlock = await provider.getBlock(tempBlockTx.blockNumber);

		// create a trade offer, addr1 will offer its 2 DUM1s, and 1 DUM2, for addr2's 2 DUM2s and 1 DUM1
		await waifuswap.connect(addr1).addOffer(
			[dummyNFT1.address, dummyNFT1.address, dummyNFT2.address],
			[1,2,1],
			[dummyNFT2.address, dummyNFT2.address, dummyNFT1.address],
			[3,4,3],
			"0x0000000000000000000000000000000000000000",
			tempBlock.timestamp + 60
		);

		// addr2 will take the trade
		await expect(waifuswap.connect(addr2).takeOffer(1)).to.be.reverted;
		});
	it("Should fail on wrong other party", async function() {
		const provider = waffle.provider;
		const [owner, addr1, addr2, addr3] = await ethers.getSigners();
		const addr1raw = await addr1.getAddress();
		const addr2raw = await addr2.getAddress();
		const addr3raw = await addr3.getAddress();
		const DummyNFT = await hre.ethers.getContractFactory("DummyNFT");
		const dummyNFT1 = await DummyNFT.deploy("DummyNFT1", "DUM1");
		const dummyNFT2 = await DummyNFT.deploy("DummyNFT2", "DUM2");
		const Waifuswap = await hre.ethers.getContractFactory("Waifuswap");
		const waifuswap = await Waifuswap.deploy();

		await dummyNFT1.deployed();
		await dummyNFT2.deployed();
		await waifuswap.deployed();

		// mint 2 DUM1s and 2 DUM2s for addr1, same for addr2
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();

		// addr1 and addr2 will give approvals to waifuswap
		await dummyNFT1.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr1).setApprovalForAll(waifuswap.address, true);
		//await dummyNFT1.connect(addr2).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlockTx = await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlock = await provider.getBlock(tempBlockTx.blockNumber);

		// create a trade offer, addr1 will offer its 2 DUM1s, and 1 DUM2, for addr2's 2 DUM2s and 1 DUM1
		await waifuswap.connect(addr1).addOffer(
			[dummyNFT1.address, dummyNFT1.address, dummyNFT2.address],
			[1,2,1],
			[dummyNFT2.address, dummyNFT2.address, dummyNFT1.address],
			[3,4,3],
			addr3raw,
			tempBlock.timestamp + 60
		);

		// addr2 will take the trade
		await expect(waifuswap.connect(addr2).takeOffer(1)).to.be.reverted;
	});
	it("Should fail on wrong inventory", async function() {
		const provider = waffle.provider;
		const [owner, addr1, addr2, addr3] = await ethers.getSigners();
		const addr1raw = await addr1.getAddress();
		const addr2raw = await addr2.getAddress();
		const addr3raw = await addr3.getAddress();
		const DummyNFT = await hre.ethers.getContractFactory("DummyNFT");
		const dummyNFT1 = await DummyNFT.deploy("DummyNFT1", "DUM1");
		const dummyNFT2 = await DummyNFT.deploy("DummyNFT2", "DUM2");
		const Waifuswap = await hre.ethers.getContractFactory("Waifuswap");
		const waifuswap = await Waifuswap.deploy();

		await dummyNFT1.deployed();
		await dummyNFT2.deployed();
		await waifuswap.deployed();

		// mint 2 DUM1s and 2 DUM2s for addr1, same for addr2
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();

		// extra NFTs for addr3
		await dummyNFT1.connect(addr3).mint();
		await dummyNFT1.connect(addr3).mint();

		// addr1 and addr2 will give approvals to waifuswap
		await dummyNFT1.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr1).setApprovalForAll(waifuswap.address, true);
		//await dummyNFT1.connect(addr2).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlockTx = await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlock = await provider.getBlock(tempBlockTx.blockNumber);

		// create a trade offer, addr1 will offer its 2 DUM1s, and 1 DUM2, for addr2's 2 DUM2s and 1 DUM1
		await waifuswap.connect(addr1).addOffer(
			[dummyNFT1.address, dummyNFT1.address, dummyNFT2.address],
			[1,5,1],
			[dummyNFT2.address, dummyNFT2.address, dummyNFT1.address],
			[3,4,3],
			"0x0000000000000000000000000000000000000000",
			tempBlock.timestamp + 60
		);

		// addr2 will take the trade
		await expect(waifuswap.connect(addr2).takeOffer(1)).to.be.reverted;
	});
	it("Should fail on trade time out", async function() {
		const provider = waffle.provider;
		const [owner, addr1, addr2, addr3] = await ethers.getSigners();
		const addr1raw = await addr1.getAddress();
		const addr2raw = await addr2.getAddress();
		const addr3raw = await addr3.getAddress();
		const DummyNFT = await hre.ethers.getContractFactory("DummyNFT");
		const dummyNFT1 = await DummyNFT.deploy("DummyNFT1", "DUM1");
		const dummyNFT2 = await DummyNFT.deploy("DummyNFT2", "DUM2");
		const Waifuswap = await hre.ethers.getContractFactory("Waifuswap");
		const waifuswap = await Waifuswap.deploy();

		await dummyNFT1.deployed();
		await dummyNFT2.deployed();
		await waifuswap.deployed();

		// mint 2 DUM1s and 2 DUM2s for addr1, same for addr2
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT1.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT2.connect(addr1).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT1.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();
		await dummyNFT2.connect(addr2).mint();

		// addr1 and addr2 will give approvals to waifuswap
		await dummyNFT1.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr1).setApprovalForAll(waifuswap.address, true);
		await dummyNFT1.connect(addr2).setApprovalForAll(waifuswap.address, true);
		await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlockTx = await dummyNFT2.connect(addr2).setApprovalForAll(waifuswap.address, true);
		let tempBlock = await provider.getBlock(tempBlockTx.blockNumber);

		// create a trade offer, addr1 will offer its 2 DUM1s, and 1 DUM2, for addr2's 2 DUM2s and 1 DUM1
		await waifuswap.connect(addr1).addOffer(
			[dummyNFT1.address, dummyNFT1.address, dummyNFT2.address],
			[1,2,1],
			[dummyNFT2.address, dummyNFT2.address, dummyNFT1.address],
			[3,4,3],
			"0x0000000000000000000000000000000000000000",
			tempBlock.timestamp - 60
		);

		// addr2 will take the trade
		await expect(waifuswap.connect(addr2).takeOffer(1)).to.be.reverted;
	});
});
