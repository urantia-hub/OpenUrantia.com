interface LogoTextProps {
  className?: string;
}

const LogoText = ({ className }: LogoTextProps) => {
  return (
    <h1 className={`font-bold tracking-wide mx-2 ${className || ""}`}>
      <span className="font-light">Open</span>Urantia
    </h1>
  );
};

export default LogoText;
