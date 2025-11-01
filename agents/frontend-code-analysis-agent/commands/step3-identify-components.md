# STEP 3: IDENTIFY COMPONENTS - Component and Element Analysis

## MISSION
Catalog all React/Vue/Angular components, identify interactive elements, and analyze component relationships and dependencies.

## ACTIONS TO EXECUTE

### 3.1 Component Discovery
- **ACTION**: Use `Glob` to find all component files
- **SEARCH PATTERNS**:
  - `src/**/*.{jsx,tsx}` - React components
  - `src/**/*.vue` - Vue components
  - `src/**/*.{js,ts}` - JavaScript/TypeScript files that might be components
- **COMPONENT IDENTIFICATION**:
  - Files with `export default function` (React functional components)
  - Files with `React.FC` (TypeScript React components)
  - Files with `Vue.component` or `<template>` (Vue components)
  - Files with `@Component` (Angular components)
- **OUTPUT**: Complete component inventory

### 3.2 Component Classification
- **ACTION**: Use `Read` to analyze each component type
- **CLASSIFY BY PURPOSE**:
  - **Layout Components**: Header, Footer, Sidebar, Layout wrappers
  - **UI Components**: Button, Input, Modal, Card, etc.
  - **Page Components**: Route-level components
  - **Container Components**: Logic/state management components
  - **Utility Components**: Helper components, providers
  - **Form Components**: Form-specific components
- **ANALYZE FOR EACH**:
  - Component props and types
  - State management (useState, useReducer, etc.)
  - Hooks usage
  - Event handlers
  - Child components
- **OUTPUT**: Component categorization and analysis

### 3.3 Interactive Element Identification
- **ACTION**: Use `Grep` to find interactive elements
- **SEARCH PATTERNS**:
  - `<button` - Button elements
  - `<input` - Input fields
  - `<select` - Dropdown selections
  - `<textarea` - Text areas
  - `<a href=` - Navigation links
  - `onClick={` - Click handlers
  - `onChange={` - Change handlers
  - `onSubmit={` - Form submissions
  - `useRef` - Ref usage for DOM manipulation
  - `querySelector` - DOM queries
- **CATEGORIZE INTERACTIONS**:
  - **Navigation**: Links, buttons that navigate
  - **Form Actions**: Submit, reset, validation
  - **Data Input**: Text, number, date inputs
  - **Selection**: Radio, checkbox, dropdown
  - **Modal/Dialog**: Open, close, confirm
  - **Display Controls**: Show/hide, expand/collapse
- **OUTPUT**: Interactive elements catalog

### 3.4 Form Component Analysis
- **ACTION**: Use `Grep` to find form-related components
- **SEARCH PATTERNS**:
  - `<form` - Form elements
  - `useForm` - Form libraries (React Hook Form, Formik)
  - `validation` - Validation logic
  - `required` - Required field validation
  - `onSubmit` - Form submission handlers
  - `reset` - Form reset functionality
- **FOR EACH FORM**:
  - Input types and validation rules
  - Submit handling logic
  - Error display and management
  - Success/failure states
  - Form libraries used
- **OUTPUT**: Form components inventory

### 3.5 Data Display Components
- **ACTION**: Use `Grep` to find data display patterns
- **SEARCH PATTERNS**:
  - `map(` - List rendering
  - `useEffect` - Data fetching
  - `axios` or `fetch` - API calls
  - `loading` - Loading states
  - `error` - Error handling
  - `data` - Data state management
- **ANALYZE**:
  - List/table components
  - Card/display components
  - Data visualization components
  - Search/filter components
  - Pagination components
- **OUTPUT**: Data display components catalog

### 3.6 Component Dependencies and Relationships
- **ACTION**: Use `Grep` to analyze import/usage patterns
- **SEARCH PATTERNS**:
  - `import.*from` - Import statements
  - `useContext` - Context usage
  - `useSelector` - Redux state usage
  - `useDispatch` - Redux actions
  - `Provider` - Context providers
- **ANALYZE**:
  - Parent-child relationships
  - Shared context usage
  - State management integration
  - Third-party library dependencies
  - Circular dependencies
- **OUTPUT**: Component relationship map

## REQUIRED OUTPUTS

### Create Analysis Document: COMPONENT_INVENTORY.md
Use `Write` tool to create a comprehensive component inventory document:

```markdown
# Component Inventory and Analysis

## Component Summary
- **Total Components Found**: [count]
- **Layout Components**: [count]
- **UI Components**: [count]
- **Page Components**: [count]
- **Form Components**: [count]
- **Data Display Components**: [count]
- **Utility Components**: [count]

## Component Categories

### 1. Layout Components
| Component | Location | Purpose | Props |
|-----------|----------|---------|-------|
| `Header` | `src/components/Header.tsx` | Main navigation header | {user, onLogout} |
| `Footer` | `src/components/Footer.tsx` | Page footer | {} |
| `Sidebar` | `src/components/Sidebar.tsx` | Navigation sidebar | {isOpen, onClose} |
| `Layout` | `src/components/Layout.tsx` | Main layout wrapper | {children} |

### 2. UI Components
#### Button Components
| Component | Variants | Usage Count | Props |
|-----------|----------|-------------|-------|
| `Button` | primary, secondary, danger | [count] | {variant, onClick, children} |
| `IconButton` | icon-only, with-text | [count] | {icon, onClick, label} |

#### Input Components
| Component | Input Types | Validation | Props |
|-----------|-------------|------------|-------|
| `Input` | text, email, password | required, pattern | {type, value, onChange, error} |
| `Select` | single, multi | required | {options, value, onChange} |
| `Checkbox` | single, group | required | {checked, onChange, label} |

#### Display Components
| Component | Purpose | Usage | Props |
|-----------|---------|-------|-------|
| `Card` | Content container | [count] | {title, children, actions} |
| `Modal` | Dialog/Popup | [count] | {isOpen, onClose, children} |
| `Badge` | Status indicator | [count] | {status, children} |

### 3. Form Components
| Component | Purpose | Fields | Validation |
|-----------|---------|--------|------------|
| `LoginForm` | User authentication | email, password | required, email format |
| `RegistrationForm` | New user signup | [list fields] | [validation rules] |
| `ContactForm` | Contact submission | [list fields] | [validation rules] |

### 4. Data Display Components
| Component | Data Source | Features | Props |
|-----------|-------------|----------|-------|
| `UserList` | API endpoint | Search, filter, pagination | {users, loading} |
| `ProductGrid` | API/props | Grid layout, filters | {products, onProductClick} |
| `DataTable` | API/props | Sort, filter, pagination | {data, columns} |

## Interactive Elements Analysis

### Navigation Elements
- **Links**: [count] internal, [count] external
- **Buttons**: [count] navigation buttons
- **Menu Items**: [count] menu navigation items
- **Breadcrumbs**: [count] breadcrumb navigations

### Form Elements
- **Text Inputs**: [count] with various validation rules
- **Password Fields**: [count] with strength validation
- **Email Fields**: [count] with format validation
- **Dropdown/Select**: [count] single and multi-select
- **Radio Buttons**: [count] in [number] groups
- **Checkboxes**: [count] single and group selections
- **File Uploads**: [count] with validation
- **Submit Buttons**: [count] with various states

### Action Elements
- **Click Actions**: [count] various click handlers
- **Hover Actions**: [count] hover effects/tooltips
- **Form Submissions**: [count] submit handlers
- **Modal Triggers**: [count] modal open/close actions

### Display Controls
- **Show/Hide**: [count] visibility toggles
- **Expand/Collapse**: [count] expandable sections
- **Tab Navigation**: [count] tab interfaces
- **Carousel/Slider**: [count] content sliders

## Component Dependencies

### External Libraries
- **UI Framework**: [Material-UI, Ant Design, etc.]
- **Form Library**: [React Hook Form, Formik, etc.]
- **State Management**: [Redux, Zustand, Context API, etc.]
- **HTTP Client**: [Axios, Fetch, etc.]
- **Routing**: [React Router, Vue Router, etc.]

### Internal Dependencies
- **Shared Components**: [list of widely used components]
- **Context Providers**: [list of context usage]
- **Custom Hooks**: [list of custom hooks and their usage]
- **Utility Functions**: [list of shared utilities]

## State Management Analysis

### Local State
- **useState Usage**: [count] components with local state
- **useReducer Usage**: [count] components with complex state
- **State Patterns**: [common state management patterns]

### Global State
- **Context API**: [count] contexts in use
- **Redux/Zustand**: [if applicable] stores and slices
- **State Sharing**: [how components share data]

## Component Quality Assessment

### Reusability
- **Highly Reusable**: [components used in 5+ places]
- **Moderately Reusable**: [components used in 3-4 places]
- **Specific Purpose**: [components used in 1-2 places]

### Complexity
- **Simple Components**: [count] props only, no state
- **Medium Components**: [count] with state and hooks
- **Complex Components**: [count] with complex logic, multiple state pieces

### Testing Considerations
- **Easy to Test**: [count] pure functions, simple props
- **Medium Complexity**: [count] with state, need mocking
- **Hard to Test**: [count] complex integration, heavy dependencies

## Testing Priorities

### High Priority Components
1. **Authentication Forms** - Critical functionality
2. **Data Input Forms** - User data validation
3. **Navigation Components** - User flow critical
4. **Payment/Checkout** - Business critical (if applicable)

### Medium Priority Components
1. **Data Display Components** - Data integrity
2. **Search/Filter Components** - User experience
3. **Modal/Dialog Components** - User interaction

### Lower Priority Components
1. **Pure Display Components** - Visual elements
2. **Simple UI Components** - Basic interactions
```

## SUCCESS CRITERIA
✅ All components identified and catalogued
✅ Components categorized by purpose and complexity
✅ Interactive elements mapped and documented
✅ Form components analyzed
✅ Data display components identified
✅ Component dependencies documented
✅ COMPONENT_INVENTORY.md created and saved

## NEXT STEP
Once this step is complete, mark the corresponding todo as completed and proceed to Step 4: Map Interactions.

---
**Do NOT proceed to the next step until ALL component analysis is complete and COMPONENT_INVENTORY.md is generated!**