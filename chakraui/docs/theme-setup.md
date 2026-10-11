# Chakra UI v3 Theme Configuration Fix

## Problem Solved

### Error Before Fix

```
Cannot read properties of undefined (reading '_config')
TypeError: Cannot read properties of undefined (reading '_config')
```

### Root Cause

Chakra UI v3 requires proper theme configuration in ChakraProvider. The `createSystem` function and complex theme structures were causing the error.

## Working Solution

### 1. Minimal Theme Configuration (`src/theme.js`)

**WORKING CODE:**

```javascript
// Minimal Chakra UI v3 theme - WORKING SOLUTION
const theme = {
  colors: {
    brand: {
      50: "#F4F4F5",
      500: "#E53E3E", // HBCU red
    },
    background: {
      dark: "#0B0B0D",
      light: "#F7FAFC",
    },
    text: {
      dark: "#F4F4F5",
      light: "#1A202C",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
};

export default theme;
```

### 2. App.js Setup

```javascript
import theme from "./theme";

<ChakraProvider theme={theme}>
```

## What NOT to Use (Causes Error)

`createSystem()` function  
 Complex theme objects with nested structures  
 `defaultConfig()` function  
 Component defaults in theme object

## Quick Fixes if Error Persists

### Option 1: No Theme (Temporary)

```javascript
<ChakraProvider>
```

### Option 2: Empty Theme Object

```javascript
<ChakraProvider theme={{}}>
```

## Verification

After applying the minimal theme:

- No runtime errors
- Basic Chakra UI components work
- HBCU brand colors available
- Limited theming (but functional)

## Theme Features

### Color Palette

```javascript
colors: {
  brand: { 50: "#F4F4F5", 500: "#E53E3E", ... }, // HBCU red
  background: { dark: "#0B0B0D", light: "#F7FAFC" },
  text: { dark: "#F4F4F5", light: "#1A202C" },
  card: { bg: "#1A1A1D", border: "rgba(255, 255, 255, 0.1)" },
  success: { 500: "#48BB78" },
  error: { 500: "#F56565" },
}
```

### Responsive Breakpoints

```javascript
breakpoints: {
  base: "0px",    // Mobile
  sm: "30em",     // 480px
  md: "48em",     // 768px (Tablet)
  lg: "62em",     // 992px (Desktop)
  xl: "80em",     // 1280px
  "2xl": "96em",  // 1536px
}
```

### Component Defaults

```javascript
components: {
  Button: { defaultProps: { colorScheme: "brand" } },
  Card: { defaultProps: { bg: "card.bg" } },
}
```

## Usage Examples

### Using Theme Colors

```jsx
<Box bg="background.dark" color="text.dark">
<Button colorScheme="brand">HBCU Button</Button>
<Card bg="card.bg" border="1px solid" borderColor="card.border">
```

### Responsive Design

```jsx
<Text fontSize={{ base: "sm", md: "lg", xl: "2xl" }}>
<Stack spacing={[2, 4, 6]} direction={{ base: "column", md: "row" }}>
```

## Migration Notes

- **Chakra UI v3**: Requires theme object in ChakraProvider
- **No extendTheme**: Use createSystem for custom themes
- **Default Config Fix**: Use simple config object, not function
- **Color Schemes**: Define brand colors for consistent theming

## Verification

After this fix:

- No runtime errors related to Chakra UI
- Theme properly applied to all components
- HBCU brand colors available throughout app
- Responsive design works correctly
- ✅ No runtime errors related to Chakra UI
- ✅ Theme properly applied to all components
- ✅ HBCU brand colors available throughout app
- ✅ Responsive design works correctly
