# 🛠️ Development Environment Setup

This guide will walk you through setting up your local machine to develop, build, and run this project. This project is built using **React Native** and the **Ignite** boilerplate.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Git**: [Download here](https://git-scm.com/)
- **Node.js**: We recommend using the LTS version. 
  > **Note:** If you are on Windows, you will install Node via **Chocolatey** in Step 1. Follow the official React Native guide closely for this.
- **Yarn**: This project uses Yarn for package management. Install it via:
  ```bash
  npm install --global yarn
---

## 🚀 Step 1: React Native Environment

First, you must configure your machine for React Native development. This includes installing the Android SDK, Xcode (for macOS), and necessary environment variables.

👉 **Follow the official guide here:** [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

---

## 🔥 Step 2: Ignite Boilerplate Setup

This project utilizes [Ignite](https://github.com/infinitered/ignite), the most popular boilerplate for professional React Native apps. It comes with built-in patterns for state management, navigation, and theming.

👉 **Review the Ignite documentation:** [Ignite README & Documentation](https://github.com/infinitered/ignite?tab=readme-ov-file)

**Key Ignite Command:**
If you need to generate new components, screens, or models, use the Ignite generator:
```bash
npx ignite-cli generate --help
```
---

## 💻 Step 3: Project Installation

Once your environment is ready, follow these steps to get the app running:

1. **Clone the repository:** 
```bash
git clone <your-repo-url>
cd <project-folder-name>
```
2. **Install dependencies:**
```bash
yarn install
```

## 📱 Step 4: Running the App

**For Android** 
```bash
yarn android
```