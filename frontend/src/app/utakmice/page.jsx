"use client"

import Head from "next/head"
import Link from "next/link"
import { useState, useEffect } from "react"
import styles from "../../styles/Utakmice.module.css"

export default function Utakmice() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [gameweeks, setGameweeks] = useState([])
  const [selectedGameweek, setSelectedGameweek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchGameweeks()
    fetchMatches()
  }, [])

  useEffect(() => {
    if (selectedGameweek) {
      fetchMatches()
    }
  }, [activeTab, selectedGameweek])

  const fetchGameweeks = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/gameweeks`)
      if (response.ok) {
        const data = await response.json()
        setGameweeks(data)
      }
    } catch (error) {
      console.error('Greška pri učitavanju kola:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      let url = `${apiUrl}/matches`
      const params = new URLSearchParams()
      
      // Ne šaljemo status parametre - prikazujemo sve utakmice za kolo
      // Filter po statusu je već uradjen na nivou kola
      
      // Uvijek je neko kolo odabrano
      params.append('gameweek_id', selectedGameweek)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      console.log('🔍 API URL:', url)
      console.log('🔍 Params:', params.toString())
      console.log('🔍 Active tab:', activeTab)
      console.log('🔍 Selected gameweek:', selectedGameweek)
      
      const response = await fetch(url)
      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Response data:', data)
        console.log('🔍 Data length:', data.length)
        
        if (activeTab === "upcoming") {
          setUpcomingMatches(data)
        } else {
          setRecentResults(data)
        }
      } else {
        console.error('🔍 Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('🔍 Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!mounted) return dateString
    return new Date(dateString).toLocaleDateString("bs-BA")
  }

  const formatTime = (dateString) => {
    if (!mounted) return "00:00"
    return new Date(dateString).toLocaleTimeString("bs-BA", {hour: '2-digit', minute: '2-digit'})
  }

  const getGameweekNumber = (gameweekId) => {
    const gameweek = gameweeks.find(gw => gw.id === gameweekId)
    return gameweek ? `${gameweek.number}. kolo` : "Nepoznato kolo"
  }

  // Filtriraj kola prema aktivnom tab-u
  const getFilteredGameweeks = () => {
    if (activeTab === "upcoming") {
      // Za nadolazeće utakmice: samo scheduled kola
      const filtered = gameweeks
        .filter(gw => gw.status === 'scheduled')
        .sort((a, b) => a.number - b.number)
      console.log('🔍 Upcoming gameweeks:', filtered)
      return filtered
    } else {
      // Za rezultate: in_progress + completed kola
      const filtered = gameweeks
        .filter(gw => gw.status === 'in_progress' || gw.status === 'completed')
        .sort((a, b) => b.number - a.number) // najnovija kola prva
      console.log('🔍 Results gameweeks:', filtered)
      return filtered
    }
  }

  // Postavi prvo dostupno kolo kada se promijeni tab
  useEffect(() => {
    const filteredGameweeks = getFilteredGameweeks()
    if (filteredGameweeks.length > 0) {
      setSelectedGameweek(filteredGameweeks[0].id)
    }
  }, [activeTab, gameweeks])

  return (
    <>
      <Head>
        <title>Utakmice | PLKutak</title>
        <meta name="description" content="Raspored utakmica i rezultati Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Utakmice</h1>
        <p className={styles.subtitle}>Raspored utakmica i rezultati Premijer lige BiH</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "upcoming" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Nadolazeće utakmice
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "results" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Rezultati
          </button>
        </div>

        <div className={styles.filterSection}>
          <select 
            value={selectedGameweek} 
            onChange={(e) => setSelectedGameweek(e.target.value)}
            className={styles.gameweekFilter}
          >
            {getFilteredGameweeks().map((gameweek) => (
              <option key={gameweek.id} value={gameweek.id}>
                {gameweek.number}. kolo
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Učitavanje utakmica...</div>
        ) : (
          <>
            {activeTab === "upcoming" && (
              <div className={styles.matchesList}>
                {upcomingMatches.length === 0 ? (
                  <div className={styles.noMatches}>
                    <p>Nema nadolazećih utakmica.</p>
                  </div>
                ) : (
                  upcomingMatches.map((match) => (
                    <div key={match.id} className={styles.matchCard}>
                      <div className={styles.matchHeader}>
                        <span className={styles.matchRound}>
                          {getGameweekNumber(match.gameweek_id)}
                        </span>
                        <span className={styles.matchDate}>
                          {formatDate(match.date)} | {formatTime(match.date)}
                        </span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div className={styles.teamHome}>
                          <span className={styles.teamName}>{match.home_club_name}</span>
                        </div>
                        <div className={styles.matchInfo}>
                          <span className={styles.vs}>VS</span>
                          <span className={styles.stadium}>{match.stadium}</span>
                        </div>
                        <div className={styles.teamAway}>
                          <span className={styles.teamName}>{match.away_club_name}</span>
                        </div>
                      </div>
                      <Link href={`/utakmice/${match.id}`} className={styles.matchLink}>
                        Detalji utakmice
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className={styles.matchesList}>
                {recentResults.length === 0 ? (
                  <div className={styles.noMatches}>
                    <p>Nema završenih utakmica.</p>
                  </div>
                ) : (
                  recentResults.map((result) => (
                    <div key={result.id} className={styles.matchCard}>
                      <div className={styles.matchHeader}>
                        <span className={styles.matchRound}>
                          {getGameweekNumber(result.gameweek_id)}
                        </span>
                        <span className={styles.matchDate}>{formatDate(result.date)}</span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div className={styles.teamHome}>
                          <span className={styles.teamName}>{result.home_club_name}</span>
                          <span className={styles.score}>{result.home_score}</span>
                        </div>
                        <div className={styles.separator}>-</div>
                        <div className={styles.teamAway}>
                          <span className={styles.score}>{result.away_score}</span>
                          <span className={styles.teamName}>{result.away_club_name}</span>
                        </div>
                      </div>
                      <Link href={`/utakmice/${result.id}`} className={styles.matchLink}>
                        Detalji utakmice
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
