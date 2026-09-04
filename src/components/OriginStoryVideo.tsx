import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings, RotateCcw, ChevronRight, CheckCircle2, X, Sparkles, BookOpen, Clock } from "lucide-react";

interface OriginStoryVideoProps {
  className?: string;
}

interface Chapter {
  title: string;
  timestamp: string;
  startTime: number; // in seconds
  endTime: number;
  text: string;
  subtitle: string;
  bgGradient: string;
}

export function OriginStoryVideo({ className = "" }: OriginStoryVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [quality, setQuality] = useState<string>("1080p HD");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const duration = 75; // 1 minute 15 seconds total video duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const chapters: Chapter[] = [
    {
      title: "The Seed of an Idea",
      timestamp: "0:00 - 0:15",
      startTime: 0,
      endTime: 15,
      text: "In 2021, our founders stood in the lush green valleys of West Africa, noticing a profound disconnect: local, high-yield agricultural operators lacked the flexible capital to scale, while global investors sought secure, sustainable, inflation-hedging opportunities.",
      subtitle: "Connecting global capital to fertile African opportunities.",
      bgGradient: "from-emerald-950 via-zinc-900 to-zinc-950"
    },
    {
      title: "Scaling Trust",
      timestamp: "0:15 - 0:35",
      startTime: 15,
      endTime: 35,
      text: "We set out to build Cowvest—a transparent bridge of absolute trust. By integrating real-time agricultural telemetry, secure local warehousing, micro-portfolio listings, and comprehensive underwritten insurance policies, we transformed traditional livestock breeding into a secure, institutional-grade asset class.",
      subtitle: "Engineered on security, transparency, and deep agricultural expertise.",
      bgGradient: "from-zinc-950 via-emerald-950/80 to-zinc-900"
    },
    {
      title: "Empowering Communities",
      timestamp: "0:35 - 0:55",
      startTime: 35,
      endTime: 55,
      text: "Today, Cowvest directly funds thousands of active high-yield produce products, distributes clean organic fertilizer, and elevates local farming families into regional economic pillars. Our mission is not just about financial yields—it's about sowing lasting prosperity that feeds a continent.",
      subtitle: "Direct socio-economic impact across farming communities.",
      bgGradient: "from-zinc-900 via-zinc-950 to-emerald-950/70"
    },
    {
      title: "The Path Forward",
      timestamp: "0:55 - 1:15",
      startTime: 55,
      endTime: 75,
      text: "As we look to the horizon, we are launching modern cold-chain processing hubs, automated dairy tracking technology, and expanding our insurance partnerships to guarantee more crop and livestock safety. We invite you to join us in farming the future. Rooted in trust, powered by you.",
      subtitle: "Farming the future of secure sustainable agriculture.",
      bgGradient: "from-emerald-950/60 via-zinc-900 to-zinc-950"
    }
  ];

  // Find active chapter based on currentTime
  const currentChapterIndex = chapters.findIndex(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );
  const activeChapter = chapters[currentChapterIndex >= 0 ? currentChapterIndex : 0];

  // Video playback loop simulation
  useEffect(() => {
    if (isPlaying && showPlayerModal) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0; // reset
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, showPlayerModal, playbackSpeed]);

  const handleOpenVideo = () => {
    setShowPlayerModal(true);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleCloseVideo = () => {
    setShowPlayerModal(false);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const newTime = Math.min(Math.max(0, Math.floor(clickPercent * duration)), duration);
    setCurrentTime(newTime);
  };

  return (
    <div className={`mt-4 mb-8 ${className}`}>
      {/* Title & Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
            <BookOpen size={16} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Our Origin Story</h2>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          First Video Content
        </span>
      </div>

      {/* Video Thumbnail Frame */}
      <motion.div 
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleOpenVideo}
        className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-zinc-100 cursor-pointer group bg-zinc-950"
      >
        {/* Cinematic Generated Background Image */}
        <img 
          src="/src/assets/images/origin_story_thumbnail_1783982939355.jpg" 
          alt="Our Origin Story Thumbnail" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 group-hover:via-black/20 transition-all duration-300" />

        {/* Cinematic Floating Play Button with Click to View indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <motion.div 
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600/95 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 border border-emerald-400/20 backdrop-blur-xs transition-all relative"
          >
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping opacity-75" />
            <Play size={24} className="fill-current text-white ml-1" />
          </motion.div>

          <div className="text-center px-4">
            <h3 className="text-white font-extrabold text-base md:text-xl tracking-tight leading-snug drop-shadow-md">
              Our Origin Story: Rooted in Trust
            </h3>
            <p className="text-zinc-300 text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-1.5 mt-1 drop-shadow-sm">
              <Clock size={12} />
              <span>1:15 MINS</span>
              <span className="w-1 h-1 bg-zinc-400 rounded-full" />
              <span className="text-emerald-400 font-extrabold underline decoration-2 underline-offset-4 uppercase tracking-widest text-[10px] hover:text-emerald-300 transition-colors">
                Click to View
              </span>
            </p>
          </div>
        </div>

        {/* Cinematic lower metadata ribbon */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white/95 text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-tight text-zinc-100">COWVEST DOCUMENTARY</span>
          </div>
          <span className="font-mono bg-black/40 backdrop-blur px-2.5 py-1 rounded-full text-[10px] tracking-wider border border-zinc-800">
            ULTRA HD 4K
          </span>
        </div>
      </motion.div>

      {/* Cinematic Simulated Video Player Modal */}
      <AnimatePresence>
        {showPlayerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseVideo}
              className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md"
            />

            {/* Video Player Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Play size={12} className="fill-current" />
                  </div>
                  <span className="font-bold text-sm text-zinc-200">Origin Documentary Player</span>
                </div>
                <button
                  onClick={handleCloseVideo}
                  className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Player Screens Wrapper */}
              <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-black">
                
                {/* Simulated Screen with changing animations and captions */}
                <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-6 md:p-8 min-h-[300px] lg:min-h-[420px]">
                  {/* Backdrop Gradient mapped to current chapter */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeChapter.bgGradient} transition-all duration-1000 ease-in-out`} />
                  
                  {/* Subtle moving grid mesh for atmospheric feeling */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Top-left documentary watermark */}
                  <div className="relative flex justify-between items-start z-10">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-zinc-800">
                      <Sparkles size={12} className="text-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">CHAPTER {currentChapterIndex + 1} of 4</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-zinc-500 bg-black/20 px-2 py-0.5 rounded">
                      TIME REMAINING: {formatTime(duration - currentTime)}
                    </div>
                  </div>

                  {/* Dynamic atmospheric quote / graphic slide inside the video */}
                  <div className="relative z-10 my-auto text-center max-w-xl mx-auto space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeChapter.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3"
                      >
                        <h4 className="text-emerald-400 text-xs font-black tracking-widest uppercase">{activeChapter.title}</h4>
                        <p className="text-white text-base md:text-lg font-black tracking-tight leading-relaxed">
                          "{activeChapter.subtitle}"
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Live Caption/Subtitle overlay mimicking a premium documentary */}
                  <div className="relative z-10 bg-black/60 backdrop-blur-sm border border-zinc-900/50 rounded-2xl p-4 max-w-2xl mx-auto w-full text-center shadow-lg">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentTime}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        className="text-xs md:text-sm text-zinc-100 font-semibold tracking-wide leading-relaxed"
                      >
                        {activeChapter.text}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Chapter Side Navigation Bar inside the Player */}
                <div className="w-full lg:w-72 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-900 p-4 overflow-y-auto shrink-0 flex flex-col justify-between max-h-[30vh] lg:max-h-none">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2 px-1">Documentary Outline</span>
                    <div className="space-y-1.5">
                      {chapters.map((chap, idx) => {
                        const isCurrent = idx === currentChapterIndex;
                        const isPassed = currentTime > chap.endTime;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentTime(chap.startTime);
                              setIsPlaying(true);
                            }}
                            className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition-all border outline-none ${
                              isCurrent
                                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                                : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                isCurrent
                                  ? "bg-emerald-500 text-white"
                                  : isPassed
                                  ? "bg-zinc-800 text-emerald-400"
                                  : "bg-zinc-900 text-zinc-600"
                              }`}>
                                {isPassed && !isCurrent ? <CheckCircle2 size={12} /> : idx + 1}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold leading-tight">{chap.title}</h5>
                                <span className="text-[9px] text-zinc-500 font-mono font-semibold">{chap.timestamp}</span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 hidden lg:block">
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                      🎥 Our story is documented using high-fidelity cinematic simulation to highlight Cowvest's core security framework.
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Timeline & Control Ribbon */}
              <div className="bg-zinc-900 px-6 py-4 flex flex-col gap-3">
                
                {/* Timeline bar with buffered simulated progress */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-400">{formatTime(currentTime)}</span>
                  <div 
                    onClick={handleTimelineClick}
                    className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer hover:h-2.5 transition-all group"
                  >
                    {/* Buffered bar */}
                    <div className="absolute inset-y-0 left-0 bg-zinc-700 w-[95%]" />
                    {/* Active played bar */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full flex items-center justify-end"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                      {/* Timeline thumb scrubber */}
                      <span className="w-2 h-2 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform shadow-lg shrink-0" />
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400">{formatTime(duration)}</span>
                </div>

                {/* Control buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left Side: Playback State */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setCurrentTime(0)}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center transition-all border border-zinc-800"
                      aria-label="Restart video"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <div className="h-4 w-[1px] bg-zinc-800" />

                    {/* Mute toggle */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                    >
                      {isMuted ? <VolumeX size={18} className="text-amber-500" /> : <Volume2 size={18} />}
                    </button>
                  </div>

                  {/* Right Side: Options & Video Telemetry */}
                  <div className="flex items-center gap-4 relative">
                    {/* Speed selection */}
                    <div className="flex bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-800">
                      {[1, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setPlaybackSpeed(sp)}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${
                            playbackSpeed === sp
                              ? "bg-emerald-600 text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-[1px] bg-zinc-800" />

                    {/* Quality & Settings */}
                    <button
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl transition-all ${
                        showSettingsMenu ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Settings size={16} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
                      <span className="text-xs font-bold font-mono tracking-tight hidden sm:inline">{quality}</span>
                    </button>

                    {/* Settings Dropdown Panel */}
                    <AnimatePresence>
                      {showSettingsMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 w-48 shadow-2xl z-20 space-y-2"
                        >
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 block">Resolution</span>
                          {["1080p HD", "720p HD", "480p Auto"].map((qual) => (
                            <button
                              key={qual}
                              onClick={() => {
                                setQuality(qual);
                                setShowSettingsMenu(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center transition-all ${
                                quality === qual
                                  ? "bg-emerald-950/60 text-emerald-400 font-extrabold"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              }`}
                            >
                              {qual}
                              {quality === qual && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => {
                        alert("Simulated Cinematic Theater mode is fully optimized for container previews.");
                      }}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                      title="Simulate Fullscreen"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
