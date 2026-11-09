import { Image, Flex, Box } from "@chakra-ui/react";

// Team identity and form/heat presentation shared by the standings lab cards and matrix.

const getLogo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;

export const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

export const TeamLogo = ({ team, size = "26px" }) => (
  <Image src={getLogo(team)} alt={teamLabel(team)} w={size} h={size} objectFit="contain" />
);

export const FormRail = ({ form }) => (
  <Flex gap="3px" justify="end">
    {String(form).split("").map((result, index) => (
      <Box
        key={`${result}-${index}`}
        w="8px"
        h="14px"
        borderRadius="2px"
        bg={result === "W" ? "#48E083" : "#F56565"}
        opacity={result === "W" ? 0.95 : 0.72}
      />
    ))}
  </Flex>
);

export const heatColor = (value, accent) => {
  if (value >= 40) return "linear-gradient(135deg, #0F8F55 0%, #32C77A 100%)";
  if (value >= 25) return "linear-gradient(135deg, #2FA96B 0%, #8AD7AF 100%)";
  if (value >= 12) return "linear-gradient(135deg, #DCEFE5 0%, #94CFAF 100%)";
  if (value > 0) return "linear-gradient(135deg, #DFA19A 0%, #B8473F 100%)";
  return "linear-gradient(135deg, #7B211F 0%, #C6554B 100%)";
};
