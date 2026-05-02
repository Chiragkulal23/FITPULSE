import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Pause, Square, ChevronRight, CheckCircle2, Flame, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type WorkoutPlanStep = {
  name: string;
  duration: number; // in seconds
  type: "exercise" | "rest";
};

interface GuidedWorkoutSessionProps {
  workoutPlan: WorkoutPlanStep[];
  onComplete: (totalDurationSeconds: number) => void;
  onClose: () => void;
}

export default function GuidedWorkoutSession({ workoutPlan, onComplete, onClose }: GuidedWorkoutSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workoutPlan[0]?.duration || 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  // Sound effect helper
  const playBeep = () => {
    try {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([200]);
      }
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio/Vibrate not supported", e);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);
      
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          if (currentIndex < workoutPlan.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
            return workoutPlan[currentIndex + 1].duration;
          } else {
            clearInterval(timer);
            setIsRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentIndex, workoutPlan]);

  // Handle completion check if finished
  const isFinished = currentIndex >= workoutPlan.length - 1 && timeLeft === 0;

  const currentStep = workoutPlan[currentIndex];
  const nextStep = workoutPlan[currentIndex + 1];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentIndex(0);
    setTimeLeft(workoutPlan[0]?.duration || 60);
    setTotalElapsed(0);
  };

  const finishSession = () => {
    onComplete(totalElapsed);
  };

  const progressPercent = ((currentIndex) / workoutPlan.length) * 100;
  
  const isRest = currentStep?.type === "rest";

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md w-full p-0 border-border/30 bg-card overflow-hidden rounded-3xl h-[82vh] sm:h-auto flex flex-col">
        {/* Header Progress */}
        <div className="bg-muted/30 p-4 flex-shrink-0">
          <div className="flex justify-between text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            <span>Step {currentIndex + 1} of {workoutPlan.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 p-4 md:p-5 flex flex-col items-center justify-center relative min-h-[320px]">
          <AnimatePresence mode="wait">
            {isFinished ? (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-heading text-xl font-semibold mb-1 text-foreground">WORKOUT COMPLETE!</h2>
                <p className="text-muted-foreground mb-6 text-sm">You crushed it today.</p>
                <Button onClick={finishSession} size="lg" className="gradient-btn rounded-2xl w-full h-11 text-base">
                  Save & Exit
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full text-center flex flex-col items-center"
              >
                <div className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 inline-flex items-center gap-1.5 ${isRest ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'}`}>
                  {isRest ? <Flame className="w-3.5 h-3.5" /> : null}
                  {isRest ? 'Rest' : 'Exercise'}
                </div>

                <h2 className="font-heading text-xl sm:text-2xl font-semibold mb-3 px-2 leading-tight">
                  {currentStep?.name}
                </h2>

                <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center mb-3">
                  {/* Circular timer ring */}
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="5" />
                    <motion.circle
                      cx="100" cy="100" r="90" fill="none" stroke="url(#timerGrad)" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 90}
                      animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - (timeLeft / currentStep.duration)) }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                    <defs>
                      <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={isRest ? "hsl(24.6 95% 53.1%)" : "hsl(252 96% 67%)"} />
                        <stop offset="100%" stopColor={isRest ? "hsl(47.9 95.8% 53.1%)" : "hsl(164 100% 42%)"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {nextStep && (
                  <div className="rounded-2xl bg-muted/40 p-2.5 w-full flex items-center justify-between border border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5 text-left">Up Next</p>
                      <p className="font-semibold text-sm">{nextStep.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">{nextStep.type}</p>
                      <p className="font-semibold text-sm">{nextStep.duration}s</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Footer */}
        {!isFinished && (
          <div className="py-3 px-4 bg-muted/20 border-t border-border/30 flex items-center justify-center gap-3 flex-shrink-0">
            <Button variant="outline" size="icon" onClick={resetSession} className="h-10 w-10 rounded-2xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
              <RotateCcw className="h-4.5 w-4.5" />
            </Button>
            
            <Button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`h-12 w-12 rounded-2xl ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'gradient-btn'}`}
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button variant="outline" size="icon" onClick={() => {
              if (currentIndex < workoutPlan.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setTimeLeft(workoutPlan[currentIndex + 1].duration);
              } else {
                setTimeLeft(0);
                setIsRunning(false);
              }
            }} className="h-10 w-10 rounded-2xl">
              <ChevronRight className="h-4.5 w-4.5" />
            </Button>
            
            <div className="w-px h-8 bg-border mx-1"></div>
            
            <Button variant="ghost" onClick={finishSession} className="h-10 px-3 rounded-2xl text-sm text-muted-foreground hover:text-destructive">
              <Square className="h-4 w-4 mr-1.5" /> End
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
