// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StrideUSDCChallengeManager
 * @notice A social fitness challenge contract where participants stake USDC,
 *         complete challenges, and winners split the prize pool.
 * @dev Built for Base Sepolia testnet - Powered by Circle USDC
 * @custom:bounty Circle USDC and Payments Bounty - MBC Hackathon 2025
 */
contract StrideUSDCChallengeManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    /// @notice USDC token contract (6 decimals)
    IERC20 public immutable usdc;
    
    /// @notice Platform fee in basis points (0 = no fee, 100 = 1%)
    uint256 public constant PLATFORM_FEE_BPS = 0;
    
    // ============ Structs ============
    
    struct Challenge {
        uint256 id;
        address creator;
        uint256 stakeAmount;      // In USDC (6 decimals)
        uint256 endTime;
        string description;
        bool settled;
        bool cancelled;
        uint256 totalPool;        // Total USDC staked
        uint256 groupId;          // 0 = no group, otherwise group ID + 1
    }

    struct UserStats {
        uint256 challengesCreated;
        uint256 challengesJoined;
        uint256 challengesCompleted;
        uint256 challengesWon;
        uint256 totalStaked;      // In USDC
        uint256 totalWon;         // In USDC
        uint256 totalLost;        // In USDC
    }

    // ============ State Variables ============
    
    uint256 public challengeCount;
    
    mapping(uint256 => Challenge) private challenges;
    mapping(uint256 => address[]) private participants;
    mapping(uint256 => mapping(address => bool)) private hasJoinedMapping;
    mapping(uint256 => mapping(address => bool)) private hasCompletedMapping;
    mapping(uint256 => address[]) private completers;
    mapping(uint256 => mapping(address => bool)) private cancelVotes;
    mapping(uint256 => uint256) private cancelVoteCount;
    mapping(uint256 => mapping(address => bool)) private earlySettleVotes;
    mapping(uint256 => uint256) private earlySettleVoteCount;
    mapping(address => UserStats) public userStats;

    address public charityAddress;
    uint256 public totalDonatedToCharity;

    // ============ Events ============
    
    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed creator,
        uint256 stakeAmount,
        uint256 endTime,
        string description,
        uint256 groupId
    );
    
    event ParticipantJoined(
        uint256 indexed challengeId,
        address indexed participant,
        uint256 stakeAmount
    );
    
    event CompletionMarked(
        uint256 indexed challengeId,
        address indexed participant
    );
    
    event ChallengeSettled(
        uint256 indexed challengeId,
        uint256 winnersCount,
        uint256 prizePerWinner
    );

    event ChallengeCancelled(
        uint256 indexed challengeId,
        string reason
    );

    event CancelVoteCast(
        uint256 indexed challengeId,
        address indexed voter,
        uint256 totalVotes,
        uint256 requiredVotes
    );

    event EarlySettleVoteCast(
        uint256 indexed challengeId,
        address indexed voter,
        uint256 totalVotes,
        uint256 requiredVotes
    );

    event DonatedToCharity(
        uint256 indexed challengeId,
        uint256 amount
    );

    event CharityAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    // ============ Errors ============
    
    error InvalidStakeAmount();
    error InvalidDuration();
    error ChallengeNotFound();
    error ChallengeEnded();
    error ChallengeNotEnded();
    error AlreadyJoined();
    error NotJoined();
    error AlreadyCompleted();
    error AlreadySettled();
    error AlreadyCancelled();
    error TransferFailed();
    error NotCreator();
    error AlreadyVotedCancel();
    error AlreadyVotedEarlySettle();
    error ChallengeHasParticipants();
    error NoCharityAddress();
    error InsufficientAllowance();
    error InsufficientBalance();

    // ============ Constructor ============
    
    /**
     * @notice Initialize with USDC token address
     * @param _usdc The USDC token contract address
     */
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        // Default charity - GiveDirectly (update for production)
        charityAddress = 0x750EF1D7a0b4Ab1c97B7A623D7917CcEb5ea779C;
    }

    // ============ External Functions ============
    
    /**
     * @notice Create a new challenge and stake USDC as the first participant
     * @dev Requires prior USDC approval
     * @param stakeAmount The amount each participant must stake (in USDC, 6 decimals)
     * @param duration How long the challenge lasts (in seconds)
     * @param description A description of the challenge
     * @param groupId Optional group ID (0 for no group)
     * @return challengeId The ID of the newly created challenge
     */
    function createChallenge(
        uint256 stakeAmount,
        uint256 duration,
        string calldata description,
        uint256 groupId
    ) external nonReentrant returns (uint256 challengeId) {
        if (stakeAmount == 0) revert InvalidStakeAmount();
        if (duration == 0) revert InvalidDuration();
        
        // Check allowance and balance
        if (usdc.allowance(msg.sender, address(this)) < stakeAmount) {
            revert InsufficientAllowance();
        }
        if (usdc.balanceOf(msg.sender) < stakeAmount) {
            revert InsufficientBalance();
        }

        challengeId = challengeCount++;
        uint256 endTime = block.timestamp + duration;

        challenges[challengeId] = Challenge({
            id: challengeId,
            creator: msg.sender,
            stakeAmount: stakeAmount,
            endTime: endTime,
            description: description,
            settled: false,
            cancelled: false,
            totalPool: stakeAmount,
            groupId: groupId
        });

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;

        // Transfer USDC from user
        usdc.safeTransferFrom(msg.sender, address(this), stakeAmount);

        // Update user stats
        userStats[msg.sender].challengesCreated++;
        userStats[msg.sender].challengesJoined++;
        userStats[msg.sender].totalStaked += stakeAmount;

        emit ChallengeCreated(
            challengeId,
            msg.sender,
            stakeAmount,
            endTime,
            description,
            groupId
        );
    }

    /**
     * @notice Create challenge (backward compatible - no group)
     */
    function createChallenge(
        uint256 stakeAmount,
        uint256 duration,
        string calldata description
    ) external nonReentrant returns (uint256) {
        if (stakeAmount == 0) revert InvalidStakeAmount();
        if (duration == 0) revert InvalidDuration();
        
        if (usdc.allowance(msg.sender, address(this)) < stakeAmount) {
            revert InsufficientAllowance();
        }
        if (usdc.balanceOf(msg.sender) < stakeAmount) {
            revert InsufficientBalance();
        }

        uint256 challengeId = challengeCount++;
        uint256 endTime = block.timestamp + duration;

        challenges[challengeId] = Challenge({
            id: challengeId,
            creator: msg.sender,
            stakeAmount: stakeAmount,
            endTime: endTime,
            description: description,
            settled: false,
            cancelled: false,
            totalPool: stakeAmount,
            groupId: 0
        });

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;

        usdc.safeTransferFrom(msg.sender, address(this), stakeAmount);

        userStats[msg.sender].challengesCreated++;
        userStats[msg.sender].challengesJoined++;
        userStats[msg.sender].totalStaked += stakeAmount;

        emit ChallengeCreated(
            challengeId,
            msg.sender,
            stakeAmount,
            endTime,
            description,
            0
        );

        return challengeId;
    }

    /**
     * @notice Join an existing challenge by staking USDC
     * @dev Requires prior USDC approval
     * @param challengeId The ID of the challenge to join
     */
    function joinChallenge(uint256 challengeId) external nonReentrant {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (hasJoinedMapping[challengeId][msg.sender]) revert AlreadyJoined();
        
        uint256 stakeAmount = challenge.stakeAmount;
        
        if (usdc.allowance(msg.sender, address(this)) < stakeAmount) {
            revert InsufficientAllowance();
        }
        if (usdc.balanceOf(msg.sender) < stakeAmount) {
            revert InsufficientBalance();
        }

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;
        challenge.totalPool += stakeAmount;

        usdc.safeTransferFrom(msg.sender, address(this), stakeAmount);

        userStats[msg.sender].challengesJoined++;
        userStats[msg.sender].totalStaked += stakeAmount;

        emit ParticipantJoined(challengeId, msg.sender, stakeAmount);
    }

    /**
     * @notice Mark yourself as having completed the challenge
     * @param challengeId The ID of the challenge
     */
    function markCompleted(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotJoined();
        if (hasCompletedMapping[challengeId][msg.sender]) revert AlreadyCompleted();

        hasCompletedMapping[challengeId][msg.sender] = true;
        completers[challengeId].push(msg.sender);

        userStats[msg.sender].challengesCompleted++;

        emit CompletionMarked(challengeId, msg.sender);
    }

    /**
     * @notice Vote to cancel a challenge (requires all participants to agree)
     * @param challengeId The ID of the challenge
     */
    function voteCancelChallenge(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.settled) revert AlreadySettled();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotJoined();
        if (cancelVotes[challengeId][msg.sender]) revert AlreadyVotedCancel();

        cancelVotes[challengeId][msg.sender] = true;
        cancelVoteCount[challengeId]++;

        uint256 totalParticipants = participants[challengeId].length;

        emit CancelVoteCast(
            challengeId, 
            msg.sender, 
            cancelVoteCount[challengeId], 
            totalParticipants
        );

        if (cancelVoteCount[challengeId] >= totalParticipants) {
            _cancelChallenge(challengeId, "All participants agreed to cancel");
        }
    }

    /**
     * @notice Vote to end a challenge early
     * @param challengeId The ID of the challenge
     */
    function voteEarlySettle(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.settled) revert AlreadySettled();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotJoined();
        if (earlySettleVotes[challengeId][msg.sender]) revert AlreadyVotedEarlySettle();

        earlySettleVotes[challengeId][msg.sender] = true;
        earlySettleVoteCount[challengeId]++;

        uint256 totalParticipants = participants[challengeId].length;

        emit EarlySettleVoteCast(
            challengeId, 
            msg.sender, 
            earlySettleVoteCount[challengeId], 
            totalParticipants
        );

        if (earlySettleVoteCount[challengeId] >= totalParticipants) {
            _settleChallenge(challengeId);
        }
    }

    /**
     * @notice Check if user has voted for early settle
     */
    function hasVotedEarlySettle(uint256 challengeId, address user) external view returns (bool) {
        return earlySettleVotes[challengeId][user];
    }

    /**
     * @notice Get early settle vote status
     */
    function getEarlySettleVoteStatus(uint256 challengeId) external view returns (uint256 votes, uint256 required) {
        return (earlySettleVoteCount[challengeId], participants[challengeId].length);
    }

    /**
     * @notice Creator can cancel if they're the only participant
     * @param challengeId The ID of the challenge
     */
    function creatorCancelChallenge(uint256 challengeId) external nonReentrant {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.creator != msg.sender) revert NotCreator();
        if (challenge.settled) revert AlreadySettled();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (participants[challengeId].length > 1) revert ChallengeHasParticipants();

        _cancelChallenge(challengeId, "Cancelled by creator");
    }

    /**
     * @notice Internal function to cancel and refund USDC
     */
    function _cancelChallenge(uint256 challengeId, string memory reason) internal {
        Challenge storage challenge = challenges[challengeId];
        challenge.cancelled = true;

        address[] memory allParticipants = participants[challengeId];
        uint256 refundAmount = challenge.stakeAmount;

        for (uint256 i = 0; i < allParticipants.length; i++) {
            address participant = allParticipants[i];
            
            userStats[participant].totalStaked -= refundAmount;
            userStats[participant].challengesJoined--;
            if (participant == challenge.creator) {
                userStats[participant].challengesCreated--;
            }

            usdc.safeTransfer(participant, refundAmount);
        }

        emit ChallengeCancelled(challengeId, reason);
    }

    /**
     * @notice Settle the challenge and distribute USDC prize pool
     * @param challengeId The ID of the challenge to settle
     */
    function settleChallenge(uint256 challengeId) external nonReentrant {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp < challenge.endTime) revert ChallengeNotEnded();
        if (challenge.settled) revert AlreadySettled();

        _settleChallenge(challengeId);
    }

    /**
     * @notice Internal function to settle and distribute USDC prizes
     */
    function _settleChallenge(uint256 challengeId) internal {
        Challenge storage challenge = challenges[challengeId];
        challenge.settled = true;
        
        address[] memory winners = completers[challengeId];
        address[] memory allParticipants = participants[challengeId];
        uint256 winnersCount = winners.length;
        uint256 totalPool = challenge.totalPool;
        uint256 prizePerWinner;

        if (winnersCount > 0) {
            prizePerWinner = totalPool / winnersCount;
            
            for (uint256 i = 0; i < winnersCount; i++) {
                address winner = winners[i];
                
                userStats[winner].challengesWon++;
                userStats[winner].totalWon += prizePerWinner;

                usdc.safeTransfer(winner, prizePerWinner);
            }

            for (uint256 i = 0; i < allParticipants.length; i++) {
                if (!hasCompletedMapping[challengeId][allParticipants[i]]) {
                    userStats[allParticipants[i]].totalLost += challenge.stakeAmount;
                }
            }
            
            // Handle dust
            uint256 dust = totalPool - (prizePerWinner * winnersCount);
            if (dust > 0) {
                usdc.safeTransfer(challenge.creator, dust);
            }
        } else {
            // No completers - donate to charity
            if (charityAddress != address(0)) {
                totalDonatedToCharity += totalPool;
                
                usdc.safeTransfer(charityAddress, totalPool);
                
                emit DonatedToCharity(challengeId, totalPool);
                
                for (uint256 i = 0; i < allParticipants.length; i++) {
                    userStats[allParticipants[i]].totalLost += challenge.stakeAmount;
                }
            } else {
                // Fallback: refund everyone
                uint256 refundAmount = challenge.stakeAmount;
                
                for (uint256 i = 0; i < allParticipants.length; i++) {
                    usdc.safeTransfer(allParticipants[i], refundAmount);
                }
            }
        }

        emit ChallengeSettled(challengeId, winnersCount, prizePerWinner);
    }

    /**
     * @notice Update charity address
     */
    function setCharityAddress(address newCharityAddress) external {
        require(msg.sender == charityAddress || charityAddress == address(0), "Not authorized");
        
        address oldAddress = charityAddress;
        charityAddress = newCharityAddress;
        
        emit CharityAddressUpdated(oldAddress, newCharityAddress);
    }

    // ============ View Functions ============
    
    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function getParticipants(uint256 challengeId) external view returns (address[] memory) {
        return participants[challengeId];
    }

    function hasJoined(uint256 challengeId, address participant) external view returns (bool) {
        return hasJoinedMapping[challengeId][participant];
    }

    function hasCompleted(uint256 challengeId, address participant) external view returns (bool) {
        return hasCompletedMapping[challengeId][participant];
    }

    function getCompleters(uint256 challengeId) external view returns (address[] memory) {
        return completers[challengeId];
    }

    function hasVotedCancel(uint256 challengeId, address user) external view returns (bool) {
        return cancelVotes[challengeId][user];
    }

    function getCancelVoteStatus(uint256 challengeId) external view returns (uint256 votes, uint256 required) {
        return (cancelVoteCount[challengeId], participants[challengeId].length);
    }

    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    /**
     * @notice Get USDC token address
     */
    function getUSDCAddress() external view returns (address) {
        return address(usdc);
    }
}

