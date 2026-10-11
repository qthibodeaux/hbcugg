# Chakra UI v3 Component Reference

## Available Components

### Drawer
- **Drawer.Root**: Main drawer container
- **Drawer.Backdrop**: Overlay background
- **Drawer.Positioner**: Positioning wrapper
- **Drawer.Content**: Main content area
- **Drawer.CloseTrigger**: Close button
- **Drawer.Header**: Header section
- **Drawer.Body**: Body content

### Layout
- **Box**: Generic container
- **Flex**: Flexbox container
- **Container**: Responsive container
- **SimpleGrid**: Grid layout

### Typography
- **Text**: Text component
- **Heading**: Heading levels

### Interactive
- **Button**: Button component
- **IconButton**: Icon button
- **Badge**: Badge component

### Navigation
- **Link**: Link component (from react-router-dom)

### Forms
- **Input**: Input field
- **Select**: Dropdown select
- **Checkbox**: Checkbox component

## Common Props (v3)

### Spacing
- Use `gap` instead of `spacing` for Stack components
- Use standard CSS values

### Boolean Props
- `disabled` instead of `isDisabled`
- `loading` instead of `isLoading`

### Color Props
- Use Chakra color tokens: `red.500`, `whiteAlpha.200`
- Custom colors supported

## Responsive Breakpoints
- `base`: 0px
- `sm`: 30em (480px)
- `md`: 48em (768px)
- `lg`: 62em (992px)
- `xl`: 80em (1280px)
- `2xl`: 96em (1536px)

## Style Props
- Use kebab-case for CSS properties: `backgroundColor` → `bg`
- Responsive arrays: `px={[4, 8, 12]}`
- Theme-aware values: `color="white"`
