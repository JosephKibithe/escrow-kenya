// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AhadiEscrowFinal
 * @notice Secured P2P escrow with seller protection and dispute deposit system
 * @author AHADI Protocol
 */
contract AhadiEscrowFinal is ReentrancyGuard, Ownable2Step, Pausable {
    using SafeERC20 for IERC20;

    // --- Custom Errors ---
    error InvalidDealID();
    error Unauthorized();
    error DealClosed();
    error DealDisputed();
    error DealNotDisputed();
    error DealNotTimedOut();
    error SellerWarningPeriodActive();
    error DisputeDeadlinePassed();
    error InvalidAmount();
    error InvalidAddress();
    error SelfDeal();
    error TimeoutRange();
    error ExceedsMaxAmount();

    // --- Constants ---
    uint256 public constant MIN_TIMEOUT = 1 hours;
    uint256 public constant MAX_TIMEOUT = 365 days;
    uint256 public constant MAX_FEE = 1000;
    uint256 public constant MIN_DEAL_AMOUNT = 1_000000;
    uint256 public constant SELLER_WARNING_PERIOD = 7 days;

    // --- State Variables ---
    uint16 public feeBasisPoints = 250;
    uint128 public disputeDepositAmount = 5_000000;
    address public feeWallet;
    IERC20 public stablecoin;
    uint96 private _currentDealId;
    uint256 public totalLockedFunds;

    // --- Struct ---
    struct Deal {
        address buyer;
        uint64 createdAt;
        uint16 feeBasisPoints;
        bool isCompleted;
        bool isDisputed;
        address seller;
        uint64 expiryTime;
        bool buyerApprovedCancel;
        bool sellerApprovedCancel;
        bool buyerRequestedCancel;
        bool refundClaimed;
        address disputer;
        uint96 id;
        uint128 amount;
        uint128 disputeDeposit;
    }

    mapping(uint256 => Deal) public deals;

    // --- Events ---
    event Deposited(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 amount, uint256 timeoutInSeconds);
    event Released(uint256 indexed dealId, address indexed seller, uint256 netAmount, uint256 fee);
    event Refunded(uint256 indexed dealId, address indexed buyer, uint256 amount);
    event DisputeRaised(uint256 indexed dealId, address indexed disputer, uint256 depositAmount);
    event DisputeResolved(uint256 indexed dealId, address indexed winner, uint256 amount, bool disputerWon);
    event DisputeCancelApproved(uint256 indexed dealId, address indexed approver);
    event DisputeCancelled(uint256 indexed dealId, address indexed disputer, uint256 depositReturned);
    event RefundClaimed(uint256 indexed dealId, address indexed buyer, uint256 amount);
    event CancelRequested(uint256 indexed dealId, address indexed buyer);
    event FeeUpdated(uint256 newFee);
    event FeeWalletUpdated(address indexed newWallet);
    event DisputeDepositUpdated(uint256 newAmount);
    event ExcessTokensRecovered(address indexed token, address indexed to, uint256 amount);

    // --- Modifiers ---
    modifier isValidDeal(uint256 _dealId) {
        if (_dealId == 0 || _dealId > _currentDealId) revert InvalidDealID();
        if (deals[_dealId].buyer == address(0)) revert InvalidDealID();
        _;
    }

    constructor(address _stablecoinAddress, address _feeWallet) Ownable(msg.sender) {
        if (_stablecoinAddress == address(0)) revert InvalidAddress();
        if (_feeWallet == address(0)) revert InvalidAddress();
        stablecoin = IERC20(_stablecoinAddress);
        feeWallet = _feeWallet;
    }

    // ============================================================
    // USER FUNCTIONS
    // ============================================================

    function createDeal(address _seller, uint256 _amount, uint256 _timeoutSeconds) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256)
    {
        if (_amount < MIN_DEAL_AMOUNT) revert InvalidAmount();
        if (_seller == msg.sender) revert SelfDeal();
        if (_seller == address(0)) revert InvalidAddress();
        if (_timeoutSeconds < MIN_TIMEOUT || _timeoutSeconds > MAX_TIMEOUT) revert TimeoutRange();

        uint256 balBefore = stablecoin.balanceOf(address(this));
        stablecoin.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 actualAmount = stablecoin.balanceOf(address(this)) - balBefore;

        if (actualAmount < MIN_DEAL_AMOUNT) revert InvalidAmount();
        if (actualAmount > type(uint128).max) revert ExceedsMaxAmount();

        unchecked { _currentDealId++; }
        uint256 dealId = _currentDealId;

        Deal storage d = deals[dealId];
        d.buyer = msg.sender;
        d.seller = _seller;
        d.amount = uint128(actualAmount);
        d.createdAt = uint64(block.timestamp);
        d.expiryTime = uint64(block.timestamp + _timeoutSeconds);
        d.feeBasisPoints = feeBasisPoints;
        d.id = uint96(dealId);

        totalLockedFunds += actualAmount;
        emit Deposited(dealId, msg.sender, _seller, actualAmount, _timeoutSeconds);
        return dealId;
    }

    function releaseFunds(uint256 _dealId) external nonReentrant whenNotPaused isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (msg.sender != d.buyer) revert Unauthorized();
        if (d.isCompleted) revert DealClosed();
        if (d.isDisputed) revert DealDisputed();

        d.isCompleted = true;
        uint256 amt = d.amount;
        totalLockedFunds -= amt;

        uint256 fee = (amt * d.feeBasisPoints) / 10000;
        uint256 payout = amt - fee;
        
        stablecoin.safeTransfer(d.seller, payout);
        if (fee > 0) stablecoin.safeTransfer(feeWallet, fee);
        
        emit Released(_dealId, d.seller, payout, fee);
    }

    function refundBuyer(uint256 _dealId) external nonReentrant whenNotPaused isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (msg.sender != d.seller) revert Unauthorized();
        if (d.isCompleted) revert DealClosed();
        if (d.isDisputed) revert DealDisputed();

        d.isCompleted = true;
        uint256 amt = d.amount;
        totalLockedFunds -= amt;

        stablecoin.safeTransfer(d.buyer, amt);
        emit Refunded(_dealId, d.buyer, amt);
    }

    function requestCancelDeal(uint256 _dealId) external nonReentrant whenNotPaused isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (msg.sender != d.buyer) revert Unauthorized();
        if (d.isCompleted) revert DealClosed();
        if (d.isDisputed) revert DealDisputed();

        d.buyerRequestedCancel = true;
        emit CancelRequested(_dealId, msg.sender);
    }

    function claimRefund(uint256 _dealId) external nonReentrant whenNotPaused isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (msg.sender != d.buyer) revert Unauthorized();
        if (d.isCompleted) revert DealClosed();
        if (d.isDisputed) revert DealDisputed();
        if (block.timestamp <= d.expiryTime) revert DealNotTimedOut();
        if (block.timestamp <= d.expiryTime + SELLER_WARNING_PERIOD) revert SellerWarningPeriodActive();

        d.isCompleted = true;
        d.refundClaimed = true;
        uint256 amt = d.amount;
        totalLockedFunds -= amt;

        stablecoin.safeTransfer(d.buyer, amt);
        emit RefundClaimed(_dealId, d.buyer, amt);
    }

    function raiseDispute(uint256 _dealId) external nonReentrant whenNotPaused isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (msg.sender != d.buyer && msg.sender != d.seller) revert Unauthorized();
        if (d.isCompleted) revert DealClosed();
        if (d.isDisputed) revert DealDisputed();
        
        if (block.timestamp > d.expiryTime) {
            if (block.timestamp > d.expiryTime + SELLER_WARNING_PERIOD) revert DisputeDeadlinePassed();
        }

        uint256 actualDep = 0;
        if (disputeDepositAmount > 0) {
            uint256 balBefore = stablecoin.balanceOf(address(this));
            stablecoin.safeTransferFrom(msg.sender, address(this), disputeDepositAmount);
            actualDep = stablecoin.balanceOf(address(this)) - balBefore;
            
            if (actualDep < (uint256(disputeDepositAmount) * 95) / 100) revert InvalidAmount();
            if (actualDep > type(uint128).max) revert ExceedsMaxAmount();
            totalLockedFunds += actualDep;
        }
        
        d.isDisputed = true;
        d.disputer = msg.sender;
        d.disputeDeposit = uint128(actualDep);
        
        emit DisputeRaised(_dealId, msg.sender, actualDep);
    }

    function approveCancelDispute(uint256 _dealId) external nonReentrant isValidDeal(_dealId) {
        Deal storage d = deals[_dealId];
        if (!d.isDisputed) revert DealNotDisputed();
        if (d.isCompleted) revert DealClosed();
        if (msg.sender != d.buyer && msg.sender != d.seller) revert Unauthorized();

        if (msg.sender == d.buyer) {
            d.buyerApprovedCancel = true;
        } else {
            d.sellerApprovedCancel = true;
        }

        emit DisputeCancelApproved(_dealId, msg.sender);

        if (d.buyerApprovedCancel && d.sellerApprovedCancel) {
            _cancelDispute(_dealId);
        }
    }

    // ============================================================
    // ADMIN FUNCTIONS
    // ============================================================

    function resolveDispute(uint256 _dealId, address _winner) 
        external 
        onlyOwner 
        nonReentrant 
        isValidDeal(_dealId) 
    {
        Deal storage d = deals[_dealId];
        if (!d.isDisputed) revert DealNotDisputed();
        if (d.isCompleted) revert DealClosed();
        if (_winner != d.buyer && _winner != d.seller) revert InvalidAddress();

        d.isCompleted = true;
        d.isDisputed = false;
        
        uint256 amt = d.amount;
        uint256 dep = d.disputeDeposit;
        totalLockedFunds -= (amt + dep);

        if (_winner == d.seller) {
            _payoutSeller(d, amt, dep);
        } else {
            _payoutBuyer(d, amt, dep);
        }
    }

    function updateFee(uint16 _newFee) external onlyOwner {
        if (_newFee > MAX_FEE) revert InvalidAmount();
        feeBasisPoints = _newFee;
        emit FeeUpdated(_newFee);
    }

    function updateFeeWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidAddress();
        feeWallet = _newWallet;
        emit FeeWalletUpdated(_newWallet);
    }

    function updateDisputeDeposit(uint128 _newAmount) external onlyOwner {
        disputeDepositAmount = _newAmount;
        emit DisputeDepositUpdated(_newAmount);
    }

    function recoverExcessTokens(address _token, address _to) external onlyOwner nonReentrant {
        if (_to == address(0)) revert InvalidAddress();
        IERC20 token = IERC20(_token);
        uint256 bal = token.balanceOf(address(this));
        
        if (_token == address(stablecoin)) {
            if (bal <= totalLockedFunds) revert InvalidAmount();
            uint256 excess = bal - totalLockedFunds;
            token.safeTransfer(_to, excess);
            emit ExcessTokensRecovered(_token, _to, excess);
        } else {
            token.safeTransfer(_to, bal);
            emit ExcessTokensRecovered(_token, _to, bal);
        }
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================
    
    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        return deals[_dealId];
    }
    
    function getContractStats() external view returns (uint256, uint256, uint256, uint256) {
        uint256 bal = stablecoin.balanceOf(address(this));
        uint256 excess = bal > totalLockedFunds ? bal - totalLockedFunds : 0;
        return (_currentDealId, totalLockedFunds, bal, excess);
    }

    function canClaimRefund(uint256 _dealId) external view returns (bool, uint256) {
        Deal storage d = deals[_dealId];
        if (d.buyer == address(0) || d.isCompleted || d.isDisputed || d.refundClaimed) {
            return (false, 0);
        }
        uint256 claimTime = d.expiryTime + SELLER_WARNING_PERIOD;
        if (block.timestamp > claimTime) {
            return (true, 0);
        }
        return (false, claimTime - block.timestamp);
    }

    // ============================================================
    // INTERNAL FUNCTIONS
    // ============================================================

    function _payoutSeller(Deal storage d, uint256 amt, uint256 dep) private {
        uint256 fee = (amt * d.feeBasisPoints) / 10000;
        uint256 payout = amt - fee;
        bool won = (d.seller == d.disputer);
        
        stablecoin.safeTransfer(d.seller, payout);
        if (fee > 0) stablecoin.safeTransfer(feeWallet, fee);
        
        if (won && dep > 0) {
            stablecoin.safeTransfer(d.seller, dep);
        } else if (dep > 0) {
            stablecoin.safeTransfer(feeWallet, dep);
        }
        
        emit DisputeResolved(d.id, d.seller, payout, won);
    }

    function _payoutBuyer(Deal storage d, uint256 amt, uint256 dep) private {
        bool won = (d.buyer == d.disputer);
        
        stablecoin.safeTransfer(d.buyer, amt);
        
        if (won && dep > 0) {
            stablecoin.safeTransfer(d.buyer, dep);
        } else if (dep > 0) {
            stablecoin.safeTransfer(feeWallet, dep);
        }
        
        emit DisputeResolved(d.id, d.buyer, amt, won);
    }

    function _cancelDispute(uint256 _dealId) private {
        Deal storage d = deals[_dealId];
        uint256 dep = d.disputeDeposit;
        address disp = d.disputer;
        
        d.isDisputed = false;
        d.buyerApprovedCancel = false;
        d.sellerApprovedCancel = false;
        
        if (dep > 0) {
            totalLockedFunds -= dep;
            stablecoin.safeTransfer(disp, dep);
        }
        
        emit DisputeCancelled(_dealId, disp, dep);
    }
}