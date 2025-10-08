// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BNBStaking
 * @dev BNB staking contract for Xiangqi game rewards
 * @author BNB Xiangqi Team
 */
contract BNBStaking is ReentrancyGuard, Pausable, Ownable {
    struct Staker {
        uint256 stakedAmount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 lockPeriod;
        bool isActive;
    }

    // Staking parameters
    uint256 public constant REWARD_RATE = 10; // 10% APY
    uint256 public constant LOCK_PERIOD = 7 days;
    uint256 public constant MIN_STAKE = 0.1 ether;
    
    // State variables
    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    // Mappings
    mapping(address => Staker) public stakers;
    mapping(address => uint256) public userRewardPerTokenPaid;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsUpdated(uint256 newRewardPerToken);
    
    constructor() {
        lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Stake BNB tokens
     * @param lockPeriod Lock period in seconds (minimum 7 days)
     */
    function stake(uint256 lockPeriod) external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_STAKE, "Minimum stake not met");
        require(lockPeriod >= LOCK_PERIOD, "Lock period too short");
        
        address user = msg.sender;
        uint256 amount = msg.value;
        
        // Update rewards before staking
        _updateRewards();
        
        // If user already has staked tokens, add to existing stake
        if (stakers[user].isActive) {
            stakers[user].stakedAmount += amount;
            stakers[user].lockPeriod = lockPeriod;
        } else {
            stakers[user] = Staker({
                stakedAmount: amount,
                rewardDebt: 0,
                lastStakeTime: block.timestamp,
                lockPeriod: lockPeriod,
                isActive: true
            });
        }
        
        totalStaked += amount;
        
        emit Staked(user, amount, lockPeriod);
    }
    
    /**
     * @dev Unstake BNB tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        address user = msg.sender;
        Staker storage staker = stakers[user];
        
        require(staker.isActive, "No active stake");
        require(amount <= staker.stakedAmount, "Insufficient staked amount");
        require(
            block.timestamp >= staker.lastStakeTime + staker.lockPeriod,
            "Lock period not expired"
        );
        
        // Update rewards before unstaking
        _updateRewards();
        
        // Calculate pending rewards
        uint256 pendingRewards = _calculatePendingRewards(user);
        
        // Update staker data
        staker.stakedAmount -= amount;
        staker.rewardDebt = (staker.stakedAmount * rewardPerTokenStored) / 1e18;
        
        if (staker.stakedAmount == 0) {
            staker.isActive = false;
        }
        
        totalStaked -= amount;
        
        // Transfer BNB
        (bool success, ) = payable(user).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(user, amount);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        address user = msg.sender;
        require(stakers[user].isActive, "No active stake");
        
        _updateRewards();
        
        uint256 pendingRewards = _calculatePendingRewards(user);
        require(pendingRewards > 0, "No rewards to claim");
        
        // Update user reward debt
        stakers[user].rewardDebt = (stakers[user].stakedAmount * rewardPerTokenStored) / 1e18;
        
        totalRewards += pendingRewards;
        
        // Transfer rewards
        (bool success, ) = payable(user).call{value: pendingRewards}("");
        require(success, "Transfer failed");
        
        emit RewardsClaimed(user, pendingRewards);
    }
    
    /**
     * @dev Get staking information for a user
     */
    function getStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 rewards,
        uint256 lockPeriod,
        bool canUnstake
    ) {
        Staker memory staker = stakers[user];
        stakedAmount = staker.stakedAmount;
        rewards = _calculatePendingRewards(user);
        lockPeriod = staker.lockPeriod;
        canUnstake = staker.isActive && 
                    block.timestamp >= staker.lastStakeTime + staker.lockPeriod;
    }
    
    /**
     * @dev Get total staked amount
     */
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
    
    /**
     * @dev Get reward rate (APY)
     */
    function getRewardRate() external pure returns (uint256) {
        return REWARD_RATE;
    }
    
    /**
     * @dev Update rewards calculation
     */
    function _updateRewards() internal {
        if (totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            uint256 rewards = (totalStaked * REWARD_RATE * timeElapsed) / (365 days * 100);
            rewardPerTokenStored += (rewards * 1e18) / totalStaked;
        }
        lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Calculate pending rewards for a user
     */
    function _calculatePendingRewards(address user) internal view returns (uint256) {
        Staker memory staker = stakers[user];
        if (!staker.isActive) return 0;
        
        uint256 currentRewardPerToken = rewardPerTokenStored;
        if (totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            uint256 rewards = (totalStaked * REWARD_RATE * timeElapsed) / (365 days * 100);
            currentRewardPerToken += (rewards * 1e18) / totalStaked;
        }
        
        uint256 userReward = (staker.stakedAmount * currentRewardPerToken) / 1e18;
        return userReward - staker.rewardDebt;
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
}
