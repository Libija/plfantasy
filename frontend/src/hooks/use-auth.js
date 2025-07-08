"use client"

import { useState, useEffect } from "react"

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Funkcija za učitavanje auth stanja
  const loadAuth = () => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("access_token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      setUser(null)
      setToken(null)
    }
  }

  useEffect(() => {
    loadAuth()
    // Slušaj promjene na localStorage (drugi tabovi)
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "access_token") {
        loadAuth()
      }
    }
    // Slušaj custom event za auth promjenu
    const onAuthChanged = () => loadAuth()
    window.addEventListener("storage", onStorage)
    window.addEventListener("authChanged", onAuthChanged)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("authChanged", onAuthChanged)
    }
  }, [])

  const isLoggedIn = !!user && !!token
  const role = user?.role || null

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    setUser(null)
    setToken(null)
    window.dispatchEvent(new Event("authChanged"))
    window.location.href = "/"
  }

  return { user, token, isLoggedIn, role, logout }
} 