import React, { useEffect, useRef } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Katakana characters, numbers, and letters for the rain effect
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹｲﾒﾝ'.split('');
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }

      const draw = () => {
        // Use a semi-transparent background to create the fading trail effect
        ctx.fillStyle = 'rgba(3, 7, 18, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set the color and font for the falling characters
        ctx.fillStyle = '#0891B2'; // theme cyan-glow
        ctx.font = `${fontSize}px "Roboto Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = letters[Math.floor(Math.random() * letters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          // Reset drop to the top when it goes off-screen
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };
      
      const animate = () => {
        draw();
        animationFrameId = window.requestAnimationFrame(animate);
      };

      animate();
    };

    const handleResize = () => {
      window.cancelAnimationFrame(animationFrameId);
      setup();
    };

    setup();
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove event listener and cancel animation frame
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        backgroundColor: '#030712', // dark-bg
      }}
      aria-hidden="true"
    />
  );
};

export default MatrixBackground;
