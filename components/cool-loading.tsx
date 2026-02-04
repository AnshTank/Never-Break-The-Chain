"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const loadingMessages = [
  "Building your journey...",
  "Preparing your MNZD dashboard...",
  "Loading your progress...",
  "Setting up your chain...",
  "Almost ready to track...",
  "Syncing your data...",
  "Preparing analytics...",
  "Loading your streak...",
];

const motivationalQuotes = [
  "Every expert was once a beginner.",
  "Progress, not perfection.",
  "Small steps, big results.",
  "Consistency beats intensity.",
  "Your future self will thank you.",
  "One day at a time.",
  "Never break the chain.",
  "Show up, even on bad days.",
];

interface LoadingStep {
  name: string;
  progress: number;
  completed: boolean;
}

export default function CoolLoading({
  message = "Loading...",
  onLoadingComplete,
}: {
  message?: string;
  onLoadingComplete?: (data: any) => void;
}) {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [progress, setProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { name: "Authenticating user", progress: 0, completed: false },
    { name: "Loading settings", progress: 0, completed: false },
    { name: "Fetching analytics", progress: 0, completed: false },
    { name: "Loading today's progress", progress: 0, completed: false },
  ]);
  const [allData, setAllData] = useState<any>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Three.js Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 6;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create mountain/staircase effect
    const stairs: THREE.Mesh[] = [];
    const stairCount = 7;

    for (let i = 0; i < stairCount; i++) {
      const width = 0.6;
      const height = 0.15 + i * 0.12;
      const depth = 0.6;
      const geometry = new THREE.BoxGeometry(width, height, depth);

      // Gradient color based on position
      const hue = 0.55 + i * 0.08;
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.85, 0.65),
        transparent: true,
        opacity: 0.95,
      });

      const stair = new THREE.Mesh(geometry, material);
      stair.position.x = (i - stairCount / 2 + 0.5) * 0.7;
      stair.position.y = -1 + i * 0.12;
      scene.add(stair);
      stairs.push(stair);
    }

    // Smooth flowing particles (like progress energy)
    const particleCount = 50;
    const particles: {
      mesh: THREE.Mesh;
      speed: number;
      angle: number;
      radius: number;
      offset: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const size = 0.03 + Math.random() * 0.04;
      const geometry = new THREE.SphereGeometry(size, 6, 6);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.2, 0.9, 0.7),
        transparent: true,
        opacity: 0.7,
      });
      const particle = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 1.5;
      const offset = Math.random() * Math.PI * 2;

      particles.push({
        mesh: particle,
        speed: 0.3 + Math.random() * 0.4,
        angle,
        radius,
        offset,
      });

      scene.add(particle);
    }

    // Central progress sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Smooth rings
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.2 + i * 0.3, 0.02, 16, 50);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.8, 0.6),
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + i * 0.2;
      rings.push(ring);
      scene.add(ring);
    }

    // Animation loop with smooth interpolation
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.008; // Slower, smoother time progression

      // Smooth stair animation
      stairs.forEach((stair, i) => {
        const progressFactor = Math.min(progress / 100, 1);
        const targetHeight = 0.15 + i * 0.12 + Math.sin(time + i * 0.5) * 0.08;
        const targetY = -1 + i * 0.12 + progressFactor * 0.3;

        // Smooth interpolation
        stair.scale.y +=
          (targetHeight / (0.15 + i * 0.12) - stair.scale.y) * 0.08;
        stair.position.y += (targetY - stair.position.y) * 0.08;

        // Smooth rotation
        stair.rotation.y += 0.005;

        // Color shift based on progress
        const hue = 0.55 + progressFactor * 0.15 + i * 0.08;
        (stair.material as THREE.MeshBasicMaterial).color.setHSL(
          hue,
          0.85,
          0.65,
        );
      });

      // Smooth particle flow
      particles.forEach((p, i) => {
        const t = time * p.speed + p.offset;
        p.angle += 0.01;

        // Spiral motion
        const x = Math.cos(p.angle) * p.radius * (1 + Math.sin(t) * 0.1);
        const y = Math.sin(t) * 1.5;
        const z = Math.sin(p.angle) * p.radius * (1 + Math.cos(t) * 0.1);

        // Smooth position interpolation
        p.mesh.position.x += (x - p.mesh.position.x) * 0.1;
        p.mesh.position.y += (y - p.mesh.position.y) * 0.1;
        p.mesh.position.z += (z - p.mesh.position.z) * 0.1;

        // Smooth scale pulse
        const targetScale = 1 + Math.sin(t * 2) * 0.3;
        const currentScale = p.mesh.scale.x;
        p.mesh.scale.setScalar(
          currentScale + (targetScale - currentScale) * 0.1,
        );

        // Update opacity based on progress
        (p.mesh.material as THREE.MeshBasicMaterial).opacity =
          0.5 + (progress / 100) * 0.3;
      });

      // Smooth sphere rotation and scale
      sphere.rotation.y += 0.003;
      sphere.rotation.z += 0.002;
      const targetScale = 1 + Math.sin(time * 0.5) * 0.1;
      sphere.scale.x += (targetScale - sphere.scale.x) * 0.05;
      sphere.scale.y += (targetScale - sphere.scale.y) * 0.05;
      sphere.scale.z += (targetScale - sphere.scale.z) * 0.05;

      // Smooth ring rotation
      rings.forEach((ring, i) => {
        ring.rotation.z += 0.002 * (i + 1);
        const targetOpacity = 0.3 + Math.sin(time + i) * 0.15;
        (ring.material as THREE.MeshBasicMaterial).opacity +=
          (targetOpacity - (ring.material as THREE.MeshBasicMaterial).opacity) *
          0.05;
      });

      // Ultra smooth camera movement
      const targetCameraX = Math.sin(time * 0.3) * 0.3;
      const targetCameraY = Math.cos(time * 0.2) * 0.3;
      camera.position.x += (targetCameraX - camera.position.x) * 0.02;
      camera.position.y += (targetCameraY - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvas || !camera || !renderer) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      particles.forEach((p) => {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      stairs.forEach((stair) => {
        stair.geometry.dispose();
        (stair.material as THREE.Material).dispose();
      });
    };
  }, []);

  // Sync message with current loading step
  useEffect(() => {
    const currentStepIndex = loadingSteps.findIndex((step) => !step.completed);
    if (currentStepIndex !== -1) {
      const stepMessages = [
        "Building your journey...",
        "Preparing your MNZD dashboard...",
        "Loading your progress...",
        "Setting up your chain...",
      ];
      setCurrentMessage(
        stepMessages[currentStepIndex] || "Almost ready to track...",
      );
    } else if (progress === 100) {
      setCurrentMessage("Almost ready to track...");
    }
  }, [loadingSteps, progress]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(
        motivationalQuotes[
          Math.floor(Math.random() * motivationalQuotes.length)
        ],
      );
    }, 4000);

    return () => {
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const updateStep = (
        index: number,
        progress: number,
        completed: boolean = false,
      ) => {
        if (!mounted) return;
        setLoadingSteps((prev) =>
          prev.map((step, i) =>
            i === index ? { ...step, progress, completed } : step,
          ),
        );

        const totalProgress = Math.round(index * 25 + progress * 0.25);
        // Prevent progress from going backwards
        setProgress((prevProgress) =>
          Math.max(prevProgress, Math.min(totalProgress, 100)),
        );
      };

      try {
        updateStep(0, 20);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const userResponse = await fetch("/api/user");
        updateStep(0, 60);

        if (!userResponse.ok) {
          window.location.href = "/login";
          return;
        }

        const userData = await userResponse.json();
        updateStep(0, 100, true);
        setAllData((prev: any) => ({ ...prev, user: userData }));

        if (userData.isNewUser) {
          window.location.replace("/welcome");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));

        updateStep(1, 30);
        const settingsResponse = await fetch("/api/settings");
        updateStep(1, 70);

        let settingsData = null;
        if (settingsResponse.ok) {
          settingsData = await settingsResponse.json();
        }
        updateStep(1, 100, true);

        await new Promise((resolve) => setTimeout(resolve, 200));

        updateStep(2, 40);
        const analyticsResponse = await fetch("/api/analytics");
        updateStep(2, 80);

        let analyticsData = null;
        if (analyticsResponse.ok) {
          analyticsData = await analyticsResponse.json();
        }
        updateStep(2, 100, true);

        await new Promise((resolve) => setTimeout(resolve, 200));

        updateStep(3, 50);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(
          today.getMonth() + 1,
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const progressResponse = await fetch(`/api/progress?date=${todayStr}`);
        updateStep(3, 90);

        let progressData = null;
        if (progressResponse.ok) {
          progressData = await progressResponse.json();
        }
        updateStep(3, 100, true);

        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (mounted && onLoadingComplete) {
          // Get the final accumulated data
          const finalData = {
            user: userData,
            settings: settingsData,
            analytics: analyticsData,
            todayProgress: progressData,
          };
          // console.log("Loading complete, passing data:", finalData);
          onLoadingComplete(finalData);
        }
      } catch (error) {
        // console.error("Loading error:", error);
        if (mounted) {
          setProgress(100);
          if (onLoadingComplete) {
            onLoadingComplete({});
          }
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [onLoadingComplete]);

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/30"
      data-loading="true"
    >
      {/* Smooth Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob-smooth"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob-smooth animation-delay-2s"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-blob-smooth animation-delay-4s"></div>

        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Three.js Canvas - Smaller */}
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              className="w-full h-48 mx-auto rounded-2xl"
              style={{ maxWidth: "300px" }}
            />
          </div>

          {/* Loading Message - Smaller */}
          <div className="space-y-2 px-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
              {currentMessage}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium max-w-sm mx-auto">
              "{currentQuote}"
            </p>
          </div>

          {/* Progress Bar - Smaller */}
          <div className="space-y-4 px-4">
            <div className="relative">
              {/* Percentage Display */}
              <div className="text-center mb-3">
                <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {progress}%
                </span>
              </div>

              {/* Main Progress Track - Smaller */}
              <div className="relative">
                <div className="w-full h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{
                      width: `${progress}%`,
                      boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-smooth"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-smooth-delayed"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Steps - Smaller */}
          <div className="space-y-3 px-4">
            {loadingSteps.map((step, index) => (
              <div key={index} className="relative">
                <div
                  className={`flex items-center gap-3 p-3 rounded-2xl backdrop-blur-xl border transition-all duration-700 ${
                    step.completed
                      ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-400/40 shadow-lg shadow-emerald-500/10"
                      : step.progress > 0
                        ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-400/40 shadow-lg shadow-purple-500/10"
                        : "bg-white/60 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {/* Step Indicator - Smaller */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-700 ${
                        step.completed
                          ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/50"
                          : step.progress > 0
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-purple-500/50"
                            : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : step.progress > 0 ? (
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse-smooth"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full opacity-40"></div>
                      )}
                    </div>

                    {/* Orbital ring - always smooth */}
                    <div className="absolute inset-0 border border-purple-400 rounded-xl animate-spin-smooth opacity-60"></div>

                    {/* Success burst */}
                    {step.completed && (
                      <div className="absolute inset-0 bg-emerald-400 rounded-xl animate-ping-smooth"></div>
                    )}
                  </div>

                  {/* Step Content - Smaller */}
                  <div className="flex-1 text-left min-w-0">
                    <div
                      className={`font-semibold text-sm transition-all duration-500 ${
                        step.completed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : step.progress > 0
                            ? "text-purple-700 dark:text-purple-300"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.name}
                    </div>
                  </div>

                  {/* Status Badge - Smaller */}
                  <div className="flex-shrink-0">
                    {step.completed && (
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Smaller */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 italic pt-2">
            "Some people spend their entire lives waiting for the time to be
            right to make an improvement"🌟
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob-smooth {
          0%,
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(40px, -60px) scale(1.15) rotate(120deg);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.9) rotate(240deg);
          }
        }

        @keyframes shimmer-smooth {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes shimmer-smooth-delayed {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        @keyframes float-gentle {
          0%,
          100% {
            transform: translateY(0px) rotate(-5deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-smooth {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes twinkle-smooth {
          0%,
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          25% {
            opacity: 0.4;
            transform: scale(0.8) rotate(90deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
          75% {
            opacity: 0.4;
            transform: scale(0.8) rotate(270deg);
          }
        }

        @keyframes spin-smooth {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ping-smooth {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-blob-smooth {
          animation: blob-smooth 12s ease-in-out infinite;
        }
        .animate-shimmer-smooth {
          animation: shimmer-smooth 2.5s ease-in-out infinite;
        }
        .animate-shimmer-smooth-delayed {
          animation: shimmer-smooth-delayed 3s ease-in-out infinite;
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-pulse-smooth {
          animation: pulse-smooth 1.5s ease-in-out infinite;
        }
        .animate-twinkle-smooth {
          animation: twinkle-smooth 2s ease-in-out infinite;
        }
        .animate-spin-smooth {
          animation: spin-smooth 2s linear infinite;
        }
        .animate-ping-smooth {
          animation: ping-smooth 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
      `}</style>
    </div>
  );
}
