interface LogoTextProps {
  className?: string;
}

const LogoText = ({ className }: LogoTextProps) => {
  return (
    <h1 className={`text-4xl font-bold tracking-wide ${className || ""}`}>
      <span className="font-light">Open</span>Urantia
    </h1>
  );
};

export default LogoText;
