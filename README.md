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

### Option 1: Docker Setup (Recommended)

Docker ensures complete compatibility and eliminates environment issues.

#### Prerequisites
- Docker and Docker Compose installed
- Git

#### Quick Start with Docker
```bash
# Clone the repository
git clone <repository-url>
cd smilecare-dental

# Start the entire stack (app + database)
docker-compose up -d

# Initialize database schema
docker-compose exec app npm run db:push

# View logs (optional)
docker-compose logs -f app
```

The application will be available at `http://localhost:5000`

#### Docker Environment Configuration
Edit the `docker-compose.yml` file to configure environment variables:

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://dental_user:dental_secure_pass_123@postgres:5432/smilecare_dental
  SESSION_SECRET: your-super-secure-session-secret-change-in-production
  
  # OAuth credentials (optional)
  GOOGLE_CLIENT_ID: your-google-client-id
  GOOGLE_CLIENT_SECRET: your-google-client-secret
  APPLE_TEAM_ID: your-apple-team-id
  APPLE_CLIENT_ID: your-apple-client-id
  APPLE_KEY_ID: your-apple-key-id
  APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----"
```

#### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose build app
docker-compose up -d app

# Access database
docker-compose exec postgres psql -U dental_user -d smilecare_dental

# Run database migrations
docker-compose exec app npm run db:push

# Clean everything (removes data!)
docker-compose down -v
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (Neon recommended)

#### Installation Steps
```bash
# Clone and install
git clone <repository-url>
cd smilecare-dental
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your configuration
```

#### Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret-key
NODE_ENV=development

# OAuth credentials (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_TEAM_ID=your-apple-team-id
APPLE_CLIENT_ID=your-apple-client-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----"
```

### Passport.js Authentication Configuration

The application uses **Passport.js** with multiple authentication strategies. All authentication is independent and portable.

#### Core Authentication Features
- **Local Strategy**: Email/password authentication with bcrypt hashing
- **Google OAuth**: Google Sign In integration
- **Apple Sign In**: Apple ID authentication
- **Session Management**: PostgreSQL-backed sessions with 7-day TTL
- **Role-Based Access**: User and admin roles with middleware protection

#### Authentication Flow
1. **Registration**: Users register with email/password or OAuth
2. **Password Security**: Bcrypt with salt for local accounts
3. **Session Storage**: Secure PostgreSQL session storage
4. **OAuth Integration**: Seamless provider linking
5. **Role Management**: Admin promotion and permission system

#### OAuth Authentication Setup (Optional)

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

### Database Setup

#### For Docker Setup
```bash
# Initialize database schema (after docker-compose up)
docker-compose exec app npm run db:push
```

#### For Manual Setup
```bash
# Push database schema
npm run db:push

# Optional: Generate and run migrations
npm run db:generate
npm run db:migrate
```

### Start Development

#### Docker Development
```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### Manual Development
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Application Overview

### Patient Workflow
1. **Login** - Secure authentication via email/password or OAuth
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

### Docker Production Deployment (Recommended)

#### Build and Deploy
```bash
# Build production image
docker build -t smilecare-dental:latest .

# Run with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms (AWS, GCP, Azure)
docker tag smilecare-dental:latest your-registry/smilecare-dental:latest
docker push your-registry/smilecare-dental:latest
```

#### Production Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=super-secure-random-key-minimum-32-chars
NODE_ENV=production

# OAuth for production (optional)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
APPLE_TEAM_ID=your-apple-team-id
APPLE_CLIENT_ID=your-apple-client-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nProduction key\n-----END PRIVATE KEY-----"
```

### Manual Production Deployment

#### Build for Production
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

### Production Checklist
- [ ] Set strong `SESSION_SECRET` (minimum 32 characters)
- [ ] Configure production database with SSL
- [ ] Set up HTTPS/TLS certificates
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for PostgreSQL
- [ ] Test all authentication flows
- [ ] Verify file upload functionality

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
> - **Patient Access**: Register with email/password or use OAuth
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

The application includes a comprehensive test suite covering TypeScript compilation, builds, database schema, API routes, and module imports.

### Run All Tests

#### Docker Testing
```bash
# Run tests in Docker environment
docker-compose exec app ./run-tests.sh

# Or build a test image
docker build -t smilecare-test --target builder .
docker run --rm smilecare-test ./run-tests.sh
```

#### Manual Testing
```bash
# Make script executable (first time only)
chmod +x run-tests.sh

# Run comprehensive test suite
./run-tests.sh

# Run individual test files
./test-individual.sh
```

### Test Suite Components

The test runner checks:
1. **TypeScript Compilation** - Validates all TypeScript code
2. **Frontend Build** - Ensures Vite build succeeds
3. **Backend Compilation** - Validates server-side TypeScript
4. **Database Schema** - Checks Drizzle ORM schema validity
5. **Module Imports** - Validates import/export structure
6. **API Routes** - Ensures all required endpoints exist
7. **Environment Config** - Checks required environment variables

### Test Results
```bash
# View detailed test report
cat test-results/test-report.txt

# Current test status: 5/7 tests passing
# Known issues: TypeScript compilation warnings in Drizzle ORM dependencies (non-blocking)
```

### Add New Tests
Create test files in the `tests/` directory:
- `frontend.test.js` - Frontend component tests
- `backend.test.js` - API endpoint tests
- `integration.test.js` - End-to-end tests
- `database.test.js` - Database operation tests

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