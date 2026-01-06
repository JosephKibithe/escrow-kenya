// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AhadiEscrowFinal
 * @notice Scalable P2P escrow with O(1) balance tracking and per-deal timeouts
 */
contract AhadiEscrowFinal is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Constants (Adjusted for USDT 6 decimals on Polygon)
    uint256 public constant MIN_TIMEOUT = 1 hours;
    uint256 public constant MAX_TIMEOUT = 365 days;
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant MIN_DEAL_AMOUNT = 1_000000; // 1 USDT (6 decimals)

    // Configurable Variables
    uint256 public feeBasisPoints = 250; // 2.5%
    address public feeWallet;
    IERC20 public stablecoin;

    // Auto-Increment IDs
    uint256 private _currentDealId;

    // O(1) Scalability: Track total locked funds in state
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

    // Events
    event Deposited(
        uint256 indexed dealId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timeoutInSeconds
    );
    event Released(
        uint256 indexed dealId,
        address indexed seller,
        uint256 netAmount,
        uint256 fee
    );
    event Refunded(
        uint256 indexed dealId,
        address indexed buyer,
        uint256 amount
    );
    event DisputeRaised(uint256 indexed dealId, address indexed disputer);
    event DisputeResolved(
        uint256 indexed dealId,
        address indexed winner,
        uint256 amount
    );
    event FeeUpdated(uint256 newFee);
    event FeeWalletUpdated(address indexed newWallet);
    event ExcessTokensRecovered(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    modifier isValidDeal(uint256 _dealId) {
        require(deals[_dealId].buyer != address(0), "Deal does not exist");
        _;
    }

    constructor(address _stablecoinAddress, address _feeWallet) {
        require(_stablecoinAddress != address(0), "Invalid stablecoin");
        require(_feeWallet != address(0), "Invalid fee wallet");
        stablecoin = IERC20(_stablecoinAddress);
        feeWallet = _feeWallet;
    }

    // --- USER FUNCTIONS ---

    function createDeal(
        address _seller,
        uint256 _amount,
        uint256 _timeoutSeconds
    ) external nonReentrant whenNotPaused returns (uint256 dealId) {
        require(_amount >= MIN_DEAL_AMOUNT, "Amount below minimum (1 USDT)");
        require(_seller != msg.sender, "Cannot deal with self");
        require(_seller != address(0), "Invalid seller address");
        require(_timeoutSeconds >= MIN_TIMEOUT, "Timeout too short");
        require(_timeoutSeconds <= MAX_TIMEOUT, "Timeout too long");

        _currentDealId++;
        dealId = _currentDealId;
        uint256 expiry = block.timestamp + _timeoutSeconds;

        stablecoin.safeTransferFrom(msg.sender, address(this), _amount);

        deals[dealId] = Deal({
            id: dealId,
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            isCompleted: false,
            isDisputed: false,
            createdAt: block.timestamp,
            expiryTime: expiry
        });

        totalLockedFunds += _amount;
        emit Deposited(dealId, msg.sender, _seller, _amount, _timeoutSeconds);
    }

    function releaseFunds(
        uint256 _dealId
    ) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.buyer, "Only buyer can release");
        require(!deal.isCompleted, "Deal closed");
        require(!deal.isDisputed, "Deal disputed");

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        (uint256 payout, uint256 fee) = _payout(deal.seller, amount);
        emit Released(_dealId, deal.seller, payout, fee);
    }

    function refundBuyer(
        uint256 _dealId
    ) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.seller, "Only seller can refund");
        require(!deal.isCompleted, "Deal closed");
        require(!deal.isDisputed, "Deal disputed");

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        stablecoin.safeTransfer(deal.buyer, amount);
        emit Refunded(_dealId, deal.buyer, amount);
    }

    function refundTimedOutDeal(
        uint256 _dealId
    ) external nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        require(!deal.isCompleted, "Deal closed");
        require(!deal.isDisputed, "Deal disputed");
        require(block.timestamp > deal.expiryTime, "Not timed out yet");

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        totalLockedFunds -= amount;

        stablecoin.safeTransfer(deal.buyer, amount);
        emit Refunded(_dealId, deal.buyer, amount);
    }

    function raiseDispute(uint256 _dealId) external isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        require(
            msg.sender == deal.buyer || msg.sender == deal.seller,
            "Not involved"
        );
        require(!deal.isCompleted, "Deal closed");
        require(!deal.isDisputed, "Already disputed");

        deal.isDisputed = true;
        emit DisputeRaised(_dealId, msg.sender);
    }

    // --- ADMIN FUNCTIONS ---

    function resolveDispute(
        uint256 _dealId,
        address _winner
    ) external onlyOwner nonReentrant isValidDeal(_dealId) {
        Deal storage deal = deals[_dealId];
        require(deal.isDisputed, "Not disputed");
        require(!deal.isCompleted, "Closed");
        require(
            _winner == deal.buyer || _winner == deal.seller,
            "Invalid winner"
        );

        uint256 amount = deal.amount;
        deal.isCompleted = true;
        deal.isDisputed = false;
        totalLockedFunds -= amount;

        stablecoin.safeTransfer(_winner, amount);
        emit DisputeResolved(_dealId, _winner, amount);
    }

    function updateFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee > 10%");
        feeBasisPoints = _newFee;
        emit FeeUpdated(_newFee);
    }

    function updateFeeWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet");
        feeWallet = _newWallet;
        emit FeeWalletUpdated(_newWallet);
    }

    function recoverExcessTokens(
        address _token,
        address _to
    ) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid recipient");
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));

        if (_token == address(stablecoin)) {
            require(balance > totalLockedFunds, "No excess");
            uint256 excess = balance - totalLockedFunds;
            token.safeTransfer(_to, excess);
            emit ExcessTokensRecovered(_token, _to, excess);
        } else {
            token.safeTransfer(_to, balance);
            emit ExcessTokensRecovered(_token, _to, balance);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- VIEW FUNCTIONS ---

    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        return deals[_dealId];
    }

    function getContractStats()
        external
        view
        returns (
            uint256 totalDeals,
            uint256 locked,
            uint256 balance,
            uint256 excess
        )
    {
        totalDeals = _currentDealId;
        locked = totalLockedFunds;
        balance = stablecoin.balanceOf(address(this));
        excess = balance > locked ? balance - locked : 0;
    }

    // --- INTERNAL ---

    function _payout(
        address _recipient,
        uint256 _amount
    ) internal returns (uint256 payout, uint256 fee) {
        fee = (_amount * feeBasisPoints) / 10000;
        payout = _amount - fee;
        stablecoin.safeTransfer(_recipient, payout);
        if (fee > 0) stablecoin.safeTransfer(feeWallet, fee);
    }
}
