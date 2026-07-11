import { useTheme } from "next-themes";
import { useEffect , useState } from "react";

export function ThemeToggle (){
    const {theme ,setTheme , resolvedTheme} = useTheme();
    const [mounted , setMounted] = useState(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-9 h-9" />;
    const isDark = resolvedTheme === "dark";
    const handleToggle = ()=>{
        setTheme(isDark ? "light" : "dark")
        console.log("classname",document.documentElement.className)
        console.log(localStorage.theme)
    }
    return (
    <button
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m8.25-9H21M3 12h1.5m13.5-6.75l-1.06 1.06M6.31 17.69l-1.06 1.06m0-13.5L6.31 6.31m11.38 11.38l-1.06-1.06M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
}