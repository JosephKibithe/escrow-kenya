// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AhadiEscrow is ReentrancyGuard, Ownable {
    
    // Fee: 2.5% (250 basis points)
    uint256 public feeBasisPoints = 250; 
    address public feeWallet; 
    
    // The Token (USDT on Polygon)
    IERC20 public stablecoin;

    struct Deal {
        address buyer;
        address seller;
        uint256 amount;
        bool isCompleted;
        bool isDisputed;
    }

    mapping(uint256 => Deal) public deals;

    event Deposited(uint256 indexed dealId, address indexed buyer, uint256 amount);
    event Released(uint256 indexed dealId, address indexed seller, uint256 netAmount, uint256 feeTaken);
    event DisputeRaised(uint256 indexed dealId, address indexed disputer);
    event DisputeResolved(uint256 indexed dealId, address winner, uint256 amount);

    constructor(address _stablecoinAddress, address _feeWallet) {
        stablecoin = IERC20(_stablecoinAddress);
        feeWallet = _feeWallet;
    }

    // 1. BUYER DEPOSITS
    function createDeal(uint256 _dealId, address _seller, uint256 _amount) external nonReentrant {
        require(deals[_dealId].amount == 0, "Deal ID exists");
        require(_amount > 0, "Amount must be > 0");

        // Transfer funds from Buyer to Contract
        require(stablecoin.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        deals[_dealId] = Deal({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            isCompleted: false,
            isDisputed: false
        });

        emit Deposited(_dealId, msg.sender, _amount);
    }

    // 2. RELEASE FUNDS
    function releaseFunds(uint256 _dealId) external nonReentrant {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.buyer, "Only Buyer can release");
        require(!deal.isCompleted, "Deal closed");
        require(!deal.isDisputed, "Deal in dispute");

        deal.isCompleted = true;

        uint256 fee = (deal.amount * feeBasisPoints) / 10000;
        uint256 payout = deal.amount - fee;

        require(stablecoin.transfer(deal.seller, payout), "Transfer to seller failed");
        require(stablecoin.transfer(feeWallet, fee), "Fee transfer failed");

        emit Released(_dealId, deal.seller, payout, fee);
    }

    // 3. RAISE DISPUTE
    function raiseDispute(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.buyer || msg.sender == deal.seller, "Not involved");
        require(!deal.isCompleted, "Deal closed");
        deal.isDisputed = true;
        emit DisputeRaised(_dealId, msg.sender);
    }

    // 4. ADMIN RESOLVE
    function resolveDispute(uint256 _dealId, address _winner) external onlyOwner nonReentrant {
        Deal storage deal = deals[_dealId];
        require(deal.isDisputed, "Not disputed");
        require(!deal.isCompleted, "Deal closed");

        deal.isCompleted = true;
        deal.isDisputed = false;

        require(stablecoin.transfer(_winner, deal.amount), "Transfer failed");
        emit DisputeResolved(_dealId, _winner, deal.amount);
    }
}