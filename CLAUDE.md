# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WAVE SPACE is a comprehensive community platform for real estate sales professionals in Korea. It combines information sharing, career development, and gamification elements to create an engaging ecosystem for industry practitioners.

## Architecture

### Frontend Structure
- **Static HTML Pages**: Individual HTML files for each major section (index.html, events.html, notice.html, etc.)
- **CSS Organization**: 
  - `common.css` - Shared styles across all pages
  - Individual page CSS files (e.g., `events.css`, `notice.css`)
  - Modular CSS in `/css` directory (base.css, components.css, layout.css, etc.)
- **JavaScript Structure**:
  - ES6 modules in `/js/modules/` (sidebar.js, header.js, preload.js)
  - Main entry point: `js/main.js`
  - Page-specific scripts (e.g., `events.js`, `notice.js`)

### Key Design Patterns
- **Sidebar Navigation**: Collapsible categories with Font Awesome icons
- **User Profile System**: Points, badges, and rankings
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Glass Morphism Effects**: Modern UI with blur effects and gradients

## Development Commands

Since this is a static site project without package.json:
- **Run locally**: Use a local server (e.g., `python -m http.server` or VS Code Live Server)
- **CSS changes**: Directly edit CSS files, version query strings on link tags for cache busting
- **JS changes**: Update individual JS files, ensure module imports are correct
- **Test pages**: Use test-*.html files for component testing (test-attendance.html, test-navigation.html, test-simple.html)
- **Debug pages**: Use debug-*.html files for debugging specific features

## Design System Reference

The project follows a comprehensive design system documented in `docs/DESIGN_SYSTEM.md`:

### Core Design Tokens
- **Primary Colors**: #0066FF (primary), #0099FF (bright), #00CCFF (sky)
- **Spacing**: 8px grid system (space-1: 8px, space-2: 16px, etc.)
- **Typography**: Pretendard font family with defined scale
- **Border Radius**: XS (4px) to Full (9999px)
- **Animations**: Standardized durations (200ms, 300ms, 500ms)

### Component Standards
- **Buttons**: Primary (gradient), Secondary (outline), Text, Icon variants
- **Cards**: Glass effect with 16px border radius, hover animations
- **Forms**: 36px height inputs, 6px border radius, focus states
- **Tables**: Compact data tables with hover states

## PRD and Business Context

The platform serves real estate sales professionals with:
1. **Community Features**: Forums, Q&A, humor sections
2. **Professional Resources**: Market research, proposals, educational materials
3. **Career Services**: Job listings, headhunting system
4. **Gamification**: Points system, badges (28 types), mini-games
5. **AI Features**: Automated report generation

Revenue model includes Plus Membership (₩29,000/month), point purchases, and corporate partnerships.

## Development Workflow

Follow the structured workflow in `docs/WORKFLOW.md`:

1. **Feature Implementation**:
   - Check relevant PRD section in `docs/PRD/`
   - Verify design system compliance
   - Implement with clean code principles
   - Test across breakpoints and color modes

2. **UI Development**:
   - Use only defined CSS variables for colors
   - Apply typography classes (text-h1, text-body)
   - Follow 8px spacing grid
   - Ensure dark/light mode support

3. **Quality Checklist**:
   - PRD requirements met
   - Design system compliance
   - Responsive implementation
   - Korean UI text
   - Accessibility considerations

## File Organization

```
/
├── index.html          # Main landing page
├── *.html             # Individual page files
├── common.css         # Shared styles
├── *.css             # Page-specific styles
├── script.js         # Legacy main script
├── *.js              # Page-specific scripts
├── css/              # Modular CSS system
├── js/               # ES6 modules
├── docs/             # Documentation
│   ├── PRD/         # Product requirements
│   ├── DESIGN_SYSTEM.md
│   └── WORKFLOW.md
├── jobkorea_css/    # Reference styles
└── saramin_css/     # Reference styles
```

## Key Implementation Notes

1. **Sidebar State**: Managed via localStorage for persistence
2. **User Authentication**: Mock data in current implementation (see js/mockUsers.js)
3. **Responsive Breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
4. **Animation Performance**: Use CSS transforms over position changes
5. **Color Modes**: CSS variables support dark/light theme switching
6. **Korean Language**: All UI text should be in Korean for production
7. **Module System**: ES6 modules used throughout (main entry: js/main.js)
8. **Page-specific Scripts**: Each HTML page may have corresponding JS file (e.g., events.html → events.js)

## Common Development Tasks

### Adding a New Page
1. Create new HTML file (e.g., `newpage.html`)
2. Create corresponding CSS file (e.g., `newpage.css`)
3. Create corresponding JS file in root or js/ directory
4. Include common.css and page-specific CSS
5. Add data-page attribute to body tag for JS initialization
6. Update sidebar navigation if needed

### Working with Forms and Data
- Mock user data available in `js/mockUsers.js`
- Form data typically handled with localStorage for persistence
- Use Font Awesome icons for UI elements (already included)

### Testing and Debugging
- Use browser DevTools for debugging
- Check localStorage for persistent data issues
- Test responsive design at key breakpoints
- Verify Korean text rendering properly

## MCP Servers

The project includes several MCP (Model Context Protocol) servers in `/mcp-servers/`:
- Task management
- File editing utilities
- Image generation
- Browser automation

These are development tools and not part of the main application.