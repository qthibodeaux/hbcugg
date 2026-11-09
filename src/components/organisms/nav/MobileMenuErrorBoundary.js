import { Component } from "react";

// The menu is outside the route boundary. Keep its failure local and display
// the actual React exception when Safari's dev overlay only says "Script error."
// Use native elements here so a Chakra/drawer failure cannot break the fallback.
export default class MobileMenuErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, isOpen: props.isOpen };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isOpen !== state.isOpen) return { error: null, isOpen: props.isOpen };
    return null;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[mobile menu error]", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (!this.props.isOpen) return null;

    return (
      <div role="alertdialog" aria-modal="true" aria-labelledby="mobile-menu-error-title"
        style={{ position: "fixed", inset: 0, zIndex: 1500, overflowY: "auto", background: "var(--bg-primary, #0B0B0D)", color: "var(--text-primary, #F4F4F5)", padding: "max(24px, env(safe-area-inset-top)) 24px 24px", pointerEvents: "auto" }}>
        <h2 id="mobile-menu-error-title">The menu hit a problem</h2>
        <p>Please share this message so we can fix it:</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "#FC8181" }}>
          {String(error?.message ?? error)}
        </pre>
        <button type="button" onClick={this.props.onClose}
          style={{ padding: "12px 20px", marginTop: 16, background: "#9333EA", color: "#FFFFFF", border: 0, font: "inherit", cursor: "pointer" }}>
          Close menu
        </button>
      </div>
    );
  }
}
