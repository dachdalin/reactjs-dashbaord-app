# 🚀 ReactJS Dashboard App

A modern, high-performance dashboard application built with **React 19**, **TypeScript**, and **Vite**. Features a bold, vibrant solid-color design system, JWT/Context Authentication, Global Toast notifications, drag-and-drop image uploading with centered percentage progress, and a Notion-style block article editor.

---

## ✨ Key Features

- 🎨 **Vibrant Solid-Color Design System**: Clean, high-contrast UI with vivid solid colors (Emerald, Rose, Amber, Indigo, Sky). Zero gradients for a crisp aesthetic.
- 🔔 **Global Toast & Confirmation System**: Top-right animated toast notifications (`useToast`) with deduplication and custom confirmation modals.
- 🖼️ **Global Drag & Drop Image Uploader**: Responsive mobile/desktop uploader featuring a centered circular progress percentage overlay (`0%` → `100%`), preview state, and instant replace/remove controls.
- 📝 **Notion-Style Article Block Editor**: Compose blog posts using paragraph text, multi-level headings (H1, H2, H3), and syntax code blocks with language selectors.
- 👥 **User & Team Management**: Role-based access control with distinct badges (`ADMIN`, `AUTHOR`, `USER`) and push notification triggers.
- 🏷️ **Tag Manager**: Interactive tag creator with automated URL slug previewing.
- 💬 **Comments & Contact Inbox**: Manage incoming customer messages and comment notification feeds.
- 📄 **Dynamic Pages Editor**: Rich-text editing for core pages (About, Contact, Privacy Policy, Terms & Conditions).
- ⚙️ **System Settings**: Key-value system parameters management with presets.
- 🧭 **Intelligent Sidebar Navigation**: Automatic active state highlighting supporting nested sub-routes (e.g., `/blogs/create` highlights the **Blogs** menu link).

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Type Checking**: TypeScript 5.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router DOM 7.x
- **Icons**: Heroicons React 2.x
- **State & Context**: React Context API (`AuthContext`, `ToastProvider`)

---

## 📁 Project Structure

```text
Reactjs-dashboard-app/
├── public/                # Static public assets
├── src/
│   ├── components/        # UI & Feature Components
│   │   ├── auth/          # Auth forms & widgets
│   │   ├── blog/          # Banner uploader & blog tools
│   │   ├── editor/        # Rich text editor
│   │   ├── notifications/ # Push notification modals
│   │   └── ui/            # Global UI primitives (ImageUploader, UserProfile, etc.)
│   ├── context/           # React Context Providers (AuthContext, etc.)
│   ├── hook/              # Custom Hooks (useToast, etc.)
│   ├── layouts/           # Shared Layout Shells (RootLayout)
│   ├── lib/               # API actions, client helpers & type definitions
│   ├── pages/             # Route-level screens
│   │   ├── auth/          # Login & Register screens
│   │   ├── blog/          # Blog list & Notion-style PostEditor
│   │   ├── comments/      # Comments & Inbox manager
│   │   ├── dashboard/     # Content overview & statistics
│   │   ├── pages/         # Static page content editor
│   │   ├── profile/       # User profile page
│   │   ├── settings/      # System settings manager
│   │   ├── tags/          # Tag management screen
│   │   └── team/          # User management screen
│   ├── App.tsx            # Main App Router & Protected Routes
│   ├── main.tsx           # Application Entry Point & Provider Wrappers
│   └── index.css          # Global Tailwind CSS tokens & keyframe animations
├── index.html             # HTML Entry Template
├── package.json           # Scripts & Dependencies
├── tsconfig.json          # TypeScript Configuration
└── vite.config.ts         # Vite Configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 📥 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/dachdalin/reactjs-dashbaord-app.git
   cd reactjs-dashbaord-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📄 Available Commands

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) |
| `npm run build` | Runs `tsc -b` type-check and compiles for production in `/dist` |
| `npm run preview` | Serves the production bundle locally for verification |
| `npm run lint` | Runs ESLint checks across the project |

---

## 📝 License

This project is private and proprietary.
