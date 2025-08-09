# SmileCare Dental Management System

A comprehensive dental practice management system with patient portal, appointment booking, admin panel, and AI-powered chatbot.

## Features

- 🦷 **Patient Portal** - Appointment booking, profile management, and access to dental resources
- 👩‍⚕️ **Admin Panel** - Manage procedures, promotions, PDF forms, team members, and appointments
- 🤖 **AI Chatbot** - Instant answers to common dental questions
- 📅 **Calendar Integration** - Interactive appointment scheduling with device calendar reminders
- 🔐 **Secure Authentication** - Replit Auth integration with role-based access control
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS

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