import { useNavigate } from "react-router-dom";
import { SchoolDirectoryCompact, SchoolDirectoryStandard } from "./directory/DirectoryViews";

export const SchoolDirectoryFusion = ({ variant = "standard", target = "team" }) => {
  const navigate = useNavigate();

  if (variant === "compact") {
    return <SchoolDirectoryCompact navigate={navigate} target={target} />;
  }

  return <SchoolDirectoryStandard navigate={navigate} target={target} />;
};
