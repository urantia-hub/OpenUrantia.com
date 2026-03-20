const LogoSymbol = ({ className }: { className?: string }) => (
  <svg className={`${className || ""}`} viewBox="0 0 512 512">
    <circle cx="256" cy="256" r="200.00" fill="none" stroke="currentColor" strokeWidth="1.60" opacity="0.10"/>
    <circle cx="256" cy="256" r="166.60" fill="none" stroke="currentColor" strokeWidth="1.60" opacity="0.15"/>
    <circle cx="256" cy="256" r="133.40" fill="none" stroke="currentColor" strokeWidth="2.00" opacity="0.22"/>
    <circle cx="256" cy="256" r="100.00" fill="none" stroke="currentColor" strokeWidth="3.00" opacity="0.40"/>
    <circle cx="256" cy="256" r="66.60" fill="none" stroke="currentColor" strokeWidth="5.00" opacity="0.70"/>
    <circle cx="256" cy="256" r="33.40" fill="none" stroke="currentColor" strokeWidth="7.00" opacity="0.95"/>
    <circle cx="256" cy="256" r="10.40" fill="currentColor"/>
  </svg>
);

export default LogoSymbol;
