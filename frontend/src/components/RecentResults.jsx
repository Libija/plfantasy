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
      console.log('Sva kola:', gameweeks)
      
      // Pronađi zadnje završeno kolo (po datumu - najnoviji datum)
      const completedGameweeks = gameweeks.filter(gw => gw.status === 'completed')
      console.log('Završena kola:', completedGameweeks)
      
      const lastCompletedGameweek = completedGameweeks
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
      
      console.log('Zadnje završeno kolo (po start_date):', lastCompletedGameweek)
      console.log('Sortiranje po start_date:', completedGameweeks.map(gw => ({ id: gw.id, number: gw.number, start_date: gw.start_date })).sort((a, b) => new Date(b.start_date) - new Date(a.start_date)))
      
      // Alternativno sortiranje po broju kola
      const lastCompletedGameweekByNumber = completedGameweeks
        .sort((a, b) => b.number - a.number)[0]
      
      console.log('Zadnje završeno kolo (po number):', lastCompletedGameweekByNumber)
      console.log('Sortiranje po number:', completedGameweeks.map(gw => ({ id: gw.id, number: gw.number, start_date: gw.start_date })).sort((a, b) => b.number - a.number))
      
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
      console.log('Sve utakmice za kolo:', allMatches)
      
      // Filtriraj samo completed utakmice, uzmi prve 3
      const completedMatches = allMatches
        .filter(match => match.status === 'completed')
        .slice(0, 3)
      
      console.log('Filtrirane completed utakmice:', completedMatches)
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
