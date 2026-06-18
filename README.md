# 🗳️ DApp Voting System Test Project

> 基于 Hardhat、Solidity、Next.js 和 MetaMask 构建的去中心化电子投票系统测试项目

## 📖 项目简介

本项目围绕区块链电子投票业务场景，完成智能合约开发、前端交互及系统测试验证工作。

系统实现了候选人管理、选民授权、链上投票、票数统计及结果展示等核心功能，并通过 MetaMask 钱包完成用户身份验证和链上交易签名。

在项目实施过程中，重点从软件测试工程角度对系统功能、权限控制、异常场景及数据一致性进行了验证，确保智能合约逻辑与前端业务流程稳定可靠。

---

## 🏗️ 系统架构

```text
User
 │
 ▼
MetaMask Wallet
 │
 ▼
Next.js Frontend
 │
 ▼
Ethers.js
 │
 ▼
Solidity Smart Contract
 │
 ▼
Hardhat Local Blockchain
```

---

## 🚀 项目启动

### 安装依赖

```bash
npm install
```

### 编译智能合约

```bash
npx hardhat compile
```

### 启动本地链

```bash
npx hardhat node
```

### 部署智能合约

```bash
npx hardhat run scripts/deployFactory.js --network localhost
```

### 启动前端

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

---

## 🛠️ 技术栈

### Blockchain

* Solidity
* Hardhat
* Ethers.js

### Frontend

* Next.js
* React

### Wallet

* MetaMask

### Development

* Node.js
* Git
* GitHub

---

## ✨ 核心功能

### 候选人管理

* 添加候选人
* 查询候选人信息
* 展示候选人列表

### 选民授权

* 白名单选民授权
* 选民身份验证

### 投票功能

* 链上投票
* 一人一票
* 防重复投票

### 实时统计

* 实时获取票数
* 动态更新投票结果

### 钱包交互

* MetaMask连接
* 钱包账户切换
* 交易签名确认

---

## 🧪 测试范围

### 功能测试

| 测试模块  | 测试结果     |
| ----- | -------- |
| 钱包连接  | ✅ Passed |
| 添加候选人 | ✅ Passed |
| 查询候选人 | ✅ Passed |
| 发起投票  | ✅ Passed |
| 票数统计  | ✅ Passed |
| 结果展示  | ✅ Passed |

---

### 权限测试

| 测试场景      | 测试结果     |
| --------- | -------- |
| 非管理员添加候选人 | ✅ Passed |
| 未授权账户投票   | ✅ Passed |
| 非法账户访问    | ✅ Passed |

---

### 异常测试

| 测试场景   | 测试结果     |
| ------ | -------- |
| 重复投票   | ✅ Passed |
| 钱包未连接  | ✅ Passed |
| 非法参数提交 | ✅ Passed |
| 交易取消   | ✅ Passed |

---

## 📋 测试用例示例

### TC001 钱包连接测试

**测试目标**

验证 MetaMask 钱包连接功能是否正常。

**测试步骤**

1. 打开系统首页
2. 点击“连接钱包”
3. 在 MetaMask 中确认授权

**预期结果**

* 成功连接钱包
* 页面显示当前账户地址
<img width="403" height="215" alt="image" src="https://github.com/user-attachments/assets/cfbc26cf-c352-49a1-b9a0-8acae05f056d" />

---

### TC002 重复投票验证

**测试目标**

验证系统是否能够阻止同一账户重复投票。

**测试步骤**

1. 使用账户A完成投票
2. 再次使用账户A发起投票

**预期结果**

* 系统拒绝重复投票
* 链上数据保持一致

---

### TC003 未授权账户投票验证

**测试目标**

验证未授权账户是否无法参与投票。

**测试步骤**

1. 使用未授权账户连接钱包
2. 点击投票按钮

**预期结果**

* 投票失败
* 系统提示无投票权限
<img width="483" height="147" alt="image" src="https://github.com/user-attachments/assets/e3ba2126-1541-4c33-aa90-bfccd9f9f47f" />

---


---

## 📁 项目结构

```text
DApp-Voting-System-Test
│
├── contracts
│   └── Ballot.sol
│
├── scripts
│   └── deployFactory.js
│
├── test
│   └── Ballot.test.js
│
├── frontend
│
├── screenshots
│
├── README.md
│
└── package.json
```

---

## 🎯 项目成果

* 完成去中心化投票系统功能验证
* 实现智能合约与前端交互测试
* 完成权限控制及异常场景验证
* 验证链上数据与页面展示一致性
* 提升 Web3 DApp 测试实践能力
* 积累智能合约测试与区块链应用测试经验

---

## 📈 Future Work

* Selenium自动化测试
* GitHub Actions自动化执行
* 测试报告自动生成
* 智能合约安全测试
* AI辅助测试用例生成

```
```
