import React, { useEffect, useRef } from 'react';

export default function CyberCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let animationFrameId;

    function syncSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    syncSize();
    window.addEventListener('resize', syncSize);

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = canvas.height - event.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    if (gl) {
      const vs = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fs = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        void main() {
          vec2 uv = v_texCoord;
          vec2 mPos = u_mouse / u_resolution;

          // Base Deep Obsidian Void
          vec3 color = vec3(0.008, 0.024, 0.063);

          // Neural-like grid/nodes
          vec2 gridUv = uv * 14.0;
          vec2 id = floor(gridUv);
          vec2 gv = fract(gridUv) - 0.5;

          float m = 0.0;
          for(float y = -1.0; y <= 1.0; y++) {
            for(float x = -1.0; x <= 1.0; x++) {
              vec2 offs = vec2(x, y);
              float h = hash(id + offs);
              vec2 p = offs + vec2(sin(u_time * h * 0.8), cos(u_time * h * 0.8)) * 0.35;
              float d = length(gv - p);

              // Mouse interaction
              float distToMouse = length(uv - mPos);
              float mouseInfluence = smoothstep(0.25, 0.0, distToMouse) * 0.6;

              float star = 0.002 / (d * d + 0.001);
              m += star * (h + mouseInfluence);
            }
          }

          // Cyan and Purple accents
          vec3 cyan = vec3(0.0, 0.94, 1.0);
          vec3 purple = vec3(0.69, 0.15, 1.0);

          color += m * mix(cyan, purple, sin(u_time * 0.2) * 0.5 + 0.5);

          // Vignette
          color *= smoothstep(1.5, 0.5, length(uv - 0.5));

          gl_FragColor = vec4(color, 0.65);
        }
      `;

      function createShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const pos = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes = gl.getUniformLocation(prog, 'u_resolution');
      const uMouse = gl.getUniformLocation(prog, 'u_mouse');

      function render(t) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameId = requestAnimationFrame(render);
      }

      render(0);
    }

    return () => {
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70"
      />
      {/* Subtle CRT Scanlines overlay */}
      <div className="scan-lines absolute inset-0 opacity-20 pointer-events-none" />
    </div>
  );
}
