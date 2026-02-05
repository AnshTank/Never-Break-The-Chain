"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  Play,
  Pause,
  RotateCcw,
  Menu,
  X,
  CheckSquare,
  BarChart3,
  Settings,
} from "lucide-react";
import FocusOnboarding from "../../components/focus-onboarding";
import { MNZDConfig } from "../../lib/models-new";

interface Session {
  id: string;
  type: "focus" | "break";
  duration: number;
  completed: boolean;
  timestamp: number;
  mnzdTask?: string;
}

interface Stats {
  todayMinutes: number;
  todaySessions: number;
  totalHours: number;
  mnzdProgress: {
    meditation: number;
    nutrition: number;
    zone: number;
    discipline: number;
  };
}

interface Task {
  id: string;
  name: string;
  sessions: number;
  totalTime: number;
  isMNZD?: boolean;
}

interface Theme {
  name: string;
  background: string;
  overlay: string;
  text: string;
  accent: string;
  panel: string;
  border: string;
  particle: number;
  environment: string;
}

const quotes = [
  "Deep work is the ability to focus without distraction",
  "Focus is a matter of deciding what things you're not going to do",
  "The successful warrior is the average person with laser-like focus",
  "Concentrate all your thoughts upon the work at hand",
  "Where attention goes, energy flows and results show",
  "Excellence is never an accident. It is always the result of high intention",
  "The expert in anything was once a beginner",
  "Success is the sum of small efforts repeated day in and day out",
];

const themes: Theme[] = [
  {
    name: "No Theme",
    background:
      "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)",
    overlay: "rgba(240, 244, 248, 0.2)",
    text: "text-slate-700",
    accent: "#3b82f6",
    panel: "bg-white/40",
    border: "border-slate-200/60",
    particle: 0x3b82f6,
    environment: "minimal",
  },
  {
    name: "Ocean Depths",
    background:
      "linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0369a1 50%, #0284c7 75%, #0ea5e9 100%)",
    overlay: "rgba(12, 74, 110, 0.1)",
    text: "text-blue-50",
    accent: "#0ea5e9",
    panel: "bg-blue-900/20",
    border: "border-blue-400/30",
    particle: 0x0ea5e9,
    environment: "ocean",
  },
  {
    name: "Emerald Matrix",
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 50%, #059669 75%, #10b981 100%)",
    overlay: "rgba(6, 78, 59, 0.15)",
    text: "text-emerald-50",
    accent: "#10b981",
    panel: "bg-emerald-900/25",
    border: "border-emerald-400/30",
    particle: 0x10b981,
    environment: "matrix",
  },
  {
    name: "Cosmic Void",
    background:
      "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
    overlay: "rgba(15, 15, 35, 0.2)",
    text: "text-purple-100",
    accent: "#a855f7",
    panel: "bg-purple-900/20",
    border: "border-purple-400/30",
    particle: 0xa855f7,
    environment: "space",
  },
  {
    name: "Golden Hour",
    background:
      "linear-gradient(135deg, #451a03 0%, #7c2d12 25%, #ea580c 50%, #f97316 75%, #fb923c 100%)",
    overlay: "rgba(69, 26, 3, 0.1)",
    text: "text-orange-50",
    accent: "#f97316",
    panel: "bg-orange-900/20",
    border: "border-orange-400/30",
    particle: 0xf97316,
    environment: "sunset",
  },
  {
    name: "Zen Garden",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)",
    overlay: "rgba(248, 250, 252, 0.3)",
    text: "text-slate-800",
    accent: "#64748b",
    panel: "bg-white/30",
    border: "border-slate-300/50",
    particle: 0x64748b,
    environment: "zen",
  },
];

const mnzdTasks = [
  {
    id: "meditation",
    name: "Meditation (Mindfulness)",
    minMinutes: 30,
    symbol: "△",
    color: "#8b5cf6",
    description: "Mindfulness and mental clarity",
  },
  {
    id: "nutrition",
    name: "Nutrition (Learning)",
    minMinutes: 20,
    symbol: "∞",
    color: "#06b6d4",
    description: "Learning and knowledge growth",
  },
  {
    id: "zone",
    name: "Zone (Focus)",
    minMinutes: 45,
    symbol: "◊",
    color: "#f59e0b",
    description: "Deep focused work time",
  },
  {
    id: "discipline",
    name: "Discipline (Work)",
    minMinutes: 15,
    symbol: "{ }",
    color: "#10b981",
    description: "Focused work and productivity",
  },
];

const backgroundSounds = [
  { name: "Rain", file: "/sounds/rain.mp3" },
  { name: "Forest", file: "/sounds/forest.mp3" },
  { name: "Ocean", file: "/sounds/ocean.mp3" },
  { name: "Cafe", file: "/sounds/cafe.mp3" },
  { name: "White Noise", file: "/sounds/whitenoise.mp3" },
];

const notificationSounds = [
  { name: "Default (System)", value: "default" },
  { name: "Bell", value: "/sounds/bell.mp3" },
  { name: "Chime", value: "/sounds/chime.mp3" },
  { name: "Ding", value: "/sounds/ding.mp3" },
];

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayMinutes: 0,
    todaySessions: 0,
    totalHours: 0,
    mnzdProgress: { meditation: 0, nutrition: 0, zone: 0, discipline: 0 },
  });
  const [mnzdConfigs, setMnzdConfigs] = useState<MNZDConfig[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [currentTask, setCurrentTask] = useState<string>("");
  const [newTaskName, setNewTaskName] = useState("");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [backgroundSound, setBackgroundSound] = useState("");
  const [backgroundSoundName, setBackgroundSoundName] = useState("None");
  const [bgSoundVolume, setBgSoundVolume] = useState(0.5);
  const [notificationSound, setNotificationSound] = useState("default");
  const [notificationSoundName, setNotificationSoundName] =
    useState("Default (System)");
  const [isNewUser, setIsNewUser] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [beepCount, setBeepCount] = useState(0);
  const [beepInterval, setBeepInterval] = useState<NodeJS.Timeout | null>(null);

  // Panel states
  const [showPanel, setShowPanel] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "tasks" | "stats" | "settings"
  >("tasks");
  const [taskPage, setTaskPage] = useState(0);

  // Onboarding and session settings
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    focusTime: 25,
    breakTime: 5,
    dailySessionGoal: 8,
    dailyHoursGoal: 8,
  });
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [customAccentColor, setCustomAccentColor] = useState("#3b82f6");
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewUserInfo, setShowNewUserInfo] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef2 = useRef<HTMLAudioElement | null>(null); // Second audio for seamless looping
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const isChangingVolume = useRef(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  const playNotificationSound = () => {
    if (notificationSound === "default") {
      // Use system default notification
      if ("Notification" in window && notificationPermission === "granted") {
        new Notification(
          mode === "focus" ? "Focus time complete!" : "Break time complete!",
          {
            body:
              mode === "focus" ? "Time for a break" : "Ready to focus again?",
            icon: "/favicon.ico",
          }
        );
      }
    } else {
      // Use custom sound
      if (notificationAudioRef.current) {
        notificationAudioRef.current.src = notificationSound;
        notificationAudioRef.current.volume = soundVolume;
        notificationAudioRef.current.play().catch(console.error);
      }
    }
  };

  const startBeepSequence = () => {
    if (beepInterval) clearInterval(beepInterval);
    setBeepCount(0);

    const beep = () => {
      playNotificationSound();
      setBeepCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          if (beepInterval) clearInterval(beepInterval);
          setBeepInterval(null);
        }
        return newCount;
      });
    };

    beep(); // First beep immediately
    const interval = setInterval(beep, 10000); // Then every 10 seconds
    setBeepInterval(interval);
  };

  const stopBeepSequence = () => {
    if (beepInterval) {
      clearInterval(beepInterval);
      setBeepInterval(null);
    }
    setBeepCount(0);
  };

  const theme =
    currentTheme >= 0 && themes[currentTheme]
      ? currentTheme === 0
        ? {
            ...themes[0],
            accent: customAccentColor,
            particle: parseInt(customAccentColor.replace("#", "0x")),
          }
        : themes[currentTheme]
      : themes[0];

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Request notification permission on load
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Three.js Environment Setup
  useEffect(() => {
    if (!mountRef.current || isMobile) return;

    // Clean up previous scene
    if (rendererRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      try {
        if (
          mountRef.current &&
          rendererRef.current.domElement &&
          mountRef.current.contains(rendererRef.current.domElement)
        ) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      } catch (error) {
        console.warn("DOM element already removed:", error);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    }

    // Environment-specific setup
    const setupEnvironment = () => {
      scene.clear();

      if (theme.environment === "ocean") {
        // Ocean waves
        const waveGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const waveMaterial = new THREE.MeshPhongMaterial({
          color: theme.particle,
          transparent: true,
          opacity: 0.1,
          wireframe: true,
        });
        const waves = new THREE.Mesh(waveGeometry, waveMaterial);
        waves.rotation.x = -Math.PI / 2;
        waves.position.y = -20;
        scene.add(waves);

        // Floating bubbles
        for (let i = 0; i < 30; i++) {
          const bubbleGeometry = new THREE.SphereGeometry(
            Math.random() * 0.5 + 0.1,
            8,
            8
          );
          const bubbleMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.3,
          });
          const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
          bubble.position.set(
            (Math.random() - 0.5) * 50,
            Math.random() * 30 - 10,
            (Math.random() - 0.5) * 50
          );
          scene.add(bubble);
        }
      } else if (theme.environment === "matrix") {
        // Matrix-style digital rain effect with geometric shapes
        for (let i = 0; i < 40; i++) {
          const shapes = [
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.TetrahedronGeometry(0.3),
            new THREE.OctahedronGeometry(0.25),
          ];
          const geometry = shapes[Math.floor(Math.random() * shapes.length)];
          const material = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: Math.random() * 0.6 + 0.2,
            emissive: theme.particle,
            emissiveIntensity: 0.1,
          });
          const shape = new THREE.Mesh(geometry, material);
          shape.position.set(
            (Math.random() - 0.5) * 80,
            Math.random() * 40 + 10,
            (Math.random() - 0.5) * 80
          );
          shape.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(shape);
        }

        // Vertical light beams
        for (let i = 0; i < 15; i++) {
          const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 20, 8);
          const beamMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.15,
            emissive: theme.particle,
            emissiveIntensity: 0.05,
          });
          const beam = new THREE.Mesh(beamGeometry, beamMaterial);
          beam.position.set(
            (Math.random() - 0.5) * 100,
            0,
            (Math.random() - 0.5) * 100
          );
          scene.add(beam);
        }
      } else if (theme.environment === "space") {
        // Stars and galaxies
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(200 * 3);
        for (let i = 0; i < 200 * 3; i += 3) {
          starPositions[i] = (Math.random() - 0.5) * 200;
          starPositions[i + 1] = (Math.random() - 0.5) * 200;
          starPositions[i + 2] = (Math.random() - 0.5) * 200;
        }
        starGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(starPositions, 3)
        );
        const starMaterial = new THREE.PointsMaterial({
          color: theme.particle,
          size: 2,
          transparent: true,
          opacity: 0.8,
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Nebula clouds
        for (let i = 0; i < 10; i++) {
          const cloudGeometry = new THREE.SphereGeometry(
            Math.random() * 5 + 3,
            16,
            16
          );
          const cloudMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.1,
          });
          const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
          cloud.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 100
          );
          scene.add(cloud);
        }
      } else if (theme.environment === "sunset") {
        // Floating orbs
        for (let i = 0; i < 25; i++) {
          const orbGeometry = new THREE.SphereGeometry(
            Math.random() * 1 + 0.5,
            16,
            16
          );
          const orbMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.3,
            emissive: theme.particle,
            emissiveIntensity: 0.1,
          });
          const orb = new THREE.Mesh(orbGeometry, orbMaterial);
          orb.position.set(
            (Math.random() - 0.5) * 60,
            Math.random() * 30,
            (Math.random() - 0.5) * 60
          );
          scene.add(orb);
        }
      } else if (theme.environment === "zen") {
        // Minimalist floating cubes
        for (let i = 0; i < 15; i++) {
          const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
          const cubeMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.2,
          });
          const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
          cube.position.set(
            (Math.random() - 0.5) * 40,
            Math.random() * 20,
            (Math.random() - 0.5) * 40
          );
          cube.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(cube);
        }
      } else if (theme.environment === "minimal") {
        // Simple floating particles for No Theme
        for (let i = 0; i < 20; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          const particleMaterial = new THREE.MeshPhongMaterial({
            color: theme.particle,
            transparent: true,
            opacity: 0.4,
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.position.set(
            (Math.random() - 0.5) * 60,
            Math.random() * 30,
            (Math.random() - 0.5) * 60
          );
          scene.add(particle);
        }
      }
    };

    setupEnvironment();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(theme.particle, 0.6);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 30;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    let time = 0;
    const animate = () => {
      time += 0.01;

      // Animate scene objects based on environment
      scene.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          if (theme.environment === "ocean") {
            child.position.y += Math.sin(time + index) * 0.02;
            child.rotation.y += 0.005;
          } else if (theme.environment === "matrix") {
            // Matrix rain effect - shapes fall down and reset
            child.position.y -= 0.1;
            if (child.position.y < -30) {
              child.position.y = 30;
            }
            child.rotation.x += 0.01;
            child.rotation.y += 0.008;
          } else if (theme.environment === "space") {
            child.rotation.y += 0.003;
            child.rotation.x += 0.001;
          } else if (theme.environment === "sunset") {
            child.position.y += Math.sin(time + index * 0.5) * 0.03;
            child.rotation.y += 0.01;
          } else if (theme.environment === "zen") {
            child.rotation.x += 0.005;
            child.rotation.y += 0.003;
            child.position.y += Math.sin(time * 0.3 + index) * 0.01;
          } else if (theme.environment === "minimal") {
            child.position.y += Math.sin(time * 0.2 + index) * 0.02;
            child.rotation.y += 0.002;
          }
        }
      });

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentTheme, isMobile]);

  // Initialize MNZD tasks from database configs
  useEffect(() => {
    if (mnzdConfigs.length > 0) {
      const mnzdTaskList = mnzdConfigs.map((config) => ({
        id: config.id,
        name: config.name,
        sessions: 0,
        totalTime: 0,
        isMNZD: true,
      }));
      setTasks((prev) => [...mnzdTaskList, ...prev.filter((t) => !t.isMNZD)]);
    }
  }, [mnzdConfigs]);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const settings = await response.json();

          // Load MNZD configs
          if (settings.mnzdConfigs) {
            setMnzdConfigs(settings.mnzdConfigs);
          }

          // Check newUser flag - only show onboarding if newUser is true
          if (settings.newUser === true) {
            setIsNewUser(true);
            setShowOnboarding(true);
            setShowLoadingScreen(false); // Hide loading immediately for new users
          } else {
            setIsNewUser(false);
            setShowOnboarding(false); // Explicitly don't show onboarding for existing users
          }

          if (settings.timerSettings) {
            const ts = settings.timerSettings;
            const newSessionSettings = {
              focusTime: ts.focusTime || 25,
              breakTime: ts.breakTime || 5,
              dailySessionGoal: ts.dailySessionGoal || 8,
              dailyHoursGoal: ts.dailyHoursGoal || 8,
            };
            setSessionSettings(newSessionSettings);
            setAutoStart(ts.autoStart || false);
            setNotifications(
              ts.notifications !== undefined ? ts.notifications : true
            );
            setSoundVolume(ts.soundVolume || 0.5);

            // Map background sound from DB to name and file
            const bgSound = backgroundSounds.find(
              (s) => s.file === ts.backgroundSound
            );
            setBackgroundSound(ts.backgroundSound || "");
            setBackgroundSoundName(bgSound?.name || "None");
            setBgSoundVolume(ts.bgSoundVolume || 0.5);

            // Map notification sound from DB to name
            const notifSound = notificationSounds.find(
              (s) => s.value === ts.notificationSound
            );
            setNotificationSound(ts.notificationSound || "default");
            setNotificationSoundName(notifSound?.name || "Default (System)");

            // Load theme settings from timerSettings
            if (ts.timerTheme !== undefined) {
              const themeIndex =
                typeof ts.timerTheme === "string"
                  ? themes.findIndex((t) => t.name === ts.timerTheme)
                  : ts.timerTheme;
              setCurrentTheme(themeIndex >= 0 ? themeIndex : 0);
            }
            if (ts.timerCustomAccentColor) {
              setCustomAccentColor(ts.timerCustomAccentColor);
            }

            // Apply session settings to timer with auto-scroll
            setSelectedDuration(newSessionSettings.focusTime);
            setTimeLeft(newSessionSettings.focusTime * 60);
            setBreakDuration(newSessionSettings.breakTime);

            // Auto-scroll duration selector to current value
            setTimeout(() => {
              const selector = document.querySelector(".duration-selector");
              const activeButton = document.querySelector(
                `button[data-duration="${newSessionSettings.focusTime}"]`
              );
              if (selector && activeButton) {
                activeButton.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                });
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    const loadTimerData = async () => {
      try {
        const response = await fetch("/api/timer-data");
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
          setStats(data.stats || {
            todayMinutes: 0,
            todaySessions: 0,
            totalHours: 0,
            mnzdProgress: { meditation: 0, nutrition: 0, zone: 0, discipline: 0 },
          });
          setTasks(data.tasks || []);
          setPomodoroCount(data.pomodoroCount || 0);
          setCompletedSessions(data.completedSessions || 0);

        } else {
          console.error('Failed to load timer data from database');
          // Only fallback to localStorage if database fails
          const savedData = localStorage.getItem("focusTimerData");
          if (savedData) {
            const data = JSON.parse(savedData);
            setSessions(data.sessions || []);
            setStats(data.stats || stats);
            setTasks(data.tasks || []);
            setPomodoroCount(data.pomodoroCount || 0);
            setCompletedSessions(data.completedSessions || 0);

          }
        }
      } catch (error) {
        console.error("Error loading timer data:", error);
        // Fallback to localStorage on error
        const savedData = localStorage.getItem("focusTimerData");
        if (savedData) {
          const data = JSON.parse(savedData);
          setSessions(data.sessions || []);
          setStats(data.stats || stats);
          setTasks(data.tasks || []);
          setPomodoroCount(data.pomodoroCount || 0);
          setCompletedSessions(data.completedSessions || 0);

        }
      }
    };

    const loadTodayProgress = async () => {
      try {
        const today = new Date().toLocaleDateString("en-CA");
        const response = await fetch(`/api/progress?date=${today}`);
        if (response.ok) {
          const progress = await response.json();
          const mnzdProgress = { meditation: 0, nutrition: 0, zone: 0, discipline: 0 };

          progress.tasks?.forEach((task: any) => {
            if (mnzdProgress.hasOwnProperty(task.taskId)) {
              mnzdProgress[task.taskId as keyof typeof mnzdProgress] =
                task.minutes;
            }
          });

          setStats((prev) => ({ ...prev, mnzdProgress }));
        }
      } catch (error) {
        console.error("Error loading today progress:", error);
      }
    };

    // Remove localStorage dependency - load from database first
    loadUserSettings();
    loadTimerData();
    loadTodayProgress();

    setTimeout(() => {
      setShowLoadingScreen(false);
    }, 1500);

    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      bgAudioRef.current = new Audio();
    }

    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Background sound management with seamless looping
  useEffect(() => {
    const setupAudio = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
      if (audioRef.current) {
        audioRef.current.preload = "auto";
        audioRef.current.volume = bgSoundVolume;

        // Handle seamless looping
        const handleTimeUpdate = () => {
          if (audioRef.current && audioRef.current.duration > 0) {
            // Start crossfade 0.5 seconds before end
            if (
              audioRef.current.currentTime >=
              audioRef.current.duration - 0.5
            ) {
              const otherRef =
                audioRef === bgAudioRef ? bgAudioRef2 : bgAudioRef;
              if (otherRef.current && backgroundSound) {
                otherRef.current.currentTime = 0;
                otherRef.current.volume = bgSoundVolume;
                otherRef.current.play().catch(console.error);
              }
            }
          }
        };

        const handleEnded = () => {
          if (backgroundSound && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          }
        };

        audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.addEventListener("ended", handleEnded);

        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener(
              "timeupdate",
              handleTimeUpdate
            );
            audioRef.current.removeEventListener("ended", handleEnded);
          }
        };
      }
    };

    if (backgroundSound) {
      // Setup both audio elements
      if (bgAudioRef.current) {
        bgAudioRef.current.src = backgroundSound;
        setupAudio(bgAudioRef);
      }
      if (bgAudioRef2.current) {
        bgAudioRef2.current.src = backgroundSound;
        setupAudio(bgAudioRef2);
      }

      // Start playing the first audio
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(console.error);
      }
    } else {
      // Stop both audio elements
      [bgAudioRef, bgAudioRef2].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    }

    // Cleanup function to stop all audio when component unmounts or backgroundSound changes
    return () => {
      [bgAudioRef, bgAudioRef2].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current.src = '';
        }
      });
    };
  }, [backgroundSound]);

  // Comprehensive cleanup on component unmount - this ensures audio stops when leaving the timer route
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop all audio when page is about to unload
      [bgAudioRef, bgAudioRef2, audioRef, notificationAudioRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current.src = '';
        }
      });
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Stop all audio when component unmounts (route change)
      [bgAudioRef, bgAudioRef2, audioRef, notificationAudioRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current.src = '';
          // Remove all event listeners
          ref.current.removeEventListener('timeupdate', () => {});
          ref.current.removeEventListener('ended', () => {});
        }
      });
      
      // Clear any beep intervals
      if (beepInterval) {
        clearInterval(beepInterval);
      }
      
      // Clear timer interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Background sound volume with immediate updates
  useEffect(() => {
    [bgAudioRef, bgAudioRef2].forEach((ref) => {
      if (ref.current) {
        ref.current.volume = bgSoundVolume;
      }
    });
  }, [bgSoundVolume]);

  const initializeTimerSettings = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUser: false,
          timerSettings: {
            focusTime: sessionSettings.focusTime,
            breakTime: sessionSettings.breakTime,
            dailySessionGoal: sessionSettings.dailySessionGoal,
            autoStart,
            notifications,
            soundVolume,
            backgroundSound,
            bgSoundVolume,
            notificationSound,
            timerTheme: themes[currentTheme].name,
            timerCustomAccentColor: customAccentColor,
          },
        }),
      });
      setShowNewUserInfo(false);
      setIsNewUser(false);
    } catch (error) {
      console.error("Error initializing timer settings:", error);
    }
  };

  const saveTimerSettings = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUser: false,
          timerSettings: {
            focusTime: sessionSettings.focusTime,
            breakTime: sessionSettings.breakTime,
            dailySessionGoal: sessionSettings.dailySessionGoal,
            dailyHoursGoal: sessionSettings.dailyHoursGoal,
            autoStart,
            notifications,
            soundVolume,
            backgroundSound,
            bgSoundVolume,
            notificationSound,
            timerTheme: themes[currentTheme].name,
            timerCustomAccentColor: customAccentColor,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings to database');
      }
      
      setSettingsChanged(false);
      setOriginalSettings(null);
      setIsNewUser(false);

    } catch (error) {
      console.error("Error saving timer settings to database:", error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const cancelSettingsChanges = () => {
    if (originalSettings) {
      setSessionSettings(originalSettings.sessionSettings);
      setAutoStart(originalSettings.autoStart);
      setNotifications(originalSettings.notifications);
      setSoundVolume(originalSettings.soundVolume);
      setBackgroundSound(originalSettings.backgroundSound);
      setBgSoundVolume(originalSettings.bgSoundVolume);
      setNotificationSound(originalSettings.notificationSound);
      setCurrentTheme(originalSettings.currentTheme);
      setCustomAccentColor(originalSettings.customAccentColor);

      // Reset timer duration based on current mode
      const newDuration =
        mode === "focus"
          ? originalSettings.sessionSettings.focusTime
          : originalSettings.sessionSettings.breakTime;
      setSelectedDuration(newDuration);
      if (!isRunning) {
        setTimeLeft(newDuration * 60);
      }
      setBreakDuration(originalSettings.sessionSettings.breakTime);
    }
    setSettingsChanged(false);
    setOriginalSettings(null);
  };

  const saveData = async () => {
    const data = {
      sessions,
      stats,
      tasks,
      pomodoroCount,
      completedSessions,
    };

    try {
      const response = await fetch("/api/timer-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to database');
      }
      

    } catch (error) {
      console.error("Error saving timer data to database:", error);
      // Only use localStorage as emergency backup
      localStorage.setItem("focusTimerData", JSON.stringify(data));
    }
  };

  const switchMode = (newMode: "focus" | "break") => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setShowModeTransition(true);
    setIsRunning(false);

    // Fade out current content
    setTimeout(() => {
      setMode(newMode);
      const minutes =
        newMode === "focus"
          ? sessionSettings.focusTime
          : sessionSettings.breakTime;
      setSelectedDuration(minutes);
      setTimeLeft(minutes * 60);
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      // Fade in new content
      setTimeout(() => {
        setShowModeTransition(false);
        setTimeout(() => {
          setIsTransitioning(false);
          if (autoStart) {
            setTimeout(() => setIsRunning(true), 500);
          }
        }, 300);
      }, 100);
    }, 300);
  };
  const handleComplete = async () => {
    setIsRunning(false);
    startBeepSequence();

    if (audioRef.current) {
      audioRef.current.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/Eeyw";
      audioRef.current.volume = soundVolume;
      audioRef.current.play().catch(() => {});
    }

    if (
      notifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(
        `${mode === "focus" ? "Focus" : "Break"} session completed!`,
        {
          body: `Great job! Time for a ${
            mode === "focus" ? "break" : "focus session"
          }.`,
          icon: "/favicon.ico",
        }
      );
    }

    const newSession: Session = {
      id: Date.now().toString(),
      type: mode,
      duration: selectedDuration,
      completed: true,
      timestamp: Date.now(),
      mnzdTask: currentTask,
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);

    // Update MNZD progress in database if focus session with MNZD task
    if (
      currentTask &&
      mode === "focus" &&
      mnzdConfigs.find((c) => c.id === currentTask)
    ) {
      try {
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
        const response = await fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            taskId: currentTask,
            minutes: selectedDuration,
          }),
        });

        if (response.ok) {
          // Update local MNZD progress state
          const newMnzdProgress = { ...stats.mnzdProgress };
          newMnzdProgress[currentTask as keyof typeof newMnzdProgress] +=
            selectedDuration;
          setStats((prev) => ({ ...prev, mnzdProgress: newMnzdProgress }));
        }
      } catch (error) {
        console.error("Error updating MNZD progress:", error);
      }
    }

    if (currentTask && mode === "focus") {
      const updatedTasks = tasks.map((task) =>
        task.id === currentTask
          ? {
              ...task,
              sessions: task.sessions + 1,
              totalTime: task.totalTime + selectedDuration,
            }
          : task
      );
      setTasks(updatedTasks);

      if (mnzdConfigs.find((c) => c.id === currentTask)) {
        const newMnzdProgress = { ...stats.mnzdProgress };
        newMnzdProgress[currentTask as keyof typeof newMnzdProgress] +=
          selectedDuration;
        setStats((prev) => ({ ...prev, mnzdProgress: newMnzdProgress }));
      }
    }

    const newStats = {
      ...stats,
      todayMinutes: stats.todayMinutes + selectedDuration,
      todaySessions: stats.todaySessions + 1,
      totalHours: stats.totalHours + selectedDuration / 60,
    };
    setStats(newStats);

    if (mode === "focus") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      switchMode("break");
    } else {
      switchMode("focus");
    }

    await saveData();
  };

  const start = () => {
    stopBeepSequence();
    setIsRunning(true);
  };
  const pause = () => {
    stopBeepSequence();
    setIsRunning(false);
  };
  const reset = () => {
    stopBeepSequence();
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const setDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    if (!isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const addTask = async () => {
    if (newTaskName.trim() && newTaskName.trim().length <= 25) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName.trim(),
        sessions: 0,
        totalTime: 0,
        isMNZD: false,
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setNewTaskName("");
      
      // Save immediately to database
      const data = {
        sessions,
        stats,
        tasks: updatedTasks,
        pomodoroCount,
        completedSessions,
      };
      
      try {
        const response = await fetch("/api/timer-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save to database');
        }
        

      } catch (error) {
        console.error("Error adding task to database:", error);
        // Revert the change if database save fails
        setTasks(tasks);
        setNewTaskName(newTaskName.trim());
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    if (tasks.find((t) => t.id === taskId)?.isMNZD) return;
    
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    
    if (currentTask === taskId) {
      setCurrentTask("");
    }
    
    // Save immediately to database
    const data = {
      sessions,
      stats,
      tasks: updatedTasks,
      pomodoroCount,
      completedSessions,
    };
    
    try {
      const response = await fetch("/api/timer-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to database');
      }
      

    } catch (error) {
      console.error("Error deleting task from database:", error);
      // Revert the change if database save fails
      setTasks(tasks);
      if (currentTask === taskId) {
        setCurrentTask(taskId);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    return ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;
  };

  const todaySessions = sessions.filter((s) => {
    const today = new Date().toLocaleDateString("en-CA");
    const sessionDate = new Date(s.timestamp).toLocaleDateString("en-CA");
    return sessionDate === today;
  });

  const refreshTheme = () => {
    // Force re-render of Three.js scene without stopping animation
    const currentThemeIndex = currentTheme;
    setCurrentTheme(-1);
    setTimeout(() => {
      setCurrentTheme(currentThemeIndex);
    }, 100);
  };

  const handleThemeChange = async (newTheme: number) => {
    setCurrentTheme(newTheme);

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timerSettings: {
            timerTheme: themes[newTheme].name,
          },
        }),
      });
    } catch (error) {
      console.error("Error saving theme:", error);
    }

    saveData();
  };

  const handleOnboardingComplete = async (settings: {
    focusTime: number;
    breakTime: number;
    dailySessionGoal: number;
    dailyHoursGoal: number;
  }) => {
    setSessionSettings(settings);
    setSelectedDuration(settings.focusTime);
    setTimeLeft(settings.focusTime * 60);
    setBreakDuration(settings.breakTime);
    setShowOnboarding(false);
    
    // Save settings to database
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUser: false,
          timerSettings: {
            focusTime: settings.focusTime,
            breakTime: settings.breakTime,
            dailySessionGoal: settings.dailySessionGoal,
            dailyHoursGoal: settings.dailyHoursGoal,
            autoStart,
            notifications,
            soundVolume,
            backgroundSound,
            bgSoundVolume,
            notificationSound,
            timerTheme: themes[currentTheme]?.name || "No Theme",
            timerCustomAccentColor: customAccentColor,
          },
        }),
      });
    } catch (error) {
      console.error("Error saving onboarding settings:", error);
    }
    
    saveData();
  };

  // Generate time options
  const focusOptions = Array.from({ length: 16 }, (_, i) => 15 + i * 5); // 15-90 minutes
  const breakOptions = Array.from({ length: 6 }, (_, i) => 5 + i * 5); // 5-30 minutes

  const sessionProgress = Math.min(
    (completedSessions / sessionSettings.dailySessionGoal) * 100,
    100
  );

  return (
    <div
      className={`${isMobile ? "min-h-screen" : "fixed inset-0"} ${
        isMobile ? "overflow-auto" : "overflow-hidden"
      } transition-all duration-1000 ease-in-out`}
      style={{ background: theme.background }}
    >
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          overflow: ${isMobile ? "auto" : "hidden"};
        }
        html,
        body {
          height: ${isMobile ? "auto" : "100%"};
          min-height: ${isMobile ? "100vh" : "100%"};
        }
        .loading-bar {
          animation: loading 2s ease-in-out infinite;
        }
        .gradient-shift {
          animation: gradientShift 8s ease-in-out infinite;
        }
        .duration-selector::-webkit-scrollbar {
          display: none;
        }
        .duration-selector {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      {/* Loading Screen */}
      {showLoadingScreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: theme.background }}
        >
          <div className="text-center">
            <div
              className="text-6xl mb-6 animate-pulse"
              style={{ color: theme.accent }}
            >
              🧘‍♂️
            </div>
            <h2 className={`text-4xl font-light ${theme.text} mb-4`}>
              Preparing Your Focus Space
            </h2>
            <p
              className={`${theme.text} opacity-70 text-lg max-w-md mx-auto leading-relaxed`}
            >
              "The mind is everything. What you think you become." - Buddha
            </p>
            <div className="mt-8 flex justify-center">
              <div
                className="w-16 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <div
                  className="h-full rounded-full animate-pulse loading-bar"
                  style={{
                    background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent}80 50%, ${theme.accent} 100%)`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Three.js Background - Desktop Only */}
      {!isMobile && <div ref={mountRef} className="fixed inset-0 -z-10" />}

      {/* Mobile Background */}
      {isMobile && (
        <div
          className="fixed inset-0 -z-10 gradient-shift"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.accent}10 0%, ${theme.accent}05 50%, transparent 100%)`,
            backgroundSize: "400% 400%",
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="fixed inset-0 -z-5 transition-all duration-1000 ease-in-out"
        style={{ background: theme.overlay }}
      ></div>

      {/* Header */}
      <div
        className={`${
          isMobile ? "fixed" : "absolute"
        } top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-8`}
      >
        <Link
          href="/dashboard"
          className={`${theme.text} hover:opacity-80 transition-all duration-300 font-medium text-base md:text-lg`}
        >
          ← Dashboard
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowOnboarding(true)}
            className={`p-2 md:p-3 rounded-full ${theme.panel} backdrop-blur-xl transition-all duration-300 hover:scale-110 ${theme.border} border`}
            title="Learn about Focus Timer"
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 ${theme.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={refreshTheme}
            className={`p-2 md:p-3 rounded-full ${
              theme.panel
            } backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
              theme.border
            } border ${isMobile ? "hidden" : ""}`}
            title="Refresh Theme"
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 ${theme.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
            disabled={isTransitioning}
            className={`px-3 py-2 md:px-8 md:py-3 rounded-full ${
              theme.panel
            } backdrop-blur-xl transition-all duration-500 ${
              theme.border
            } border hover:scale-105 shadow-2xl ${
              isTransitioning ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ color: theme.accent }}
          >
            <span className="font-medium text-xs md:text-base">
              {mode === "focus" ? "Focus Mode" : "Break Mode"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Timer */}
      <div
        className={`flex items-center justify-center ${
          isMobile ? "h-screen" : "min-h-screen"
        } ${isMobile ? "p-4" : "p-4 lg:p-8"} transition-all duration-500 ${
          showModeTransition ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="text-center max-w-4xl mx-auto">
          <div
            className={`${
              isMobile ? "mb-4" : "mb-4 lg:mb-8"
            } transition-all duration-500 ${
              showModeTransition
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <h1
              className={`${
                isMobile ? "text-3xl" : "text-4xl lg:text-6xl"
              } font-extralight ${theme.text} ${
                isMobile ? "mb-2" : "mb-3 lg:mb-4"
              } transition-all duration-1000 tracking-wide`}
            >
              {mode === "focus" ? "Focus Time" : "Break Time"}
            </h1>
            <p
              className={`${theme.text} opacity-90 ${
                isMobile ? "text-sm px-4" : "text-base lg:text-xl px-8"
              } font-light max-w-4xl mx-auto leading-relaxed transition-all duration-1000`}
            >
              {currentQuote}
            </p>
          </div>

          {currentTask && mode === "focus" && (
            <div
              className={`${isMobile ? "mb-2" : "mb-3"} transition-all duration-600 ${
                showModeTransition
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <div
                className={`inline-flex items-center gap-2 ${isMobile ? "px-3 py-1.5" : "px-4 py-2"} rounded-full ${theme.panel} backdrop-blur-xl ${
                  theme.border
                } border shadow-lg`}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.accent }}
                />
                <span className={`${theme.text} ${isMobile ? "text-xs" : "text-sm"} opacity-70`}>
                  Working on:
                </span>
                <span 
                  className={`${isMobile ? "text-sm" : "text-base"} font-semibold`}
                  style={{ color: theme.accent }}
                >
                  {(() => {
                    const task = tasks.find((t) => t.id === currentTask);
                    const mnzdConfig = mnzdConfigs.find((c) => c.id === currentTask);
                    return task?.name || mnzdConfig?.name || "Unknown Task";
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Timer Circle */}
          <button
            onClick={() => {
              if (timeLeft === 0) {
                reset();
              } else if (isRunning) {
                pause();
              } else {
                start();
              }
            }}
            className={`relative ${
              isMobile ? "mb-6" : "mb-12"
            } transition-all duration-700 ${
              showModeTransition
                ? "opacity-0 scale-90"
                : "opacity-100 scale-100"
            } cursor-pointer hover:scale-105 active:scale-95`}
          >
            {!isMobile && (
              <div className="absolute inset-0 animate-pulse pointer-events-none">
                <div
                  className="w-72 h-72 lg:w-96 lg:h-96 mx-auto rounded-full opacity-20 blur-3xl"
                  style={{
                    background: `radial-gradient(circle, ${theme.accent}40 0%, transparent 70%)`,
                  }}
                ></div>
              </div>
            )}
            <svg
              className={`${
                isMobile ? "w-56 h-56" : "w-64 h-64 lg:w-80 lg:h-80"
              } mx-auto transform -rotate-90 relative z-10`}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className={`${theme.text} opacity-20 transition-all duration-1000`}
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={theme.accent}
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${
                  2 * Math.PI * 45 * (1 - getProgress() / 100)
                }`}
                className="transition-all duration-1000 ease-linear drop-shadow-lg"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div
                  className={`${
                    isMobile ? "text-4xl" : "text-4xl lg:text-6xl"
                  } font-extralight ${theme.text} ${
                    isMobile ? "mb-2" : "mb-3"
                  } tabular-nums transition-all duration-1000 tracking-wider`}
                >
                  {formatTime(timeLeft)}
                </div>
                <div
                  className={`${theme.text} opacity-70 ${
                    isMobile ? "text-sm" : "text-base lg:text-xl"
                  } font-light transition-all duration-1000`}
                >
                  {timeLeft === 0
                    ? "Tap to Reset"
                    : isRunning
                    ? mode === "focus"
                      ? "Deep Focus"
                      : "Rest Time"
                    : "Tap to Start"}
                </div>
                {isRunning && mode === "focus" && (
                  <div
                    className={`${
                      isMobile ? "mt-1 text-xs" : "mt-2 text-sm lg:text-lg"
                    } ${theme.text} opacity-50 transition-all duration-1000`}
                  >
                    Session {pomodoroCount + 1}
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Controls */}
          <div
            className={`flex justify-center ${
              isMobile ? "gap-3 mb-4" : "gap-4 lg:gap-6 mb-4 lg:mb-8"
            } transition-all duration-600 ${
              showModeTransition
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            {!isRunning ? (
              <button
                onClick={start}
                className={`${
                  isMobile ? "px-8 py-3" : "px-12 py-4 lg:px-16 lg:py-5"
                } rounded-full ${
                  theme.panel
                } backdrop-blur-xl transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-110 ${
                  theme.border
                } border group`}
              >
                <span
                  className={`${
                    isMobile ? "text-lg" : "text-xl lg:text-2xl"
                  } font-medium ${
                    theme.text
                  } group-hover:scale-105 transition-transform duration-300`}
                >
                  Start
                </span>
              </button>
            ) : (
              <button
                onClick={pause}
                className={`${
                  isMobile ? "px-8 py-3" : "px-12 py-4 lg:px-16 lg:py-5"
                } rounded-full ${
                  theme.panel
                } backdrop-blur-xl transition-all duration-500 shadow-2xl hover:shadow-3xl hover:scale-110 ${
                  theme.border
                } border group`}
              >
                <span
                  className={`${
                    isMobile ? "text-lg" : "text-xl lg:text-2xl"
                  } font-medium ${
                    theme.text
                  } group-hover:scale-105 transition-transform duration-300`}
                >
                  Pause
                </span>
              </button>
            )}
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(selectedDuration * 60);
                stopBeepSequence();
              }}
              className={`${
                isMobile ? "px-6 py-3" : "px-8 py-4 lg:px-12 lg:py-5"
              } rounded-full ${
                theme.panel
              } opacity-80 backdrop-blur-xl transition-all duration-500 hover:scale-110 ${
                theme.border
              } border group`}
            >
              <span
                className={`${
                  isMobile ? "text-base" : "text-lg lg:text-xl"
                } font-medium ${
                  theme.text
                } group-hover:scale-105 transition-transform duration-300`}
              >
                Reset
              </span>
            </button>
          </div>

          {/* Duration Selector */}
          <div
            className={`inline-flex ${
              theme.panel
            } backdrop-blur-xl rounded-full ${
              isMobile ? "p-2" : "p-3"
            } shadow-2xl ${theme.border} border transition-all duration-1000 ${
              showModeTransition
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div
              className={`flex ${
                isMobile ? "gap-1 max-w-xs" : "gap-2 max-w-2xl"
              } overflow-x-auto overflow-y-hidden duration-selector`}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
              onWheel={(e) => {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }}
            >
              {(mode === "focus" ? focusOptions : breakOptions).map(
                (duration) => (
                  <button
                    key={duration}
                    data-duration={duration}
                    onClick={() => setDuration(duration)}
                    disabled={isRunning}
                    className={`${
                      isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"
                    } rounded-full transition-all duration-300 whitespace-nowrap ${
                      selectedDuration === duration
                        ? "text-white shadow-lg scale-105"
                        : `${theme.text} opacity-70 hover:opacity-100 hover:scale-105`
                    } ${isRunning ? "opacity-30 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor:
                        selectedDuration === duration
                          ? theme.accent
                          : "transparent",
                    }}
                  >
                    {duration}m
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 ${
          theme.panel
        } backdrop-blur-2xl shadow-2xl transform transition-all duration-700 ease-out ${
          theme.border
        } border-l ${showPanel ? "translate-x-0" : "translate-x-full"} z-50`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6">
            <h2 className={`text-2xl font-light ${theme.text}`}>
              {activePanel === "tasks" ? (
                "Tasks"
              ) : activePanel === "stats" ? (
                "Analytics"
              ) : activePanel === "settings" && settingsChanged ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveTimerSettings}
                    className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg text-base"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={cancelSettingsChanges}
                    className={`p-2 rounded-lg ${theme.text} opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110`}
                    style={{ backgroundColor: `${theme.accent}20` }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                "Settings"
              )}
            </h2>
            <button
              onClick={() => setShowPanel(false)}
              className={`p-2 rounded-full hover:scale-110 transition-all duration-300`}
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <svg
                className={`w-5 h-5 ${theme.text}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activePanel === "tasks" && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    MNZD Progress
                  </h3>
                  <div
                    className={`mb-4 p-3 rounded-lg ${theme.panel} backdrop-blur-sm ${theme.border} border`}
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        className={`w-4 h-4 ${theme.text} opacity-60 mt-0.5 flex-shrink-0`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p
                        className={`text-xs ${theme.text} opacity-70 leading-relaxed`}
                      >
                        <strong>Tip:</strong> Select one task to focus on during
                        your session. Single-tasking improves concentration and
                        productivity.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {mnzdConfigs.map((config) => {
                      const progress = stats.mnzdProgress[config.id as keyof typeof stats.mnzdProgress] || 0;
                      const isComplete = progress >= config.minMinutes;
                      const progressPercent = Math.min((progress / config.minMinutes) * 100, 100);
                      const mnzdTask = mnzdTasks.find(
                        (t) => t.id === config.id
                      );

                      return (
                        <div
                          key={config.id}
                          className={`p-4 rounded-xl ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-300`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300"
                                style={{
                                  backgroundColor: isComplete
                                    ? `${mnzdTask?.color || "#3b82f6"}30`
                                    : `${mnzdTask?.color || "#3b82f6"}10`,
                                  color: mnzdTask?.color || "#3b82f6",
                                  border: `2px solid ${
                                    mnzdTask?.color || "#3b82f6"
                                  }${isComplete ? "60" : "30"}`,
                                }}
                              >
                                {mnzdTask?.symbol || "●"}
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${theme.text} text-sm`}
                                >
                                  {config.name}
                                </div>
                                <div
                                  className={`text-xs ${theme.text} opacity-60`}
                                >
                                  {config.description}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setCurrentTask(
                                  currentTask === config.id ? "" : config.id
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs transition-all duration-300 hover:scale-105 ${
                                currentTask === config.id
                                  ? "text-white shadow-lg"
                                  : `${theme.text} opacity-70 hover:opacity-100`
                              }`}
                              style={{
                                backgroundColor:
                                  currentTask === config.id
                                    ? mnzdTask?.color || "#3b82f6"
                                    : `${mnzdTask?.color || "#3b82f6"}20`,
                              }}
                            >
                              {currentTask === config.id ? "Active" : "Select"}
                            </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${progressPercent}%`,
                                backgroundColor: mnzdTask?.color || "#3b82f6",
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-xs">
                            <span className={`${theme.text} opacity-60`}>
                              {progress}/{config.minMinutes} min
                            </span>
                            <span
                              style={{ color: mnzdTask?.color || "#3b82f6" }}
                            >
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    Custom Tasks
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Add task (max 25 chars)..."
                      maxLength={25}
                      className={`flex-1 px-3 py-2 rounded-lg ${theme.panel} backdrop-blur-xl ${theme.border} border ${theme.text} placeholder-opacity-50 outline-none focus:scale-105 transition-all duration-300`}
                      onKeyPress={(e) => e.key === "Enter" && addTask()}
                    />
                    <button
                      onClick={addTask}
                      className="px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ backgroundColor: theme.accent }}
                    >
                      Add
                    </button>
                  </div>

                  {(() => {
                    const customTasks = tasks.filter((t) => !t.isMNZD);
                    const tasksPerPage = 3;
                    const totalPages = Math.ceil(
                      customTasks.length / tasksPerPage
                    );
                    const currentTasks = customTasks.slice(
                      taskPage * tasksPerPage,
                      (taskPage + 1) * tasksPerPage
                    );

                    return (
                      <>
                        <div className="space-y-2">
                          {currentTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-300`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setCurrentTask(
                                      currentTask === task.id ? "" : task.id
                                    )
                                  }
                                  className={`w-5 h-5 rounded-full border-2 transition-all duration-300 hover:scale-110`}
                                  style={{
                                    backgroundColor:
                                      currentTask === task.id
                                        ? theme.accent
                                        : "transparent",
                                    borderColor: theme.accent,
                                  }}
                                >
                                  {currentTask === task.id && (
                                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                  )}
                                </button>
                                <div>
                                  <div
                                    className={`font-medium ${theme.text} text-sm truncate max-w-[140px]`}
                                  >
                                    {task.name}
                                  </div>
                                  <div
                                    className={`text-xs ${theme.text} opacity-60`}
                                  >
                                    {task.sessions} sessions •{" "}
                                    {Math.round((task.totalTime / 60) * 10) /
                                      10}
                                    h
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className={`${theme.text} opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <button
                              onClick={() =>
                                setTaskPage(Math.max(0, taskPage - 1))
                              }
                              disabled={taskPage === 0}
                              className={`px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${
                                taskPage === 0
                                  ? "opacity-30 cursor-not-allowed"
                                  : `${theme.panel} ${theme.border} border hover:shadow-lg`
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 ${theme.text}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            <div className="flex gap-2">
                              {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setTaskPage(i)}
                                  className={`w-8 h-8 rounded-full transition-all duration-300 hover:scale-110 ${
                                    taskPage === i
                                      ? "text-white shadow-lg"
                                      : `${theme.text} opacity-60 hover:opacity-100`
                                  }`}
                                  style={{
                                    backgroundColor:
                                      taskPage === i
                                        ? theme.accent
                                        : "transparent",
                                  }}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() =>
                                setTaskPage(
                                  Math.min(totalPages - 1, taskPage + 1)
                                )
                              }
                              disabled={taskPage === totalPages - 1}
                              className={`px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${
                                taskPage === totalPages - 1
                                  ? "opacity-30 cursor-not-allowed"
                                  : `${theme.panel} ${theme.border} border hover:shadow-lg`
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 ${theme.text}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {activePanel === "stats" && (
              <div className="space-y-6">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`relative p-6 rounded-2xl ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-500 overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="w-full h-full bg-gradient-to-br"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}40 0%, transparent 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="relative z-10">
                      <div
                        className="text-4xl font-extralight mb-2"
                        style={{ color: theme.accent }}
                      >
                        {Math.round((stats.todayMinutes / 60) * 10) / 10}
                      </div>
                      <div className={`text-xs ${theme.text} opacity-70`}>
                        Hours Today
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative p-6 rounded-2xl ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-500 overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="w-full h-full bg-gradient-to-br"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}40 0%, transparent 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="relative z-10">
                      <div
                        className="text-4xl font-extralight mb-2"
                        style={{ color: theme.accent }}
                      >
                        {completedSessions}
                      </div>
                      <div className={`text-xs ${theme.text} opacity-70 mb-2`}>
                        Sessions Today
                      </div>
                      <div className="flex gap-1">
                        {Array.from(
                          { length: sessionSettings.dailySessionGoal },
                          (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-6 rounded-full transition-all duration-500`}
                              style={{
                                backgroundColor:
                                  i < completedSessions
                                    ? theme.accent
                                    : theme.name === "Zen Garden"
                                    ? "rgba(100, 116, 139, 0.3)"
                                    : "rgba(255,255,255,0.3)",
                                animationDelay: `${i * 100}ms`,
                              }}
                            ></div>
                          )
                        )}
                      </div>
                      <div className={`text-xs ${theme.text} opacity-50 mt-1`}>
                        Target: {sessionSettings.dailySessionGoal} sessions
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals Achievement - Full Width */}
                <div
                  className={`relative p-8 rounded-2xl ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-500 overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-5">
                    <div
                      className="w-full h-full bg-gradient-to-r"
                      style={{
                        background: `linear-gradient(90deg, ${theme.accent}60 0%, transparent 100%)`,
                      }}
                    ></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div
                      className="text-3xl font-light mb-3"
                      style={{ color: theme.accent }}
                    >
                      Daily Goals
                    </div>
                    <div className={`text-sm ${theme.text} opacity-70 mb-6`}>
                      Track your progress toward daily targets
                    </div>

                    {/* Goal Progress Bars */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div
                          className="text-2xl font-light mb-2"
                          style={{ color: theme.accent }}
                        >
                          {Math.round(((stats.todayMinutes / 60) / sessionSettings.dailyHoursGoal) * 100)}%
                        </div>
                        <div
                          className={`text-xs ${theme.text} opacity-70 mb-2`}
                        >
                          Hours Goal
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min(
                                ((stats.todayMinutes / 60) / sessionSettings.dailyHoursGoal) * 100,
                                100
                              )}%`,
                              backgroundColor: theme.accent,
                            }}
                          ></div>
                        </div>
                        <div
                          className={`text-xs ${theme.text} opacity-50 mt-1`}
                        >
                          {Math.round((stats.todayMinutes / 60) * 10) / 10}/{sessionSettings.dailyHoursGoal} hours
                        </div>
                      </div>

                      <div className="text-center">
                        <div
                          className="text-2xl font-light mb-2"
                          style={{ color: theme.accent }}
                        >
                          {Math.round(sessionProgress)}%
                        </div>
                        <div
                          className={`text-xs ${theme.text} opacity-70 mb-2`}
                        >
                          Sessions Goal
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${sessionProgress}%`,
                              backgroundColor: theme.accent,
                            }}
                          ></div>
                        </div>
                        <div
                          className={`text-xs ${theme.text} opacity-50 mt-1`}
                        >
                          {completedSessions}/{sessionSettings.dailySessionGoal}{" "}
                          sessions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    MNZD Progress Today
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mnzdConfigs.map((config) => {
                      const progress = stats.mnzdProgress[config.id as keyof typeof stats.mnzdProgress] || 0;
                      const progressPercent = Math.min((progress / config.minMinutes) * 100, 100);
                      const isComplete = progress >= config.minMinutes;
                      const mnzdTask = mnzdTasks.find(
                        (t) => t.id === config.id
                      );

                      return (
                        <div
                          key={config.id}
                          className={`relative p-4 rounded-xl ${theme.panel} backdrop-blur-xl ${theme.border} border hover:scale-105 transition-all duration-500 overflow-hidden`}
                        >
                          <div className="absolute inset-0 opacity-10">
                            <div
                              className="w-full h-full bg-gradient-to-br"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  mnzdTask?.color || "#3b82f6"
                                }40 0%, transparent 100%)`,
                              }}
                            ></div>
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                style={{
                                  backgroundColor: `${
                                    mnzdTask?.color || "#3b82f6"
                                  }${isComplete ? "40" : "20"}`,
                                  color: mnzdTask?.color || "#3b82f6",
                                }}
                              >
                                {mnzdTask?.symbol || "●"}
                              </div>
                              <div
                                className={`text-xs ${theme.text} opacity-60`}
                              >
                                {progress}/{config.minMinutes}m
                              </div>
                            </div>

                            <div
                              className={`font-medium ${theme.text} text-sm mb-2`}
                            >
                              {config.name}
                            </div>

                            {/* Circular Progress */}
                            <div className="relative w-12 h-12 mx-auto">
                              <svg
                                className="w-12 h-12 transform -rotate-90"
                                viewBox="0 0 36 36"
                              >
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.1)"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke={mnzdTask?.color || "#3b82f6"}
                                  strokeWidth="2"
                                  strokeDasharray={`${2 * Math.PI * 16}`}
                                  strokeDashoffset={`${
                                    2 *
                                    Math.PI *
                                    16 *
                                    (1 - progressPercent / 100)
                                  }`}
                                  className="transition-all duration-1000 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: mnzdTask?.color || "#3b82f6",
                                  }}
                                >
                                  {Math.round(progressPercent)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Session History */}
                {todaySessions.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                      Today's Journey
                    </h3>
                    <div className="space-y-2">
                      {todaySessions.slice(-8).map((session, index) => {
                        const sessionTask = mnzdTasks.find(
                          (t) => t.id === session.mnzdTask
                        );
                        return (
                          <div
                            key={session.id}
                            className={`flex items-center gap-4 p-3 rounded-xl ${theme.panel} ${theme.border} border backdrop-blur-xl hover:scale-105 transition-all duration-500`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor:
                                    session.type === "focus"
                                      ? `${theme.accent}30`
                                      : "#10b98130",
                                  color:
                                    session.type === "focus"
                                      ? theme.accent
                                      : "#10b981",
                                }}
                              >
                                {session.type === "focus" ? "●" : "○"}
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-medium ${theme.text}`}
                                >
                                  {session.duration}m{" "}
                                  {session.type === "focus" ? "Focus" : "Break"}
                                </div>
                                {sessionTask && (
                                  <div
                                    className="text-xs opacity-60"
                                    style={{ color: sessionTask.color }}
                                  >
                                    {sessionTask.name.split(" ")[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-auto">
                              <div
                                className="text-xs opacity-50"
                                style={{ color: theme.accent }}
                              >
                                {new Date(session.timestamp).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Weekly Streak Visualization */}
                    <div
                      className={`mt-6 p-4 rounded-xl ${theme.panel} backdrop-blur-xl ${theme.border} border`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${theme.text}`}>
                          Weekly Streak
                        </span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: theme.accent }}
                        >
                          ▲
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const dayHasSessions = i < 3; // Mock data - replace with actual logic
                          return (
                            <div
                              key={i}
                              className={`flex-1 h-8 rounded transition-all duration-500`}
                              style={{
                                backgroundColor: dayHasSessions
                                  ? `${theme.accent}60`
                                  : "rgba(255,255,255,0.1)",
                                animationDelay: `${i * 100}ms`,
                              }}
                            ></div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-xs opacity-50">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <span key={day} className={theme.text}>
                              {day}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePanel === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    Session Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Focus Time (minutes)
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="5"
                        value={sessionSettings.focusTime}
                        onChange={(e) => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSound,
                              bgSoundVolume,
                            });
                          }
                          const newSettings = {
                            ...sessionSettings,
                            focusTime: Number(e.target.value),
                          };
                          setSessionSettings(newSettings);
                          setSettingsChanged(true);
                          if (mode === "focus") {
                            setSelectedDuration(newSettings.focusTime);
                            if (!isRunning)
                              setTimeLeft(newSettings.focusTime * 60);
                          }
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme.accent
                          } 0%, ${theme.accent} ${
                            ((sessionSettings.focusTime - 15) / 75) * 100
                          }%, rgba(255,255,255,0.3) ${
                            ((sessionSettings.focusTime - 15) / 75) * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${theme.text} opacity-60`}>15m</span>
                        <span className={`${theme.text} font-mono`}>
                          {sessionSettings.focusTime}m
                        </span>
                        <span className={`${theme.text} opacity-60`}>90m</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Break Time (minutes)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={sessionSettings.breakTime}
                        onChange={(e) => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSound,
                              bgSoundVolume,
                            });
                          }
                          const newSettings = {
                            ...sessionSettings,
                            breakTime: Number(e.target.value),
                          };
                          setSessionSettings(newSettings);
                          setSettingsChanged(true);
                          setBreakDuration(newSettings.breakTime);
                          if (mode === "break") {
                            setSelectedDuration(newSettings.breakTime);
                            if (!isRunning)
                              setTimeLeft(newSettings.breakTime * 60);
                          }
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme.accent
                          } 0%, ${theme.accent} ${
                            ((sessionSettings.breakTime - 5) / 25) * 100
                          }%, rgba(255,255,255,0.3) ${
                            ((sessionSettings.breakTime - 5) / 25) * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${theme.text} opacity-60`}>5m</span>
                        <span className={`${theme.text} font-mono`}>
                          {sessionSettings.breakTime}m
                        </span>
                        <span className={`${theme.text} opacity-60`}>30m</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Daily Session Goal
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="12"
                        step="1"
                        value={sessionSettings.dailySessionGoal}
                        onChange={(e) => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSound,
                              bgSoundVolume,
                            });
                          }
                          const newSettings = {
                            ...sessionSettings,
                            dailySessionGoal: Number(e.target.value),
                          };
                          setSessionSettings(newSettings);
                          setSettingsChanged(true);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme.accent
                          } 0%, ${theme.accent} ${
                            ((sessionSettings.dailySessionGoal - 3) / 9) * 100
                          }%, rgba(255,255,255,0.3) ${
                            ((sessionSettings.dailySessionGoal - 3) / 9) * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${theme.text} opacity-60`}>3</span>
                        <span className={`${theme.text} font-mono`}>
                          {sessionSettings.dailySessionGoal}
                        </span>
                        <span className={`${theme.text} opacity-60`}>12</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Daily Hours Goal
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="0.5"
                        value={sessionSettings.dailyHoursGoal}
                        onChange={(e) => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSound,
                              bgSoundVolume,
                            });
                          }
                          const newSettings = {
                            ...sessionSettings,
                            dailyHoursGoal: Number(e.target.value),
                          };
                          setSessionSettings(newSettings);
                          setSettingsChanged(true);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme.accent
                          } 0%, ${theme.accent} ${
                            ((sessionSettings.dailyHoursGoal - 2) / 10) * 100
                          }%, rgba(255,255,255,0.3) ${
                            ((sessionSettings.dailyHoursGoal - 2) / 10) * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${theme.text} opacity-60`}>2h</span>
                        <span className={`${theme.text} font-mono`}>
                          {sessionSettings.dailyHoursGoal}h
                        </span>
                        <span className={`${theme.text} opacity-60`}>12h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    Themes
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {themes.map((t, index) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSoundName,
                              bgSoundVolume,
                              notificationSoundName,
                              currentTheme,
                              customAccentColor,
                            });
                          }
                          setCurrentTheme(index);
                          setSettingsChanged(true);
                        }}
                        className={`p-3 rounded-xl transition-all duration-500 hover:scale-105 ${
                          currentTheme === index
                            ? "ring-2 shadow-xl"
                            : `${theme.panel} ${theme.border} border`
                        }`}
                        style={{
                          background:
                            currentTheme === index
                              ? index === 0
                                ? `linear-gradient(135deg, ${customAccentColor}20 0%, ${customAccentColor}10 100%)`
                                : t.background
                              : "transparent",
                          borderColor:
                            currentTheme === index
                              ? index === 0
                                ? customAccentColor
                                : theme.accent
                              : "transparent",
                        }}
                      >
                        <div
                          className={`font-medium text-sm ${
                            currentTheme === index
                              ? index === 0
                                ? theme.text
                                : "text-white"
                              : theme.text
                          }`}
                        >
                          {t.name}
                        </div>
                        <div
                          className={`text-xs ${
                            currentTheme === index
                              ? index === 0
                                ? theme.text + " opacity-80"
                                : "text-white opacity-80"
                              : theme.text + " opacity-60"
                          }`}
                        >
                          {t.environment}
                        </div>
                      </button>
                    ))}
                  </div>

                  {currentTheme === 0 && (
                    <div className="mt-4">
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Custom Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customAccentColor}
                          onChange={(e) => {
                            if (!originalSettings) {
                              setOriginalSettings({
                                sessionSettings,
                                autoStart,
                                notifications,
                                soundVolume,
                                backgroundSoundName,
                                bgSoundVolume,
                                notificationSoundName,
                                currentTheme,
                                customAccentColor,
                              });
                            }
                            setCustomAccentColor(e.target.value);
                            setSettingsChanged(true);
                          }}
                          className="w-12 h-8 rounded border-2 cursor-pointer"
                          style={{ borderColor: theme.accent }}
                        />
                        <span className={`${theme.text} text-sm font-mono`}>
                          {customAccentColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`text-lg font-medium ${theme.text} mb-4`}>
                    Background Sounds
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (!originalSettings) {
                          setOriginalSettings({
                            sessionSettings,
                            autoStart,
                            notifications,
                            soundVolume,
                            backgroundSound,
                            bgSoundVolume,
                            notificationSound,
                            currentTheme,
                            customAccentColor,
                          });
                        }
                        setBackgroundSound("");
                        setSettingsChanged(true);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-500 hover:scale-105 transform ${
                        backgroundSound === ""
                          ? "ring-2 shadow-xl scale-105"
                          : `${theme.panel} ${theme.border} border hover:shadow-lg`
                      }`}
                      style={{
                        backgroundColor:
                          backgroundSound === ""
                            ? `${theme.accent}40`
                            : "transparent",
                        borderColor:
                          backgroundSound === "" ? theme.accent : "transparent",
                      }}
                    >
                      <span className={`${theme.text} text-sm font-medium`}>
                        None
                      </span>
                    </button>
                    {backgroundSounds.map((sound) => (
                      <button
                        key={sound.name}
                        onClick={() => {
                          if (!originalSettings) {
                            setOriginalSettings({
                              sessionSettings,
                              autoStart,
                              notifications,
                              soundVolume,
                              backgroundSound,
                              bgSoundVolume,
                              notificationSound,
                              currentTheme,
                              customAccentColor,
                            });
                          }
                          setBackgroundSound(sound.file);
                          setSettingsChanged(true);
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-500 hover:scale-105 transform ${
                          backgroundSound === sound.file
                            ? "ring-2 shadow-xl scale-105"
                            : `${theme.panel} ${theme.border} border hover:shadow-lg`
                        }`}
                        style={{
                          backgroundColor:
                            backgroundSound === sound.file
                              ? `${theme.accent}40`
                              : "transparent",
                          borderColor:
                            backgroundSound === sound.file
                              ? theme.accent
                              : "transparent",
                        }}
                      >
                        <span className={`${theme.text} text-sm font-medium`}>
                          {sound.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      backgroundSound
                        ? "max-h-20 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-4">
                      <label className={`block ${theme.text} mb-2 text-sm`}>
                        Ambient Volume
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={bgSoundVolume}
                        onChange={(e) => {
                          setBgSoundVolume(parseFloat(e.target.value));
                          setSettingsChanged(true);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme.accent
                          } 0%, ${theme.accent} ${
                            bgSoundVolume * 100
                          }%, rgba(255,255,255,0.3) ${
                            bgSoundVolume * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${theme.text} text-sm`}>Auto Start</span>
                    <button
                      onClick={() => {
                        if (!originalSettings) {
                          setOriginalSettings({
                            sessionSettings,
                            autoStart,
                            notifications,
                            soundVolume,
                            backgroundSound,
                            bgSoundVolume,
                            notificationSound,
                          });
                        }
                        setAutoStart(!autoStart);
                        setSettingsChanged(true);
                      }}
                      className={`w-12 h-7 rounded-full transition-all duration-500 hover:scale-110 shadow-lg`}
                      style={{
                        backgroundColor: autoStart ? "#22c55e" : "#ef4444",
                        boxShadow: autoStart
                          ? "0 0 20px rgba(34, 197, 94, 0.3)"
                          : "0 0 20px rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${
                          autoStart ? "translate-x-6" : "translate-x-1"
                        }`}
                      ></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`${theme.text} text-sm`}>
                      Notifications
                    </span>
                    <button
                      onClick={() => {
                        setNotifications(!notifications);
                        setSettingsChanged(true);
                      }}
                      className={`w-12 h-7 rounded-full transition-all duration-500 hover:scale-110 shadow-lg`}
                      style={{
                        backgroundColor: notifications ? "#22c55e" : "#ef4444",
                        boxShadow: notifications
                          ? "0 0 20px rgba(34, 197, 94, 0.3)"
                          : "0 0 20px rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${
                          notifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      ></div>
                    </button>
                  </div>

                  <div>
                    <label className={`block ${theme.text} mb-2 text-sm`}>
                      Notification Volume
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={soundVolume}
                      onChange={(e) => {
                        setSoundVolume(parseFloat(e.target.value));
                        setSettingsChanged(true);
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${
                          theme.accent
                        } 0%, ${theme.accent} ${
                          soundVolume * 100
                        }%, rgba(255,255,255,0.3) ${
                          soundVolume * 100
                        }%, rgba(255,255,255,0.3) 100%)`,
                      }}
                    />
                  </div>

                  <div>
                    <label className={`block ${theme.text} mb-2 text-sm`}>
                      Notification Sound
                    </label>
                    <div className="space-y-2">
                      {notificationSounds.map((sound) => (
                        <button
                          key={sound.value}
                          onClick={() => {
                            if (!originalSettings) {
                              setOriginalSettings({
                                sessionSettings,
                                autoStart,
                                notifications,
                                soundVolume,
                                backgroundSound,
                                bgSoundVolume,
                                notificationSound,
                                currentTheme,
                                customAccentColor,
                              });
                            }
                            setNotificationSound(sound.value);
                            setSettingsChanged(true);
                          }}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-500 hover:scale-105 transform ${
                            notificationSound === sound.value
                              ? "ring-2 shadow-xl scale-105"
                              : `${theme.panel} ${theme.border} border hover:shadow-lg`
                          }`}
                          style={{
                            backgroundColor:
                              notificationSound === sound.value
                                ? `${theme.accent}40`
                                : "transparent",
                            borderColor:
                              notificationSound === sound.value
                                ? theme.accent
                                : "transparent",
                          }}
                        >
                          <span className={`${theme.text} text-sm font-medium`}>
                            {sound.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Navigation */}
          <div
            className="p-4 border-t"
            style={{ borderColor: `${theme.accent}20` }}
          >
            <div className="flex gap-2">
              {[
                { id: "tasks", icon: CheckSquare, label: "Tasks" },
                { id: "stats", icon: BarChart3, label: "Stats" },
                { id: "settings", icon: Settings, label: "Settings" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActivePanel(id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                    activePanel === id
                      ? "text-white shadow-lg"
                      : `${theme.text} opacity-70 hover:opacity-100`
                  }`}
                  style={{
                    backgroundColor:
                      activePanel === id ? theme.accent : "transparent",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed ${
          isMobile
            ? "bottom-4 right-4"
            : "top-1/2 right-4 transform -translate-y-1/2"
        } z-40 p-3 rounded-full ${
          theme.panel
        } backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 ${
          theme.border
        } border`}
      >
        <svg
          className={`w-5 h-5 ${theme.text} transition-transform duration-500 ${
            showPanel ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMobile ? "M5 15l7-7 7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <FocusOnboarding
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
          isNewUser={isNewUser}
          onInitializeSettings={initializeTimerSettings}
        />
      )}

      {/* New User Info Modal */}
      {/* Removed - info available via i button */}

      {/* Hidden audio elements */}
      <audio ref={bgAudioRef} />
      <audio ref={bgAudioRef2} />
      <audio ref={notificationAudioRef} preload="none" />
    </div>
  );
}
