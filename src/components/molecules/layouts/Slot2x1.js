import LayoutSlot from "./LayoutSlot";

const Slot2x1 = ({ children }) => {
  return <LayoutSlot colSpan={2} rowSpan={1}>{children}</LayoutSlot>;
};

export default Slot2x1;
