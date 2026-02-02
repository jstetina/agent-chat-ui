export function LangGraphLogoSVG({
  className,
  width,
  height,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo.svg"
      alt="RHOAI Ops Buddy"
      width={width}
      height={height}
      className={className}
    />
  );
}
