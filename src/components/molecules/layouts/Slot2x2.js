import LayoutSlot from "./LayoutSlot";

const Slot2x2 = ({ children }) => {
  return <LayoutSlot colSpan={2} rowSpan={2}>{children}</LayoutSlot>;
};

export default Slot2x2;
