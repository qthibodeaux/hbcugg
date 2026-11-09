import { memo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DEFAULT_ACCENT } from "./sideNavPresentation";
import { Box, Text } from "@chakra-ui/react";
import { Lock } from "lucide-react";

export const NavItem = memo(({ item, depth = 0 }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = item.active ?? pathname === item.path;
  const isIndented = item.indent || depth > 0;
  const accent = item.accent || DEFAULT_ACCENT;

  const handleClick = useCallback(() => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  }, [item, navigate]);

  const baseStyle = {
    w: "full",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    py: isIndented ? 5 : 3.5,
    // Sized off the sidebar's own width (it is a size container), so labels
    // scale as the sidebar narrows instead of jumping at breakpoints.
    px: isIndented ? "clamp(0.6rem, 7.8cqw, 1.25rem)" : "clamp(0.5rem, 6.3cqw, 1rem)",
    fontSize: isIndented ? "clamp(0.76rem, 6.65cqw, 1.06rem)" : "clamp(0.72rem, 6.15cqw, 0.98rem)",
    fontWeight: isIndented ? "bold" : "extrabold",
    letterSpacing: "0.03em",
    lineHeight: "1.25",
    color: isActive ? "text.primary" : isIndented ? "text.secondary" : "text.primary",
    bg: isActive ? `${accent}26` : "transparent",
    borderLeft: "3px solid",
    borderColor: isActive ? accent : "transparent",
    transition: "all 0.15s ease",
    cursor: "pointer",
    _hover: { bg: isActive ? `${accent}33` : "whiteAlpha.50" },
    position: "relative",
  };

  // Locked: shown so the section's shape stays visible, but not a link.
  if (item.locked) {
    return (
      <Box {...baseStyle} as="div" aria-disabled="true" color="text.muted" bg="transparent" borderColor="transparent" cursor="not-allowed" _hover={{}} opacity={0.6}>
        <Text textTransform="uppercase" lineHeight="1.25" minW={0} overflowWrap="break-word">
          {item.label}
        </Text>
        <Box as={Lock} boxSize="0.8em" flexShrink={0} ml={2} />
      </Box>
    );
  }

  return (
    <Box as="button" onClick={handleClick} {...baseStyle}>
      <Text textTransform="uppercase" lineHeight="1.25" minW={0} overflowWrap="break-word">
        {item.label}
      </Text>
    </Box>
  );
});

NavItem.displayName = "NavItem";
