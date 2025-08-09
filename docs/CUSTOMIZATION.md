# SmileCare Dental - Customization Guide

This guide shows how to customize the SmileCare Dental application for your own dental practice.

## Changing Brand Name and Logo

### 1. Update Brand Name

Replace "SmileCare" throughout the application:

**Files to update:**
- `client/src/pages/landing.tsx`
- `client/src/pages/home.tsx`
- `client/src/pages/not-found.tsx`
- `README.md`
- `replit.md`

**Example changes:**
```tsx
// From:
<h1 className="text-4xl font-bold">SmileCare Dental</h1>

// To:
<h1 className="text-4xl font-bold">Your Practice Name</h1>
```

### 2. Update Logo and Icons

**Replace the Smile icon:**
```tsx
// In navigation components, replace:
import { Smile } from "lucide-react";

// With your preferred icon:
import { Building2 } from "lucide-react"; // Or any other icon
```

**Add custom logo image:**
1. Place your logo in `client/public/images/`
2. Update components to use your image:
```tsx
<img src="/images/your-logo.png" alt="Your Practice" className="h-8 w-8" />
```

## Color Scheme Customization

### Primary Color Palette

Edit `client/src/index.css` to change the main colors:

```css
:root {
  /* Main brand colors */
  --primary: 210 100% 50%;          /* Your primary color */
  --primary-foreground: 0 0% 98%;   /* Text on primary */
  
  /* Secondary colors */
  --secondary: 210 40% 98%;         /* Light version of primary */
  --secondary-foreground: 210 10% 15%;
  
  /* Accent colors */
  --accent: 210 40% 95%;
  --accent-foreground: 210 10% 15%;
}
```

### Dental Theme Colors

Update specific dental theme colors:

```css
:root {
  /* Dental specific colors */
  --dental-blue: 210 100% 50%;     /* Professional blue */
  --dental-green: 142 76% 36%;     /* Health/success green */
  --dental-purple: 262 83% 58%;    /* Information purple */
  --dental-red: 0 84% 60%;         /* Alert/emergency red */
  --dental-gold: 45 100% 70%;      /* Premium/luxury gold */
}
```

### Color Usage Examples

```tsx
// Using custom colors in components
<div className="bg-primary text-primary-foreground">
  Primary colored section
</div>

<Button className="bg-dental-green hover:bg-dental-green/90">
  Success Action
</Button>
```

## Typography Customization

### Font Family

Add custom fonts to `client/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', ui-sans-serif, system-ui;
  --font-heading: 'Inter', ui-sans-serif, system-ui;
}
```

Update `tailwind.config.ts`:
```js
fontFamily: {
  sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
  heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
}
```

## Content Customization

### Practice Information

Update practice details in:

**Contact Information:**
```tsx
// In components and pages, update:
const practiceInfo = {
  name: "Your Dental Practice",
  phone: "(555) 123-4567",
  email: "info@yourpractice.com",
  address: "123 Main St, Your City, ST 12345",
  hours: {
    monday: "8:00 AM - 6:00 PM",
    tuesday: "8:00 AM - 6:00 PM",
    // ... etc
  }
};
```

**Services and Procedures:**
Update the treatment types in `client/src/components/calendar.tsx`:
```tsx
<SelectContent>
  <SelectItem value="cleaning">Routine Cleaning</SelectItem>
  <SelectItem value="whitening">Teeth Whitening</SelectItem>
  <SelectItem value="implants">Dental Implants</SelectItem>
  // Add your specific services
</SelectContent>
```

### Team Members

Update default team information in the admin panel or database seed data:
```js
const teamMembers = [
  {
    name: "Dr. Your Name",
    position: "General Dentist",
    specialties: ["General Dentistry", "Cosmetic Dentistry"],
    bio: "Your professional bio here...",
    imageUrl: "/images/team/dr-yourname.jpg"
  }
];
```

## Feature Customization

### Chatbot Responses

Update chatbot knowledge base in the admin panel or seed data:
```js
const chatbotResponses = [
  {
    keywords: ["hours", "open", "closed"],
    response: "We're open Monday-Friday 8AM-6PM, Saturday 8AM-2PM. Closed Sundays."
  },
  {
    keywords: ["insurance", "coverage"],
    response: "We accept most major insurance plans including Delta, Blue Cross, and Aetna."
  }
  // Add your practice-specific responses
];
```

### Available Time Slots

Modify appointment availability in `client/src/components/calendar.tsx`:
```tsx
// Update default time slots
const defaultTimeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];
```

### Forms and Documents

Add your practice forms to the forms management system:
```js
const practiceforms = [
  {
    title: "New Patient Registration",
    description: "Complete registration form for new patients",
    category: "registration",
    downloadUrl: "/forms/new-patient-registration.pdf"
  },
  {
    title: "Medical History",
    description: "Comprehensive medical and dental history form",
    category: "intake",
    downloadUrl: "/forms/medical-history.pdf"
  }
];
```

## Layout and Design

### Page Layouts

Modify the main layout components:
- `client/src/pages/home.tsx` - Patient dashboard
- `client/src/pages/landing.tsx` - Landing page
- `client/src/pages/admin.tsx` - Admin panel

### Component Styling

Update component classes for your design:
```tsx
// Example: Modify card styling
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
  <CardHeader className="bg-blue-600 text-white rounded-t-lg">
    <CardTitle>Your Custom Card</CardTitle>
  </CardHeader>
</Card>
```

## Environment Configuration

### Production Settings

Update environment variables for your practice:
```env
# Your practice information
PRACTICE_NAME="Your Dental Practice"
PRACTICE_PHONE="(555) 123-4567"
PRACTICE_EMAIL="info@yourpractice.com"

# Database
DATABASE_URL="your-production-database-url"

# Authentication
SESSION_SECRET="your-secure-session-secret"
REPL_ID="your-replit-id"
```

### Email and Notifications

Configure email settings for appointment confirmations:
```env
EMAIL_SERVICE_API_KEY="your-email-service-key"
FROM_EMAIL="noreply@yourpractice.com"
ADMIN_EMAIL="admin@yourpractice.com"
```

## Testing Your Customizations

After making changes, run the test suite:
```bash
# Run all tests
./run-tests.sh

# Run specific tests
./test-individual.sh frontend
./test-individual.sh backend
```

## Deployment

1. Update all branding and content
2. Test thoroughly in development
3. Configure production environment variables
4. Deploy using Replit's deployment features

## Support

For customization assistance:
1. Review the main README.md
2. Check existing code patterns
3. Test changes incrementally
4. Keep backups of working configurations