"use client"

import Head from "next/head"
import { useState, useEffect } from "react"
import styles from "../../styles/Tabela.module.css"

export default function Tabela() {
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
      console.log("Fetched table data:", data)
      setTableData(data)
    } catch (error) {
      console.error("Error fetching table data:", error)
      setError("Greška pri dohvatanju tabele")
    } finally {
      setLoading(false)
    }
  }

  // Funkcija za određivanje pozicije i boje
  const getPositionInfo = (position) => {
    if (position === 1) {
      return { type: "champions", label: "Liga prvaka", color: "#4cc9f0" }
    } else if (position === 2) {
      return { type: "europa", label: "Evropska liga", color: "#4361ee" }
    } else if (position === 3) {
      return { type: "europa", label: "Evropska liga", color: "#4361ee" }
    } else if (position === 4) {
      return { type: "conference", label: "Liga konferencije", color: "#7209b7" }
    } else if (position === tableData.length - 1 || position === tableData.length) {
      return { type: "relegation", label: "Ispadanje", color: "#f72585" }
    } else {
      return { type: "midtable", label: "", color: "transparent" }
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Tabela</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>
        <div className={styles.loading}>Učitavanje tabele...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Tabela</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Tabela | PLKutak</title>
        <meta name="description" content="Tabela Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Tabela</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tableInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#4cc9f0" }}></span>
                <span className={styles.infoText}>Liga prvaka</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#4361ee" }}></span>
                <span className={styles.infoText}>Evropska liga</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#7209b7" }}></span>
                <span className={styles.infoText}>Liga konferencije</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#f72585" }}></span>
                <span className={styles.infoText}>Ispadanje</span>
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.positionCol}>#</th>
                  <th className={styles.teamCol}>Tim</th>
                  <th className={styles.statsCol}>OU</th>
                  <th className={styles.statsCol}>P</th>
                  <th className={styles.statsCol}>N</th>
                  <th className={styles.statsCol}>I</th>
                  <th className={styles.statsCol}>GD</th>
                  <th className={styles.statsCol}>GP</th>
                  <th className={styles.statsCol}>GR</th>
                  <th className={styles.pointsCol}>BOD</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => {
                  const positionInfo = getPositionInfo(row.position)
                  return (
                    <tr 
                      key={row.club_id} 
                      className={styles.tableRow}
                      style={{
                        borderLeft: positionInfo.color !== "transparent" ? `4px solid ${positionInfo.color}` : "none"
                      }}
                    >
                      <td className={styles.positionCol}>{row.position}</td>
                      <td className={styles.teamCol}>{row.club_name}</td>
                      <td className={styles.statsCol}>{row.played}</td>
                      <td className={styles.statsCol}>{row.won}</td>
                      <td className={styles.statsCol}>{row.drawn}</td>
                      <td className={styles.statsCol}>{row.lost}</td>
                      <td className={styles.statsCol}>{row.goals_for}</td>
                      <td className={styles.statsCol}>{row.goals_against}</td>
                      <td className={styles.statsCol}>{row.goal_difference}</td>
                      <td className={styles.pointsCol}>{row.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
