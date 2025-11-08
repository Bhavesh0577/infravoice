# InfraVoice Frontend

Next.js 14 frontend for InfraVoice - Voice-powered Infrastructure-as-Code platform.

## 🚀 Features

- **Modern UI**: Next.js 14 with App Router and React 19
- **Responsive Design**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Zod validation
- **Code Editor**: Monaco Editor for Terraform code editing
- **Animations**: Framer Motion for smooth transitions
- **Toast Notifications**: React Hot Toast for user feedback
- **API Integration**: Axios with automatic token refresh

## 📋 Requirements

- Node.js 20+
- npm or yarn

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth group
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/                 # Protected routes group
│   │   ├── dashboard/
│   │   ├── deploy/
│   │   ├── deployments/
│   │   └── settings/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── features/              # Feature-specific components
│   │   ├── VoiceInput/
│   │   ├── CodeEditor/
│   │   ├── SecurityAnalysis/
│   │   └── CostEstimate/
│   └── layout/                # Layout components
│       └── Navbar.tsx
├── services/                  # API services
│   ├── api.ts                # Axios instance
│   ├── authService.ts
│   ├── voiceService.ts
│   ├── codeService.ts
│   ├── securityService.ts
│   ├── costService.ts
│   └── deploymentService.ts
├── store/                     # Zustand stores
│   ├── authStore.ts
│   ├── deploymentStore.ts
│   └── uiStore.ts
└── hooks/                     # Custom React hooks
    ├── useAuth.ts
    ├── useVoiceRecording.ts
    └── useDeployment.ts
```

## 🎨 Design System

### Colors

```css
--color-primary: #14b8a6        /* Teal */
--color-secondary: #6366f1      /* Indigo */
--color-background: #fef7f1     /* Cream */
--color-surface: #ffffff        /* White */
--color-text: #1f2937           /* Gray 900 */
```

## 📦 Build & Deploy

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Connect GitHub repository
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy from main branch

## 📄 License

MIT License
