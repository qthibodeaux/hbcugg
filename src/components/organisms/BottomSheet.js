import { createPortal } from "react-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { X } from "lucide-react";

// Shared mobile bottom-sheet shell — backdrop + slide-up panel, portal-rendered
// to document.body so it isn't clipped by a banner's overflow:hidden. Used by
// MobileSectionSwitcher (hub navigation) and any other trigger that needs the
// same "tap a compact control, get a full-width panel" pattern rather than a
// small anchored dropdown.
export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      <Box position="fixed" inset={0} zIndex={3000} bg="blackAlpha.700" onClick={onClose} />
      <Box
        position="fixed"
        left={0}
        right={0}
        bottom={0}
        zIndex={3001}
        bg="#111114"
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
        borderTopRadius="1.25rem"
        maxH="70vh"
        overflowY="auto"
        pb="env(safe-area-inset-bottom, 0rem)"
      >
        {title && (
          <Flex align="center" justify="space-between" px="1rem" py="0.85rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="0.65rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              {title}
            </Text>
            <Box as="button" type="button" onClick={onClose} p="0.25rem">
              <X size={18} color="rgba(255,255,255,0.6)" />
            </Box>
          </Flex>
        )}
        {children}
      </Box>
    </>,
    document.body,
  );
};
