import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import axios from "axios";
import { toast } from "react-hot-toast"; // או 'react-toastify' בהתאם למה שמותקן אצלך

export default function Focus() {
  const { language, user, token } = useApp();
  const t = useT(language);
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  
  // Ref שמונע מהשמירה וההודעה לרוץ פעמיים באותו שבר שנייה
  const isSavingRef = useRef(false);

  // פונקציה השומרת את סשן הלמידה בבסיס הנתונים
  const saveStudySession = async () => {
    if (isSavingRef.current) return; // אם כבר התחילה שמירה, אל תריץ שוב
    isSavingRef.current = true;

    try {
      const authToken = token || user?.token || localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/study-sessions`, 
        {
          duration: selectedMinutes,
          date: new Date().toISOString(),
        },
        { 
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : ""
          },
          withCredentials: true 
        }
      );
      
      // הקפצת הודעה מעוצבת ומודרנית במקום alert!
      toast.success(language === "he" ? "כל הכבוד! סשן הלמידה נשמר בהצלחה." : "Great job! Study session saved.");
    } catch (error) {
      console.error("Failed to save study session:", error);
      toast.error(language === "he" ? "שגיאה בשמירת סשן הלמידה" : "Failed to save session");
    } finally {
      // מאפסים את ה-Ref רק אחרי שהכול נגמר
      isSavingRef.current = false;
    }
  };

  // אפקט שמנהל את ריצת הטיימר לאחור
  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // מוודאים שעוצרים את הריצה מיד ומנקים את ה-interval
      setIsRunning(false);
      clearInterval(interval);
      
      // שמירת הסשן והקפצת הטוסט
      saveStudySession();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // חישוב הדקות לתצוגה בשעון
  const displayMinutes = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    return String(mins).padStart(2, "0");
  }, [timeLeft]);

  // חישוב השניות לתצוגה בשעון
  const displaySeconds = useMemo(() => {
    const secs = timeLeft % 60;
    return String(secs).padStart(2, "0");
  }, [timeLeft]);

  // החלפת מצבי זמן (25, 50, 90 דקות)
  const handleModeChange = (minutes) => {
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  // איפוס הטיימר לזמן המקורי שנבחר
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
          
          {/* כפתורי בחירת דקות הלמידה */}
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
          
          {/* כפתורי שליטה (Start / Pause / Reset) */}
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