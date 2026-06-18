// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./Ballot.sol";

/// @title 投票工厂合约
/// @author Your Name
/// @notice 工厂合约模式 - 通过调用函数创建投票合约，节省Gas费用
/// @dev 所有require错误消息使用英文，避免编译问题
contract BallotFactory {
    // 工厂合约所有者地址
    address public owner;
    
    // 存储所有创建的投票合约地址数组
    address[] public ballots;
    
    // 投票合约地址 => 投票描述 (用于记录每个投票的说明)
    mapping(address => string) public ballotDescriptions;
    
    // 投票合约地址 => 创建者地址 (记录谁创建了这个投票)
    mapping(address => address) public ballotCreators;
    
    /// @notice 投票创建事件
    /// @param ballotAddress 新创建的投票合约地址
    /// @param creator 创建者地址
    /// @param proposalCount 提案数量
    /// @param description 投票描述
    event BallotCreated(
        address indexed ballotAddress,
        address indexed creator,
        uint256 proposalCount,
        string description
    );
    
    /// @notice 构造函数 - 部署时设置所有者为部署者
    constructor() {
        owner = msg.sender;
    }
    
    /// @notice 创建新的投票合约
    /// @param proposalNames 提案名称数组（bytes32格式）
    /// @param description 投票描述（用于说明这次投票的目的）
    /// @return 新创建的投票合约地址
    function createBallot(bytes32[] calldata proposalNames, string calldata description) external returns (address) {
        // 验证：至少需要两个提案
        require(proposalNames.length >= 2, "At least two proposals required");
        // 验证：描述不能为空
        require(bytes(description).length > 0, "Description cannot be empty");
        
        // 创建新的Ballot合约实例
        Ballot newBallot = new Ballot(proposalNames, msg.sender);
        address newBallotAddress = address(newBallot);
        
        // 存储新合约地址到数组
        ballots.push(newBallotAddress);
        // 存储投票描述
        ballotDescriptions[newBallotAddress] = description;
        // 存储创建者地址
        ballotCreators[newBallotAddress] = msg.sender;
        
        // 触发事件，通知外部监听者
        emit BallotCreated(
            newBallotAddress,
            msg.sender,
            proposalNames.length,
            description
        );
        
        // 返回新创建的合约地址
        return newBallotAddress;
    }
    
    /// @notice 获取所有创建的投票合约数量
    /// @return 投票合约总数
    function getBallotCount() external view returns (uint256) {
        return ballots.length;
    }
    
    /// @notice 获取指定索引的投票合约地址
    /// @param index 数组索引（从0开始）
    /// @return 投票合约地址
    function getBallot(uint256 index) external view returns (address) {
        require(index < ballots.length, "Index out of bounds");
        return ballots[index];
    }
    
    /// @notice 获取所有投票合约地址
    /// @return 所有投票合约地址数组
    function getAllBallots() external view returns (address[] memory) {
        return ballots;
    }
    
    /// @notice 获取投票的完整信息
    /// @param index 数组索引
    /// @return ballotAddress 投票合约地址
    /// @return description 投票描述
    /// @return creator 创建者地址
    function getBallotInfo(uint256 index) external view returns (
        address ballotAddress,
        string memory description,
        address creator
    ) {
        require(index < ballots.length, "Index out of bounds");
        address addr = ballots[index];
        return (addr, ballotDescriptions[addr], ballotCreators[addr]);
    }
    
    /// @notice 获取指定投票合约的描述
    /// @param ballotAddress 投票合约地址
    /// @return 投票描述字符串
    function getBallotDescription(address ballotAddress) external view returns (string memory) {
        return ballotDescriptions[ballotAddress];
    }
    
    /// @notice 获取指定投票合约的创建者
    /// @param ballotAddress 投票合约地址
    /// @return 创建者地址
    function getBallotCreator(address ballotAddress) external view returns (address) {
        return ballotCreators[ballotAddress];
    }
}