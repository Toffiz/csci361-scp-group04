# GitHub Pages Deployment Notes

## Current Setup

This app is configured for **static export** to GitHub Pages.

### What Works:
✅ Client-side routing (all pages)
✅ Role-based authentication (localStorage)
✅ UI components and styling
✅ Client-side state management
✅ Mock data (client-side)

### Limitations:
❌ No API routes (converted to client-side mock data)
❌ No server-side rendering
❌ No server actions
❌ Session stored in localStorage (not cookies)

## Changes Made for GitHub Pages:

1. **next.config.js**: Changed from `standalone` to `export` output
2. **Layout**: Removed server components, simplified i18n
3. **Auth**: Uses localStorage instead of server-side sessions
4. **API Routes**: All data is now mocked client-side
5. **Middleware**: Removed (not supported in static export)

## Deployment URL:
**https://toffiz.github.io/csci361-scp-group04/**

## Alternative (if you need full SSR/API routes):
Deploy to **Vercel** instead:
```bash
cd frontend
npm i -g vercel
vercel
```

Vercel supports all Next.js features including:
- API routes
- Server-side rendering
- Server actions  
- Middleware
- Image optimization

## Current Approach:
This uses pure client-side SPA approach with static HTML/CSS/JS only.
