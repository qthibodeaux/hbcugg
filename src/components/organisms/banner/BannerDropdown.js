import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BANNER_PILL_BG } from "./BannerFrame";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

// Shared controlled/uncontrolled banner dropdown, portal positioning and selection handlers.

export const BannerDropdown = ({ label, options, value, onChange, minW, disabled, disabledHint }) => {
  const { isMobile } = useLayoutDensity();
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(options[0]?.value ?? options[0]);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalSelected;
  const selectedOption = options.find((o) => (typeof o === "object" ? o.value === selectedValue : o === selectedValue));
  const selectedLabel = typeof selectedOption === "object" ? selectedOption.label : selectedOption ?? selectedValue;

  const [panelRect, setPanelRect] = useState(null);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    setIsOpen((o) => !o);
  };

  const selectOption = (opt) => {
    const v = typeof opt === "object" ? opt.value : opt;
    if (isControlled) onChange?.(v);
    else setInternalSelected(v);
    setIsOpen(false);
  };

  return (
    <Box position="relative">
      <Flex
        ref={triggerRef}
        as="button"
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        align="center"
        gap="0.5rem"
        pl="0.75rem"
        pr="0.6rem"
        py="0.4rem"
        minW={minW}
        bg={BANNER_PILL_BG}
        border="1px solid"
        borderColor={isOpen ? "whiteAlpha.400" : "whiteAlpha.200"}
        borderRadius={isMobile ? "0" : "md"}
        opacity={disabled ? 0.4 : 1}
        cursor={disabled ? "not-allowed" : "pointer"}
        _hover={disabled ? {} : { borderColor: "whiteAlpha.400" }}
        transition="border-color 0.15s"
      >
        {label && (
          <Text fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
            {label}
          </Text>
        )}
        <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">
          {selectedLabel}
        </Text>
        <ChevronDown size={12} color="rgba(255,255,255,0.5)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </Flex>

      {isOpen && panelRect &&
        createPortal(
          <>
            <Box position="fixed" inset={0} zIndex={2000} onClick={() => setIsOpen(false)} />
            <Box
              position="fixed"
              top={`${panelRect.top}px`}
              left={`${panelRect.left}px`}
              minW={`${panelRect.width}px`}
              zIndex={2001}
              bg="#1C1C1F"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius={isMobile ? "0" : "md"}
              overflow="hidden"
              boxShadow="0 0.5rem 1.5rem rgba(0,0,0,0.5)"
              maxH="16rem"
              overflowY="auto"
            >
              {options.map((opt) => {
                const v = typeof opt === "object" ? opt.value : opt;
                const l = typeof opt === "object" ? opt.label : opt;
                const optDisabled = typeof opt === "object" && opt.disabled;
                const hint = typeof opt === "object" ? opt.hint : null;
                const isSelected = v === selectedValue;
                return (
                  <Box
                    key={v}
                    as="button"
                    type="button"
                    disabled={optDisabled}
                    title={optDisabled ? hint ?? undefined : undefined}
                    onClick={() => !optDisabled && selectOption(opt)}
                    w="full"
                    textAlign="left"
                    px="0.75rem"
                    py="0.5rem"
                    bg={isSelected ? "whiteAlpha.100" : "transparent"}
                    opacity={optDisabled ? 0.35 : 1}
                    cursor={optDisabled ? "not-allowed" : "pointer"}
                    _hover={optDisabled ? {} : { bg: "whiteAlpha.200" }}
                    whiteSpace="nowrap"
                  >
                    <Flex align="baseline" justify="space-between" gap="1rem">
                      <Text fontSize="0.7rem" fontWeight={isSelected ? "black" : "bold"} color={isSelected ? "white" : "whiteAlpha.700"}>
                        {l}
                      </Text>
                      {hint && (
                        <Text fontSize="0.6rem" fontWeight="bold" color="whiteAlpha.400" whiteSpace="nowrap">
                          {hint}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          </>,
          document.body,
        )}
    </Box>
  );
};
