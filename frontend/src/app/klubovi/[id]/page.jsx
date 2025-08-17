"use client"

import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "../../../styles/KluboviDetalji.module.css"

const POSITION_LABELS = {
  GK: "Golmani",
  DEF: "Odbrana",
  MID: "Vezni",
  FWD: "Napad",
};

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"];

export default function KluboviDetalji() {
  const params = useParams()
  const id = params.id
  const [club, setClub] = useState(null)
  const [players, setPlayers] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [error, setError] = useState("")

  // Uklonjen hardkodirani podaci - sada se dohvaćaju iz baze

  useEffect(() => {
    if (!id) return
    const fetchClub = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs/${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClub(data)
      } catch {
        setError("Greška pri dohvatu kluba.")
      }
    }
    fetchClub()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchPlayers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/players?club_id=${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setPlayers(data)
      } catch {
        // Ne prikazuj error, samo pusti prazno
      }
    }
    fetchPlayers()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchMatches = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        
        // Dohvati nedavne utakmice
        const recentRes = await fetch(`${apiUrl}/matches/club/${id}/recent?limit=5`)
        if (recentRes.ok) {
          const recentData = await recentRes.json()
          setRecentMatches(recentData)
        }
        
        // Dohvati nadolazeće utakmice
        const upcomingRes = await fetch(`${apiUrl}/matches/club/${id}/upcoming?limit=5`)
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json()
          setUpcomingMatches(upcomingData)
        }
      } catch (error) {
        console.error("Greška pri dohvatu utakmica:", error)
      }
    }
    fetchMatches()
  }, [id])

  if (!id) return null
  if (error) return <div className={styles.container}><p style={{ color: "red" }}>{error}</p></div>
  if (!club) return <div className={styles.container}><p>Učitavanje...</p></div>

  // Grupiraj igrače po pozicijama
  const playersByPosition = POSITION_ORDER.reduce((acc, pos) => {
    acc[pos] = players.filter((p) => p.position === pos)
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>{club.name} | PLKutak</title>
        <meta name="description" content={`Informacije o klubu ${club.name} - Premijer liga BiH`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/klubovi">Klubovi</Link> / <span>{club.name}</span>
        </div>

        <div className={styles.clubHeader} style={{ backgroundColor: club.primary_color || "#1a1a2e" }}>
          <div className={styles.clubLogo}>
            {club.logo_url ? (
              <img src={club.logo_url} alt={club.name} style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover" }} />
            ) : (
              <div className={styles.logoPlaceholder} style={{ backgroundColor: club.primary_color || "#4361ee", color: club.secondary_color || "#fff" }}>
                {club.name.charAt(0)}
              </div>
            )}
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <div className={styles.clubBasicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Osnovan</span>
                <span className={styles.infoValue}>{club.year_founded}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Grad</span>
                <span className={styles.infoValue}>{club.city}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stadion</span>
                <span className={styles.infoValue}>{club.stadium}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kapacitet</span>
                <span className={styles.infoValue}>{club.stadium_capacity?.toLocaleString?.() || club.stadium_capacity}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Trener</span>
                <span className={styles.infoValue}>{club.coach}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.clubContent}>
          <div className={styles.aboutClub}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>O klubu</h2>
            </div>
            <div className={styles.aboutContent}>
              <div className={styles.description}>
                {club.description ? club.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                )) : <p>Nema opisa.</p>}
              </div>
            </div>
          </div>

          

          <div className={styles.squad}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>Igrači</h2>
            </div>
            <div className={styles.squadContent}>
              {POSITION_ORDER.map((pos) =>
                playersByPosition[pos] && playersByPosition[pos].length > 0 ? (
                  <div className={styles.positionGroup} key={pos}>
                    <h3>{POSITION_LABELS[pos]}</h3>
                    <div className={styles.playersList}>
                      {playersByPosition[pos].map((player) => (
                        <div className={styles.playerCard} key={player.id}>
                          <div className={styles.playerNumber}>{player.shirt_number || "-"}</div>
                          <div className={styles.playerInfo}>
                            <div className={styles.playerName}>{player.name}</div>
                            <div className={styles.playerDetails}>
                              <span>{player.nationality}</span>
                              
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className={styles.matches}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>Utakmice</h2>
            </div>
            <div className={styles.matchesContent}>
              <div className={styles.matchesGroup}>
                <h3>Nedavne utakmice</h3>
                <div className={styles.matchesList}>
                  {recentMatches.length === 0 ? (
                    <p>Nema nedavnih utakmica</p>
                  ) : (
                    recentMatches.map((match) => (
                      <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                        <div className={styles.matchInfo}>
                          <span className={styles.matchCompetition}>Premijer liga BiH</span>
                          <span className={styles.matchDate}>{new Date(match.date).toLocaleDateString("bs-BA")}</span>
                        </div>
                        <div className={styles.matchTeams}>
                          <div className={`${styles.matchTeam} ${match.home_club_id === parseInt(id) ? styles.homeTeam : styles.awayTeam}`}>
                            {match.home_club_name}
                          </div>
                          <div className={styles.matchScore}>{match.home_score} - {match.away_score}</div>
                          <div className={`${styles.matchTeam} ${match.away_club_id === parseInt(id) ? styles.homeTeam : styles.awayTeam}`}>
                            {match.away_club_name}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.matchesGroup}>
                <h3>Nadolazeće utakmice</h3>
                <div className={styles.matchesList}>
                  {upcomingMatches.length === 0 ? (
                    <p>Nema nadolazećih utakmica</p>
                  ) : (
                    upcomingMatches.map((match) => (
                      <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                        <div className={styles.matchInfo}>
                          <span className={styles.matchCompetition}>Premijer liga BiH</span>
                          <span className={styles.matchDate}>
                            {new Date(match.date).toLocaleDateString("bs-BA")} | {new Date(match.date).toLocaleTimeString("bs-BA", {hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <div className={styles.matchTeams}>
                          <div className={`${styles.matchTeam} ${match.home_club_id === parseInt(id) ? styles.homeTeam : styles.awayTeam}`}>
                            {match.home_club_name}
                          </div>
                          <div className={styles.matchVs}>VS</div>
                          <div className={`${styles.matchTeam} ${match.away_club_id === parseInt(id) ? styles.homeTeam : styles.awayTeam}`}>
                            {match.away_club_name}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

