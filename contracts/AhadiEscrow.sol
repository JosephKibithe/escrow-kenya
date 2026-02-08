// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol"; // H-3: Safer Ownership
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AhadiEscrowFinal
 * @notice Secured P2P escrow with fee-on-transfer support and strict validation
 * @author AHADI Protocol
 */
contract AhadiEscrowFinal is ReentrancyGuard, Ownable2Step, Pausable {
    using SafeERC20 for IERC20;

    // --- Custom Errors (G-3: Gas Optimization) ---
    error InvalidDealID();
    error Unauthorized();
    error DealClosed();
    error DealDisputed();
    error DealNotDisputed();
    error DealNotTimedOut();
    error InvalidState();
    error InvalidAmount();
    error InvalidAddress();
    error SelfDeal();
    error TimeoutRange();

    // --- Constants ---
    uint256 public constant MIN_TIMEOUT = 1 hours;
    uint256 public constant MAX_TIMEOUT = 365 days;
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant MIN_DEAL_AMOUNT = 1_000000; // 1 USDT (6 decimals)

    // --- State Variables ---
    uint256 public feeBasisPoints = 250; // 2.5%
    address public feeWallet;
    IERC20 public stablecoin;
    
    uint256 private _currentDealId;
    uint256 public totalLockedFunds;

    struct Deal {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        bool isCompleted;
        bool isDisputed;
        uint256 createdAt;
        uint256 expiryTime;
    }

    mapping(uint256 => Deal) public deals;

    // --- Events ---
    event Deposited(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount, uint256 timeoutInSeconds);
    event Released(uint256 indexed dealId, address indexed seller, uint256 netAmount, uint256 fee);
    event Refunded(uint256 indexed dealId, address indexed buyer, uint256 amount);
    event DisputeRaised(uint256 indexed dealId, address indexed disputer);
    event DisputeResolved(uint256 indexed dealId, address indexed winner, uint256 amount);
    event FeeUpdated(uint256 newFee);
    event FeeWalletUpdated(address indexed newWallet);
    event ExcessTokensRecovered(address indexed token, address indexed to, uint256 amount);

    // H-2: Strict Deal ID Validation
    modifier isValidDeal(uint256 _dealId) {
        if (_dealId == 0 || _dealId > _currentDealId) revert InvalidDealID();
        if (deals[_dealId].buyer == address(0)) revert InvalidDealID();
        _;
    }

    constructor(address _stablecoinAddress, address _feeWallet) {
        // M-4: Constructor Validation
        if (_stablecoinAddress == address(0)) revert InvalidAddress();
        if (_feeWallet == address(0)) revert InvalidAddress();
        
        stablecoin = IERC20(_stablecoinAddress);
        feeWallet = _feeWallet;
    }

    // ------------------------------------------------------------
    // USER FUNCTIONS
    // ------------------------------------------------------------

    function createDeal(address _seller, uint256 _amount, uint256 _timeoutSeconds) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 dealId)
    {
        if (_amount < MIN_DEAL_AMOUNT) revert InvalidAmount();
        if (_seller == msg.sender) revert SelfDeal();
        if (_seller == address(0)) revert InvalidAddress();
        if (_timeoutSeconds < MIN_TIMEOUT || _timeoutSeconds > MAX_TIMEOUT) revert TimeoutRange();

        // H-1: Fix Fee-on-Transfer Token Accounting
        uint256 balanceBefore = stablecoin.balanceOf(address(this));
        stablecoin.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 balanceAfter = stablecoin.balanceOf(address(this));
        uint256 actualAmount = balanceAfter - balanceBefore;

        if (actualAmount < MIN_DEAL_AMOUNT) revert InvalidAmount();

        _currentDealId++;
        dealId = _currentDealId;
        uint256 expiry = block.timestamp + _timeoutSeconds;

        deals[dealId] = Deal({
            id: dealId,
            buyer: msg.sender,
            seller: _seller,
            amount: actualAmount, // Use actual received amount
            isCompleted: false,
            isDisputed: false,
            createdAt: block.timestamp,
            expiryTime: expiry 
        });

        totalLockedFunds += actualAmount;
        emit Deposited(dealId, msg.sender, _seller, actualAmount, _timeoutSeconds);
    }

    function releaseFunds(uint256 _dealId) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        
        if (msg.sender != deal.buyer) revert Unauthorized();
        if (deal.isCompleted) revert DealClosed();
        if (deal.isDisputed) revert DealDisputed();

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        (uint256 payout, uint256 fee) = _payout(deal.seller, amount);
        emit Released(_dealId, deal.seller, payout, fee);
    }

    function refundBuyer(uint256 _dealId) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        
        if (msg.sender != deal.seller) revert Unauthorized();
        if (deal.isCompleted) revert DealClosed();
        if (deal.isDisputed) revert DealDisputed();

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        stablecoin.safeTransfer(deal.buyer, amount);
        emit Refunded(_dealId, deal.buyer, amount);
    }

    function refundTimedOutDeal(uint256 _dealId) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        
        if (deal.isCompleted) revert DealClosed();
        if (deal.isDisputed) revert DealDisputed();
        // M-1: Enforce Timeout Check
        if (block.timestamp <= deal.expiryTime) revert DealNotTimedOut();

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        stablecoin.safeTransfer(deal.buyer, amount);
        emit Refunded(_dealId, deal.buyer, amount);
    }

    function raiseDispute(uint256 _dealId) external isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        
        if (msg.sender != deal.buyer && msg.sender != deal.seller) revert Unauthorized();
        if (deal.isCompleted) revert DealClosed();
        if (deal.isDisputed) revert DealDisputed();

        deal.isDisputed = true;
        emit DisputeRaised(_dealId, msg.sender);
    }

    // ------------------------------------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------------------------------------

    // C-1: Fix Dispute Resolution Fee Logic
    function resolveDispute(uint256 _dealId, address _winner) external onlyOwner nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        
        if (!deal.isDisputed) revert DealNotDisputed();
        if (deal.isCompleted) revert DealClosed();
        if (_winner != deal.buyer && _winner != deal.seller) revert InvalidAddress();

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        deal.isDisputed = false;
        totalLockedFunds -= amount;

        // Apply fee ONLY if seller wins (Service was delivered)
        if (_winner == deal.seller) {
            (uint256 payout, uint256 fee) = _payout(_winner, amount);
            emit DisputeResolved(_dealId, _winner, payout);
        } else {
            // Full refund if buyer wins
            stablecoin.safeTransfer(_winner, amount);
            emit DisputeResolved(_dealId, _winner, amount);
        }
    }

    function updateFee(uint256 _newFee) external onlyOwner {
        if (_newFee > MAX_FEE) revert InvalidAmount();
        feeBasisPoints = _newFee;
        emit FeeUpdated(_newFee);
    }

    function updateFeeWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidAddress();
        feeWallet = _newWallet;
        emit FeeWalletUpdated(_newWallet);
    }

    function recoverExcessTokens(address _token, address _to) external onlyOwner nonReentrant {
        if (_to == address(0)) revert InvalidAddress();
        
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        
        if (_token == address(stablecoin)) {
            if (balance <= totalLockedFunds) revert InvalidAmount(); // No excess
            uint256 excess = balance - totalLockedFunds;
            token.safeTransfer(_to, excess);
            emit ExcessTokensRecovered(_token, _to, excess);
        } else {
            token.safeTransfer(_to, balance);
            emit ExcessTokensRecovered(_token, _to, balance);
        }
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ------------------------------------------------------------
    // VIEW FUNCTIONS
    // ------------------------------------------------------------
    
    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        return deals[_dealId];
    }
    
    function getContractStats() external view returns (uint256 totalDeals, uint256 locked, uint256 balance, uint256 excess) {
        totalDeals = _currentDealId;
        locked = totalLockedFunds;
        balance = stablecoin.balanceOf(address(this));
        excess = balance > locked ? balance - locked : 0;
    }

    // ------------------------------------------------------------
    // INTERNAL
    // ------------------------------------------------------------

    // M-2: Amount Validation in Payout
    function _payout(address _recipient, uint256 _amount) internal returns (uint256 payout, uint256 fee) {
        if (_amount == 0) revert InvalidAmount();
        
        fee = (_amount * feeBasisPoints) / 10000;
        payout = _amount - fee;
        
        stablecoin.safeTransfer(_recipient, payout);
        if (fee > 0) stablecoin.safeTransfer(feeWallet, fee);
    }
}