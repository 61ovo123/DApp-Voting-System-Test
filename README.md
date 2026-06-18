# DApp Voting System Test Project

## 项目简介

本项目基于 Hardhat、Solidity、Next.js 和 MetaMask 构建去中心化电子投票系统，并从测试工程角度对系统功能、权限控制及异常场景进行验证。

项目实现了候选人管理、选民授权、链上投票、票数统计及钱包交互等核心功能。

---

## 技术栈

* Solidity
* Hardhat
* Next.js
* Ethers.js
* MetaMask
* Node.js

---

## 核心功能

### 候选人管理

* 添加候选人
* 查询候选人信息

### 投票管理

* 选民授权
* 链上投票
* 实时计票

### 权限控制

* 管理员权限验证
* 选民资格验证
* 防重复投票

### 钱包交互

* MetaMask连接
* 交易签名
* 链上数据同步

---

## 测试验证

### 功能测试

| 测试模块  | 测试结果   |
| ----- | ------ |
| 创建候选人 | Passed |
| 钱包连接  | Passed |
| 发起投票  | Passed |
| 票数统计  | Passed |

### 权限测试

| 测试场景      | 测试结果   |
| --------- | ------ |
| 非管理员添加候选人 | Passed |
| 未授权账户投票   | Passed |

### 异常测试

| 测试场景   | 测试结果   |
| ------ | ------ |
| 重复投票   | Passed |
| 非法账户操作 | Passed |

---

## 项目截图

### 首页

<img width="403" height="215" alt="image" src="https://github.com/user-attachments/assets/5441c5c6-d8fe-4c23-beea-5a8764bbd5e2" />


### 投票过程

<img width="484" height="273" alt="image" src="https://github.com/user-attachments/assets/08258f20-5dd7-45fc-b509-a83f40f46ee5" />

<img width="428" height="299" alt="image" src="https://github.com/user-attachments/assets/3d1a85fd-be13-4565-a922-a53ef7a8c9b1" />

### 投票结果

<img width="483" height="147" alt="image" src="https://github.com/user-attachments/assets/005b60b1-2db5-43b3-bf6c-f41b71b89279" />
<img width="484" height="273" alt="image" src="https://github.com/user-attachments/assets/6b3a62a0-46bc-462a-8847-1ecae01dd3ba" />


---

## 测试成果

* 完成智能合约核心逻辑验证
* 完成权限控制验证
* 完成异常场景验证
* 实现前端与智能合约交互测试
* 验证链上数据与页面展示一致性

---

## 后续优化

* Selenium自动化测试
* GitHub Actions持续集成
* 测试报告自动生成
* 智能合约安全测试
