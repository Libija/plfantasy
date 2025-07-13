"use client"

import { useState, useEffect } from "react"
import useAuth from "./use-auth"

export default function useFantasyTeam() {
  const [hasTeam, setHasTeam] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState(null)
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      setHasTeam(false)
      setLoading(false)
      return
    }

    const checkFantasyTeam = async () => {
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

    checkFantasyTeam()
  }, [isLoggedIn, user])

  return { hasTeam, loading, teamData }
} 