# V Cloud Tech - CRM & E-commerce Platform

A comprehensive CRM and E-commerce management system with AI Agent marketplace capabilities. Built with modern web technologies for managing products, AI agents, customers, orders, and business operations.

## 🚀 Features

- **Product Management**: Complete CRUD operations for products with categories, brands, tags, pricing, and inventory management
- **AI Agent Marketplace**: Manage AI agents with categories, delivery methods, publishers, and detailed agent profiles
- **Admin Dashboard**: Real-time analytics and statistics for products and AI agents
- **E-commerce Operations**: Product inquiries, customer management, seller management, and order processing
- **Content Management**: Rich text editing, image galleries, document management, and resource links/videos
- **Advanced Search & Filtering**: Multi-criteria search with pagination and sorting
- **Responsive Design**: Modern UI built with React Bootstrap and custom components

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **React Bootstrap** for UI components
- **React Hook Form** for form management
- **Axios** for API calls
- **React Query** for data fetching and caching
- **ApexCharts** for data visualization

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with PostgreSQL/MySQL
- **JWT** for authentication
- **Multer** for file uploads
- **Node Cron** for scheduled tasks
- **Stripe** integration for payments

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL or MySQL
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Configure .env file with database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
CRM/
├── backend/          # Express.js API server
│   ├── controllers/  # Route controllers
│   ├── models/       # Sequelize models
│   ├── routes/       # API routes
│   └── middleware/   # Custom middleware
├── frontend/         # React application
│   ├── src/
│   │   ├── app/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── http/     # API service layer
│   │   └── assets/   # Static assets
└── README.md
```

## 🔑 Key Modules

- **Products**: Full product lifecycle management
- **AI Agents**: AI tool marketplace with detailed profiles
- **Categories & Tags**: Hierarchical categorization system
- **Dashboard**: Analytics and business insights
- **User Management**: Authentication and authorization
- **File Management**: Image and document handling

## 📝 License

ISC

## 👥 Contributors

V Cloud Tech Team
