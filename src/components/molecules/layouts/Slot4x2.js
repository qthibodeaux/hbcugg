import LayoutSlot from "./LayoutSlot";

const Slot4x2 = ({ children }) => {
  return <LayoutSlot colSpan={4} rowSpan={2}>{children}</LayoutSlot>;
};

export default Slot4x2;
