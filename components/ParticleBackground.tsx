import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  lastMessageTime?: number;
  messageTarget?: Particle;
  messageProgress?: number;
  messageSpeed?: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const isInViewport = useRef(true);
  const particlesRef = useRef<Particle[]>([]);
  const fadeProgress = useRef(0);
  const lastFrameTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset fade progress before starting animation
    fadeProgress.current = 0;

    // Define star colors
    const starColors = [
      "#ffffff", // White
      "#fffacd", // Light yellow
      "#87ceeb", // Sky blue
      "#800080", // Blue/Purple
      "#ffd700", // Gold
      "#00ff00", // Light green
    ];

    // Function to create particles
    const createParticles = (width: number, height: number) => {
      return Array.from({ length: 20 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.3 + 0.1,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      }));
    };

    // Debounce function
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport.current = entry.isIntersecting;

          // If coming back into view, restart animation
          if (entry.isIntersecting && !animationFrameId.current) {
            animate();
          }
          // If leaving view, cancel animation
          else if (!entry.isIntersecting && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
          }
        });
      },
      {
        root: null,
        threshold: 0,
      }
    );

    // Start observing the canvas
    observer.observe(canvas);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.35;
    };

    const handleResize = debounce(() => {
      resizeCanvas();
      // Reset fade progress before creating new particles
      fadeProgress.current = 0;
      particlesRef.current = createParticles(canvas.width, canvas.height);
    }, 250);

    // Initialize everything with fade at 0
    resizeCanvas();
    fadeProgress.current = 0;
    particlesRef.current = createParticles(canvas.width, canvas.height);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      if (!isInViewport.current) {
        animationFrameId.current = undefined;
        return;
      }

      // Calculate delta time for smooth animation
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastFrameTime.current) / 1000;
      lastFrameTime.current = currentTime;

      // Clear the canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Increment fade progress
      fadeProgress.current = Math.min(
        fadeProgress.current + deltaTime * 0.5,
        1
      );

      // Calculate message probability based on viewport width
      const baseMessageProbability = 0.003;
      const scaledProbability = baseMessageProbability * (canvas.width / 1920); // Scale based on a reference width of 1920px

      // Only draw particles after clearing
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle with fade
        ctx.beginPath();
        ctx.shadowBlur = 5;
        ctx.shadowColor = particle.color;
        ctx.globalAlpha = particle.opacity * fadeProgress.current;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Only start sending messages after fade-in is complete
        if (
          fadeProgress.current > 0.7 &&
          Math.random() < scaledProbability && // Use scaled probability
          !particle.messageTarget
        ) {
          const possibleTargets = particlesRef.current.filter(
            (p) =>
              p !== particle &&
              Math.hypot(p.x - particle.x, p.y - particle.y) < 200
          );

          if (possibleTargets.length > 0) {
            particle.messageTarget =
              possibleTargets[
                Math.floor(Math.random() * possibleTargets.length)
              ];
            particle.messageProgress = 0;
            particle.messageSpeed = 0.005 + Math.random() * 0.01;
          }
        }

        // Draw messages with fade
        if (
          particle.messageTarget &&
          particle.messageProgress !== undefined &&
          particle.messageSpeed
        ) {
          const target = particle.messageTarget;
          const progress = particle.messageProgress;

          const x = particle.x + (target.x - particle.x) * progress;
          const y = particle.y + (target.y - particle.y) * progress;

          ctx.beginPath();
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = 0.3 * fadeProgress.current;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          particle.messageProgress += particle.messageSpeed;
          if (particle.messageProgress >= 1) {
            particle.messageTarget = undefined;
            particle.messageProgress = undefined;
            particle.messageSpeed = undefined;
          }
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation
    if (isInViewport.current) {
      lastFrameTime.current = Date.now();
      animate();
    }

    return () => {
      observer.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full z-0"
      style={{
        background: "transparent",
        height: "35vh",
      }}
    />
  );
};

export default ParticleBackground;
