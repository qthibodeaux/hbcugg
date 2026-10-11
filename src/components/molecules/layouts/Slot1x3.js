import LayoutSlot from "./LayoutSlot";

const Slot1x3 = ({ children }) => {
  return <LayoutSlot colSpan={1} rowSpan={3}>{children}</LayoutSlot>;
};

export default Slot1x3;
