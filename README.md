# Amanah - Finance Management App

Amanah is a personal, privacy-focused finance management application built for those who prefer manual tracking and want to manage their Zakat obligations accurately. Inspired by premium financial apps, it features a sleek dark mode, customizable themes, and a native-like experience for managing your finances.

## ✨ Key Features

- **Multi-Account Support**: Manage bank accounts and cash wallets separately with initial and current balance tracking.
- **Transaction History**: Track income, expenses, and internal transfers with detailed categorization.
- **Smart Pie Charts**: Visualize spending and income distribution with percentage breakdowns and category toggles.
- **Dynamic Theming**: Support for Dark Mode and beautiful Light Mode themes (Sky Blue, Mint Fresh, Lavender, Peach).
- **Zakat Calculator**: Accurate Zakat calculations based on current gold/silver prices, synced with your app balance.
- **Privacy First**: All data is managed manually; no sensitive bank connection required.
- **Fast & Responsive**: Built with React Native and Reanimated for smooth transitions and a premium feel.

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native (Expo SDK 54)
- **State Management**: React Context API
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Navigation**: React Navigation (Stack & Tabs)
- **Storage**: Expo SecureStore

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based auth

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AhmedGhannam17/Finance-management-app.git
   cd Finance-management-app
   ```

2. **Backend Setup**:
   ```bash
   cd amanah-backend
   npm install
   # Configure .env with your Supabase credentials
   npm run start:dev
   ```

3. **Mobile App Setup**:
   ```bash
   cd mobile-app
   npm install
   npx expo start
   ```

## 📄 License
This project is licensed under the MIT License.
