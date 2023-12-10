type SpinnerProps = {
  className?: string;
  style?: Record<string, any>;
};

const Spinner = (props: SpinnerProps) => {
  return (
    <div className={`${props.className} spinner`} style={props.style}>
      <div className="dot1"></div>
      <div className="dot2"></div>
    </div>
  );
};

export default Spinner;
