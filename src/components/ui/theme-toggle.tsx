'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true) // Default to dark mode
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    const useDark = saved !== 'light' // default to dark when no saved preference

    setIsDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-9 h-9 p-0 border-border bg-background hover:bg-accent"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 border-border bg-background hover:bg-accent transition-all duration-300"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      )}
    </Button>
  )
}
