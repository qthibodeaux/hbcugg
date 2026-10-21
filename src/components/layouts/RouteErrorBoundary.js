import { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";

// ─────────────────────────────────────────────────────────────────────────────
// A page that throws shows this instead of a blank screen — and shows the real
// error. iPhone Safari reports uncaught errors to the dev overlay as a bare
// "Script error."; a boundary receives the actual error object, message and
// stack intact. Keyed on the path, so navigating anywhere clears it.
// In development close the red overlay (×) to read this underneath.
// ─────────────────────────────────────────────────────────────────────────────

class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[page error]", error, info?.componentStack);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;
    const where = String(info?.componentStack ?? "").trim().split("\n").slice(0, 6).join("\n");
    return (
      <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary" px="1rem" pb="2rem">
        <Text mt="1.5rem" fontSize="1.4rem" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase">This page hit a problem</Text>
        <Box mt="1rem" p="0.85rem" bg="rgba(229,62,62,0.12)" border="1px solid" borderColor="rgba(229,62,62,0.4)">
          <Text fontSize="0.85rem" fontWeight="900" color="#FC8181" wordBreak="break-word">{String(error?.message ?? error)}</Text>
          {where && (
            <Text as="pre" mt="0.6rem" fontSize="0.65rem" color="whiteAlpha.700" whiteSpace="pre-wrap" wordBreak="break-word" fontFamily="mono">{where}</Text>
          )}
        </Box>
        <Text mt="0.75rem" fontSize="0.7rem" color="whiteAlpha.500" wordBreak="break-all">{this.props.path}</Text>
        <Flex as="button" type="button" onClick={this.props.onBack} mt="1rem" px="1rem" h="2.6rem" align="center" bg="brand.500">
          <Text fontSize="0.8rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.08em">Go back</Text>
        </Flex>
      </Box>
    );
  }
}

const RouteErrorBoundary = ({ children }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  return (
    <Boundary key={pathname} path={`${pathname}${search}`} onBack={() => navigate(-1)}>
      {children}
    </Boundary>
  );
};

export default RouteErrorBoundary;
