import LayoutSlot from "./LayoutSlot";

const Slot1x1 = ({ children }) => {
  return <LayoutSlot colSpan={1} rowSpan={1}>{children}</LayoutSlot>;
};

export default Slot1x1;
