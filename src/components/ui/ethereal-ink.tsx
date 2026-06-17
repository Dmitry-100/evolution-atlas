import { memo, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "../../lib/utils";

type ShaderParams = {
  hue: number;
  speed: number;
  intensity: number;
  complexity: number;
  interactive: boolean;
  paused: boolean;
};

type EtherealInkProps = {
  className?: string;
  hue?: number;
  speed?: number;
  intensity?: number;
  complexity?: number;
  interactive?: boolean;
};

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function useThrottledCallback<T extends (...args: never[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== null) return;

      callbackRef.current(...args);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
      }, delay);
    },
    [delay],
  );
}

function createShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function useShaderAnimation(canvasRef: RefObject<HTMLCanvasElement | null>, params: ShaderParams) {
  const { hue, speed, intensity, complexity, interactive, paused } = params;
  const mousePos = useRef({ x: 0.54, y: 0.46 });
  const [isSupported, setIsSupported] = useState(true);

  const throttledMouseMove = useThrottledCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    mousePos.current.x = (event.clientX - rect.left) / rect.width;
    mousePos.current.y = 1 - (event.clientY - rect.top) / rect.height;
  }, 32);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
      stencil: false,
    });

    if (!gl) {
      setIsSupported(false);
      return;
    }

    const vertexShaderSource = `
      attribute vec2 a_position;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_hue;
      uniform float u_speed;
      uniform float u_intensity;
      uniform float u_complexity;

      float random(vec2 p) {
        return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
          mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        mat2 rotation = mat2(1.6, 1.2, -1.2, 1.6);

        for (int i = 0; i < 6; ++i) {
          value += amplitude * noise(p);
          p = rotation * p;
          amplitude *= 0.5;
        }

        return value;
      }

      vec3 palette(float t) {
        vec3 a = vec3(0.42, 0.41, 0.36);
        vec3 b = vec3(0.42, 0.38, 0.32);
        vec3 c = vec3(0.94, 0.72, 0.48);
        vec3 d = vec3(0.72, 0.82, 0.28);
        d.x += u_hue / 360.0;

        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouseUv = (u_mouse * 2.0 - 1.0);
        mouseUv.x *= u_resolution.x / max(u_resolution.y, 1.0);

        vec2 p = uv * u_complexity;
        float time = u_time * 0.2 * u_speed;
        float q = fbm(p - time);
        vec2 flow = vec2(
          fbm(p + q + vec2(1.7, 9.2) - time),
          fbm(p + q + vec2(8.3, 2.8) - time)
        );

        vec2 distortion = flow * u_intensity;
        float mouseDistance = length(uv - mouseUv);
        distortion -= normalize(uv - mouseUv + 0.0001) * 0.045 / (mouseDistance + 0.18);

        float colorValue = fbm(p + distortion);
        vec3 color = palette(colorValue);
        float vignette = 1.0 - 0.58 * pow(length(uv), 2.0);
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      setIsSupported(false);
      return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setIsSupported(false);
      return;
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setIsSupported(false);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const uniformLocations = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      hue: gl.getUniformLocation(program, "u_hue"),
      speed: gl.getUniformLocation(program, "u_speed"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      complexity: gl.getUniformLocation(program, "u_complexity"),
    };

    let animationFrameId = 0;
    const startTime = performance.now();

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const nextWidth = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const nextHeight = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }

      gl.uniform2f(uniformLocations.resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uniformLocations.time, paused ? 0 : (performance.now() - startTime) * 0.001);
      gl.uniform2f(uniformLocations.mouse, mousePos.current.x, mousePos.current.y);
      gl.uniform1f(uniformLocations.hue, hue);
      gl.uniform1f(uniformLocations.speed, speed);
      gl.uniform1f(uniformLocations.intensity, intensity);
      gl.uniform1f(uniformLocations.complexity, complexity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!paused) {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };

    render();

    if (interactive) {
      window.addEventListener("mousemove", throttledMouseMove, { passive: true });
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", throttledMouseMove);

      if (!gl.isContextLost()) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [canvasRef, complexity, hue, intensity, interactive, paused, speed, throttledMouseMove]);

  return isSupported;
}

const ShaderCanvas = memo(function ShaderCanvas(props: ShaderParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSupported = useShaderAnimation(canvasRef, props);

  if (!isSupported) {
    return <div className="ethereal-ink-fallback" />;
  }

  return <canvas ref={canvasRef} className="ethereal-ink-canvas" />;
});

export const EtherealInk = memo(function EtherealInk({
  className,
  hue = 36,
  speed = 0.16,
  intensity = 0.72,
  complexity = 2.35,
  interactive = true,
}: EtherealInkProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn("ethereal-ink", className)} aria-hidden="true">
      <ShaderCanvas
        complexity={complexity}
        hue={hue}
        intensity={intensity}
        interactive={interactive}
        paused={reducedMotion}
        speed={speed}
      />
      <div className="ethereal-ink-scrim" />
    </div>
  );
});

export default EtherealInk;
