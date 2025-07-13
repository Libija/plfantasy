"use client"

import { useState, useEffect } from "react"
import useAuth from "./use-auth"

export default function useFantasyTeam() {
  const [hasTeam, setHasTeam] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState(null)
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Ako se još učitava auth, ne radi ništa
    if (authLoading) {
      console.log("Fantasy team hook: Auth still loading")
      return
    }

    if (!isLoggedIn || !user) {
      console.log("Fantasy team hook: User not logged in or no user", { isLoggedIn, user: !!user })
      setHasTeam(false)
      setLoading(false)
      return
    }

    console.log("Fantasy team hook: Checking for fantasy team for user", user.id)

    const checkFantasyTeam = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        
        const response = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Fantasy team hook: API response", { teamsCount: data.length, hasTeam: data.length > 0 })
          setHasTeam(data.length > 0)
          setTeamData(data[0] || null)
        } else {
          console.log("Fantasy team hook: API error", response.status)
          setHasTeam(false)
          setTeamData(null)
        }
      } catch (error) {
        console.error("Greška pri provjeri fantasy tima:", error)
        setHasTeam(false)
        setTeamData(null)
      } finally {
        setLoading(false)
      }
    }

    checkFantasyTeam()

    // Slušaj custom event za osvježavanje fantasy tima
    const onFantasyTeamChanged = async () => {
      console.log("Fantasy team hook: Event received, refreshing data")
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        
        const response = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setHasTeam(data.length > 0)
          setTeamData(data[0] || null)
        } else {
          setHasTeam(false)
          setTeamData(null)
        }
      } catch (error) {
        console.error("Greška pri provjeri fantasy tima:", error)
        setHasTeam(false)
        setTeamData(null)
      } finally {
        setLoading(false)
      }
    }
    
    window.addEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    
    return () => {
      window.removeEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    }
  }, [authLoading, isLoggedIn, user])

  return { hasTeam, loading, teamData }
} 