# Chakra UI v3 Design System

## Overview

This folder contains all Chakra UI components, tools, and design documentation for the HBCU Paper Champs application.

## Migration Status ✅

- **Version**: Chakra UI v3.34.0
- **Migration Completed**: March 18, 2026
- **Icons Package**: Migrated from @chakra-ui/icons to react-icons
- **Theme Setup**: Proper v3 theme configuration implemented

## Key Changes Made

1. **Drawer Components**: Updated from v2 to v3 compound component structure
2. **Icons**: Replaced @chakra-ui/icons with react-icons (HiMenu from Heroicons)
3. **Props**: Updated deprecated props (isOpen → open, onClose → onOpenChange)
4. **Theme**: Created comprehensive theme configuration with HBCU brand colors

## Component Structure

```
src/chakraui/
├── docs/           # Design documentation
│   ├── migration-guide.md      # v2 to v3 migration guide
│   ├── component-reference.md   # Available components reference
│   ├── design-tokens.md       # Colors, typography, spacing
│   └── theme-setup.md         # Theme configuration fix
└── README.md        # This overview file
```

## Theme Configuration ✅

- **File**: `src/theme.js`
- **Colors**: HBCU brand palette with semantic mapping
- **Typography**: Inter font family with proper scale
- **Spacing**: 4px-based consistent scale
- **Breakpoints**: Mobile-first responsive design

## Usage Guidelines

- All components use Chakra UI v3 syntax
- Icons imported from react-icons
- Dark theme by default with HBCU brand colors
- Responsive design with Chakra breakpoints
- Theme passed via `<ChakraProvider theme={theme}>`

## Common Issues & Solutions

### Runtime Error: `_config` undefined

**Problem**: `Cannot read properties of undefined (reading '_config')`
**Solution**: Create proper theme configuration with `createSystem` and pass to ChakraProvider

### Icons Package Error

**Problem**: `@chakra-ui/icons` not found in v3
**Solution**: Use react-icons or lucide-react instead

## Design Tokens

- **Primary Colors**: HBCU team colors
- **Background**: #0B0B0D (dark theme)
- **Accent**: #E53E3E (HBCU red)
- **Text**: #F4F4F5 (light gray)

## Component Reference

See `docs/component-reference.md` for complete list of available components and props.

## Migration Guide

See `docs/migration-guide.md` for detailed v2 to v3 migration steps.
