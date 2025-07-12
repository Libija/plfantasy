"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "../styles/LeagueTable.module.css"

export default function LeagueTable() {
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTableData()
  }, [])

  const fetchTableData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/league-table`)
      
      if (!response.ok) {
        throw new Error("Greška pri dohvatanju podataka")
      }
      
      const data = await response.json()
      // Prikaži sve klubove na homepage-u
      setTableData(data)
    } catch (error) {
      console.error("Error fetching table data:", error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className={styles.leagueTable}>
        <div className={styles.sectionHeader}>
          <h2>Tabela</h2>
          <Link href="/tabela" className={styles.viewAll}>
            Pogledaj sve
          </Link>
        </div>
        <div className={styles.loading}>Učitavanje...</div>
      </section>
    )
  }

  return (
    <section className={styles.leagueTable}>
      <div className={styles.sectionHeader}>
        <h2>Tabela</h2>
        <Link href="/tabela" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {tableData.length === 0 ? (
          <div className={styles.noData}>Nema podataka o tabeli</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.positionCol}>#</th>
                <th className={styles.teamCol}>Tim</th>
                <th className={styles.statsCol}>OU</th>
                <th className={styles.statsCol}>BOD</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.club_id} className={styles.tableRow}>
                  <td className={styles.positionCol}>{row.position}</td>
                  <td className={styles.teamCol}>{row.club_name}</td>
                  <td className={styles.statsCol}>{row.played}</td>
                  <td className={styles.statsCol}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
