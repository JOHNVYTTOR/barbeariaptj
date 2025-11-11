import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: "circle" | "scissor";
}

export const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 2,
          duration: Math.random() * 8 + 10,
          delay: Math.random() * 5,
          type: Math.random() < 0.3 ? "scissor" : "circle", // 30% tesouras
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) =>
        particle.type === "circle" ? (
          // 🔹 partículas redondas (brilho)
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(255,196,0,0.9) 0%, rgba(255,180,0,0.5) 50%, transparent 100%)`,
              boxShadow: `0 0 ${particle.size * 3}px rgba(255,200,0,0.9)`,
              filter: "blur(0.5px)",
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 25 - 12, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : (
          // ✂️ partículas de tesoura PNG
          <motion.img
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * 5}px`,
              height: "auto",
              filter:
                "drop-shadow(0 0 8px rgba(255,220,0,0.9)) brightness(1.2)",
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 25 - 12, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      )}

      {/* 🔹 brilhos extras */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 16 + 8}px`,
            height: `${Math.random() * 16 + 8}px`,
            background: "rgba(255, 200, 0, 0.5)",
            filter: "blur(6px)",
            boxShadow: "0 0 20px rgba(255, 220, 0, 0.8)",
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
