import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getTheme, onThemeChange, toggleTheme } from '../../theme'

/** Sun/moon switch in the navbar — flips the whole site between themes. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme())

  useEffect(() => onThemeChange(setTheme), [])

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-glow-cyan/50 hover:text-glow-cyan"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
