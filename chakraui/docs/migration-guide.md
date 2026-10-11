# Chakra UI v3 Migration Guide

## Drawer Component Migration

### Before (v2)
```jsx
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from "@chakra-ui/react";

<Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
  <DrawerOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
  <DrawerContent bg="#0B0B0D" borderRight="1px solid">
    <DrawerCloseButton color="white" size="lg" top={4} right={4} />
    <DrawerHeader borderBottomWidth="0" pt={16}>
      Title
    </DrawerHeader>
    <DrawerBody>
      Content
    </DrawerBody>
  </DrawerContent>
</Drawer>
```

### After (v3)
```jsx
import { Drawer, Portal } from "@chakra-ui/react";

<Drawer.Root open={isOpen} placement="start" onOpenChange={(e) => !e.open && onClose()}>
  <Portal>
    <Drawer.Backdrop bg="blackAlpha.800" backdropFilter="blur(4px)" />
    <Drawer.Positioner>
      <Drawer.Content bg="#0B0B0D" borderRight="1px solid">
        <Drawer.CloseTrigger color="white" size="lg" top={4} right={4} />
        <Drawer.Header borderBottomWidth="0" pt={16}>
          Title
        </Drawer.Header>
        <Drawer.Body>
          Content
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Positioner>
  </Portal>
</Drawer.Root>
```

## Key Changes
- `DrawerOverlay` → `Drawer.Backdrop`
- `DrawerContent` → `Drawer.Positioner` + `Drawer.Content`
- `DrawerCloseButton` → `Drawer.CloseTrigger`
- `DrawerHeader` → `Drawer.Header`
- `DrawerBody` → `Drawer.Body`
- `isOpen` → `open`
- `onClose` → `onOpenChange={(e) => !e.open && onClose()}`
- `placement="left"` → `placement="start"`
- Added `Portal` wrapper

## Icons Migration

### Before (v2)
```jsx
import { HamburgerIcon } from "@chakra-ui/icons";
<IconButton icon={<HamburgerIcon boxSize={6} />} />
```

### After (v3)
```jsx
import { HiMenu } from "react-icons/hi";
<IconButton icon={<HiMenu size={24} />} />
```

## Removed Features
- @chakra-ui/icons package (use react-icons instead)
- Boolean props with "is" prefix (use standard HTML props)
- Various deprecated props and components
