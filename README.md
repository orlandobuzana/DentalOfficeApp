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

### Administrative Tools
- 👩‍⚕️ **Comprehensive Admin Panel** - Manage all aspects of the dental practice
- 📊 **Reports & Analytics** - Generate detailed reports with PDF export
- 🦷 **Procedure Management** - Define treatments, pricing, and time requirements
- 🎉 **Promotions System** - Create and manage special offers
- 👥 **Team Management** - Add and manage dental team members
- 📄 **PDF Forms Management** - Upload and organize patient forms

### Technical Features
- 🔐 **Secure Authentication** - Replit Auth with role-based access control  
- 🎨 **Modern UI/UX** - Blue-teal gradients, glass morphism, and smooth animations
- 📱 **Fully Responsive** - Mobile-first design with Tailwind CSS
- ⚡ **Real-time Updates** - Live appointment and data synchronization
- 🏥 **Medical-Grade Security** - HIPAA-compliant data handling practices
- 📊 **PDF Reports** - Professional printable reports with jsPDF integration
- ✨ **Enhanced Visuals** - Card shadows, hover effects, and interactive elements

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Shadcn/ui** components with Radix UI
- **Tailwind CSS** for styling
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Neon Database
- **Drizzle ORM** for database operations
- **Replit Auth** with OpenID Connect

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

### 3. Database Setup
```bash
# Push database schema
npm run db:push

# Optional: Generate and run migrations
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server
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
2. **Appointment Management** - Confirm, reschedule, or cancel appointments
3. **Reports Generation** - Create detailed PDF reports for analysis
4. **Practice Management** - Manage procedures, promotions, and team
5. **Form Management** - Upload and organize patient PDF forms
6. **Analytics Review** - Monitor practice performance and trends

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

### Recent Visual Improvements (January 2025)
- Implemented comprehensive gradient color system
- Added glass effect navigation bar with translucent background
- Enhanced appointment cards with gradient borders and hover animations
- Improved Quick Actions sidebar with colorful hover states
- Upgraded calendar component with modern date selection styling
- Added professional button animations and shadow effects

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
│   └── replitAuth.ts       # Authentication setup
├── shared/                  # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
├── tests/                   # Test files
└── docs/                   # Documentation
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id/status` - Update appointment status

### Admin (Requires admin role)
- `GET/POST/PUT/DELETE /api/procedures` - Manage dental procedures
- `GET/POST/PUT/DELETE /api/promotions` - Manage promotions
- `GET/POST/PUT/DELETE /api/forms` - Manage PDF forms
- `GET/POST /api/team` - Manage team members

### Resources
- `GET /api/resources` - Get educational resources
- `GET /api/chatbot` - Get chatbot responses

## Database Schema

### Core Tables
- `users` - User profiles and authentication
- `appointments` - Patient appointments
- `procedures` - Dental procedures and pricing
- `promotions` - Special offers and discounts
- `forms` - Downloadable PDF forms
- `team_members` - Dental team information
- `resources` - Educational materials
- `chatbot_responses` - AI chatbot knowledge base

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