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
        uint256 totalPool;
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

    // ============ Events ============
    
    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed creator,
        uint256 stakeAmount,
        uint256 endTime,
        string description
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
    error IncorrectStakeAmount();
    error TransferFailed();

    // ============ External Functions ============
    
    /**
     * @notice Create a new challenge and stake as the first participant
     * @param stakeAmount The amount each participant must stake (in wei)
     * @param duration How long the challenge lasts (in seconds)
     * @param description A description of the challenge (e.g., "5K run")
     * @return challengeId The ID of the newly created challenge
     */
    function createChallenge(
        uint256 stakeAmount,
        uint256 duration,
        string calldata description
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
            totalPool: stakeAmount
        });

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;

        emit ChallengeCreated(
            challengeId,
            msg.sender,
            stakeAmount,
            endTime,
            description
        );
    }

    /**
     * @notice Join an existing challenge by staking the required amount
     * @param challengeId The ID of the challenge to join
     */
    function joinChallenge(uint256 challengeId) external payable {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (hasJoinedMapping[challengeId][msg.sender]) revert AlreadyJoined();
        if (msg.value != challenge.stakeAmount) revert IncorrectStakeAmount();

        participants[challengeId].push(msg.sender);
        hasJoinedMapping[challengeId][msg.sender] = true;
        challenge.totalPool += msg.value;

        emit ParticipantJoined(challengeId, msg.sender);
    }

    /**
     * @notice Mark yourself as having completed the challenge
     * @param challengeId The ID of the challenge
     */
    function markCompleted(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (block.timestamp >= challenge.endTime) revert ChallengeEnded();
        if (!hasJoinedMapping[challengeId][msg.sender]) revert NotJoined();
        if (hasCompletedMapping[challengeId][msg.sender]) revert AlreadyCompleted();

        hasCompletedMapping[challengeId][msg.sender] = true;
        completers[challengeId].push(msg.sender);

        emit CompletionMarked(challengeId, msg.sender);
    }

    /**
     * @notice Settle the challenge and distribute the prize pool
     * @dev Can only be called after the challenge has ended
     * @param challengeId The ID of the challenge to settle
     */
    function settleChallenge(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        
        if (challenge.endTime == 0) revert ChallengeNotFound();
        if (block.timestamp < challenge.endTime) revert ChallengeNotEnded();
        if (challenge.settled) revert AlreadySettled();

        challenge.settled = true;
        
        address[] memory winners = completers[challengeId];
        uint256 winnersCount = winners.length;
        uint256 totalPool = challenge.totalPool;
        uint256 prizePerWinner;

        if (winnersCount > 0) {
            // Split pool among completers
            prizePerWinner = totalPool / winnersCount;
            
            for (uint256 i = 0; i < winnersCount; i++) {
                (bool success, ) = winners[i].call{value: prizePerWinner}("");
                if (!success) revert TransferFailed();
            }
            
            // Handle dust (any remainder due to division)
            uint256 dust = totalPool - (prizePerWinner * winnersCount);
            if (dust > 0) {
                (bool success, ) = challenge.creator.call{value: dust}("");
                if (!success) revert TransferFailed();
            }
        } else {
            // No completers - refund everyone
            address[] memory allParticipants = participants[challengeId];
            uint256 refundAmount = challenge.stakeAmount;
            
            for (uint256 i = 0; i < allParticipants.length; i++) {
                (bool success, ) = allParticipants[i].call{value: refundAmount}("");
                if (!success) revert TransferFailed();
            }
        }

        emit ChallengeSettled(challengeId, winnersCount, prizePerWinner);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get challenge details
     * @param challengeId The ID of the challenge
     * @return The challenge struct
     */
    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /**
     * @notice Get all participants of a challenge
     * @param challengeId The ID of the challenge
     * @return Array of participant addresses
     */
    function getParticipants(uint256 challengeId) external view returns (address[] memory) {
        return participants[challengeId];
    }

    /**
     * @notice Check if an address has joined a challenge
     * @param challengeId The ID of the challenge
     * @param participant The address to check
     * @return True if the address has joined
     */
    function hasJoined(uint256 challengeId, address participant) external view returns (bool) {
        return hasJoinedMapping[challengeId][participant];
    }

    /**
     * @notice Check if an address has completed a challenge
     * @param challengeId The ID of the challenge
     * @param participant The address to check
     * @return True if the address has marked completion
     */
    function hasCompleted(uint256 challengeId, address participant) external view returns (bool) {
        return hasCompletedMapping[challengeId][participant];
    }

    /**
     * @notice Get all completers of a challenge
     * @param challengeId The ID of the challenge
     * @return Array of completer addresses
     */
    function getCompleters(uint256 challengeId) external view returns (address[] memory) {
        return completers[challengeId];
    }
}

