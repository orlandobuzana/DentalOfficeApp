# SmileCare Dental Management System

A comprehensive dental practice management system with patient portal, appointment booking, admin panel, and AI-powered chatbot.

## Screenshots

### Patient Dashboard
![Patient Dashboard](docs/screenshots/patient-dashboard.png)
*Modern patient portal with gradient design, upcoming appointments, and quick action sidebar*

### Appointment Booking Calendar
![Appointment Calendar](docs/screenshots/appointment-calendar.png)
*Interactive calendar with procedure-based time slot filtering and device calendar integration*

### Admin Panel
![Admin Panel](docs/screenshots/admin-panel.png)
*Comprehensive admin dashboard with appointment management, analytics, and quick management tools*

### Reports & Analytics
![Reports and Analytics](docs/screenshots/reports-analytics.png)
*Detailed reporting system with PDF export functionality and financial tracking*

### Mobile Responsive Design
![Mobile View](docs/screenshots/mobile-responsive.png)
*Fully responsive design optimized for mobile devices and tablets*

### AI Chatbot
![AI Chatbot](docs/screenshots/chatbot-interface.png)
*Intelligent dental chatbot providing instant answers to common patient questions*

## Key Features

### Patient Experience
- 🦷 **Modern Patient Portal** - Intuitive dashboard with gradient design and glass morphism effects
- 📅 **Smart Appointment Booking** - Interactive calendar with procedure-based filtering
- 📱 **Device Calendar Integration** - Add appointments directly to phone/computer calendars
- 🤖 **AI Dental Chatbot** - Instant answers to common dental questions
- 💳 **Payment History Tracking** - View past payments and insurance information
- 📋 **Downloadable Forms** - Access patient forms and documents
- 📋 **Appointments Overview** - "See All" popup to view complete appointment history with refresh capability

### Administrative Tools
- 👩‍⚕️ **Comprehensive Admin Panel** - Manage all aspects of the dental practice
- 📊 **Reports & Analytics** - Generate detailed reports with PDF/Excel export
- 🦷 **Procedure Management** - Define treatments, pricing, and time requirements
- 🎉 **Promotions System** - Create and manage special offers
- 👥 **Team Management** - Add and manage dental team members with high-quality images (up to 25MB)
- 📄 **PDF Forms Management** - Upload and organize patient forms
- 📅 **Appointments Management** - View all appointments popup with refresh functionality
- 🔔 **Reminder System** - Send email and SMS appointment reminders to patients
- 🧹 **Cleanup Tools** - Bulk cleanup of missed appointments with selection interface

### Technical Features
- 🔐 **Multi-Provider Authentication** - Email/password, Google OAuth, and Apple Sign In support
- 🎨 **Modern UI/UX** - Blue-teal gradients, glass morphism, and smooth animations
- 📱 **Fully Responsive** - Mobile-first design with Tailwind CSS
- ⚡ **Real-time Updates** - Live appointment and data synchronization
- 🏥 **Medical-Grade Security** - HIPAA-compliant data handling practices
- 📊 **Advanced Reports** - Professional PDF/Excel exports with simplified browser API
- ✨ **Enhanced Visuals** - Card shadows, hover effects, and interactive elements
- 📧 **Communication Tools** - Email and SMS reminder system for patients
- 🖼️ **High-Quality Images** - Advanced image compression (800x800px, 85% quality)
- 📂 **Large File Support** - Up to 25MB file uploads with 50MB server payload capacity
- 🔄 **Popup Interfaces** - Professional dialogs for appointments and management tools

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management and caching
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for responsive styling
- **Vite** for development and building
- **Canvas API** for client-side image compression
- **Dialog Components** for professional popup interfaces
- **Tabs Components** for organized admin interfaces

### Backend
- **Node.js** with Express.js (50MB payload limit)
- **TypeScript** with ES modules
- **PostgreSQL** with Neon Database
- **Drizzle ORM** for database operations
- **Independent Authentication** with OAuth support
- **Communication APIs** for email/SMS reminders
- **File Processing** with advanced image compression

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (Neon recommended)
- Replit account for authentication

### 1. Clone and Install
```bash
git clone <repository-url>
cd smilecare-dental
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret-key
REPL_ID=your-replit-id
NODE_ENV=development
REPLIT_DOMAINS=your-domain.replit.dev
```

### 3. OAuth Authentication Setup (Optional)

The application supports Google and Apple Sign In in addition to email/password authentication. OAuth is optional - email/password login works without any additional setup.

#### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your domain to authorized redirect URIs:
     - For development: `http://localhost:5000/api/auth/google/callback`
     - For production: `https://your-domain.com/api/auth/google/callback`

4. **Add to Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

#### Apple Sign In Setup

1. **Apple Developer Account**
   - You need an Apple Developer account ($99/year)
   - Visit [Apple Developer Portal](https://developer.apple.com/)

2. **Register Your App**
   - Go to "Certificates, Identifiers & Profiles"
   - Create a new App ID
   - Enable "Sign in with Apple" capability

3. **Create Service ID**
   - Create a new Services ID
   - Configure it for "Sign in with Apple"
   - Add your domain and redirect URLs:
     - For development: `http://localhost:5000/api/auth/apple/callback`
     - For production: `https://your-domain.com/api/auth/apple/callback`

4. **Generate Private Key**
   - Create a new key with "Sign in with Apple" enabled
   - Download the private key file (.p8)

5. **Add to Environment Variables**
   ```env
   APPLE_TEAM_ID=your-apple-team-id
   APPLE_CLIENT_ID=your-apple-service-id
   APPLE_KEY_ID=your-apple-key-id
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content\n-----END PRIVATE KEY-----"
   ```

#### OAuth Status
- **Without OAuth setup**: Email/password login works perfectly
- **With Google setup**: Google Sign In button becomes functional
- **With Apple setup**: Apple Sign In button becomes functional
- **Current behavior**: OAuth buttons show helpful messages when not configured

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Optional: Generate and run migrations
npm run db:generate
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Application Overview

### Patient Workflow
1. **Login** - Secure authentication via Replit Auth
2. **Dashboard** - View upcoming appointments and quick actions
3. **Book Appointment** - Select procedure, date, time, and doctor
4. **Calendar Reminder** - Add appointment to device calendar
5. **Chat Support** - Get instant answers from AI chatbot
6. **Payment History** - Track payments and insurance coverage

### Admin Workflow
1. **Admin Dashboard** - Overview of appointments and practice statistics
2. **Appointment Management** - Confirm, reschedule, or cancel appointments with "See All" popup
3. **Reminder System** - Send email/SMS reminders to patients for upcoming appointments
4. **Reports Generation** - Create detailed PDF/Excel reports with simplified download system
5. **Practice Management** - Manage procedures, promotions, and team with high-quality image uploads
6. **Form Management** - Upload and organize patient PDF forms
7. **Cleanup Tools** - Bulk cleanup of missed appointments with selection interface
8. **Analytics Review** - Monitor practice performance and trends

## Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Customization

### Changing Logo and Brand Colors

#### 1. Logo Customization
Replace the logo references in:
- `client/src/components/ui/button.tsx` - Update Smile icon imports
- `client/src/pages/not-found.tsx` - Update watermark logo
- `client/src/pages/landing.tsx` - Update header logo
- `client/src/pages/home.tsx` - Update navigation logo

#### 2. Color Scheme Customization
Edit `client/src/index.css` to modify the color palette:

```css
:root {
  /* Primary Colors - Change these for main brand colors */
  --primary: 210 100% 50%;          /* Blue */
  --primary-foreground: 0 0% 98%;   /* White text on primary */
  
  /* Secondary Colors */
  --secondary: 210 40% 98%;         /* Light blue */
  --secondary-foreground: 210 10% 15%; /* Dark text on secondary */
  
  /* Accent Colors */
  --accent: 210 40% 95%;           /* Very light blue */
  --accent-foreground: 210 10% 15%; /* Dark text on accent */
  
  /* Custom Dental Theme Colors */
  --dental-blue: 210 100% 50%;     /* Main dental blue */
  --dental-green: 142 76% 36%;     /* Success/health green */
  --dental-purple: 262 83% 58%;    /* Info purple */
  --dental-red: 0 84% 60%;         /* Alert/error red */
}
```

#### 3. Brand Name Changes
Update the brand name "SmileCare" in:
- `client/src/pages/landing.tsx`
- `client/src/pages/home.tsx`
- `client/src/pages/not-found.tsx`
- `replit.md` documentation

## Design Highlights

### Modern Visual Design
- **Gradient Themes**: Beautiful blue-to-teal gradients throughout the interface
- **Glass Morphism**: Modern translucent card effects with backdrop blur
- **Smooth Animations**: 200ms transitions and hover effects for professional feel
- **Enhanced Typography**: Gradient text effects and improved font weights
- **Interactive Elements**: Scale animations, pulse effects, and shadow enhancements

### Recent Feature Updates (August 2025)
- **Enhanced File Upload System**: Increased limits to 25MB with intelligent image compression (800x800px, 85% quality)
- **Appointment Management Popups**: Professional "See All" dialogs for both patient and admin interfaces
- **Reminder Communication System**: Email and SMS reminder functionality for appointment notifications
- **Bulk Cleanup Tools**: Missed appointment cleanup with bulk selection and organization
- **Download System Optimization**: Simplified browser-based downloads using Blob API for better reliability
- **Server Optimization**: Increased payload capacity to 50MB for handling large file uploads
- **Professional UI Dialogs**: Consistent popup interfaces across all management sections
- **Advanced Image Processing**: Client-side compression with Canvas API for optimal quality-to-size ratio

## Screenshots Guide

### How to Capture Screenshots

1. **Run the Application**:
   ```bash
   npm run dev
   ```

2. **Navigate to Key Pages**:
   - Patient Dashboard: `http://localhost:5000/`
   - Admin Panel: `http://localhost:5000/admin`
   - Login and use "Become Admin" button to access admin features

3. **Capture These Views**:
   - **Patient Dashboard**: Show upcoming appointments, quick actions sidebar
   - **Calendar Booking**: Display the interactive calendar with date selection
   - **Admin Panel**: Capture admin dashboard with statistics and management tools
   - **Reports**: Show the reports interface with charts and export options
   - **Mobile View**: Use browser dev tools to capture responsive design
   - **Chatbot**: Show the AI chatbot interface in action

4. **Save Screenshots**: Place files in `docs/screenshots/` with these names:
   - `patient-dashboard.png`
   - `appointment-calendar.png`
   - `admin-panel.png`
   - `reports-analytics.png`
   - `mobile-responsive.png`
   - `chatbot-interface.png`

5. **Image Guidelines**:
   - Format: PNG preferred for UI screenshots
   - Resolution: 1920x1080+ for desktop, 375x812 for mobile
   - Show the gradient themes and modern design elements
   - Capture hover states and animations when possible
   - File size: Under 2MB each

## Live Demo

> **Note**: Replace with actual deployment URL when available
> 
> Demo: `https://your-app-name.replit.dev`
> 
> **Test Credentials**:
> - **Patient Access**: Login with any Replit account
> - **Admin Access**: Use "Become Admin" button in patient dashboard
> - **Features to Test**: 
>   - Book appointments with "New Patient Consultation" option
>   - Generate PDF reports from Admin Panel → Reports & Analytics
>   - Try the AI chatbot for dental questions
>   - Add appointments to device calendar
>   - View responsive design on mobile devices

## Visual Design Features

The application showcases a modern, professional design suitable for medical practices:

- **Color Palette**: Medical blue-teal gradient theme
- **Typography**: Clean, readable fonts with gradient text effects  
- **Layout**: Glass morphism cards with elevated shadows
- **Interactions**: Smooth hover animations and scale effects
- **Accessibility**: High contrast ratios and intuitive navigation
- **Branding**: Professional aesthetic that builds patient trust

## Testing

### Run All Tests
```bash
./run-tests.sh
```

### Run Specific Test Suites
```bash
# Frontend tests
npm run test:frontend

# Backend API tests
npm run test:backend

# Integration tests
npm run test:integration

# Database tests
npm run test:database
```

### Test Coverage
```bash
npm run test:coverage
```

## Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database inspection

### Testing
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
smilecare-dental/
├── client/src/               # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions
├── server/                  # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts               # Database connection
│   └── auth.ts             # Multi-provider authentication setup
├── shared/                  # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
├── tests/                   # Test files
└── docs/                   # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user profile
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/apple` - Initiate Apple Sign In login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/apple/callback` - Apple Sign In callback

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id/status` - Update appointment status

### Admin (Requires admin role)
- `GET/POST/PUT/DELETE /api/procedures` - Manage dental procedures
- `GET/POST/PUT/DELETE /api/promotions` - Manage promotions
- `GET/POST/PUT/DELETE /api/forms` - Manage PDF forms
- `GET/POST /api/team` - Manage team members with image uploads
- `POST /api/reminders/email` - Send email appointment reminders
- `POST /api/reminders/sms` - Send SMS appointment reminders
- `POST /api/appointments/cleanup` - Cleanup missed appointments

### Resources
- `GET /api/resources` - Get educational resources
- `GET /api/chatbot` - Get chatbot responses

## Database Schema

### Core Tables
- `users` - User profiles and authentication
- `appointments` - Patient appointments with status tracking
- `procedures` - Dental procedures and pricing
- `promotions` - Special offers and discounts
- `forms` - Downloadable PDF forms
- `team_members` - Dental team information with high-quality images
- `resources` - Educational materials
- `chatbot_responses` - AI chatbot knowledge base
- `sessions` - Secure session storage for authentication
- `payments` - Payment history and insurance tracking

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Run tests: `./run-tests.sh`
5. Commit changes: `git commit -m "Description"`
6. Push to branch: `git push origin feature-name`
7. Open a pull request

## Security

- All API endpoints require authentication
- Role-based access control for admin functions
- Secure session management with PostgreSQL storage
- Input validation and sanitization
- HTTPS enforcement in production

## Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact support team

## License

This project is licensed under the MIT License - see the LICENSE file for details.