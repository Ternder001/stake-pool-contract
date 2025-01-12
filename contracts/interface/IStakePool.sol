// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStakePool {
  
    struct Share {
        uint256 amount;
        uint256 stakedTime;
    }

    struct Reward {
        uint256 excluded;
        uint256 realised;
    }
    function stake (uint256 amount) external;

    function userStake(address wallet) external view returns (uint256, uint256);

    function getUnpaid(address wallet) external view returns (uint256);

    function claimReward() external;
}