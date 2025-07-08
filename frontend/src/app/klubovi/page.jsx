"use client"

import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import styles from "../../styles/Klubovi.module.css"

export default function Klubovi() {
  const [clubs, setClubs] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        const data = await res.json()
        setClubs(data)
      } catch {
        setError("Greška pri dohvatu klubova.")
      }
    }
    fetchClubs()
  }, [])

  return (
    <>
      <Head>
        <title>Klubovi | PLKutak</title>
        <meta name="description" content="Klubovi Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Klubovi</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <Link href={`/klubovi/${club.id}`} key={club.id} className={styles.clubCard} style={{ border: `2px solid ${club.primary_color || "#4361ee"}` }}>
              <div className={styles.clubLogo} style={{ backgroundColor: club.primary_color || "#16213e" }}>
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8 }} />
                ) : (
                  <div className={styles.logoPlaceholder} style={{ backgroundColor: club.primary_color || "#4361ee", color: club.secondary_color || "#fff" }}>
                    {club.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.clubInfo}>
                <h3 className={styles.clubName}>{club.name}</h3>
                <p className={styles.clubCity}>{club.city}</p>
                <div className={styles.clubDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Osnovan:</span>
                    <span className={styles.detailValue}>{club.year_founded}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Stadion:</span>
                    <span className={styles.detailValue}>{club.stadium}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Kapacitet:</span>
                    <span className={styles.detailValue}>{club.stadium_capacity?.toLocaleString?.() || club.stadium_capacity}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trener:</span>
                    <span className={styles.detailValue}>{club.coach}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
