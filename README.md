# Portfolio Builder

A professional-grade portfolio builder built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and Zustand.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with password: `admin123`

## Features

- 7 pre-built templates (Developer, Designer, Photographer, Model, Agency, Creative, Minimal)
- Drag-and-drop section reordering
- Real-time live preview with device views (desktop/tablet/mobile)
- Full theme customization (colors, fonts, spacing, animations, border radius)
- Inline content editing with unlimited dynamic fields
- SEO configuration (title, description, keywords, OG image)
- SMTP email configuration for contact form submissions
- Export as HTML/CSS/JS, React.js, or Next.js ZIP
- Multi-portfolio management dashboard
- Persistent storage via localStorage

## Changing Admin Password

Edit `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`.

## Project Structure

```
app/
  page.tsx          # Entry point (login or dashboard)
  api/contact/      # SMTP contact form API
components/
  LoginPage.tsx
  Dashboard.tsx     # Portfolio management
  Builder.tsx       # Main builder layout
  builder/
    BuilderTopbar   # Device view, export, nav tabs
    BuilderSidebar  # Drag-and-drop section list
    BuilderCanvas   # Live preview canvas
    BuilderRightPanel # Theme/SEO/SMTP/Templates panels
    SectionEditor   # Inline field editor
  preview/
    PortfolioPreview # Animated portfolio renderer
lib/
  types.ts          # TypeScript types
  store.ts          # Zustand state management
  templates.ts      # Template definitions & section defaults
  exporter.ts       # ZIP export (HTML/React/Next.js)
  utils.ts
```
