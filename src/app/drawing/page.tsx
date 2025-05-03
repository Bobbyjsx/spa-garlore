'use client'
import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import {
  Circle, Trash, Download, Undo, Redo, Square,
  Grid, Image as ImageIcon, Pencil, Eraser, Plus, Minus, List, Home, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Index = () => {
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<"pencil" | "eraser" | "rectangle" | "circle">("pencil");
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [customColor, setCustomColor] = useState("#7C3AED");
  const [layers, setLayers] = useState<Array<{id: number, name: string, visible: boolean, data: string}>>([]);
  const [activeLayer, setActiveLayer] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [startShape, setStartShape] = useState({ x: 0, y: 0 });
  const [showIntro, setShowIntro] = useState(true);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Colors palette
  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FF6600", "#9900FF"
  ];

  // Initialize canvas size without setting content
  useEffect(() => {
    if (canvasRef.current && !canvasInitialized) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        setCtx(context);

        // Dynamically set canvas size based on parent container
        const parentElement = canvas.parentElement;
        if (parentElement) {
          const isMobileView = window.innerWidth < 768;
          const padding = isMobileView ? 20 : 40;
          const newWidth = parentElement.clientWidth - padding;
          const newHeight = isMobileView
            ? window.innerHeight * 0.5
            : window.innerHeight - 220;

          canvas.width = newWidth;
          canvas.height = newHeight;
        }

        // Only initialize with white background if no history exists
        if (history.length === 0) {
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Create initial history state
          const dataUrl = canvas.toDataURL();
          setHistory([dataUrl]);
          setHistoryIndex(0);

          // Update the layer data
          const updatedLayers = layers.map(layer =>
            layer.id === activeLayer ? { ...layer, data: dataUrl } : layer
          );
          setLayers(updatedLayers);
        } else {
          // If history exists, load the active layer
          loadLayerToCanvas(activeLayer);
        }

        setCanvasInitialized(true);
      }
    }
  }, [canvasRef, canvasInitialized, activeLayer, layers, history]);

  // Setup canvas and context and handle resizing
  useEffect(() => {
    if (canvasRef.current && canvasInitialized) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        setCtx(context);

        const updateCanvasSize = () => {
          const isMobileView = window.innerWidth < 768;
          setIsMobile(isMobileView);

          const parentElement = canvas.parentElement;
          if (parentElement) {
            const padding = isMobileView ? 20 : 40;
            const newWidth = parentElement.clientWidth - padding;
            const newHeight = isMobileView
              ? window.innerHeight * 0.5
              : window.innerHeight - 220;

            // Only update if dimensions actually changed
            if (canvas.width !== newWidth || canvas.height !== newHeight) {
              // Save current content
              const oldContent = canvas.toDataURL();

              // Resize canvas
              canvas.width = newWidth;
              canvas.height = newHeight;

              // Restore content
              const img = new Image();
              img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, newWidth, newHeight);

                // Save this as the new layer state
                saveCanvasToLayer();
              };
              img.src = oldContent;
            }
          }
        };

        // Update canvas size initially and on window resize
        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        return () => {
          window.removeEventListener("resize", updateCanvasSize);
        };
      }
    }
  }, [canvasInitialized]);

  // Load active layer when it changes
  useEffect(() => {
    if (canvasInitialized && activeLayer > 0) {
      loadLayerToCanvas(activeLayer);
    }
  }, [activeLayer, canvasInitialized]);

  // Save the current canvas state to the active layer
  const saveCanvasToLayer = () => {
    if (canvasRef.current && ctx && activeLayer > 0) {
      const dataUrl = canvasRef.current.toDataURL();

      // Update the layers with the new data for the active layer
      const updatedLayers = layers.map(layer =>
        layer.id === activeLayer ? { ...layer, data: dataUrl } : layer
      );

      setLayers(updatedLayers);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Load a layer's data to the canvas
  const loadLayerToCanvas = (layerId: number) => {
    const layer = layers.find(l => l.id === layerId);

    if (layer && layer.visible && layer.data && ctx && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = layer.data;
    } else if (ctx && canvasRef.current) {
      // Clear canvas if no data or layer is invisible
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Save this state
      saveCanvasToLayer();
    }
  };

  // Switch active layer
  const changeActiveLayer = (layerId: number) => {
    setActiveLayer(layerId);
    loadLayerToCanvas(layerId);
  };

  // Start drawing
  const startDrawing = (x: number, y: number) => {
    if (!ctx) return;

    setIsDrawing(true);
    setLastPosition({ x, y });

    if (tool === "rectangle" || tool === "circle") {
      setStartShape({ x, y });
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  // Continue drawing
  const draw = (x: number, y: number) => {
    if (!isDrawing || !ctx) return;

    if (tool === "pencil" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      setLastPosition({ x, y });
    }
  };

  // Stop drawing and handle shape drawing
  const stopDrawing = () => {
    if (!ctx || !isDrawing) return;

    if (tool === "rectangle" && ctx) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;

      const width = lastPosition.x - startShape.x;
      const height = lastPosition.y - startShape.y;

      ctx.strokeRect(startShape.x, startShape.y, width, height);
    } else if (tool === "circle" && ctx) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;

      const centerX = (startShape.x + lastPosition.x) / 2;
      const centerY = (startShape.y + lastPosition.y) / 2;

      const radiusX = Math.abs(lastPosition.x - startShape.x) / 2;
      const radiusY = Math.abs(lastPosition.y - startShape.y) / 2;

      const maxRadius = Math.max(radiusX, radiusY);

      ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
    saveCanvasToLayer();
  };

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "rectangle" || tool === "circle") {
      setLastPosition({ x, y });
    } else {
      draw(x, y);
    }
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const rect = canvasRef.current!.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      startDrawing(x, y);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDrawing) {
      e.preventDefault();
      const rect = canvasRef.current!.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (tool === "rectangle" || tool === "circle") {
        setLastPosition({ x, y });
      } else {
        draw(x, y);
      }
    }
  };

  // Clear all canvas content
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasToLayer();
    toast("Canvas cleared!");
  };

  // Create a new layer
  const addNewLayer = () => {
    const layerIds = layers.length > 0 ? layers.map(l => l.id) : [0];
    const newLayerId = Math.max(...layerIds) + 1;
    const newLayer = { id: newLayerId, name: `Layer ${newLayerId}`, visible: true, data: "" };
    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);
    setActiveLayer(newLayerId);

    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveCanvasToLayer();
    }

    toast(`New layer created: Layer ${newLayerId}`);
  };

  // Toggle a layer's visibility
  const toggleLayerVisibility = (layerId: number) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    setLayers(updatedLayers);
  };

  // Delete a layer
  const deleteLayer = (layerId: number) => {
    if (layers.length <= 1) {
      toast.error("Cannot delete the last layer");
      return;
    }

    const filteredLayers = layers.filter(l => l.id !== layerId);
    setLayers(filteredLayers);

    if (activeLayer === layerId) {
      const newActiveId = filteredLayers[0].id;
      setActiveLayer(newActiveId);
      loadLayerToCanvas(newActiveId);
    }

    toast(`Layer ${layerId} deleted`);
  };

  // Save the canvas as an image
  const saveAsImage = () => {
    if (!canvasRef.current) return;

    try {
      const dataURL = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "drawing.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image saved successfully!");
    } catch (error) {
      toast.error("Failed to save image");
      console.error("Error saving image:", error);
    }
  };

  // Undo drawing action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);

      if (ctx && canvasRef.current) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);

          // Update current layer data
          const updatedLayers = layers.map(layer =>
            layer.id === activeLayer ? { ...layer, data: history[newIndex] } : layer
          );
          setLayers(updatedLayers);
        };
        img.src = history[newIndex];
      }

      toast("Undo successful");
    } else {
      toast("Nothing to undo", { description: "You're at the beginning of the history" });
    }
  };

  // Redo drawing action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);

      if (ctx && canvasRef.current) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);

          // Update current layer data
          const updatedLayers = layers.map(layer =>
            layer.id === activeLayer ? { ...layer, data: history[newIndex] } : layer
          );
          setLayers(updatedLayers);
        };
        img.src = history[newIndex];
      }

      toast("Redo successful");
    } else {
      toast("Nothing to redo", { description: "You're at the latest change" });
    }
  };

  // Intro animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  // Landing screen animation
  if (showIntro) {
    return (
      <motion.div
        className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-soft-light"></div>
        <div className="absolute -top-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-screen py-8 sm:py-12">
          <motion.div
            variants={itemVariants}
            className="mb-6 sm:mb-8 relative"
          >
            <div className="absolute -inset-3 sm:-inset-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-xl opacity-70 animate-pulse"></div>
            <div className="relative">
              <ImageIcon className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 text-white drop-shadow-lg" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold mb-3 sm:mb-4 text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 drop-shadow-lg"
          >
            Canvas<span className="text-teal-300">Studio</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-indigo-100 max-w-xs sm:max-w-md md:max-w-2xl text-center mb-8 sm:mb-12 leading-relaxed font-light px-2"
          >
            Unleash your creativity with our premium digital canvas experience
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl mb-10 sm:mb-14 px-2 sm:px-4"
          >
            {[
              { icon: <Pencil size={24} className="sm:w-8 sm:h-8" />, text: "Draw freely", desc: "Express your ideas with precision" },
              { icon: <Square size={24} className="sm:w-8 sm:h-8" />, text: "Create shapes", desc: "Perfect geometric forms" },
              { icon: <List size={24} className="sm:w-8 sm:h-8" />, text: "Manage layers", desc: "Build complex compositions" },
              { icon: <Download size={24} className="sm:w-8 sm:h-8" />, text: "Export your art", desc: "Share your masterpieces" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative backdrop-blur-lg bg-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_20px_80px_-10px_rgba(0,0,0,0.3)]"
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  background: "rgba(255, 255, 255, 0.15)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 rounded-2xl sm:rounded-3xl transition-opacity"></div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center mb-4 sm:mb-6 shadow-xl group-hover:shadow-indigo-500/30 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{feature.text}</h3>
                <p className="text-indigo-200 text-xs sm:text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={() => setShowIntro(false)}
            className="relative py-3 sm:py-4 md:py-5 px-8 sm:px-10 md:px-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full font-bold text-base sm:text-lg md:text-xl shadow-xl transition-all overflow-hidden group"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 80px -10px rgba(125, 96, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
            <span className="relative z-10 flex items-center">
              <span>Start Creating</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.button>

          <motion.div
            variants={itemVariants}
            className="mt-10 sm:mt-16 text-indigo-200 text-xs sm:text-sm opacity-80"
          >
            <p>Free for personal use • No account required </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute w-full h-1 bottom-0 left-0 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500"></div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xl sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <ImageIcon className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-bold tracking-tight">Canvas<span className="text-teal-400">Studio</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={saveAsImage}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-full transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            <span className="hidden md:inline font-medium">Export</span>
          </motion.button>
          <motion.button
            onClick={() => setShowIntro(true)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={18} />
            <span className="hidden md:inline font-medium">Home</span>
          </motion.button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Toolbar */}
        <div className="bg-gray-800/50 backdrop-blur-md p-2 fixed  left-0 bottom-0 -translate-y-1/2- z-20 flex-col  flex-shrink-0 flex  items-center justify-between space-y-8 shadow-lg rounded-r-2xl">
          {/* Drawing tools */}
          <div className="flex flex-col items-center space-y-3 justify-center">
            <motion.button
              onClick={() => setTool("pencil")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                tool === "pencil" ? "bg-teal-600 shadow-lg" : "bg-gray-700/80 hover:bg-gray-600/80"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Pencil tool"
            >
              <Pencil size={isMobile ? 18 : 22} />
            </motion.button>

            <motion.button
              onClick={() => setTool("eraser")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                tool === "eraser" ? "bg-teal-600 shadow-lg" : "bg-gray-700/80 hover:bg-gray-600/80"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Eraser tool"
            >
              <Eraser size={isMobile ? 18 : 22} />
            </motion.button>

            <motion.button
              onClick={() => setTool("rectangle")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                tool === "rectangle" ? "bg-teal-600 shadow-lg" : "bg-gray-700/80 hover:bg-gray-600/80"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Rectangle tool"
            >
              <Square size={isMobile ? 18 : 22} />
            </motion.button>

            <motion.button
              onClick={() => setTool("circle")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                tool === "circle" ? "bg-teal-600 shadow-lg" : "bg-gray-700/80 hover:bg-gray-600/80"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Circle tool"
            >
              <Circle size={isMobile ? 18 : 22} />
            </motion.button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center space-y-4 p-2 rounded-xl bg-muted shadow-xl">
            {[
              {
                onClick: handleUndo,
                icon: <Undo size={isMobile ? 18 : 22} />,
                label: "Undo",
                disabled: historyIndex <= 0,
              },
              {
                onClick: handleRedo,
                icon: <Redo size={isMobile ? 18 : 22} />,
                label: "Redo",
                disabled: historyIndex >= history.length - 1,
              },
              {
                onClick: clearCanvas,
                icon: <Trash size={isMobile ? 18 : 22} />,
                label: "Clear",
                className: "hover:bg-red-500/80",
              },
              {
                onClick: () => setLayersPanelOpen(!layersPanelOpen),
                icon: <Grid size={isMobile ? 18 : 22} />,
                label: "Layers",
                isActive: layersPanelOpen,
              },
            ].map((btn, idx) => (
              <motion.button
                key={idx}
                onClick={btn.onClick}
                disabled={btn.disabled}
                aria-label={btn.label}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={classNames(
                  "group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                  "shadow-md bg-background/70 hover:bg-accent text-foreground",
                  btn.disabled && "opacity-40 cursor-not-allowed",
                  btn.className,
                  btn.isActive && "bg-teal-600 text-white"
                )}
              >
                {btn.icon}
                <span className="absolute left-full ml-2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {btn.label}
                </span>
              </motion.button>
            ))}
          </div>

        </div>

        <div className="flex-1 flex flex-col ">
          {/* Color Palette and Brush Size */}
          <div className="w-full max-w-4xl mx-auto mb-4 flex justify-center">
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/30 overflow-hidden">
              {/* Two-part toolbar */}
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-700/30">
                {/* 🎨 Color Selector */}
                <div className="p-3 md:p-4">
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-1 text-center">Colors</h3>
                  <div className="overflow-x-auto p-2 hide-scrollbar">
                    <div className="flex space-x-3 min-w-min">
                      {/* Color presets */}
                      <div className="flex space-x-3">
                        {colors.map((c) => (
                          <motion.button
                            key={c}
                            onClick={() => setColor(c)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className={classNames(
                              "w-9 h-9 rounded-full shadow-md transition-all border border-white/5 flex-shrink-0",
                              color === c ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-800" : "hover:border-white/20"
                            )}
                            style={{ backgroundColor: c }}
                            aria-label={`Select color ${c}`}
                          />
                        ))}
                      </div>

                      {/* Custom color picker */}
                      <div className="pl-1 border-l border-gray-700/30 flex items-center">
                        <label className="relative cursor-pointer group">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value);
                              setColor(e.target.value);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className={classNames(
                              "w-9 h-9 rounded-full shadow-md border border-white/20 flex-shrink-0 transition-all",
                              "group-hover:ring-1 group-hover:ring-white/30",
                              !colors.includes(color) && "ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-800"
                            )}
                            style={{ backgroundColor: customColor }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-3 h-3 bg-white/80 rounded-full"></div>
                          </div>
                        </label>
                        <span className="ml-2 text-xs text-gray-400 hidden md:block">Custom</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✏️ Brush Size Controls */}
                <div className="p-3 md:p-4 flex-shrink-0 flex flex-col justify-center">
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-1 text-center">Brush Size</h3>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      aria-label="Decrease brush size"
                    >
                      <Minus size={16} />
                    </motion.button>

                    <div className="flex flex-col items-center space-y-1">
                      <div className="relative w-32 h-2 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="absolute top-0 left-0 h-full bg-teal-500 transition-all"
                          style={{ width: `${(brushSize / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-300">
                        {brushSize}px
                      </span>
                    </div>

                    <motion.button
                      onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      aria-label="Increase brush size"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="flex-1 flex p-4 relative">
            {/* Layers Panel */}
            <AnimatePresence>
              {layersPanelOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: isMobile ? "100%" : "280px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`${
                    isMobile ? "absolute inset-0 z-10" : "relative"
                  } bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold text-white">Layers</h3>
                      <motion.button
                        onClick={addNewLayer}
                        className="w-9 h-9 bg-teal-600 hover:bg-teal-500 rounded-lg flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Add new layer"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                      {[...layers].reverse().map((layer) => (
                        <motion.div
                          key={layer.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            activeLayer === layer.id
                              ? "bg-teal-600/30 border border-teal-500/50 shadow-md"
                              : "hover:bg-gray-700/50 border border-transparent"
                          }`}
                          onClick={() => changeActiveLayer(layer.id)}
                          whileHover={{ x: 3 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerVisibility(layer.id);
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  layer.visible
                                    ? "text-teal-400 bg-teal-500/20 hover:bg-teal-500/30"
                                    : "text-gray-400 bg-gray-700/70 hover:bg-gray-700/90"
                                }`}
                                title={layer.visible ? "Hide layer" : "Show layer"}
                              >
                                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                              <span className="font-medium truncate">
                                {layer.name}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLayer(layer.id);
                              }}
                              className="w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg flex items-center justify-center ml-2"
                              title="Delete layer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {layers.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <p>No layers yet</p>
                          <button
                            onClick={addNewLayer}
                            className="mt-2 text-teal-400 hover:text-teal-300"
                          >
                            Add your first layer
                          </button>
                        </div>
                      )}
                    </div>

                    {isMobile && (
                      <div className="mt-5 flex justify-center">
                        <motion.button
                          onClick={() => setLayersPanelOpen(false)}
                          className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-xl shadow-md"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Close Layers
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas */}
            <motion.div
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {layers.length < 1 ? (
                <div className="flex flex-col items-center justify-center h-[70vh]  w-full">
                  <p className="text-gray-400 text-xl">No layers available</p>
                  <button
                    onClick={addNewLayer}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium"
                  >
                    Create First Layer
                  </button>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="bg-white shadow-2xl rounded-2xl border border-gray-700/50"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={stopDrawing}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/80 backdrop-blur-md px-6 py-4 text-center text-gray-300 text-sm mt-auto">
        <p className="font-medium">
          CanvasStudio • Built with <span className="text-red-400">♥</span> • All your creations are saved locally
        </p>
      </footer>
    </div>
  );
};

export default Index;
