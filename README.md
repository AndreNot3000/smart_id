# Campus ID System

A comprehensive digital campus identity management system that provides secure, convenient, and modern student/lecturer ID functionality with integrated features for attendance tracking, QR code-based access, and institutional management.

## Overview

This project proposes the design and development of a Smart Campus ID System integrated with a cashless digital wallet, providing students with a secure, all-in-one digital identity accessible through QR code or NFC-enabled mobile devices.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **React Hooks** - State management

### Backend (Separate Repository)
- **Deno** - Modern JavaScript/TypeScript runtime
- **Hono** - Fast web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens

## Authentication Flow

### Institution-First Model

This system follows a secure, institution-controlled authentication model:

1. **Institution Registration** (Public)
   - Only institution admins can register
   - Creates institution with auto-generated code
   - Admin account created automatically
   - Route: `/register-institution`

2. **User Creation** (Admin Only)
   - Admins create student/lecturer accounts manually
   - Users receive activation email with token (7-day expiry)
   - Auto-generated IDs: STU (students), FAC (lecturers), EMP (admins)

3. **Account Activation**
   - Users click activation link in email
   - Set their password
   - Account becomes active
   - Route: `/activate-account?token=xxx`

4. **Sign In**
   - Users sign in with email/ID and password
   - Redirected to appropriate dashboard
   - Route: `/signup` (sign-in only page)

### User Roles

- **Students**: Access to student dashboard with QR code, attendance, CGPA calculator, events, etc.
- **Lecturers**: Access to lecturer dashboard with QR scanner, attendance management, course schedule
- **Admins**: Access to admin dashboard with full institutional management capabilities

## Features

### Student Dashboard (`/test-dashboard`)
- Digital ID card with QR code
- Wallet balance (₦ Naira currency)
- Attendance tracking
- CGPA calculator
- Campus events
- Rewards system
- FAQ section
- Campus map
- Lecturer directory

### Lecturer Dashboard (`/lecturer-dashboard`)
- QR code scanner for attendance
- Attendance management with statistics
- Weekly course schedule
- Course details and topics
- Faculty QR code display
- Real-time scanning simulation

### Admin Dashboard (`/admin-dashboard`)
- Student management (create, view, manage)
- Lecturer management (create, view, manage)
- Department management
- Course management
- Enrollment tracking
- Attendance reports
- Grade management
- Academic reports
- Campus events
- Announcements
- Institution settings

### Landing Page (`/`)
- Hero section with call-to-action
- Features showcase
- About section
- Contact information
- News & Updates link

### News Page (`/news`)
- University news
- Job opportunities
- Internships
- Scholarships
- Grants
- Search functionality
- Newsletter signup

## Project Structure

```
app/
├── page.tsx                      # Landing page
├── signup/page.tsx               # Sign-in page (students/lecturers/admins)
├── register-institution/page.tsx # Institution registration
├── activate-account/page.tsx     # Account activation
├── test-dashboard/page.tsx       # Student dashboard
├── lecturer-dashboard/page.tsx   # Lecturer dashboard
├── admin-dashboard/page.tsx      # Admin dashboard
├── news/page.tsx                 # News & updates
├── globals.css                   # Global styles
└── layout.tsx                    # Root layout

components/
├── ui/                           # Reusable UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── FormInput.tsx
│   ├── Sidebar.tsx
│   ├── DashboardHeader.tsx
│   ├── StatsCard.tsx
│   ├── WelcomeCard.tsx
│   ├── QuickActions.tsx
│   ├── UserCard.tsx
│   ├── ActivityCard.tsx
│   └── LoadingSpinner.tsx
├── dashboard/                    # Dashboard-specific components
│   ├── QRScanner.tsx
│   └── QRCodeDisplay.tsx
└── layout/                       # Layout components
    └── DashboardLayout.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm/yarn/pnpm/bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart_id
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

The backend is in a separate repository. Follow the backend README for setup instructions.

## Development Notes

### Demo Credentials
- OTP Code: `123456` (for testing)
- All user creation sends activation emails (simulated in development)

### Important Routes
- `/` - Landing page
- `/signup` - Sign-in page (no public signup)
- `/register-institution` - Institution registration (public)
- `/activate-account?token=xxx` - Account activation
- `/test-dashboard` - Student dashboard (use this instead of `/dashboard`)
- `/lecturer-dashboard` - Lecturer dashboard
- `/admin-dashboard` - Admin dashboard
- `/news` - News & updates

### Styling
- Uses Tailwind CSS v4 compatible syntax
- Custom animations and transitions
- Responsive design (mobile-first)
- Dark blue gradient theme
- Nigerian Naira (₦) currency format

## API Integration (TODO)

The frontend is ready for backend integration. Update the following:

1. **Institution Registration**: `/api/auth/register-institution`
2. **Account Activation**: `/api/auth/activate-account`
3. **Sign In**: `/api/auth/login`
4. **Token Verification**: `/api/auth/verify-activation-token/:token`
5. **Create Student**: `/api/admin/students`
6. **Create Lecturer**: `/api/admin/lecturers`
7. **List Students**: `/api/admin/students`
8. **List Lecturers**: `/api/admin/lecturers`

Replace the simulated API calls (setTimeout) with actual fetch calls to your backend.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
