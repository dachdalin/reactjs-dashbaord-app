# React.js Dashboard App

A modern, feature-rich dashboard application built with React, TypeScript, and Vite. This project features a premium dark theme with glassmorphism design, multiple dashboard pages, and a responsive layout.

## ✨ Features

- 🎨 **Premium Dark Theme** with glassmorphism design
- 📊 **Multiple Dashboard Pages**: Dashboard, Analytics, Projects, Teams, Calendar, Settings
- 🔐 **Authentication** ready (Auth.js integration)
- 📱 **Responsive Design** optimized for all devices
- ⚡ **Fast Development** with Vite and Hot Module Replacement (HMR)
- 🎯 **Type Safety** with TypeScript
- 🎭 **Modern UI Components** with Tailwind CSS
- 🧭 **Client-side Routing** with React Router DOM
- 🎨 **Hero Icons** for beautiful iconography

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.13.0
- **Icons**: Heroicons React 2.2.0
- **Utilities**: clsx for conditional classnames
- **Linting**: ESLint with TypeScript support

## 📁 Project Structure

```
Reactjs-dashboard-app/
├── public/              # Static assets
├── src/
│   ├── actions/        # Server actions and API calls
│   ├── assets/         # Images, fonts, and other assets
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Layout components (e.g., DashboardLayout)
│   ├── lib/            # Utility functions and helpers
│   ├── pages/          # Page components (Dashboard, Analytics, etc.)
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and design tokens
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher) or **yarn**

### 📥 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/dachdalin/reactjs-dashbaord-app.git

# Navigate to the project directory
cd reactjs-dashbaord-app
```

### 📦 Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install all required dependencies including:
- React and React DOM
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Heroicons
- ESLint and related plugins

### 🏃 Run the Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will start on `http://localhost:5173` (or another available port). The development server includes:
- ⚡ Hot Module Replacement (HMR) for instant updates
- 🔍 TypeScript type checking
- 🎨 Tailwind CSS with JIT compilation

### 🏗️ Build for Production

```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

This will:
1. Run TypeScript compiler to check for type errors
2. Build the application for production in the `dist` folder
3. Optimize and minify all assets

### 👀 Preview Production Build

```bash
# Using npm
npm run preview

# Or using yarn
yarn preview
```

This serves the production build locally for testing before deployment.

### 🧹 Lint Your Code

```bash
# Using npm
npm run lint

# Or using yarn
yarn lint
```

## 📄 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🎨 Customization

### Tailwind CSS Configuration

The project uses Tailwind CSS 4.x with custom design tokens defined in `src/index.css`. You can customize:
- Color schemes
- Typography
- Spacing
- Animations
- And more...

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add routing in `src/App.tsx`
3. Update navigation in the layout component

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a custom port:

```bash
npm run dev -- --port 3000
```

### Node Modules Issues

If you encounter dependency issues, try:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### TypeScript Errors

Ensure your IDE has TypeScript support enabled. For VS Code, install the official TypeScript extension.

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using React + TypeScript + Vite
