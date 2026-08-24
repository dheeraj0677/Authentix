import React, { useEffect, useRef } from 'react';

export default function CyberCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for reactive parallax
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Color definitions
    const colors = [
      'rgba(0, 240, 255, ',    // Cyan
      'rgba(176, 38, 255, ',   // Purple
      'rgba(255, 0, 127, ',    // Pink
      'rgba(16, 185, 129, ',   // Emerald
      'rgba(0, 255, 196, ',    // Teal
    ];

    // Constellation / Data Nodes
    let nodes = [];
    const NODE_COUNT = Math.min(120, Math.floor((width * height) / 14000));

    // Floating glowing orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.3, vx: 0.25, vy: 0.18, r: 240, color: 'rgba(0, 240, 255, 0.08)' },
      { x: width * 0.8, y: height * 0.7, vx: -0.2, vy: -0.22, r: 280, color: 'rgba(176, 38, 255, 0.08)' },
      { x: width * 0.5, y: height * 0.85, vx: 0.15, vy: -0.25, r: 220, color: 'rgba(16, 185, 129, 0.06)' },
      { x: width * 0.75, y: height * 0.2, vx: -0.18, vy: 0.2, r: 200, color: 'rgba(255, 0, 127, 0.05)' },
    ];

    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const colorBase = colors[Math.floor(Math.random() * colors.length)];
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2.2 + 0.8,
          colorBase: colorBase,
          alpha: Math.random() * 0.6 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulse: Math.random() * Math.PI * 2,
          isHub: Math.random() < 0.15,
        });
      }
    }

    initNodes();

    // Pulses traveling across connections
    const pulses = [];
    function spawnPulse(nodeA, nodeB) {
      if (pulses.length > 25) return;
      pulses.push({
        from: nodeA,
        to: nodeB,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: nodeA.colorBase,
      });
    }

    let frameCount = 0;

    // Render loop
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // 1. Draw drifting holographic nebula orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = height + orb.r;
        if (orb.y > height + orb.r) orb.y = -orb.r;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Update & Draw Constellation Nodes
      const maxDistance = 140;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move node
        node.x += node.vx;
        node.y += node.vy;

        // Bounce from walls
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse avoidance/repulsion
        const dxMouse = mouse.x - node.x;
        const dyMouse = mouse.y - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          node.x -= (dxMouse / distMouse) * force * 2.5;
          node.y -= (dyMouse / distMouse) * force * 2.5;
        }

        // Pulse calculation
        node.pulse += node.pulseSpeed;
        const currentAlpha = node.alpha + Math.sin(node.pulse) * 0.2;

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.25;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `${node.colorBase}${lineAlpha})`;
            ctx.lineWidth = node.isHub && other.isHub ? 1.2 : 0.6;
            ctx.stroke();

            // Randomly trigger data pulse along active connection
            if (frameCount % 90 === 0 && Math.random() < 0.04) {
              spawnPulse(node, other);
            }
          }
        }

        // Draw Node Point
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isHub ? node.radius * 1.8 : node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.colorBase}${Math.max(0.1, currentAlpha)})`;
        ctx.fill();

        // Hub nodes get an outer glow ring
        if (node.isHub) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
          ctx.strokeStyle = `${node.colorBase}0.25)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 3. Render Data Pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const px = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const py = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${pulse.color}0.95)`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Dynamic Animated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Cyber Grid Pattern Background Overlay */}
      <div className="absolute inset-0 cyber-grid-bg opacity-35" />

      {/* Subtle Scanlines Layer */}
      <div className="absolute inset-0 scanlines opacity-15 pointer-events-none" />

      {/* Radial Vignette Darkening edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#020617_95%)] pointer-events-none" />
    </div>
  );
}
