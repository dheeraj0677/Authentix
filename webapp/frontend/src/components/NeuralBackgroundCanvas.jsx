import React, { useEffect, useRef } from 'react';

export default function NeuralBackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Node count based on screen width
    const NUM_NODES = Math.min(70, Math.floor(width / 22));
    const nodes = [];

    // Track mouse position
    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Instantiate Node Constellation
    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.8 + 1,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, ' : 'rgba(139, 92, 246, ',
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Packet animation pulses running along web connections
    const packets = [];
    const createPacket = (fromNode, toNode) => {
      packets.push({
        x: fromNode.x,
        y: fromNode.y,
        targetX: toNode.x,
        targetY: toNode.y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02
      });
    };

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Dark vignette gradient overlay
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 100,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGradient.addColorStop(0, '#030605');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Update and Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off screen boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse interaction (gentle push)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            node.x -= (dx / dist) * force * 1.5;
            node.y -= (dy / dist) * force * 1.5;
          }
        }

        // Draw Node Core
        const alpha = 0.4 + 0.3 * Math.sin(frameCount * 0.03 + node.pulseOffset);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color + alpha + ')';
        ctx.fill();

        // Connect nearby nodes with cryptographic neural lines
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Occasionally spawn a data packet moving along line
            if (frameCount % 120 === 0 && Math.random() < 0.08 && packets.length < 15) {
              createPacket(node, other);
            }
          }
        }
      }

      // Render Active Neural Data Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        const currentX = p.x + (p.targetX - p.x) * p.progress;
        const currentY = p.y + (p.targetY - p.y) * p.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;


        if (p.progress >= 1) {
          packets.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
}
