"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "../styles/TopScorers.module.css"

export default function TopScorers() {
  const [scorers, setScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopScorers()
  }, [])

  const fetchTopScorers = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/top-scorers?limit=5`)
      
      if (!response.ok) {
        throw new Error("Greška pri dohvatanju podataka")
      }
      
      const data = await response.json()
      console.log("Fetched top scorers:", data)
      setScorers(data)
    } catch (error) {
      console.error("Error fetching top scorers:", error)
      setScorers([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className={styles.topScorers}>
        <div className={styles.sectionHeader}>
          <h2>Najbolji strijelci</h2>
          <Link href="/statistika/strijelci" className={styles.viewAll}>
            Pogledaj sve
          </Link>
        </div>
        <div className={styles.loading}>Učitavanje...</div>
      </section>
    )
  }

  return (
    <section className={styles.topScorers}>
      <div className={styles.sectionHeader}>
        <h2>Najbolji strijelci</h2>
        <Link href="/statistika/strijelci" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.scorersContainer}>
        {scorers.length === 0 ? (
          <div className={styles.noData}>Nema podataka o strijelcima</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.positionCol}>#</th>
                <th className={styles.playerCol}>Igrač</th>
                <th className={styles.teamCol}>Tim</th>
                <th className={styles.goalsCol}>G</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((scorer) => (
                <tr key={scorer.player_id} className={styles.tableRow}>
                  <td className={styles.positionCol}>{scorer.position}</td>
                  <td className={styles.playerCol}>{scorer.player_name}</td>
                  <td className={styles.teamCol}>{scorer.club_name}</td>
                  <td className={styles.goalsCol}>{scorer.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
