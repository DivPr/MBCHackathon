// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StrideChallengeManager.sol";

/**
 * @title StrideGroups
 * @notice Manages friend groups for social fitness challenges
 * @dev Groups can have multiple members, leaderboards, and shared challenges
 */
contract StrideGroups {
    // ============ Structs ============
    
    struct Group {
        uint256 id;
        string name;
        string description;
        address creator;
        address[] members;
        uint256[] challengeIds;
        uint256 createdAt;
        bool isPrivate;
        bytes32 inviteCode;
        bool deleted;
    }
    
    struct MemberStats {
        uint256 challengesCompleted;
        uint256 challengesJoined;
        uint256 totalStaked;
        uint256 totalWon;
        uint256 lastActive;
        uint256 winStreak;
        uint256 bestWinStreak;
    }

    struct GroupStats {
        uint256 totalChallenges;
        uint256 totalStaked;
        uint256 totalDistributed;
        uint256 activeChallenges;
    }
    
    // ============ State Variables ============
    
    uint256 public groupCount;
    mapping(uint256 => Group) public groups;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(uint256 => mapping(address => MemberStats)) public memberStats;
    mapping(uint256 => GroupStats) public groupStats;
    mapping(bytes32 => uint256) public inviteCodeToGroup;
    mapping(address => uint256[]) public userGroups;
    
    StrideChallengeManager public challengeManager;
    
    // ============ Events ============
    
    event GroupCreated(uint256 indexed groupId, string name, address indexed creator, bool isPrivate);
    event GroupDeleted(uint256 indexed groupId, address indexed deletedBy);
    event MemberJoined(uint256 indexed groupId, address indexed member);
    event MemberLeft(uint256 indexed groupId, address indexed member);
    event ChallengeAddedToGroup(uint256 indexed groupId, uint256 indexed challengeId, address indexed creator);
    event StatsUpdated(uint256 indexed groupId, address indexed member);
    event GroupDescriptionUpdated(uint256 indexed groupId, string newDescription);
    
    // ============ Errors ============
    
    error GroupNotFound();
    error GroupIsDeleted();
    error NotGroupCreator();
    error AlreadyMember();
    error NotMember();
    error CreatorCannotLeave();
    error InvalidInviteCode();
    error NameRequired();
    error NameTooLong();
    error GroupHasActiveMembers();
    
    // ============ Constructor ============
    
    constructor(address _challengeManager) {
        challengeManager = StrideChallengeManager(_challengeManager);
    }
    
    // ============ Modifiers ============
    
    modifier groupExists(uint256 _groupId) {
        if (_groupId >= groupCount) revert GroupNotFound();
        if (groups[_groupId].deleted) revert GroupIsDeleted();
        _;
    }
    
    modifier onlyCreator(uint256 _groupId) {
        if (groups[_groupId].creator != msg.sender) revert NotGroupCreator();
        _;
    }
    
    modifier onlyMember(uint256 _groupId) {
        if (!isMember[_groupId][msg.sender]) revert NotMember();
        _;
    }
    
    // ============ Group Management ============
    
    /**
     * @notice Create a new friend group
     */
    function createGroup(
        string calldata _name,
        string calldata _description,
        bool _isPrivate
    ) external returns (uint256) {
        if (bytes(_name).length == 0) revert NameRequired();
        if (bytes(_name).length > 50) revert NameTooLong();
        
        uint256 groupId = groupCount++;
        
        bytes32 inviteCode = _isPrivate 
            ? keccak256(abi.encodePacked(groupId, msg.sender, block.timestamp, block.prevrandao))
            : bytes32(0);
        
        Group storage group = groups[groupId];
        group.id = groupId;
        group.name = _name;
        group.description = _description;
        group.creator = msg.sender;
        group.createdAt = block.timestamp;
        group.isPrivate = _isPrivate;
        group.inviteCode = inviteCode;
        group.deleted = false;
        
        group.members.push(msg.sender);
        isMember[groupId][msg.sender] = true;
        userGroups[msg.sender].push(groupId);
        memberStats[groupId][msg.sender].lastActive = block.timestamp;
        
        if (_isPrivate) {
            inviteCodeToGroup[inviteCode] = groupId;
        }
        
        emit GroupCreated(groupId, _name, msg.sender, _isPrivate);
        emit MemberJoined(groupId, msg.sender);
        
        return groupId;
    }
    
    /**
     * @notice Delete a group (only creator, and only if they're the only member)
     */
    function deleteGroup(uint256 _groupId) external groupExists(_groupId) onlyCreator(_groupId) {
        Group storage group = groups[_groupId];
        
        // Can only delete if creator is the only member
        if (group.members.length > 1) revert GroupHasActiveMembers();
        
        group.deleted = true;
        isMember[_groupId][msg.sender] = false;
        
        // Clear invite code mapping
        if (group.isPrivate) {
            delete inviteCodeToGroup[group.inviteCode];
        }
        
        // Remove from user's groups
        _removeFromUserGroups(msg.sender, _groupId);
        
        emit GroupDeleted(_groupId, msg.sender);
    }
    
    /**
     * @notice Join a public group
     */
    function joinGroup(uint256 _groupId) external groupExists(_groupId) {
        if (isMember[_groupId][msg.sender]) revert AlreadyMember();
        
        Group storage group = groups[_groupId];
        if (group.isPrivate) revert InvalidInviteCode();
        
        group.members.push(msg.sender);
        isMember[_groupId][msg.sender] = true;
        userGroups[msg.sender].push(_groupId);
        memberStats[_groupId][msg.sender].lastActive = block.timestamp;
        
        emit MemberJoined(_groupId, msg.sender);
    }
    
    /**
     * @notice Join a private group with invite code
     */
    function joinGroupWithCode(bytes32 _inviteCode) external {
        uint256 groupId = inviteCodeToGroup[_inviteCode];
        
        // Check if valid invite code
        if (groups[groupId].inviteCode != _inviteCode) revert InvalidInviteCode();
        if (groups[groupId].deleted) revert GroupIsDeleted();
        if (isMember[groupId][msg.sender]) revert AlreadyMember();
        
        Group storage group = groups[groupId];
        
        group.members.push(msg.sender);
        isMember[groupId][msg.sender] = true;
        userGroups[msg.sender].push(groupId);
        memberStats[groupId][msg.sender].lastActive = block.timestamp;
        
        emit MemberJoined(groupId, msg.sender);
    }
    
    /**
     * @notice Leave a group
     */
    function leaveGroup(uint256 _groupId) external groupExists(_groupId) onlyMember(_groupId) {
        if (groups[_groupId].creator == msg.sender) revert CreatorCannotLeave();
        
        isMember[_groupId][msg.sender] = false;
        
        // Remove from members array
        Group storage group = groups[_groupId];
        for (uint256 i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                group.members[i] = group.members[group.members.length - 1];
                group.members.pop();
                break;
            }
        }
        
        // Remove from user's groups
        _removeFromUserGroups(msg.sender, _groupId);
        
        emit MemberLeft(_groupId, msg.sender);
    }
    
    /**
     * @notice Transfer group ownership (creator only)
     */
    function transferOwnership(uint256 _groupId, address _newCreator) 
        external 
        groupExists(_groupId) 
        onlyCreator(_groupId) 
    {
        if (!isMember[_groupId][_newCreator]) revert NotMember();
        groups[_groupId].creator = _newCreator;
    }
    
    /**
     * @notice Update group description (creator only)
     */
    function updateDescription(uint256 _groupId, string calldata _description) 
        external 
        groupExists(_groupId) 
        onlyCreator(_groupId) 
    {
        groups[_groupId].description = _description;
        emit GroupDescriptionUpdated(_groupId, _description);
    }
    
    /**
     * @notice Regenerate invite code (creator only, private groups)
     */
    function regenerateInviteCode(uint256 _groupId) 
        external 
        groupExists(_groupId) 
        onlyCreator(_groupId) 
        returns (bytes32) 
    {
        Group storage group = groups[_groupId];
        require(group.isPrivate, "Only private groups have invite codes");
        
        // Delete old mapping
        delete inviteCodeToGroup[group.inviteCode];
        
        // Generate new code
        bytes32 newCode = keccak256(abi.encodePacked(_groupId, msg.sender, block.timestamp, block.prevrandao));
        group.inviteCode = newCode;
        inviteCodeToGroup[newCode] = _groupId;
        
        return newCode;
    }
    
    /**
     * @notice Add a challenge to a group and update stats
     */
    function addChallengeToGroup(uint256 _groupId, uint256 _challengeId, uint256 _stakeAmount) 
        external 
        groupExists(_groupId) 
        onlyMember(_groupId) 
    {
        groups[_groupId].challengeIds.push(_challengeId);
        
        // Update group stats
        groupStats[_groupId].totalChallenges++;
        groupStats[_groupId].activeChallenges++;
        groupStats[_groupId].totalStaked += _stakeAmount;
        
        // Update member stats
        memberStats[_groupId][msg.sender].challengesJoined++;
        memberStats[_groupId][msg.sender].totalStaked += _stakeAmount;
        memberStats[_groupId][msg.sender].lastActive = block.timestamp;
        
        emit ChallengeAddedToGroup(_groupId, _challengeId, msg.sender);
    }
    
    /**
     * @notice Record challenge completion for a member
     */
    function recordChallengeCompletion(
        uint256 _groupId,
        address _member,
        uint256 _amountWon,
        bool _didComplete
    ) external groupExists(_groupId) {
        if (!isMember[_groupId][_member]) return;
        
        MemberStats storage stats = memberStats[_groupId][_member];
        
        if (_didComplete) {
            stats.challengesCompleted++;
            stats.totalWon += _amountWon;
            stats.winStreak++;
            if (stats.winStreak > stats.bestWinStreak) {
                stats.bestWinStreak = stats.winStreak;
            }
        } else {
            stats.winStreak = 0;
        }
        
        stats.lastActive = block.timestamp;
        
        // Update group stats
        groupStats[_groupId].totalDistributed += _amountWon;
        if (groupStats[_groupId].activeChallenges > 0) {
            groupStats[_groupId].activeChallenges--;
        }
        
        emit StatsUpdated(_groupId, _member);
    }
    
    // ============ Internal Functions ============
    
    function _removeFromUserGroups(address _user, uint256 _groupId) internal {
        uint256[] storage groups_ = userGroups[_user];
        for (uint256 i = 0; i < groups_.length; i++) {
            if (groups_[i] == _groupId) {
                groups_[i] = groups_[groups_.length - 1];
                groups_.pop();
                break;
            }
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get group details
     */
    function getGroup(uint256 _groupId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        address creator,
        uint256 memberCount,
        uint256 challengeCount,
        uint256 createdAt,
        bool isPrivate,
        bool deleted
    ) {
        Group storage group = groups[_groupId];
        return (
            group.id,
            group.name,
            group.description,
            group.creator,
            group.members.length,
            group.challengeIds.length,
            group.createdAt,
            group.isPrivate,
            group.deleted
        );
    }
    
    /**
     * @notice Get group members
     */
    function getGroupMembers(uint256 _groupId) external view returns (address[] memory) {
        return groups[_groupId].members;
    }
    
    /**
     * @notice Get group challenges
     */
    function getGroupChallenges(uint256 _groupId) external view returns (uint256[] memory) {
        return groups[_groupId].challengeIds;
    }
    
    /**
     * @notice Get user's groups (filters out deleted)
     */
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        uint256[] memory allGroups = userGroups[_user];
        uint256 activeCount = 0;
        
        // Count active groups
        for (uint256 i = 0; i < allGroups.length; i++) {
            if (!groups[allGroups[i]].deleted) {
                activeCount++;
            }
        }
        
        // Build result array
        uint256[] memory result = new uint256[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < allGroups.length; i++) {
            if (!groups[allGroups[i]].deleted) {
                result[idx++] = allGroups[i];
            }
        }
        
        return result;
    }
    
    /**
     * @notice Get invite code for group creator
     */
    function getInviteCode(uint256 _groupId) external view returns (bytes32) {
        require(groups[_groupId].creator == msg.sender, "Only creator can view invite code");
        return groups[_groupId].inviteCode;
    }
    
    /**
     * @notice Get member stats
     */
    function getMemberStats(uint256 _groupId, address _member) external view returns (MemberStats memory) {
        return memberStats[_groupId][_member];
    }
    
    /**
     * @notice Get group stats
     */
    function getGroupStats(uint256 _groupId) external view returns (GroupStats memory) {
        return groupStats[_groupId];
    }
    
    /**
     * @notice Get leaderboard for a group (sorted by completions)
     */
    function getLeaderboard(uint256 _groupId) external view returns (
        address[] memory members,
        uint256[] memory completions,
        uint256[] memory totalWon
    ) {
        Group storage group = groups[_groupId];
        uint256 len = group.members.length;
        
        members = new address[](len);
        completions = new uint256[](len);
        totalWon = new uint256[](len);
        
        for (uint256 i = 0; i < len; i++) {
            address member = group.members[i];
            MemberStats storage stats = memberStats[_groupId][member];
            members[i] = member;
            completions[i] = stats.challengesCompleted;
            totalWon[i] = stats.totalWon;
        }
        
        // Simple bubble sort by completions (fine for small groups)
        for (uint256 i = 0; i < len; i++) {
            for (uint256 j = i + 1; j < len; j++) {
                if (completions[j] > completions[i]) {
                    (members[i], members[j]) = (members[j], members[i]);
                    (completions[i], completions[j]) = (completions[j], completions[i]);
                    (totalWon[i], totalWon[j]) = (totalWon[j], totalWon[i]);
                }
            }
        }
        
        return (members, completions, totalWon);
    }
    
    /**
     * @notice Check if group is deleted
     */
    function isGroupDeleted(uint256 _groupId) external view returns (bool) {
        return groups[_groupId].deleted;
    }
}
