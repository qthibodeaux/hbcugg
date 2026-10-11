import { Container } from "@chakra-ui/react";

const ContentContainer = ({
  children,
  maxW = "1200px",
  px = { base: 4, md: 6, lg: 8 },
  ...props
}) => {
  return (
    <Container w="100%" maxW={maxW} mx="auto" px={px} {...props}>
      {children}
    </Container>
  );
};

export default ContentContainer;
