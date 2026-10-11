import LayoutSlot from "./LayoutSlot";

const Slot4x1 = ({ children }) => {
  return <LayoutSlot colSpan={4} rowSpan={1}>{children}</LayoutSlot>;
};

export default Slot4x1;
