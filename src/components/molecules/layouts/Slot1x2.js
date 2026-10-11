import LayoutSlot from "./LayoutSlot";

const Slot1x2 = ({ children }) => {
  return <LayoutSlot colSpan={1} rowSpan={2}>{children}</LayoutSlot>;
};

export default Slot1x2;
