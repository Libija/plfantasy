"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "../styles/UpcomingMatches.module.css"

export default function UpcomingMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingMatches()
  }, [])

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Dohvati sve kola
      const gameweeksResponse = await fetch(`${apiUrl}/gameweeks`)
      if (!gameweeksResponse.ok) {
        throw new Error('Greška pri dohvatanju kola')
      }
      
      const gameweeks = await gameweeksResponse.json()
      
      // Pronađi sljedeće kolo (najmanji broj kola koji je scheduled ili in_progress)
      const upcomingGameweek = gameweeks
        .filter(gw => gw.status === 'scheduled' || gw.status === 'in_progress')
        .sort((a, b) => a.round_number - b.round_number)[0]
      
      if (!upcomingGameweek) {
        setMatches([])
        return
      }
      
      // Dohvati utakmice za to kolo
      const matchesResponse = await fetch(`${apiUrl}/matches?gameweek_id=${upcomingGameweek.id}`)
      if (!matchesResponse.ok) {
        throw new Error('Greška pri dohvatanju utakmica')
      }
      
      const allMatches = await matchesResponse.json()
      
      // Filtriraj samo scheduled i in_progress utakmice, uzmi prve 3
      const upcomingMatches = allMatches
        .filter(match => match.status === 'scheduled' || match.status === 'in_progress')
        .slice(0, 3)
      
      console.log('Upcoming matches data:', upcomingMatches)
      setMatches(upcomingMatches)
    } catch (error) {
      console.error('Greška pri učitavanju nadolazećih utakmica:', error)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("bs-BA")
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("bs-BA", {hour: '2-digit', minute: '2-digit'})
  }

  if (loading) {
    return (
      <section className={styles.upcomingMatches}>
        <div className={styles.sectionHeader}>
          <h2>Nadolazeće utakmice</h2>
        </div>
        <div className={styles.loading}>Učitavanje...</div>
      </section>
    )
  }

  return (
    <section className={styles.upcomingMatches}>
      <div className={styles.sectionHeader}>
        <h2>Nadolazeće utakmice</h2>
        <Link href="/utakmice" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.matchesList}>
        {matches.length === 0 ? (
          <div className={styles.noMatches}>Nema nadolazećih utakmica</div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchDate}>
                <span>{formatDate(match.date)}</span>
                <span>{formatTime(match.date)}</span>
              </div>
              <div className={styles.matchTeams}>
                <div className={styles.teamHome}>
                  <span className={styles.teamName}>{match.home_club_name || 'N/A'}</span>
                </div>
                <div className={styles.matchInfo}>
                  <span className={styles.vs}>VS</span>
                  <span className={styles.stadium}>{match.stadium || 'N/A'}</span>
                </div>
                <div className={styles.teamAway}>
                  <span className={styles.teamName}>{match.away_club_name || 'N/A'}</span>
                </div>
              </div>
              <Link href={`/utakmice/${match.id}`} className={styles.matchLink}>
                Detalji
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
