# BallotFactory Deployment Guide

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 部署 BallotFactory

**方式一：使用 Hardhat Ignition（推荐）**

```bash
npx hardhat ignition deploy ignition/modules/BallotFactory.js --network sepolia
```

**方式二：使用脚本**

```bash
npx hardhat run scripts/deployFactory.js --network sepolia
```

部署成功后会输出合约地址，保存该地址。

### 4. 配置前端环境变量

将部署的合约地址添加到 `ballot-next.js` 项目的 `.env.local` 文件：

```
NEXT_PUBLIC_BALLOT_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

### 5. 创建测试投票

```bash
npx hardhat run scripts/createBallot.js --network sepolia "Proposal A" "Proposal B" "Proposal C"
```

### 6. 验证合约（可选）

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## 网络配置

| 网络 | Chain ID | RPC URL |
|------|----------|---------|
| Sepolia Testnet | 11155111 | https://sepolia.infura.io/v3/... |
| Localhost | 31337 | http://127.0.0.1:8545 |
| Hardhat | 31337 | 内置 |

## 常用命令

```bash
# 本地测试
npx hardhat node

# 运行测试
npx hardhat test

# 部署到本地网络
npx hardhat run scripts/deployFactory.js --network localhost

# 部署到 Sepolia
npx hardhat run scripts/deployFactory.js --network sepolia
```