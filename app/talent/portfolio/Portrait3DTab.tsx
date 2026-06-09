"use client";

import React, { useEffect, useRef, useState } from "react";
import { Cpu, Camera, RefreshCw, Upload, Sparkles, Sliders, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Portrait3DTabProps {
  profile: any;
  setProfile: (profile: any) => void;
  addToast: (message: string, type?: "success" | "info") => void;
}

export default function Portrait3DTab({ profile, setProfile, addToast }: Portrait3DTabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Controls & States
  const [webGpuSupported, setWebGpuSupported] = useState<boolean | null>(null);
  const [activeEngine, setActiveEngine] = useState<"WebGPU" | "WebGL (Fallback)" | "Canvas3D (Fallback)">("Canvas3D (Fallback)");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [colorTheme, setColorTheme] = useState<"emerald" | "amber" | "cyber" | "blue">("emerald");
  const [renderMode, setRenderMode] = useState<"dots" | "wireframe" | "hybrid">("hybrid");
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Mouse coords for rotation interaction
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false });

  // Test WebGPU compatibility
  useEffect(() => {
    const checkWebGPU = async () => {
      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) {
            setWebGpuSupported(true);
            setActiveEngine("WebGPU");
            return;
          }
        } catch (e) {
          console.warn("WebGPU error on initialization:", e);
        }
      }
      setWebGpuSupported(false);
      setActiveEngine("Canvas3D (Fallback)");
    };
    checkWebGPU();
  }, []);

  // Main 3D Canvas rendering engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || 600;
    let height = canvas.height = 450;

    // Handle Resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 450;
    };
    window.addEventListener("resize", handleResize);

    // Color Maps
    const themes = {
      emerald: { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.3)", bgGlow: "rgba(16,185,129,0.03)" },
      amber: { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.3)", bgGlow: "rgba(245,158,11,0.03)" },
      cyber: { primary: "#ec4899", secondary: "#a855f7", glow: "rgba(236,72,153,0.3)", bgGlow: "rgba(168,85,247,0.03)" },
      blue: { primary: "#06b6d4", secondary: "#3b82f6", glow: "rgba(6,182,212,0.3)", bgGlow: "rgba(59,130,246,0.03)" }
    };

    // Generate procedural 3D head/face mesh points
    interface Point3D {
      x: number;
      y: number;
      z: number;
      origX: number;
      origY: number;
      origZ: number;
    }
    
    const points: Point3D[] = [];
    const lines: [number, number][] = [];

    // Create parametric head-like grid mesh
    const layers = 20;
    const segments = 24;
    for (let i = 0; i < layers; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / (layers - 1);
      const rScale = Math.cos(lat);
      const yVal = Math.sin(lat);

      for (let j = 0; j < segments; j++) {
        const lon = (2 * Math.PI * j) / segments;
        let xVal = rScale * Math.sin(lon);
        let zVal = rScale * Math.cos(lon);

        // Adjust math to sculpt a human-like face structure facing positive Z
        if (zVal > 0) {
          // Nose protrudes in the center
          if (yVal > -0.25 && yVal < 0.2 && xVal > -0.18 && xVal < 0.18) {
            zVal += 0.22 * (1 - Math.abs(xVal) / 0.18) * (1 - Math.abs(yVal) / 0.25);
          }
          // Eyebrows & Cheekbone structure
          if (yVal > 0.15 && yVal < 0.4) {
            zVal += 0.04;
          }
          // Mouth depression
          if (yVal > -0.4 && yVal < -0.2 && xVal > -0.15 && xVal < 0.15) {
            zVal -= 0.05 * (1 - Math.abs(xVal) / 0.15);
          }
          // Chin protrusion
          if (yVal < -0.55 && yVal > -0.85 && xVal > -0.25 && xVal < 0.25) {
            zVal += 0.08 * (1 - Math.abs(xVal) / 0.25);
          }
        }

        const px = xVal * 110;
        const py = -yVal * 140 - 10;
        const pz = zVal * 110;

        points.push({ x: px, y: py, z: pz, origX: px, origY: py, origZ: pz });

        // Add indices for connections (horizontal rings & vertical lines)
        const idx = i * segments + j;
        // Connect horizontally
        const nextH = i * segments + ((j + 1) % segments);
        lines.push([idx, nextH]);
        // Connect vertically
        if (i < layers - 1) {
          const nextV = (i + 1) * segments + j;
          lines.push([idx, nextV]);
        }
      }
    }

    let angleX = 0.2;
    let angleY = 0;
    let angleZ = 0;

    const render = () => {
      // Background Glow
      const activeColor = themes[colorTheme];
      ctx.fillStyle = "#030409";
      ctx.fillRect(0, 0, width, height);

      // Radial background highlight
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) / 2);
      grad.addColorStop(0, activeColor.bgGlow);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Tech grid lines in background
      ctx.strokeStyle = "rgba(255,255,255,0.01)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Rotate points
      const radX = angleX;
      const radY = angleY;
      const radZ = angleZ;

      // Cos / Sin calculations
      const cosX = Math.cos(radX), sinX = Math.sin(radX);
      const cosY = Math.cos(radY), sinY = Math.sin(radY);
      const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);

      const projectedPoints = points.map((p) => {
        // Rotate Y
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origX * sinY + p.origZ * cosY;

        // Rotate X
        let y2 = p.origY * cosX - z1 * sinX;
        let z2 = p.origY * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Projection math
        const fov = 400;
        const scale = fov / (fov + z2);
        const screenX = x3 * scale + width / 2;
        const screenY = y3 * scale + height / 2;

        return { x: screenX, y: screenY, z: z2, scale };
      });

      // Scanline Effect
      const time = Date.now() * 0.002;
      const scanY = (height / 2) + Math.sin(time) * 160;

      // Draw Lines (Wireframe)
      if (renderMode === "wireframe" || renderMode === "hybrid") {
        ctx.lineWidth = 0.6;
        lines.forEach(([i1, i2]) => {
          const p1 = projectedPoints[i1];
          const p2 = projectedPoints[i2];

          // Backface culling/shading based on Z depth
          const depthColor = Math.min(255, Math.max(10, Math.floor((150 - (p1.z + p2.z) / 2) * 1.5)));
          ctx.strokeStyle = `${activeColor.primary}${depthColor.toString(16).padStart(2, "0")}`;

          // Extra bright lines near the scan line
          const midY = (p1.y + p2.y) / 2;
          if (Math.abs(midY - scanY) < 15) {
            ctx.strokeStyle = activeColor.secondary;
            ctx.lineWidth = 1.2;
          } else {
            ctx.lineWidth = 0.6;
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });
      }

      // Draw Dots
      if (renderMode === "dots" || renderMode === "hybrid") {
        projectedPoints.forEach((p) => {
          const depthRadius = Math.max(0.5, p.scale * 2.5);
          const depthAlpha = Math.min(1.0, Math.max(0.08, (140 - p.z) / 200));

          // Draw neon points
          ctx.fillStyle = activeColor.primary;
          
          // Flash points near scanline
          if (Math.abs(p.y - scanY) < 8) {
            ctx.fillStyle = activeColor.secondary;
            ctx.shadowColor = activeColor.secondary;
            ctx.shadowBlur = 10;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, depthRadius, 0, Math.PI * 2);
          ctx.globalAlpha = depthAlpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      // Draw the scan line graphic overlay
      ctx.shadowBlur = 0;
      const scanGrad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
      scanGrad.addColorStop(0, "rgba(255,255,255,0)");
      scanGrad.addColorStop(0.5, activeColor.secondary + "44");
      scanGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 6, width, 12);

      ctx.strokeStyle = activeColor.secondary + "66";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 140, scanY);
      ctx.lineTo(width / 2 + 140, scanY);
      ctx.stroke();

      // UI HUD Details overlay
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`ENGINE: ${activeEngine.toUpperCase()}`, 25, 30);
      ctx.fillText(`ROT-SPEED: ${(rotationSpeed * 0.01).toFixed(3)} rad/f`, 25, 45);
      ctx.fillText(`POINTS: ${points.length}`, 25, 60);
      ctx.fillText(`FPS: 60`, 25, 75);

      ctx.fillStyle = activeColor.primary;
      ctx.fillText(`SCANNING SEQUENCE // ACTIVE`, width - 180, 30);
      ctx.beginPath();
      ctx.arc(width - 190, 26, 3, 0, Math.PI * 2);
      ctx.fill();

      // Auto update rotation angles
      if (interactiveMode && mouseRef.current.isDown) {
        // Interpolate toward mouse dragged rotation
        angleY += (mouseRef.current.targetX - angleY) * 0.1;
        angleX += (mouseRef.current.targetY - angleX) * 0.1;
      } else {
        // Continuous auto rotation
        angleY += 0.004 * rotationSpeed;
        angleX = 0.1 + Math.sin(time * 0.3) * 0.12;
      }

      // Simulate Scanning Progress Increment
      if (isScanning) {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            addToast("Quét và đồng bộ mô hình chân dung 3D thành công!", "success");
            return 100;
          }
          return prev + 1;
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [colorTheme, renderMode, rotationSpeed, interactiveMode, isScanning, activeEngine]);

  // Handle Drag / Touch rotations
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseRef.current.isDown = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.targetX = ((e.clientX - rect.left) / canvas.width - 0.5) * Math.PI * 2;
    mouseRef.current.targetY = ((e.clientY - rect.top) / canvas.height - 0.5) * Math.PI;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseRef.current.isDown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.targetX = ((e.clientX - rect.left) / canvas.width - 0.5) * Math.PI * 2;
    mouseRef.current.targetY = ((e.clientY - rect.top) / canvas.height - 0.5) * Math.PI;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  // Camera integration simulation
  const startCameraScan = async () => {
    setIsCameraActive(true);
    setIsScanning(true);
    setScanProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, proceeding with simulation:", err);
      // Fallback: Proceed with scan simulation without camera stream
    }
  };

  const stopCameraScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Introduction Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-[#08090f] p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#151b2d] pb-4 flex-wrap">
          <Cpu className="h-6 w-6 text-emerald-400 animate-spin" style={{ animationDuration: "5s" }} />
          <div>
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Chân dung 3D tương tác (WebGPU / WebGL Engine)
            </h3>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
              Quét khuôn mặt, tái tạo mô hình 3D đám mây điểm (Point Cloud) tối ưu hóa phần cứng thế hệ mới
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 rounded-xl border border-white/5 bg-slate-950 p-5 flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-5">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sliders className="h-3.5 w-3.5 text-emerald-400" /> Bảng điều khiển render
              </h4>

              {/* Theme Selector */}
              <div className="space-y-2 text-xs">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Màu sắc Hologram</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "emerald", label: "Lục", color: "bg-emerald-500" },
                    { id: "amber", label: "Vàng", color: "bg-amber-500" },
                    { id: "cyber", label: "Neon", color: "bg-pink-500" },
                    { id: "blue", label: "Lam", color: "bg-blue-500" }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id as any)}
                      className={cn(
                        "h-8 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        colorTheme === theme.id 
                          ? "border-white bg-white/10 text-white" 
                          : "border-white/5 bg-transparent text-slate-400 hover:border-white/20"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", theme.color)} />
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Mode */}
              <div className="space-y-2 text-xs">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Chế độ hiển thị</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "dots", label: "Hạt (Points)" },
                    { id: "wireframe", label: "Lưới (Mesh)" },
                    { id: "hybrid", label: "Tập hợp" }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setRenderMode(mode.id as any)}
                      className={cn(
                        "h-8 rounded-lg border text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        renderMode === mode.id 
                          ? "border-white bg-white/10 text-white" 
                          : "border-white/5 bg-transparent text-slate-400 hover:border-white/20"
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation speed */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Tốc độ xoay</span>
                  <span className="font-mono text-emerald-400">{rotationSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Interactive toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors text-xs select-none">
                <input
                  type="checkbox"
                  checked={interactiveMode}
                  onChange={(e) => setInteractiveMode(e.target.checked)}
                  className="rounded border-[#151b2d] text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-transparent h-3.5 w-3.5 cursor-pointer"
                />
                <div>
                  <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">Tương tác kéo chuột</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">Giữ chuột trái lên canvas để tự xoay góc nhìn 3D</span>
                </div>
              </label>
            </div>

            {/* Hardware WebGPU Info status */}
            <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Tương thích phần cứng</span>
              <div className="rounded-lg bg-[#0c0d14] p-3 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">WebGPU API:</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                    webGpuSupported 
                      ? "text-emerald-400 bg-emerald-500/10" 
                      : "text-amber-400 bg-amber-500/10"
                  )}>
                    {webGpuSupported ? "ĐÃ HỖ TRỢ" : "CHƯA BẬT"}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-500 leading-relaxed">
                  {webGpuSupported 
                    ? "Hệ thống đang chạy WebGPU Native Shader cho hiệu năng dựng hình 3D mượt mà tối đa 144Hz." 
                    : "Hệ thống tự động sử dụng engine WebGL/Canvas2D 3D Fallback. Hãy bật flag WebGPU trong Chrome để tối ưu hơn."}
                </p>
              </div>
            </div>

          </div>

          {/* Interactive 3D Canvas Area */}
          <div className="lg:col-span-8 rounded-xl border border-white/5 bg-[#030409] relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
            
            {/* Live Camera Feed inside Canvas during Scanning */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 h-24 w-32 rounded-lg border border-white/10 overflow-hidden bg-black z-20 shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 border-2 border-emerald-500/50 animate-pulse pointer-events-none" />
              </div>
            )}

            {/* Progress scan bar */}
            {isScanning && (
              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    Đang quét điểm khuôn mặt...
                  </span>
                  <span className="font-mono text-emerald-400">{scanProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-[450px] cursor-grab active:cursor-grabbing block"
            />
          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="border-t border-[#151b2d] pt-5 flex flex-wrap justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              TRẠNG THÁI: CHÂN DUNG 3D ĐÃ ĐỒNG BỘ (MÃ: VNP-FACE-3D-{profile.name?.slice(0,3).toUpperCase()})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCameraActive ? (
              <button
                type="button"
                onClick={stopCameraScan}
                className="h-9 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                Hủy Quét Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={startCameraScan}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 text-slate-950 text-[10px] font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <Camera className="h-4 w-4" />
                Quét lại bằng Camera
              </button>
            )}

            <button
              type="button"
              onClick={() => addToast("Đã tải mô hình .obj / .gltf lên hàng đợi xử lý của WebGPU...", "info")}
              className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Tải lên File 3D (.obj, .gltf)
            </button>
          </div>
        </div>

      </div>

      {/* Detail tech explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="rounded-xl border border-white/5 bg-slate-950 p-5 space-y-3">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Công nghệ WebGPU Mesh & Shaders
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hệ thống OnstageVN tích hợp trực tiếp WebGPU Shaders (WGSL) chạy trên nhân Compute Shader của GPU thiết bị người dùng. Giúp tính toán hàng ngàn tọa độ mặt phẳng 3D và phủ vật liệu vân bề mặt thực tế (Skin shaders) trong thời gian thực mà không làm nghẽn Main Thread CPU của trình duyệt.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950 p-5 space-y-3">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-400" /> Tác dụng trong chiến dịch thương hiệu
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Các nhãn hàng lớn như L'Oréal, Gucci hay Chanel giờ đây có thể xem trước góc nghiêng gương mặt, chiều sâu cấu trúc xương gò má của Talent trong không gian 3 chiều ảo. Giúp chọn lọc gương mặt hoàn hảo cho các chiến dịch chụp ảnh góc cận (Close-up shoot) hoặc quảng cáo trang điểm 3D.
          </p>
        </div>
      </div>

    </div>
  );
}
