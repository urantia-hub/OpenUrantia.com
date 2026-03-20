const LogoSymbol = ({ className }: { className?: string }) => (
  <svg className={`${className || ""}`} viewBox="0 0 512 512">
    <circle cx="256" cy="256" r="248" fill="none" stroke="currentColor" strokeWidth="12.8" opacity="0.25"/>
    <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" strokeWidth="12.8" opacity="0.35"/>
    <circle cx="256" cy="256" r="168" fill="none" stroke="currentColor" strokeWidth="14.4" opacity="0.50"/>
    <circle cx="256" cy="256" r="128" fill="none" stroke="currentColor" strokeWidth="16.0" opacity="0.65"/>
    <circle cx="256" cy="256" r="88" fill="none" stroke="currentColor" strokeWidth="16.0" opacity="0.80"/>
    <circle cx="256" cy="256" r="51.2" fill="none" stroke="currentColor" strokeWidth="17.6" opacity="0.95"/>
    <circle cx="256" cy="256" r="22.4" fill="currentColor"/>
  </svg>
);

export default LogoSymbol;
