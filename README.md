# Fashion Campaign AI Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

An advanced AI-powered platform designed to revolutionize fashion marketing campaign creation. The platform enables fashion brands and marketers to generate comprehensive, brand-compliant marketing campaigns through intelligent automation, combining visual AI, brand governance, and content generation capabilities.

## 🚀 Key Features

### 🤖 AI Campaign Generation
- **Intelligent Content Creation**: Generate comprehensive marketing campaigns using Google Gemini integration
- **Brand Compliance Validation**: Ensure all content adheres to brand guidelines and tone
- **Multi-Platform Support**: Create content optimized for Instagram, Facebook, TikTok, and more
- **Color Palette Generation**: Automatically extract harmonious color schemes
- **SEO Optimization**: Include relevant keywords for search optimization

### 🎯 Brand Management
- **Brand Book Configuration**: Define brand voice, target audience, and content rules
- **Logo Management**: Upload and position brand logos with format validation
- **Compliance Engine**: Real-time validation with scoring and suggestions
- **Custom Rules**: Configure validation strictness and custom compliance criteria

### 📊 Analytics & Insights
- **Performance Tracking**: Monitor campaign performance and engagement metrics
- **Quality Indicators**: Track compliance scores and validation history
- **Trend Analysis**: Historical data analysis and improvement suggestions
- **Export Capabilities**: Download campaign data in structured JSON format

### 🎨 Advanced Filtering System
- **Smart Filters**: Filter campaigns by status, compliance score, creation date
- **Visual Filters**: Filter by color palettes and visual elements
- **Content Filters**: Search by keywords, brand tone, and content type
- **State Persistence**: Remember filter preferences across sessions

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript (strict mode)
- **Vite** for build tooling and development server
- **React Router v6** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui + Radix UI** for component library
- **react-hook-form + zod** for form validation
- **react-i18next** for internationalization
- **Lucide React** for icons

### Backend
- **Supabase** (Backend-as-a-Service)
- **PostgreSQL** database (managed by Supabase)
- **Supabase Auth** for authentication
- **Supabase Edge Functions** (Deno runtime)
- **Supabase Storage** for file management

### External Services
- **Google Gemini API** for AI content generation
- **Image processing** and optimization services

## 📦 Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd fashion-campaign-ai
```

2. **Install dependencies**
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
```

4. **Database Setup**
```bash
# Initialize Supabase (if using local development)
npx supabase init
npx supabase start

# Run database migrations
npx supabase db push
```

5. **Start Development Server**
```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Usage Guide

### Getting Started

1. **Authentication**
   - Navigate to `/auth` to create an account or sign in
   - Use email/password authentication via Supabase Auth

2. **Campaign Creation**
   - Go to the dashboard and click "Create New Campaign"
   - Fill in campaign details (title, description)
   - Select products from the repository
   - Upload model images (optional)
   - Generate AI-powered content
   - Review compliance scores and quality indicators

3. **Brand Configuration**
   - Access Brand Settings to configure your brand identity
   - Upload brand logos and set positioning preferences
   - Define brand book rules and compliance criteria
   - Set validation strictness levels

4. **Analytics & Monitoring**
   - View campaign performance in the analytics dashboard
   - Track compliance trends and quality improvements
   - Export campaign data for external platforms

### Advanced Features

#### Campaign Filtering
```typescript
// Filter campaigns by multiple criteria
const filters = {
  status: ['approved', 'published'],
  qualityScore: { min: 0.8, max: 1.0 },
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  searchTerm: 'summer collection'
};
```

#### Brand Compliance Configuration
```typescript
// Configure brand book rules
const brandRules = {
  vocabulary: {
    preferred: ['elegant', 'sophisticated', 'timeless'],
    forbidden: ['cheap', 'basic', 'ordinary'],
    alternatives: { 'nice': 'elegant', 'good': 'exceptional' }
  },
  tone: {
    voice: 'luxury',
    personality_traits: ['sophisticated', 'exclusive', 'refined']
  }
};
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── campaigns/      # Campaign management
│   ├── analytics/      # Analytics dashboard
│   └── settings/       # User settings
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client
│   ├── gemini.ts       # Google Gemini integration
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
├── stores/             # State management
└── i18n/               # Internationalization

supabase/
├── migrations/         # Database migrations
├── functions/          # Edge functions
└── config.toml         # Supabase configuration
```

## 🔧 API Documentation

### Campaign Generation
```typescript
POST /functions/v1/generate-campaign
Authorization: Bearer <supabase_jwt>

{
  "prompt": "Create a summer collection campaign",
  "brand_settings": { ... },
  "target_audience": "young professionals",
  "platform_preferences": ["instagram", "tiktok"]
}
```

### Content Validation
```typescript
POST /functions/v1/validate-content
Authorization: Bearer <supabase_jwt>

{
  "content": { ... },
  "schema_version": "1.0"
}
```

### Campaign Revalidation
```typescript
POST /functions/v1/revalidate-campaign
Authorization: Bearer <supabase_jwt>

{
  "campaign_id": "uuid"
}
```

## 🧪 Development Workflow

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript compiler
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:coverage    # Generate coverage report

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:reset         # Reset database
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Extended configuration with React and accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality
- **Conventional Commits**: Standardized commit messages

### Testing Strategy

- **Unit Tests**: Vitest + Testing Library for component testing
- **Integration Tests**: API endpoint testing with Supabase
- **E2E Tests**: Playwright for full user journey testing
- **Coverage**: Minimum 80% coverage for critical paths

## 🤝 Contributing

We welcome contributions to the Fashion Campaign AI platform! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Add tests for new functionality
5. Ensure all tests pass: `pnpm test`
6. Commit using conventional commits: `git commit -m "feat: add amazing feature"`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode guidelines
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure accessibility compliance (WCAG 2.1 AA)

### Pull Request Process

1. Update README.md with details of changes if applicable
2. Update the version numbers following semantic versioning
3. Ensure CI/CD pipeline passes all checks
4. Request review from maintainers
5. Address feedback and iterate as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: otto.miranda@me.com
- 📖 Documentation: [docs.fashioncampaignai.com](https://docs.fashioncampaignai.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/fashion-campaign-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/fashion-campaign-ai/discussions)

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI content generation capabilities
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- The open-source community for amazing tools and libraries

---

**Built with ❤️ by Otto Miranda**
