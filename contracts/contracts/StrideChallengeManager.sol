// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Interface for StrideGroups to update leaderboard stats
interface IStrideGroups {
    function recordChallengeCompletion(
        uint256 _groupId,
        address _member,
        uint256 _amountWon,
        bool _didComplete
    ) external;
}

/**
 * @title StrideChallengeManager
 * @notice Social fitness challenge contract with ETH stakes, proof pics, and peer verification.
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

    struct CompletionView {
        bool claimed;
        uint256 approvals;
        bool verified;
        string proofCid;
    }

    // ============ State Variables ============
    
    uint256 public challengeCount;
    
    // Challenge ID => Challenge data
    mapping(uint256 => Challenge) private challenges;
    
    // Challenge ID => list of participants
    mapping(uint256 => address[]) private participants;
    
    // Challenge ID => participant address => has joined
    mapping(uint256 => mapping(address => bool)) private hasJoinedMapping;
    
    // Challenge ID => participant address => has completed (self-claim)
    mapping(uint256 => mapping(address => bool)) private hasCompletedMapping;
    
    // Challenge ID => list of completers (self-claims)
    mapping(uint256 => address[]) private completers;

    // Completion proofs + approvals
    mapping(uint256 => mapping(address => string)) private completionProofCid;              // proof for each completion
    mapping(uint256 => mapping(address => uint256)) private completionApprovals;           // number of positive votes
    mapping(uint256 => mapping(address => mapping(address => bool))) private hasApprovedCompletion; // voter tracking

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

    // StrideGroups contract for updating leaderboard stats
    IStrideGroups public strideGroups;

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

    event CompletionClaimed(
        uint256 indexed challengeId,
        address indexed participant,
        string proofCid
    );
    
    event CompletionApproved(
        uint256 indexed challengeId,
        address indexed runner,
        address indexed verifier,
        bool isValid,
        uint256 approvals,
        uint256 requiredApprovals
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

    event StrideGroupsUpdated(
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
    error NotParticipantVerifier();
    error RunnerNotCompleted();
    error AlreadyApproved();
    error SelfApprovalNotAllowed();

    // ============ Constructor ============
    
    constructor() {
        // Default charity address (can be updated by deployer pattern or governance)
        // Using a well-known charity address - update this to your preferred charity
        charityAddress = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619; // Example address
    }

    // ============ Internal Helpers ============

    /**
     * @notice For hackathon scope we require just 1 peer approval if >1 participant.
     *         Solo challenges auto-verify.
     */
    function _approvalThreshold(uint256 challengeId) internal view returns (uint256) {
        uint256 participantCount = participants[challengeId].length;
        if (participantCount <= 1) return 0;
        // Require all other participants to sign off (social verification)
        return participantCount - 1;
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
     * @notice Mark yourself as having completed the challenge (no proof)
     * @param challengeId The ID of the challenge
     */
    function markCompleted(uint256 challengeId) external {
        _markCompleted(challengeId, "");
    }

    /**
     * @notice Mark yourself as completed with a proof CID (photo hash/placeholder)
     * @param challengeId The ID of the challenge
     * @param proofCid    Off-chain proof identifier (e.g. IPFS CID / UUID)
     */
    function markCompletedWithProof(uint256 challengeId, string calldata proofCid) external {
        _markCompleted(challengeId, proofCid);
    }

    /**
     * @notice Internal completion handler
     */
    function _markCompleted(uint256 challengeId, string memory proofCid) internal {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotJoined();
        if (hasCompletedMapping[challengeId][msg.sender]) revert AlreadyCompleted();

        hasCompletedMapping[challengeId][msg.sender] = true;
        completers[challengeId].push(msg.sender);

        if (bytes(proofCid).length > 0) {
            completionProofCid[challengeId][msg.sender] = proofCid;
        }

        // Update user stats
        userStats[msg.sender].challengesCompleted++;

        emit CompletionMarked(challengeId, msg.sender);
        emit CompletionClaimed(challengeId, msg.sender, proofCid);
    }

    /**
     * @notice Peers verify a runner's completion claim.
     *         Any other participant can give +1 approval (or flag) before settlement.
     */
    function approveCompletion(uint256 challengeId, address runner, bool isValid) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (challenge.cancelled) revert AlreadyCancelled();
        if (challenge.settled) revert AlreadySettled();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotParticipantVerifier();
        if (msg.sender == runner) revert SelfApprovalNotAllowed();
        if (!hasCompletedMapping[challengeId][runner]) revert RunnerNotCompleted();
        if (hasApprovedCompletion[challengeId][runner][msg.sender]) revert AlreadyApproved();

        hasApprovedCompletion[challengeId][runner][msg.sender] = true;

        if (isValid) {
            completionApprovals[challengeId][runner] += 1;
        }

        emit CompletionApproved(
            challengeId,
            runner,
            msg.sender,
            isValid,
            completionApprovals[challengeId][runner],
            _approvalThreshold(challengeId)
        );
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

        emit EarlySettleVoteCast(
            challengeId, 
            msg.sender, 
            earlySettleVoteCount[challengeId], 
            totalParticipants
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
     *         Only verified completions are eligible (requires approvals >= threshold).
     */
    function _settleChallenge(uint256 challengeId) internal {
        Challenge storage challenge = challenges[challengeId];
        challenge.settled = true;
        
        address[] memory winners = getVerifiedCompleters(challengeId);
        address[] memory allParticipants = participants[challengeId];
        uint256 winnersCount = winners.length;
        uint256 totalPool = challenge.totalPool;
        uint256 prizePerWinner;
        
        // Check if this challenge is part of a group
        bool hasGroup = challenge.groupId > 0 && address(strideGroups) != address(0);

        if (winnersCount > 0) {
            // Split pool among verified completers
            prizePerWinner = totalPool / winnersCount;
            
            for (uint256 i = 0; i < winnersCount; i++) {
                address winner = winners[i];
                
                // Update winner stats
                userStats[winner].challengesWon++;
                userStats[winner].totalWon += prizePerWinner;

                // Update group leaderboard stats if part of a group
                if (hasGroup) {
                    try strideGroups.recordChallengeCompletion(
                        challenge.groupId - 1, // groupId is stored as groupId + 1
                        winner,
                        prizePerWinner,
                        true // didComplete = true for winners
                    ) {} catch {}
                }

                (bool success, ) = winner.call{value: prizePerWinner}("");
                if (!success) revert TransferFailed();
            }

            // Update loser stats (participants who are NOT verified winners)
            for (uint256 i = 0; i < allParticipants.length; i++) {
                address participant = allParticipants[i];
                bool isWinner = false;
                for (uint256 j = 0; j < winnersCount; j++) {
                    if (participant == winners[j]) {
                        isWinner = true;
                        break;
                    }
                }

                if (!isWinner) {
                    userStats[participant].totalLost += challenge.stakeAmount;
                    
                    // Update group leaderboard stats for losers
                    if (hasGroup) {
                        try strideGroups.recordChallengeCompletion(
                            challenge.groupId - 1,
                            participant,
                            0,
                            false // didComplete = false for losers
                        ) {} catch {}
                    }
                }
            }
            
            // Handle dust (any remainder due to division)
            uint256 dust = totalPool - (prizePerWinner * winnersCount);
            if (dust > 0) {
                (bool success, ) = challenge.creator.call{value: dust}("");
                if (!success) revert TransferFailed();
            }
        } else {
            // No verified completers - donate to charity
            if (charityAddress != address(0)) {
                totalDonatedToCharity += totalPool;
                
                (bool success, ) = charityAddress.call{value: totalPool}("");
                if (!success) revert TransferFailed();
                
                emit DonatedToCharity(challengeId, totalPool);
                
                // Update loser stats for all participants
                for (uint256 i = 0; i < allParticipants.length; i++) {
                    address participant = allParticipants[i];
                    userStats[participant].totalLost += challenge.stakeAmount;
                    
                    // Update group leaderboard stats for losers
                    if (hasGroup) {
                        try strideGroups.recordChallengeCompletion(
                            challenge.groupId - 1,
                            participant,
                            0,
                            false // didComplete = false
                        ) {} catch {}
                    }
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

    /**
     * @notice Set the StrideGroups contract address for leaderboard updates
     * @param _strideGroups Address of the StrideGroups contract
     */
    function setStrideGroups(address _strideGroups) external {
        // Simple access control - anyone can set it initially, then only the contract itself
        require(address(strideGroups) == address(0) || msg.sender == address(this), "Not authorized");
        
        address oldAddress = address(strideGroups);
        strideGroups = IStrideGroups(_strideGroups);
        
        emit StrideGroupsUpdated(oldAddress, _strideGroups);
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
     * @notice Check if an address has completed a challenge (self-claim)
     */
    function hasCompleted(uint256 challengeId, address participant) external view returns (bool) {
        return hasCompletedMapping[challengeId][participant];
    }

    /**
     * @notice Get all self-claimed completers of a challenge
     */
    function getCompleters(uint256 challengeId) public view returns (address[] memory) {
        return completers[challengeId];
    }

    /**
     * @notice Get verified completers (meets peer approval threshold)
     */
    function getVerifiedCompleters(uint256 challengeId) public view returns (address[] memory) {
        address[] memory claimed = completers[challengeId];
        uint256 threshold = _approvalThreshold(challengeId);
        if (threshold == 0) {
            return claimed;
        }

        uint256 verifiedCount;
        for (uint256 i = 0; i < claimed.length; i++) {
            if (completionApprovals[challengeId][claimed[i]] >= threshold) {
                verifiedCount++;
            }
        }

        address[] memory verified = new address[](verifiedCount);
        uint256 idx;
        for (uint256 i = 0; i < claimed.length; i++) {
            if (completionApprovals[challengeId][claimed[i]] >= threshold) {
                verified[idx] = claimed[i];
                idx++;
            }
        }

        return verified;
    }

    /**
     * @notice Get completion info for a runner
     */
    function getCompletionInfo(uint256 challengeId, address runner) external view returns (CompletionView memory) {
        bool claimed = hasCompletedMapping[challengeId][runner];
        uint256 approvals = completionApprovals[challengeId][runner];
        uint256 threshold = _approvalThreshold(challengeId);
        bool verified = claimed && (threshold == 0 || approvals >= threshold);

        return CompletionView({
            claimed: claimed,
            approvals: approvals,
            verified: verified,
            proofCid: completionProofCid[challengeId][runner]
        });
    }

    /**
     * @notice Check if a voter has already approved/flagged a runner
     */
    function hasApproved(uint256 challengeId, address runner, address voter) external view returns (bool) {
        return hasApprovedCompletion[challengeId][runner][voter];
    }

    /**
     * @notice Get approval threshold for a challenge
     */
    function getApprovalThreshold(uint256 challengeId) external view returns (uint256) {
        return _approvalThreshold(challengeId);
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
