# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## During execution:

- Do not generate documentation files (.md) for the code, or test cases for the code.
- For maximum efficiency, when you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
- If you create any temporary new files, scripts, or auxiliary files for iteration, clean up by deleting these files upon task completion.


## Project Overview

**Oromia Smart Agriculture Value Chain Big Data Platform** (奥罗米亚智能农业价值链大数据平台)

A modern agricultural data management platform for Oromia State, Ethiopia, featuring:
- Full bilingual support (Chinese/English)
- Agricultural-themed design based on Ethiopian flag colors
- User identity authentication system (farmer, supplier, buyer)
- SSO integration with OAuth2
- Data visualization and announcement system

**Tech Stack**:
- **Frontend**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite 6
- **UI Framework**: Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router (hash mode)
- **Internationalization**: Vue i18n
- **Styling**: Tailwind CSS 4
- **Icons**: Remix Icon + Element Plus Icons
- **Charts**: ECharts
- **HTTP Client**: Axios

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development in WSL Environment
This project is developed in WSL. If you encounter file locking issues:
```bash
# Option 1: Run in Windows PowerShell (recommended)
cd D:\docs\a-work\inspur\code\2025\dtsp
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev

# Option 2: Use pnpm in WSL
npm install -g pnpm
pnpm install
pnpm dev
```

## Architecture

### Directory Structure
```
src/
├── api/                      # API layer - all HTTP requests
│   ├── application.js        # Application registration APIs
│   ├── breeding.js           # Breeding management APIs
│   ├── dashboard.js          # Dashboard data APIs
│   ├── enterprise.js         # Enterprise management APIs
│   ├── farm.js               # Farm management APIs
│   ├── feedback.js           # User feedback APIs
│   ├── file.js               # File upload/download APIs
│   ├── home.js               # Home page APIs
│   ├── input.js              # Agricultural input management APIs
│   ├── inventory.js          # Inventory management APIs
│   ├── seedPromotion.js      # Seed promotion APIs
│   ├── supplier.js           # Supplier management APIs
│   └── user.js               # User-related APIs (getCurrentUserInfo, etc.)
├── assets/                   # Static assets (images, fonts, etc.)
├── components/               # Shared components
│   ├── variety/              # Variety-related components
│   │   └── VarietyInfoCard.vue  # Variety information card component
│   ├── CommonTable.vue       # Reusable table component
│   ├── Footer.vue            # Global footer component
│   ├── Header.vue            # Global header component
│   ├── ModifyContact.vue     # Contact modification dialog
│   ├── ModifyPassword.vue    # Password modification dialog
│   ├── ResponsiveDialog.vue  # Responsive dialog wrapper
│   └── userDetails.vue       # User details component
├── config/                   # Layout configuration files
│   ├── farm-layout.json      # Farm module menu configuration
│   ├── input-layout.json     # Input module menu configuration
│   └── research-layout.json  # Research module menu configuration
├── i18n/                     # i18n configuration
│   └── index.js              # i18n setup and configuration
├── layout/                   # Layout components
│   ├── Layout.vue            # Main layout wrapper
│   └── SystemLayout.vue      # System module layout (dynamic menu)
├── locales/                  # Translation files (modular structure)
│   ├── index.js              # Auto-import all languages
│   ├── zh-CN/                # Chinese translations (modular)
│   │   ├── index.js          # Auto-imports all Chinese modules
│   │   ├── callback.js       # OAuth callback translations
│   │   ├── common.js         # Common translations
│   │   ├── dataList.js       # Data list translations
│   │   ├── farm.js           # Farm module translations
│   │   ├── footer.js         # Footer translations
│   │   ├── header.js         # Header translations
│   │   ├── home.js           # Home page translations
│   │   ├── identity.js       # Identity verification translations
│   │   ├── input.js          # Input module translations
│   │   ├── research.js       # Research module translations
│   │   ├── user.js           # User profile translations
│   │   └── userInfo.js       # User information translations
│   └── en-US/                # English translations (same structure)
│       └── (same files)
├── mock/                     # Mock data for development
│   └── breedingData.js       # Breeding module mock data
├── router/                   # Vue Router configuration
│   └── index.js              # Route definitions and guards
├── store/                    # Pinia stores
│   ├── index.js              # Store exports
│   ├── locale.js             # Locale/language state
│   └── user.js               # User state management
├── utils/                    # Utility functions
│   ├── agricultureRequest.js # Agriculture API request instance
│   ├── auth.js               # Authentication utilities
│   ├── request.js            # Axios instance with interceptors
│   └── system-data-config.js # System data configuration
├── views/                    # Page components
│   ├── application/          # Application registration module
│   │   ├── index.vue         # Application form page
│   │   └── recordList.vue    # Application record list
│   ├── callback/             # OAuth callback handling
│   │   └── index.vue         # Callback processing page
│   ├── farm/                 # Farm management module
│   │   ├── farmer/           # Farmer certification
│   │   │   ├── approval.vue  # Farmer approval page
│   │   │   └── auth.vue      # Farmer authentication page
│   │   └── land/             # Land management
│   │       └── list.vue      # Land list page
│   ├── home/                 # Home page
│   │   ├── components/       # Home page components
│   │   │   ├── AnnouncementDetail.vue  # Announcement detail
│   │   │   └── dataList.vue  # Data list component
│   │   └── Home.vue          # Home page main component
│   ├── identity/             # Identity verification module
│   │   ├── buyer.vue         # Buyer identity form
│   │   ├── farmer.vue        # Farmer identity form
│   │   ├── index.vue         # Identity selection page
│   │   └── supplier.vue      # Supplier identity form
│   ├── input/                # Agricultural input management module
│   │   ├── catalog/          # Product catalog
│   │   │   ├── detail.vue    # Catalog detail page
│   │   │   ├── form.vue      # Catalog form page
│   │   │   └── index.vue     # Catalog list page
│   │   ├── dashboard/        # Input dashboard
│   │   │   └── index.vue     # Dashboard main page
│   │   ├── feedback/         # User feedback
│   │   │   ├── detail.vue    # Feedback detail page
│   │   │   ├── form.vue      # Feedback form page
│   │   │   └── index.vue     # Feedback list page
│   │   ├── inventory/        # Inventory management
│   │   │   ├── stock/        # Stock management
│   │   │   │   ├── detail.vue
│   │   │   │   └── index.vue
│   │   │   ├── stock-in/     # Stock in management
│   │   │   │   ├── detail.vue
│   │   │   │   ├── form.vue
│   │   │   │   └── index.vue
│   │   │   ├── stock-out/    # Stock out management
│   │   │   │   ├── detail.vue
│   │   │   │   ├── form.vue
│   │   │   │   └── index.vue
│   │   │   └── warehouse/    # Warehouse management
│   │   │       ├── detail.vue
│   │   │       ├── form.vue
│   │   │       └── index.vue
│   │   ├── stock/            # Legacy stock pages
│   │   │   ├── in.vue
│   │   │   └── out.vue
│   │   ├── storage/          # Storage management
│   │   │   └── index.vue
│   │   ├── supplier/         # Supplier management
│   │   │   ├── product/      # Supplier products
│   │   │   │   ├── detail.vue
│   │   │   │   ├── form.vue
│   │   │   │   └── index.vue
│   │   │   ├── approval.vue  # Supplier approval
│   │   │   ├── auth.vue      # Supplier authentication
│   │   │   └── info.vue      # Supplier information
│   │   ├── supplier-input/   # Legacy supplier input
│   │   │   └── index.vue
│   │   ├── warehouse/        # Legacy warehouse
│   │   │   └── index.vue
│   │   └── Placeholder.vue   # Placeholder component
│   ├── knowledge/            # Knowledge center (currently disabled)
│   │   └── index.vue
│   └── research/             # Research & Development module
│       ├── breeding/         # Breeding management
│       │   ├── components/   # Breeding components
│       │   │   ├── BreedingMaterialForm.vue
│       │   │   ├── BreedingPlanForm.vue
│       │   │   └── BreedingTrackingForm.vue
│       │   ├── BreedingMaterial.vue  # Breeding material management
│       │   ├── BreedingPlan.vue      # Breeding plan management
│       │   └── BreedingTracking.vue  # Breeding tracking
│       ├── data-collection/  # Data collection module
│       │   ├── agronomic-trait/      # Agronomic trait data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   ├── environment-soil/     # Environment & soil data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   ├── farmer-plot/          # Farmer plot data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   ├── farming-record/       # Farming record data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   ├── laboratory-test/      # Laboratory test data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   ├── trial-base/           # Trial base data
│       │   │   ├── detail.vue
│       │   │   ├── form.vue
│       │   │   └── index.vue
│       │   └── variety-evaluation/   # Variety evaluation data
│       │       ├── detail.vue
│       │       ├── form.vue
│       │       └── index.vue
│       ├── enterprise/       # Enterprise management
│       │   ├── EnterpriseAudit.vue   # Enterprise audit
│       │   └── EnterpriseAuth.vue    # Enterprise authentication
│       ├── seed/             # Seed management
│       │   ├── components/
│       │   │   └── UploadDialog.vue  # Upload dialog component
│       │   └── SeedPromotion.vue     # Seed promotion page
│       └── variety/          # Variety management
│           ├── VarietyAudit.vue          # Variety audit
│           ├── VarietyPublish.vue        # Variety publication
│           ├── VarietyQuery.vue          # Variety query
│           └── VarietyRegistration.vue   # Variety registration
├── App.vue               # Root component
├── main.js               # Application entry point
└── style.css             # Global styles
```

### Authentication Flow (OAuth2 SSO)

1. **Token Extraction**: Router checks URL for token parameter (hash or query string)
2. **Token Storage**: Token stored in localStorage
3. **Request Interceptor**: Adds `Authorization: ${token}` header to all API requests
4. **Response Interceptor**: Handles 401/500 errors by redirecting to login
5. **User Info**: Fetched via `/auth/oauth2/getCurrentUserInfo` after successful auth

**Key Files**:
- [src/utils/auth.js](src/utils/auth.js) - Token management, URL parsing, redirect to login
- [src/utils/request.js](src/utils/request.js) - Axios instance with auth interceptors
- [src/router/index.js](src/router/index.js) - Route guards for authentication
- [src/store/user.js](src/store/user.js) - User state and auth actions

**Important Notes**:
- Base URL: `/ditp/` (configured in vite.config.js and router)
- OAuth2 endpoint: `/auth/oauth2/authorize?response_type=token&client_id=icd&redirect_uri=${redirectUrl}`
- API proxy in dev: `/auth` → `VITE_APP_API_URL` from .env.development
- Token passed as `Authorization` header (not `Bearer ${token}`)

### Internationalization (i18n)

**Pattern**: All user-facing text MUST be internationalized

This project uses a **modular i18n structure** with automatic imports powered by Vite's `import.meta.glob`.

#### File Structure

```
src/locales/
├── index.js              # Auto-imports all languages
├── zh-CN/
│   ├── index.js          # Auto-imports all Chinese modules
│   ├── common.js         # Common translations (buttons, messages, etc.)
│   ├── header.js         # Header navigation
│   ├── footer.js         # Footer content
│   ├── home.js           # Home page
│   ├── identity.js       # Identity verification
│   ├── user.js           # User profile
│   ├── dataList.js       # Data lists
│   ├── userInfo.js       # User information
│   ├── research.js       # Research & development
│   ├── input.js          # Agricultural inputs
│   ├── callback.js       # OAuth callbacks
│   └── farm.js           # Farm management
└── en-US/
    └── (same structure)
```

#### Usage in Components

**In Templates**:
```vue
<template>
  <!-- Module.key pattern -->
  <h1>{{ $t('common.title') }}</h1>
  <button>{{ $t('common.confirm') }}</button>
  <p>{{ $t('home.welcome') }}</p>
  <span>{{ $t('farm.menu.dashboard') }}</span>
</template>
```

**In Script Setup**:
```vue
<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Use in reactive contexts
const errorMessage = computed(() => t('common.failed'))

// Use in functions
const handleError = () => {
  ElMessage.error(t('common.submitFailed'))
}

// Use with interpolation
const message = t('user.welcomeMessage', { name: userName })
</script>
```


**Details**:
- Language stored in Pinia store: `useLocaleStore()`
- Persisted to localStorage
- Element Plus locale synced with app locale automatically

### State Management (Pinia)

**User Store** ([src/store/user.js](src/store/user.js)):
```javascript
import { useUserStore } from '@/store'

const userStore = useUserStore()

// Getters
userStore.token          // Current token
userStore.userInfo       // User info object
userStore.isLogin        // Boolean: is logged in
userStore.hasUserInfo    // Boolean: has user info

// Actions
userStore.setToken(token)           // Set token
userStore.setUserInfo(info)         // Set user info
userStore.fetchUserInfo()           // Fetch from API
userStore.logout()                  // Clear local storage
userStore.logoutAndRedirect(delay)  // Logout + redirect to SSO
```

**Locale Store** ([src/store/locale.js](src/store/locale.js)):
```javascript
import { useLocaleStore } from '@/store'

const localeStore = useLocaleStore()
localeStore.setLocale('en-US')  // Switch language
```

### API Layer

All API calls go through [src/utils/request.js](src/utils/request.js) which:
- Adds base URL: `${API_BASE_URL}/auth`
- Adds Authorization header automatically
- Handles 401/500 errors with automatic logout
- Shows error messages via Element Plus

**Example API Definition** ([src/api/user.js](src/api/user.js)):
```javascript
import request from '../utils/request'

export const getCurrentUserInfo = () => {
  return request({
    url: '/oauth2/getCurrentUserInfo',
    method: 'get',
    params: { appId: 'INSPUR-ICD' }
  })
}
```

## Design System

**Reference**: See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for complete design specifications

### Color Palette (Ethiopian Flag Theme)
```css
/* Primary Green - Agriculture, growth, hope */
--primary-green: #009A44;
--primary-green-light: #00b350;
--primary-green-dark: #008038;

/* Accent Yellow - Harvest, sunshine, prosperity */
--accent-yellow: #FEDD00;

/* Accent Red - Vitality, innovation */
--accent-red: #DA121A;
--accent-red-light: #FF3D47;
--accent-red-dark: #C10F17;
```

### Common Patterns

**Page Header**:
- Large icon (80x80px) with green gradient background
- Title and subtitle
- Background with subtle green-yellow gradient
- See template in DESIGN_SYSTEM.md

**Info Cards**:
- White background with border
- Gradient header (green to yellow, subtle)
- Hover effect: lift up with shadow
- Rounded corners (16px)

**Buttons**:
- Primary: Green gradient (`linear-gradient(135deg, #009A44 0%, #00b350 100%)`)
- Danger: Red gradient (for logout, delete actions)
- Outline: Green border on hover

**Icons**: Use Remix Icon (`ri-*-line` classes) for consistency

### Responsive Breakpoints
```css
/* Mobile */
@media screen and (max-width: 768px) { }

/* Tablet */
@media screen and (max-width: 1024px) { }
```

## Common Development Tasks

### Creating a New Page

1. **Add translations** to both locale files ([src/locales/zh-CN.js](src/locales/zh-CN.js), [src/locales/en-US.js](src/locales/en-US.js))
2. **Create view** in `src/views/[module]/` using the page template from DESIGN_SYSTEM.md
3. **Add route** to [src/router/index.js](src/router/index.js):
   ```javascript
   {
     path: 'my-page',
     name: 'MyPage',
     component: () => import('../views/my-page/index.vue'),
     meta: { title: '我的页面', requiresAuth: true }
   }
   ```
4. **Apply design system** styles and patterns
5. **Test internationalization** by switching languages
6. **Test responsive design** on different screen sizes

### Adding an API Endpoint

1. **Define function** in appropriate file under [src/api/](src/api/):
   ```javascript
   export const myApiCall = (params) => {
     return request({
       url: '/my-endpoint',
       method: 'post',
       data: params
     })
   }
   ```
2. **Import and use** in component:
   ```javascript
   import { myApiCall } from '@/api/my-module'

   const handleSubmit = async () => {
     try {
       const res = await myApiCall(formData)
       if (res.code === 200) {
         ElMessage.success(t('common.success'))
       }
     } catch (error) {
       console.error(error)
     }
   }
   ```

### Form Validation with i18n

```javascript
const rules = computed(() => ({
  field: [
    { required: true, message: t('form.fieldRequired'), trigger: 'blur' },
    { validator: customValidator, trigger: 'blur' }
  ]
}))

const customValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('form.fieldRequired')))
  } else if (!pattern.test(value)) {
    callback(new Error(t('form.fieldInvalid')))
  } else {
    callback()
  }
}
```

## Environment Configuration

**Development** ([.env.development](.env.development)):
- `VITE_APP_API_URL`: Backend API URL (e.g., `http://10.110.149.140:30012`)
- Vite proxy forwards `/auth` to this URL

**Production** ([.env.production](.env.production)):
- `VITE_APP_API_URL`: Empty string (same origin)
- Knowledge base URL configured separately

## Deployment Notes

- **Base Path**: `/ditp/` (configured in vite.config.js and router)
- **Build Output**: `dist/` directory
- **Router Mode**: Hash history (`createWebHashHistory('/ditp/')`)
- **OAuth2 Redirect**: Ensure `redirect_uri` matches deployed URL + `/ditp/`

## Key Conventions

1. **Always use i18n**: Never hardcode user-facing text
2. **Follow design system**: Use defined colors, gradients, spacing, and component patterns
3. **Composition API**: Use `<script setup>` for all new components
4. **Error handling**: Let request interceptor handle auth errors; handle business logic errors locally
5. **Icons**: Prefer Remix Icon (`ri-*`) for consistency with design system
6. **Responsive**: Test all new pages on mobile, tablet, and desktop
7. **Route meta**: Set `requiresAuth: true` for protected routes, `hideInMenu: true` for detail pages

## Troubleshooting

**Rollup errors during build**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**i18n not working**:
- Verify keys exist in both [src/locales/zh-CN.js](src/locales/zh-CN.js) and [src/locales/en-US.js](src/locales/en-US.js)
- Check [src/i18n/index.js](src/i18n/index.js) configuration
- Ensure `useI18n()` is called in setup

**Auth issues**:
- Check token in localStorage: `localStorage.getItem('token')`
- Verify API proxy in [vite.config.js](vite.config.js)
- Check network tab for 401 responses
- Verify OAuth2 redirect_uri matches current origin + `/ditp/`
