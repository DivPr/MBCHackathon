// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StrideChallengeManager
 * @notice A social fitness challenge contract where participants stake ETH,
 *         complete challenges, and winners split the prize pool.
 * @dev Built for Base Sepolia testnet for MBC Hackathon
 */
contract StrideChallengeManager {
    // ============ Structs ============
    
    struct Challenge {
        uint256 id;
        address creator;
        uint256 stakeAmount;
        uint256 endTime;
        string description;
        bool settled;
        bool cancelled;
        uint256 totalPool;
        uint256 groupId;        // 0 = no group, otherwise group ID + 1
    }

    struct UserStats {
        uint256 challengesCreated;
        uint256 challengesJoined;
        uint256 challengesCompleted;
        uint256 challengesWon;      // Challenges where user got payout
        uint256 totalStaked;
        uint256 totalWon;
        uint256 totalLost;
    }

    // ============ State Variables ============
    
    uint256 public challengeCount;
    
    // Challenge ID => Challenge data
    mapping(uint256 => Challenge) private challenges;
    
    // Challenge ID => list of participants
    mapping(uint256 => address[]) private participants;
    
    // Challenge ID => participant address => has joined
    mapping(uint256 => mapping(address => bool)) private hasJoinedMapping;
    
    // Challenge ID => participant address => has completed
    mapping(uint256 => mapping(address => bool)) private hasCompletedMapping;
    
    // Challenge ID => list of completers
    mapping(uint256 => address[]) private completers;

    // Challenge ID => address => voted to cancel
    mapping(uint256 => mapping(address => bool)) private cancelVotes;
    
    // Challenge ID => number of cancel votes
    mapping(uint256 => uint256) private cancelVoteCount;

    // Challenge ID => address => voted for early settle
    mapping(uint256 => mapping(address => bool)) private earlySettleVotes;
    
    // Challenge ID => number of early settle votes
    mapping(uint256 => uint256) private earlySettleVoteCount;

    // User stats tracking
    mapping(address => UserStats) public userStats;

    // Charity address for when no one wins
    address public charityAddress;
    
    // Total donated to charity
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
        address indexed participant
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
    error IncorrectStakeAmount();
    error TransferFailed();
    error NotCreator();
    error AlreadyVotedCancel();
    error AlreadyVotedEarlySettle();
    error ChallengeHasParticipants();
    error NoCharityAddress();

    // ============ Constructor ============
    
    constructor() {
        // Default charity address (can be updated by deployer pattern or governance)
        // Using a well-known charity address - update this to your preferred charity
        charityAddress = 0x7cEB23fD6bC0adD59E62ac25578270cFf1b9f619; // Example address
    }

    // ============ External Functions ============
    
    /**
     * @notice Create a new challenge and stake as the first participant
     * @param stakeAmount The amount each participant must stake (in wei)
     * @param duration How long the challenge lasts (in seconds)
     * @param description A description of the challenge (e.g., "5K run")
     * @param groupId Optional group ID (0 for no group)
     * @return challengeId The ID of the newly created challenge
     */
    function createChallenge(
        uint256 stakeAmount,
        uint256 duration,
        string calldata description,
        uint256 groupId
    ) external payable returns (uint256 challengeId) {
        if (stakeAmount == 0) revert InvalidStakeAmount();
        if (duration == 0) revert InvalidDuration();
        if (msg.value != stakeAmount) revert IncorrectStakeAmount();

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
    ) external payable returns (uint256) {
        if (stakeAmount == 0) revert InvalidStakeAmount();
        if (duration == 0) revert InvalidDuration();
        if (msg.value != stakeAmount) revert IncorrectStakeAmount();

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
            0
        );

        return challengeId;
    }

    /**
     * @notice Join an existing challenge by staking the required amount
     * @param challengeId The ID of the challenge to join
     */
    function joinChallenge(uint256 challengeId) external payable {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (hasJoinedMapping[challengeId][msg.sender]) revert AlreadyJoined();
        if (msg.value != challenge.stakeAmount) revert IncorrectStakeAmount();

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;
        challenge.totalPool += msg.value;

        // Update user stats
        userStats[msg.sender].challengesJoined++;
        userStats[msg.sender].totalStaked += msg.value;

        emit ParticipantJoined(challengeId, msg.sender);
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

        // Update user stats
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
        uint256 votesNeeded = totalParticipants; // All must agree

        emit CancelVoteCast(
            challengeId, 
            msg.sender, 
            cancelVoteCount[challengeId], 
            votesNeeded
        );

        // If all participants voted, cancel the challenge
        if (cancelVoteCount[challengeId] >= totalParticipants) {
            _cancelChallenge(challengeId, "All participants agreed to cancel");
        }
    }

    /**
     * @notice Vote to end a challenge early (requires all participants to agree)
     * @dev If all vote and there are completers, winners get paid. If no completers, goes to charity.
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
        uint256 votesNeeded = totalParticipants; // All must agree

        emit EarlySettleVoteCast(
            challengeId, 
            msg.sender, 
            earlySettleVoteCount[challengeId], 
            votesNeeded
        );

        // If all participants voted, settle the challenge early
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
    function creatorCancelChallenge(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.creator != msg.sender) revert NotCreator();
        if (challenge.settled) revert AlreadySettled();
        if (challenge.cancelled) revert AlreadyCancelled();
        
        // Creator can only cancel if they're the only participant
        if (participants[challengeId].length > 1) revert ChallengeHasParticipants();

        _cancelChallenge(challengeId, "Cancelled by creator");
    }

    /**
     * @notice Internal function to cancel and refund
     */
    function _cancelChallenge(uint256 challengeId, string memory reason) internal {
        Challenge storage challenge = challenges[challengeId];
        challenge.cancelled = true;

        // Refund all participants
        address[] memory allParticipants = participants[challengeId];
        uint256 refundAmount = challenge.stakeAmount;

        for (uint256 i = 0; i < allParticipants.length; i++) {
            address participant = allParticipants[i];
            
            // Update stats - remove the stake from total
            userStats[participant].totalStaked -= refundAmount;
            userStats[participant].challengesJoined--;
            if (participant == challenge.creator) {
                userStats[participant].challengesCreated--;
            }

            (bool success, ) = participant.call{value: refundAmount}("");
            if (!success) revert TransferFailed();
        }

        emit ChallengeCancelled(challengeId, reason);
    }

    /**
     * @notice Settle the challenge and distribute the prize pool
     * @dev Can only be called after the challenge has ended
     * @param challengeId The ID of the challenge to settle
     */
    function settleChallenge(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp < challenge.endTime) revert ChallengeNotEnded();
        if (challenge.settled) revert AlreadySettled();

        _settleChallenge(challengeId);
    }

    /**
     * @notice Internal function to settle and distribute prizes
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
            // Split pool among completers
            prizePerWinner = totalPool / winnersCount;
            
            for (uint256 i = 0; i < winnersCount; i++) {
                address winner = winners[i];
                
                // Update winner stats
                userStats[winner].challengesWon++;
                userStats[winner].totalWon += prizePerWinner;

                (bool success, ) = winner.call{value: prizePerWinner}("");
                if (!success) revert TransferFailed();
            }

            // Update loser stats (participants who didn't complete)
            for (uint256 i = 0; i < allParticipants.length; i++) {
                if (!hasCompletedMapping[challengeId][allParticipants[i]]) {
                    userStats[allParticipants[i]].totalLost += challenge.stakeAmount;
                }
            }
            
            // Handle dust (any remainder due to division)
            uint256 dust = totalPool - (prizePerWinner * winnersCount);
            if (dust > 0) {
                (bool success, ) = challenge.creator.call{value: dust}("");
                if (!success) revert TransferFailed();
            }
        } else {
            // No completers - donate to charity
            if (charityAddress != address(0)) {
                totalDonatedToCharity += totalPool;
                
                (bool success, ) = charityAddress.call{value: totalPool}("");
                if (!success) revert TransferFailed();
                
                emit DonatedToCharity(challengeId, totalPool);
                
                // Update loser stats for all participants
                for (uint256 i = 0; i < allParticipants.length; i++) {
                    userStats[allParticipants[i]].totalLost += challenge.stakeAmount;
                }
            } else {
                // Fallback: refund everyone if no charity address set
                uint256 refundAmount = challenge.stakeAmount;
                
                for (uint256 i = 0; i < allParticipants.length; i++) {
                    (bool success, ) = allParticipants[i].call{value: refundAmount}("");
                    if (!success) revert TransferFailed();
                }
            }
        }

        emit ChallengeSettled(challengeId, winnersCount, prizePerWinner);
    }

    /**
     * @notice Update charity address (only callable by current charity or deployer initially)
     */
    function setCharityAddress(address newCharityAddress) external {
        // Simple access control - in production, use proper governance
        require(msg.sender == charityAddress || charityAddress == address(0) || msg.sender == address(this), "Not authorized");
        
        address oldAddress = charityAddress;
        charityAddress = newCharityAddress;
        
        emit CharityAddressUpdated(oldAddress, newCharityAddress);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get challenge details
     */
    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /**
     * @notice Get all participants of a challenge
     */
    function getParticipants(uint256 challengeId) external view returns (address[] memory) {
        return participants[challengeId];
    }

    /**
     * @notice Check if an address has joined a challenge
     */
    function hasJoined(uint256 challengeId, address participant) external view returns (bool) {
        return hasJoinedMapping[challengeId][participant];
    }

    /**
     * @notice Check if an address has completed a challenge
     */
    function hasCompleted(uint256 challengeId, address participant) external view returns (bool) {
        return hasCompletedMapping[challengeId][participant];
    }

    /**
     * @notice Get all completers of a challenge
     */
    function getCompleters(uint256 challengeId) external view returns (address[] memory) {
        return completers[challengeId];
    }

    /**
     * @notice Check if user has voted to cancel
     */
    function hasVotedCancel(uint256 challengeId, address user) external view returns (bool) {
        return cancelVotes[challengeId][user];
    }

    /**
     * @notice Get cancel vote status
     */
    function getCancelVoteStatus(uint256 challengeId) external view returns (uint256 votes, uint256 required) {
        return (cancelVoteCount[challengeId], participants[challengeId].length);
    }

    /**
     * @notice Get user statistics
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
}
