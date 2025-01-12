// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


import "./IERC20.sol";


error WRONG_EOA();
error AMOUNT_CANT_BE_ZERO();
error CANT_BE_ZERO();
error INSUFFICIENT_FUNDS();
error STAKE_HAS_NOT_EXPIRED();

contract StakePool {

    uint256 constant MULTIPLIER = 10 ** 18;
    address stakingToken;
    address owner;

    uint256 public totalStakedUsers;
    uint256 public totalSharesDeposited;
    uint256 public rewardsPerShare = 1000;
    uint256 public totalDistributed;

    uint256 lockupPeriod = 86400; // 24 hrs

    struct Share {
        uint256 amount;
        uint256 stakedTime;
    }

    struct Reward {
        uint256 excluded;
        uint256 realised;
    }

    mapping(address => Share) shares;
    mapping(address => Reward) rewards;

    event Stake(address indexed user, uint256 amount);
    event Unstake(address indexed user, uint256 amount);
    event ClaimReward(address user);
    event DistributeReward(address indexed user, uint256 amount);

    constructor(address _token) {
        stakingToken = _token;
        owner = msg.sender;
    }

    function stake (uint256 amount) external {
        if(msg.sender == address(0))
            revert WRONG_EOA();

        if(amount <= 0) 
            revert AMOUNT_CANT_BE_ZERO();
        if(IERC20(stakingToken).balanceOf(msg.sender) < amount)
            revert INSUFFICIENT_FUNDS();
           
        IERC20(stakingToken).transferFrom(msg.sender, address(this), amount);
        setShare(msg.sender, amount, false);
    }

    function userStake(address wallet) external view returns (uint256, uint256) {
        return (shares[wallet].amount, shares[wallet].stakedTime);
    }

    function unStake (uint256 amount) external {
        if(msg.sender == address(0))
            revert WRONG_EOA();

        if(amount <= 0) 
            revert AMOUNT_CANT_BE_ZERO();

        if(shares[msg.sender].amount < amount)
            revert INSUFFICIENT_FUNDS();

        setShare(msg.sender, amount, true);
    }

    function setShare(address wallet, uint256 balanceUpdate, bool isRemoving) internal {        

        if (isRemoving) {
            removeShare(wallet, balanceUpdate);

            IERC20(stakingToken).transfer(msg.sender, balanceUpdate);

            emit Unstake(wallet, balanceUpdate);
        } else {
            addShare(wallet, balanceUpdate);
            emit Stake(wallet, balanceUpdate);
        }
    }

    function addShare(address wallet, uint256 amount) private {

        if (shares[wallet].amount > 0) {
            distributeReward(wallet);
        }
        uint256 sharesBefore = shares[wallet].amount;
        totalSharesDeposited += amount;
        shares[wallet].amount += amount;
        shares[wallet].stakedTime = block.timestamp;

        if (sharesBefore == 0 && shares[wallet].amount > 0) {
            totalStakedUsers++;
        }

        rewards[wallet].excluded = cumulativeRewards(shares[wallet].amount, shares[wallet].stakedTime);
    }

    function removeShare(address wallet, uint256 amount) private {

        if(shares[wallet].amount < 0)
            revert INSUFFICIENT_FUNDS();
        

        if (block.timestamp < shares[wallet].stakedTime + lockupPeriod) 
            revert STAKE_HAS_NOT_EXPIRED();

        totalSharesDeposited -= amount;
        shares[wallet].amount -= amount;

        if (shares[wallet].amount == 0) {
         totalStakedUsers--;
        }

        rewards[wallet].excluded = cumulativeRewards(shares[wallet].amount, shares[wallet].stakedTime);

    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        IERC20 stakeToken = IERC20(stakingToken);
        stakeToken.transfer(
        msg.sender,
        _amount == 0 ? stakeToken.balanceOf(address(this)) : _amount
    );
  }

    function getUnpaid(address wallet) public view returns (uint256) {

        if (shares[wallet].amount == 0) {
        return 0;
        }

        uint256 earnedRewards = cumulativeRewards(shares[wallet].amount, shares[wallet].stakedTime);
        uint256 rewardsExcluded = rewards[wallet].excluded;
        
        if (earnedRewards <= rewardsExcluded) {
            return 0;
        }
        return earnedRewards - rewardsExcluded;
    }

    function modifiyRewardsPerShare(uint256 share) external {
        if(share <= 0)
            revert AMOUNT_CANT_BE_ZERO();
        
        rewardsPerShare = share;
    }

    function modifiyLockupPeriod(uint256 timeUpdate) external onlyOwner {
        if(timeUpdate <= 0)
            revert CANT_BE_ZERO();

        lockupPeriod = timeUpdate;
    }

      function claimReward() external {
        if(msg.sender == address(0))
            revert WRONG_EOA();

        distributeReward(msg.sender);

        emit ClaimReward(msg.sender);
    }

    function distributeReward(address wallet) internal {
        if (shares[wallet].amount == 0) {
         return;
        }
        uint256 amountWei = getUnpaid(wallet);

        if (amountWei > 0) {
            rewards[wallet].realised += amountWei;
            shares[wallet].stakedTime = block.timestamp; // reset every claim
            rewards[wallet].excluded = cumulativeRewards(shares[wallet].amount, shares[wallet].stakedTime);
            totalDistributed += amountWei;
            IERC20(stakingToken).transfer(wallet, amountWei);
            emit DistributeReward(wallet, amountWei);
        }
    }



    function cumulativeRewards(uint256 share, uint256 stakedTime) internal view returns (uint256) {
        // return (share * rewardsPerShare) / MULTIPLIER;
        uint256 stakingDuration = block.timestamp - stakedTime;
        return (share * rewardsPerShare * stakingDuration) / MULTIPLIER ;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'not owner');
        _;
    }
}