import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'

function Screen({ title }: { title: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  return <main><header><Link to="/">CV Studio</Link><nav><Link to="/edit">Edit</Link><Link to="/templates">Templates</Link><button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dark' : 'Light'}</button></nav></header><section><p className="eyebrow">Free, local-first resume builder</p><h1>{title}</h1><p>Your data stays in this browser. No account and no paywall on PDF export.</p></section></main>
}

export default function App() {
  return <Routes><Route path="/" element={<Screen title="Build a resume you can reopen and edit." />} /><Route path="/edit" element={<Screen title="Resume editor" />} /><Route path="/templates" element={<Screen title="Templates" />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
