import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Focus() {
  const { language } = useApp();
  const t = useT(language);
  
  // הסטייט הנוכחי של הזמן שנשאר (בשניות)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  // האם הטיימר פעיל כרגע
  const [isRunning, setIsRunning] = useState(false);
  // מצב הזמן שנבחר (ברירת מחדל 25 דקות)
  const [selectedMinutes, setSelectedMinutes] = useState(25);

  // אפקט שמנהל את הספירה לאחור בכל שנייה
  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // כאן אפשר להוסיף צליל התראה בעתיד אם תרצה
      alert("Time's up! Take a break.");
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // חישוב חכם של הדקות והשניות לתצוגה
  const displayMinutes = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    return String(mins).padStart(2, "0");
  }, [timeLeft]);

  const displaySeconds = useMemo(() => {
    const secs = timeLeft % 60;
    return String(secs).padStart(2, "0");
  }, [timeLeft]);

  // פונקציה לשינוי מצב הזמן (25, 50, 90 דקות)
  const handleModeChange = (minutes) => {
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  // פונקציה לאיפוס הטיימר לזמן המקורי שנבחר
  const handleReset = () => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(false);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.focus}</h2>
      <div className="panel grid min-h-[520px] place-items-center p-8 text-center">
        <div>
          {/* תצוגת השעון העגול */}
          <div className="mx-auto grid h-64 w-64 place-items-center rounded-full border border-purple-400/40 bg-gradient-to-br from-purple-600/20 to-blue-500/20 text-6xl font-black shadow-glow select-none">
            {displayMinutes}:{displaySeconds}
          </div>
          
          {/* כפתורי בחירת הזמנים */}
          <div className="mt-8 flex justify-center gap-2">
            {[25, 50, 90].map((value) => (
              <button 
                key={value} 
                className={`btn-soft ${selectedMinutes === value ? "bg-white text-slate-950" : ""}`} 
                onClick={() => handleModeChange(value)}
              >
                {value}m
              </button>
            ))}
          </div>
          
          {/* כפתורי שליטה בטיימר */}
          <div className="mt-6 flex justify-center gap-3">
            {!isRunning ? (
              <button className="btn-primary" onClick={() => setIsRunning(true)}>
                <Play size={18} /> Start
              </button>
            ) : (
              <button className="btn-soft bg-purple-600/20" onClick={() => setIsRunning(false)}>
                <Pause size={18} /> Pause
              </button>
            )}
            
            <button className="btn-soft" onClick={handleReset}>
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}