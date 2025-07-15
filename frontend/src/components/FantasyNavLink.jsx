"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import useAuth from "../hooks/use-auth"
import useFantasyTeam from "../hooks/use-fantasy-team"

export default function FantasyNavLink({ children, className = "" }) {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const { hasTeam, loading: fantasyLoading } = useFantasyTeam()
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()
    
    console.log("FantasyNavLink clicked:", { authLoading, isLoggedIn, fantasyLoading, hasTeam })
    
    // Ako se još učitava auth, ne radi ništa
    if (authLoading) {
      console.log("Auth still loading, ignoring click")
      return
    }
    
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to login")
      router.push("/login")
      return
    }

    // Ako se još učitava fantasy tim, preusmjeri na fantasy stranicu koja će sama provjeriti
    if (fantasyLoading) {
      console.log("Fantasy team still loading, redirecting to fantasy page")
      router.push("/fantasy")
      return
    }

    if (hasTeam) {
      console.log("User has team, redirecting to fantasy dashboard")
      router.push("/fantasy")
    } else {
      console.log("User has no team, redirecting to create team")
      router.push("/fantasy/create-team")
    }
  }

  return (
    <a 
      href="#" 
      onClick={handleClick} 
      className={className} 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        opacity: authLoading ? 0.6 : 1,
        cursor: authLoading ? 'wait' : 'pointer'
      }}
    >
      {children}
    </a>
  )
} 