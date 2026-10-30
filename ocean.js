"use strict";
// Photo-based height-field water: wave normals, refraction and moving light.
// The underlying photograph remains visible when WebGL is unavailable.
(() => {
  const canvas = document.getElementById("ocean");
  const hero = document.querySelector(".hero");
  const photo = document.querySelector(".hero-image");
  if (!canvas || !hero || !photo) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reducedMotion.matches;
  let visible = true;
  let ready = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let gl, program, geometry, texture;
  let uniforms = {};

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_photo;
    uniform vec2 u_cover;
    uniform vec2 u_offset;
    uniform float u_time;

    float waterMask(vec3 c, vec2 uv) {
      // Turquoise/blue water moves. Sand and green foliage retain their position.
      float blue = smoothstep(0.018, 0.10, c.b - c.r);
      float green = smoothstep(0.025, 0.13, c.g - c.r);
      return blue * green * smoothstep(0.19, 0.39, uv.y);
    }

    vec3 wave(vec2 p, vec2 direction, float frequency, float speed, float strength) {
      float phase = dot(p, direction) * frequency - u_time * speed;
      float slope = cos(phase) * strength * frequency;
      return vec3(sin(phase) * strength, direction * slope);
    }

    void main() {
      vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y) * u_cover + u_offset;
      vec3 base = texture2D(u_photo, uv).rgb;
      float mask = waterMask(base, uv);
      vec2 p = uv * vec2(1.3333, 1.0);
      vec3 surface = wave(p, normalize(vec2(0.34, 1.0)), 42.0, 1.15, 0.013);
      surface += wave(p, normalize(vec2(-0.5, 1.0)), 69.0, 1.65, 0.006);
      surface += wave(p, normalize(vec2(0.9, 0.38)), 113.0, 2.05, 0.0022);
      // A real three-component normal gives the surface directional depth.
      vec3 normal = normalize(vec3(-surface.y, -surface.z, 1.0));
      vec2 refractedUV = uv + normal.xy * 0.0085 * mask;
      vec3 refracted = texture2D(u_photo, clamp(refractedUV, 0.002, 0.998)).rgb;
      vec3 lightDirection = normalize(vec3(-0.25, -0.45, 1.0));
      float light = dot(normal, lightDirection);
      float specular = pow(max(light, 0.0), 24.0);
      float ridge = smoothstep(0.002, 0.018, surface.x);
      float shimmer = sin(p.x * 165.0 + sin(p.y * 95.0 - u_time) * 1.4 + u_time * 0.45);
      vec3 water = refracted * (0.95 + light * 0.055);
      water += vec3(0.66, 0.88, 0.85) * specular * ridge * 0.075;
      water += vec3(0.40, 0.70, 0.68) * max(shimmer, 0.0) * ridge * 0.012;
      gl_FragColor = vec4(mix(base, water, mask), 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error("Water shader unavailable");
    }
    return shader;
  }

  function setState() {
    const state = !ready ? "fallback" : paused ? "paused" : (!visible || document.hidden) ? "offscreen" : "playing";
    canvas.dataset.state = state;
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  function release() {
    if (!gl || gl.isContextLost()) return;
    if (geometry) gl.deleteBuffer(geometry);
    if (texture) gl.deleteTexture(texture);
    if (program) gl.deleteProgram(program);
    geometry = texture = program = null;
  }

  function fallback() {
    stop(); ready = false;
    canvas.classList.remove("is-ready");
    setState(); release();
  }

  function draw() {
    if (!ready) return;
    gl.uniform1f(uniforms.time, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function resize() {
    if (!ready) return;
    const width = hero.clientWidth, height = hero.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.25, 1600 / width, 1100 / height);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const fit = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
    const coverX = width / (photo.naturalWidth * fit);
    const coverY = height / (photo.naturalHeight * fit);
    const position = getComputedStyle(photo).objectPosition.split(" ").map(parseFloat);
    gl.uniform2f(uniforms.cover, coverX, coverY);
    gl.uniform2f(uniforms.offset, (1 - coverX) * position[0] / 100, (1 - coverY) * position[1] / 100);
    draw();
  }

  function tick(now) {
    frame = 0;
    if (!ready || paused || !visible || document.hidden) { last = 0; return; }
    const interval = hero.clientWidth < 761 ? 1000 / 24 : 1000 / 30;
    if (!last || now - last >= interval) {
      if (last) elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    stop(); setState();
    if (ready && !paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function init() {
    try {
      gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
      if (!gl) return fallback();
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex); gl.attachShader(program, fragment);
      gl.linkProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Water program unavailable");
      gl.useProgram(program);
      geometry = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
      uniforms = { time: gl.getUniformLocation(program, "u_time"), cover: gl.getUniformLocation(program, "u_cover"), offset: gl.getUniformLocation(program, "u_offset") };
      gl.uniform1i(gl.getUniformLocation(program, "u_photo"), 0);
      ready = true; resize();
      canvas.classList.add("is-ready");
      sync();
    } catch (_) { fallback(); }
  }

  reducedMotion.addEventListener("change", (event) => { paused = event.matches; sync(); });
  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting; sync();
  }, { threshold: 0 }).observe(hero);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener("resize", resize, { passive: true });
  canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); fallback(); });
  canvas.addEventListener("webglcontextrestored", init);
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", sync);
  if (photo.complete && photo.naturalWidth) init();
  else { photo.addEventListener("load", init, { once: true }); photo.addEventListener("error", fallback, { once: true }); }
})();
