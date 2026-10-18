import { useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { LightbulbIcon } from "lucide-react";

export default function ThemeBotton() {
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const toggleTheme = () => setDarkMode((previous) => !previous);
    
    // useEffect(() => {
    //     console.log(darkMode ? 'Dark Mode: On' : 'Dark Mode: Off')
    // },[darkMode])


    return (
        <>
            <button type="button" aria-label="Alternar tema" onClick={toggleTheme} className={`mx-2 grid h-10 w-10 place-items-center rounded-2xl border transition ${darkMode ? 'border-slate-300 bg-slate-200 text-slate-700' : 'border-amber-400 bg-amber-100 text-amber-600'}`}>
                <LightbulbIcon size={22} />
            </button>
        </>
    )
}


