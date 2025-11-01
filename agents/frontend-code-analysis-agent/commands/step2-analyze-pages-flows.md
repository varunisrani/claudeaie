# STEP 2: ANALYZE PAGES AND FLOWS - User Journey Mapping

## MISSION
Analyze all pages, routes, and user flows in the frontend application to understand navigation patterns and user journeys.

## ACTIONS TO EXECUTE

### 2.1 Route and Page Discovery
- **ACTION**: Use `Grep` to search for route definitions
- **SEARCH PATTERNS**:
  - `createBrowserRouter` - React Router v6
  - `createRoutesFromElements` - React Router v6
  - `Router.*path=` - Generic route patterns
  - `Route.*component=` - Route component mappings
  - `router\.push` - Navigation calls
  - `useNavigate` - Navigation hooks
  - `<Route.*path=` - JSX route definitions
  - `export.*routes` - Route exports
- **DIRECTORIES TO SEARCH**:
  - `src/**/*.{js,jsx,ts,tsx}`
  - `src/router/**/*`
  - `src/routes/**/*`
- **OUTPUT**: Complete list of all routes and their components

### 2.2 Page Component Analysis
- **ACTION**: Use `Read` to examine each page component
- **PAGES TO ANALYZE**:
  - Homepage/Landing page
  - Login/Authentication pages
  - Dashboard/Main application pages
  - Profile/Settings pages
  - Form pages (registration, contact, etc.)
  - List/Detail pages (products, articles, etc.)
  - Error pages (404, 500, etc.)
- **FOR EACH PAGE**:
  - Component structure and props
  - State management usage
  - API calls and data fetching
  - Navigation patterns
  - Form handling
  - Error boundaries
- **OUTPUT**: Detailed page component analysis

### 2.3 Navigation Flow Mapping
- **ACTION**: Use `Grep` to find navigation patterns
- **SEARCH FOR**:
  - `useNavigate()` calls
  - `router.push()` calls
  - `<Link>` components
  - `<NavLink>` components
  - `window.location` usage
  - `history.push()` calls
  - Programmatic navigation
- **ANALYZE**:
  - Navigation triggers (buttons, menu items, links)
  - Conditional navigation (based on auth, user type)
  - Redirect patterns
  - Back/forward navigation handling
- **OUTPUT**: Navigation flow diagram

### 2.4 User Journey Identification
- **ACTION**: Use `Read` and `Grep` to identify critical user paths
- **COMMON JOURNEYS TO MAP**:
  - **Authentication Flow**: Login → Dashboard → Profile
  - **Onboarding Flow**: Registration → Welcome → Setup → Dashboard
  - **E-commerce Flow**: Browse → Product → Cart → Checkout → Success
  - **Content Flow**: Home → Article → Related → Comments
  - **Admin Flow**: Admin Login → Dashboard → Management → Reports
- **FOR EACH JOURNEY**:
  - Entry points
  - Required steps/sequence
  - Decision points
  - Success/failure states
  - Exit points
- **OUTPUT**: User journey maps

### 2.5 Protected Route Analysis
- **ACTION**: Use `Grep` to find authentication guards
- **SEARCH PATTERNS**:
  - `ProtectedRoute`
  - `PrivateRoute`
  - `RequireAuth`
  - `useAuth`
  - `isAuthenticated`
  - `auth.*guard`
  - `canActivate`
- **ANALYZE**:
  - Which routes require authentication
  - Authentication check logic
  - Redirect behavior for unauthenticated users
  - Role-based access control
- **OUTPUT**: Authentication and authorization mapping

### 2.6 Error and Edge Case Routes
- **ACTION**: Use `Grep` to find error handling routes
- **SEARCH FOR**:
  - `404` or `notFound`
  - `error` or `ErrorBoundary`
  - `catchAll` routes
  - fallback components
  - error page components
- **ANALYZE**:
  - 404 page handling
  - Server error pages
  - Network error handling
  - Fallback UI states
- **OUTPUT**: Error route documentation

## REQUIRED OUTPUTS

### Create Analysis Document: PAGE_FLOW_MAP.md
Use `Write` tool to create a comprehensive page and flow analysis document:

```markdown
# Page Flow Map and User Journey Analysis

## Route Inventory
### Total Routes Found: [count]
### Route Categories
- **Public Routes**: [count and list]
- **Protected Routes**: [count and list]
- **Admin Routes**: [count and list]
- **Error Routes**: [count and list]

## Complete Route Map
| Path | Component | Protected | Purpose |
|------|-----------|-----------|---------|
| `/` | [Component] | No | Homepage/Landing |
| `/login` | [Component] | No | User authentication |
| `/dashboard` | [Component] | Yes | Main dashboard |
| ... | ... | ... | ... |

## Page Component Analysis

### Homepage (`/`)
- **Component**: [Component name]
- **Purpose**: [description]
- **Key Features**: [list]
- **Navigation Outbound**: [list of destinations]
- **State Management**: [if any]
- **API Dependencies**: [if any]

### Authentication Pages
#### Login Page (`/login`)
- **Component**: [Component name]
- **Form Fields**: [list]
- **Validation**: [rules]
- **Navigation**: Login success → [destination]
- **Error Handling**: [error states]

#### Registration Page (`/register`)
- **Component**: [Component name]
- **Form Fields**: [list]
- **Validation**: [rules]
- **Navigation**: Register success → [destination]
- **Error Handling**: [error states]

### Main Application Pages
#### Dashboard (`/dashboard`)
- **Component**: [Component name]
- **Purpose**: [description]
- **Data Sources**: [API endpoints]
- **Interactive Elements**: [list]
- **Navigation Options**: [list]

[Continue for all pages...]

## User Journey Maps

### 1. Authentication Journey
```
Entry Point: Access to protected resource
├── User not authenticated
│   ├── Redirect to /login
│   ├── User enters credentials
│   ├── Validation check
│   ├── Success: Redirect to intended destination
│   └── Failure: Show error message
└── User already authenticated
    └── Direct access to resource
```
**Critical Points**: Login form validation, token storage, redirect handling

### 2. New User Onboarding Journey
```
Entry Point: Landing page /register
├── Registration Form
│   ├── Input validation
│   ├── Account creation
│   └── Email verification (if applicable)
├── Welcome/Setup Page
│   ├── Profile completion
│   ├── Preferences setup
│   └── Tutorial/Introduction
└── Dashboard Access
    └── Full application access
```
**Critical Points**: Form validation, email verification, profile setup

### 3. Core Application Flow
```
Entry Point: Dashboard after login
├── Main navigation
│   ├── Browse [content/features]
│   ├── Search/Filter functionality
│   └── Create/Manage [content/features]
├── Detail Views
│   ├── View individual items
│   ├── Edit/Update capabilities
│   └── Delete/Archive options
└── Profile/Settings
    ├── Account management
    ├── Preferences
    └── Logout
```
**Critical Points**: Navigation, data loading, CRUD operations

### 4. Error Handling Journey
```
Entry Point: Any error condition
├── Network Error
│   ├── Show error message
│   ├── Retry option
│   └── Fallback to cached data
├── 404 Not Found
│   ├── Show 404 page
│   ├── Navigation suggestions
│   └── Search option
└── Server Error (500)
    ├── Show error page
    ├── Report issue option
    └── Return to safety
```

## Navigation Patterns

### Navigation Components
- **Main Navigation**: [Component name and description]
- **Breadcrumb Navigation**: [if applicable]
- **Tab Navigation**: [if applicable]
- **Mobile Navigation**: [responsive navigation]

### Navigation Triggers
- **Header Links**: [list]
- **Sidebar Menu**: [list]
- **Button Actions**: [list]
- **Card/Item Links**: [list]

### Conditional Navigation
- **Authentication-based**: [rules]
- **Role-based**: [rules]
- **Feature Flags**: [if applicable]

## Authentication and Authorization

### Protected Routes
| Route | Protection Level | Redirect Target |
|-------|------------------|-----------------|
| `/dashboard` | Authentication Required | `/login` |
| `/admin/*` | Admin Role Required | `/login` |
| ... | ... | ... |

### Authentication Flow
- **Login Method**: [form/sso/oauth etc.]
- **Token Storage**: [localStorage/cookies etc.]
- **Session Management**: [timeout/refresh etc.]
- **Logout Behavior**: [clearing/redirecting]

## Key Insights

### Most Critical User Flows
1. [Flow name] - [reason for importance]
2. [Flow name] - [reason for importance]
3. [Flow name] - [reason for importance]

### Complex Navigation Points
- [description of complex navigation logic]
- [potential issues or edge cases]

### Testing Priorities
- **High Priority**: [critical paths that need thorough testing]
- **Medium Priority**: [important but less critical paths]
- **Low Priority**: [nice-to-have paths]
```

## SUCCESS CRITERIA
✅ All routes identified and documented
✅ Page components analyzed and catalogued
✅ Navigation patterns mapped
✅ User journeys documented
✅ Authentication flow understood
✅ Error routes identified
✅ PAGE_FLOW_MAP.md created and saved

## NEXT STEP
Once this step is complete, mark the corresponding todo as completed and proceed to Step 3: Identify Components.

---
**Do NOT proceed to the next step until ALL page and flow analysis is complete and PAGE_FLOW_MAP.md is generated!**