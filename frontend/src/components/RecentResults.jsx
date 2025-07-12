"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "../styles/RecentResults.module.css"

export default function RecentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentResults()
  }, [])

  const fetchRecentResults = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Dohvati sve kola
      const gameweeksResponse = await fetch(`${apiUrl}/gameweeks`)
      if (!gameweeksResponse.ok) {
        throw new Error('Greška pri dohvatanju kola')
      }
      
      const gameweeks = await gameweeksResponse.json()
      
      // Pronađi zadnje završeno kolo (najveći broj kola koji je completed)
      const lastCompletedGameweek = gameweeks
        .filter(gw => gw.status === 'completed')
        .sort((a, b) => b.round_number - a.round_number)[0]
      
      if (!lastCompletedGameweek) {
        setResults([])
        return
      }
      
      // Dohvati utakmice za to kolo
      const matchesResponse = await fetch(`${apiUrl}/matches?gameweek_id=${lastCompletedGameweek.id}`)
      if (!matchesResponse.ok) {
        throw new Error('Greška pri dohvatanju utakmica')
      }
      
      const allMatches = await matchesResponse.json()
      
      // Filtriraj samo completed utakmice, uzmi prve 3
      const completedMatches = allMatches
        .filter(match => match.status === 'completed')
        .slice(0, 3)
      
      console.log('Recent results data:', completedMatches)
      setResults(completedMatches)
    } catch (error) {
      console.error('Greška pri učitavanju nedavnih rezultata:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("bs-BA")
  }

  if (loading) {
    return (
      <section className={styles.recentResults}>
        <div className={styles.sectionHeader}>
          <h2>Nedavni rezultati</h2>
        </div>
        <div className={styles.loading}>Učitavanje...</div>
      </section>
    )
  }

  return (
    <section className={styles.recentResults}>
      <div className={styles.sectionHeader}>
        <h2>Nedavni rezultati</h2>
        <Link href="/utakmice" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.resultsList}>
        {results.length === 0 ? (
          <div className={styles.noResults}>Nema nedavnih rezultata</div>
        ) : (
          results.map((result) => (
            <div key={result.id} className={styles.resultCard}>
              <div className={styles.resultDate}>{formatDate(result.date)}</div>
              <div className={styles.resultTeams}>
                <div className={styles.teamHome}>
                  <span className={styles.teamName}>{result.home_club_name || 'N/A'}</span>
                  <span className={styles.score}>{result.home_score}</span>
                </div>
                <div className={styles.separator}>-</div>
                <div className={styles.teamAway}>
                  <span className={styles.score}>{result.away_score}</span>
                  <span className={styles.teamName}>{result.away_club_name || 'N/A'}</span>
                </div>
              </div>
              <Link href={`/utakmice/${result.id}`} className={styles.resultLink}>
                Detalji
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
