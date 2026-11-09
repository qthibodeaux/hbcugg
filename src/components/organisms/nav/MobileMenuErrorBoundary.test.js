import { render, screen, fireEvent } from "@testing-library/react";
import MobileMenuErrorBoundary from "./MobileMenuErrorBoundary";

const FailingMenu = () => { throw new Error("Menu test failure: real exception"); };

test("menu failure shows the actual message and preserves the rest of the page", () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const close = jest.fn();
    render(<>
      <p>Page stays available</p>
      <MobileMenuErrorBoundary isOpen onClose={close}><FailingMenu /></MobileMenuErrorBoundary>
    </>);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Menu test failure: real exception");
    expect(screen.getByText("Page stays available")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(close).toHaveBeenCalledTimes(1);
  } finally { log.mockRestore(); }
});

test("closing clears the failure so the menu can be opened again", () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const { rerender } = render(<MobileMenuErrorBoundary isOpen><FailingMenu /></MobileMenuErrorBoundary>);
    expect(screen.getByRole("alertdialog")).toBeVisible();
    rerender(<MobileMenuErrorBoundary isOpen={false}><p>Closed menu</p></MobileMenuErrorBoundary>);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    rerender(<MobileMenuErrorBoundary isOpen><p>Reopened menu</p></MobileMenuErrorBoundary>);
    expect(screen.getByText("Reopened menu")).toBeVisible();
  } finally { log.mockRestore(); }
});
