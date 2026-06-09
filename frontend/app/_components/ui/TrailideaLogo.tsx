/**
 * TrailideaLogo — Brand mark with landscape icon + wordmark.
 * Used in the register page header and other brand-heavy surfaces.
 */
export default function TrailideaLogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const iconSizes = { sm: "28px", md: "36px", lg: "44px" };
  const textSizes = {
    sm: "var(--text-body-lg-size)",
    md: "var(--text-headline-md-size)",
    lg: "var(--text-headline-lg-size)",
  };

  return (
    <div className="brand-logo">
      <span
        className="brand-logo__icon"
        style={{ width: iconSizes[size], height: iconSizes[size] }}
        aria-hidden="true"
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: size === "sm" ? "16px" : size === "md" ? "20px" : "24px",
            fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
          }}
        >
          landscape
        </span>
      </span>
      <span className="brand-logo__text" style={{ fontSize: textSizes[size] }}>
        Trailidea
      </span>
    </div>
  );
}
