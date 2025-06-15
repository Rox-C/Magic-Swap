# MagicSwap 项目

这是一个基于 Spring Boot 、 React 和 Flask 的全栈项目，旨在提供一个AI换装平台。

## 技术栈

### 后端

后端使用 Java Spring Boot 框架构建，主要技术栈包括：

- **Spring Boot**: 3.4.4
- **Java**: 24
- **Spring Data MongoDB**: 用于与 MongoDB 数据库交互。
- **Spring Security**: 用于身份验证和授权。
- **JJWT**: 用于生成和验证 JSON Web Tokens (JWT)。
- **Maven**: 项目管理和构建工具。

### 前端

前端使用 React 框架构建，主要技术栈包括：

- **React**: 18.2.0
- **React Router DOM**: 用于前端路由。
- **Axios**: 用于 HTTP 请求。
- **react-avatar-editor**: 用于用户头像编辑。
- **react-scripts**: Create React App 的核心脚本。
- **npm**: 包管理工具。

## 如何使用（注意把IP替换成自己的IP地址）

### 1. 克隆项目

首先，克隆本仓库到您的本地机器：

```bash
cd MagicSwap
```
### 2. 后端设置
1. 安装 Java 和 Maven : 确保您的系统安装了 Java Development Kit (JDK) 24 及以上版本和 Apache Maven。
2. 配置 MongoDB : 项目使用 MongoDB 作为数据库。请确保您已安装并运行 MongoDB 实例。您可能需要在 magicswap/src/main/resources/application.properties 或 application.yml 中配置数据库连接信息。
3. 构建并运行后端 : 进入 magicswap 目录，使用 Maven 构建并运行后端应用：
```bash
cd magicswap
mvn clean install
mvn spring-boot:run
```
### 3. AI 换装后端设置
1. 安装 Python : 确保您的系统安装了 Python。
2. 安装依赖 : 安装所需的 Python 依赖（省略具体查看https://github.com/levihsu/OOTDiffusion）。
3. 运行后端 : 启动 AI 换装后端应用：
   ```bash
   python app.py
   ```
   AI 换装后端服务默认运行在 http://localhost:5000 。
### 4. 前端设置
1. 安装 Node.js 和 npm : 确保您的系统安装了 Node.js 和 npm 。
2. 安装依赖 : 进入 frontend 目录，安装所有前端依赖：
```bash
cd frontend
npm install
```
1. 运行前端 : 启动前端开发服务器：
```bash
npm start
```
前端应用默认运行在 http://localhost:3000 (如果端口被占用，可能会自动选择其他端口)。

### 5. 访问应用
在后端和前端都成功运行后，您可以通过浏览器访问 http://localhost:3000 来使用 MagicSwap 应用。