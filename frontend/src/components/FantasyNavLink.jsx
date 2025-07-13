"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import useAuth from "../hooks/use-auth"
import useFantasyTeam from "../hooks/use-fantasy-team"

export default function FantasyNavLink({ children, className = "" }) {
  const { isLoggedIn } = useAuth()
  const { hasTeam, loading } = useFantasyTeam()
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    if (loading) {
      return // Čekamo da se učita
    }

    if (hasTeam) {
      router.push("/fantasy")
    } else {
      router.push("/fantasy/create-team")
    }
  }

  return (
    <a href="#" onClick={handleClick} className={className} style={{ textDecoration: 'none', color: 'inherit' }}>
      {children}
    </a>
  )
} 