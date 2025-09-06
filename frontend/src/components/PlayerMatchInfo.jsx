"use client"

import { useState, useEffect } from "react"
import { FaChevronDown, FaChevronUp, FaHome, FaPlane, FaCalendarAlt, FaTrophy } from "react-icons/fa"
import styles from "../styles/PlayerMatchInfo.module.css"

export default function PlayerMatchInfo({ playerId, playerName, clubName }) {
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAllRecent, setShowAllRecent] = useState(false)
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [hasMoreRecent, setHasMoreRecent] = useState(false)
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(false)

  useEffect(() => {
    if (playerId) {
      fetchPlayerMatches()
    }
  }, [playerId])

  const fetchPlayerMatches = async () => {
    console.log(`DEBUG PlayerMatchInfo: Počinjem fetch za igrača ${playerId}`)
    setLoading(true)
    setError("")
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      console.log(`DEBUG PlayerMatchInfo: API URL: ${apiUrl}`)
      
      // Dohvati poslednje utakmice
      const recentUrl = `${apiUrl}/players/${playerId}/recent-matches?limit=3`
      console.log(`DEBUG PlayerMatchInfo: Pozivam recent matches: ${recentUrl}`)
      const recentResponse = await fetch(recentUrl)
      console.log(`DEBUG PlayerMatchInfo: Recent response status: ${recentResponse.status}`)
      
      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        console.log(`DEBUG PlayerMatchInfo: Recent data:`, recentData)
        setRecentMatches(recentData.recent_matches || [])
        setHasMoreRecent(recentData.has_more_recent || false)
      } else {
        console.log(`DEBUG PlayerMatchInfo: Recent response not ok: ${recentResponse.status}`)
      }
      
      // Dohvati sledeće utakmice
      const upcomingUrl = `${apiUrl}/players/${playerId}/upcoming-matches?limit=2`
      console.log(`DEBUG PlayerMatchInfo: Pozivam upcoming matches: ${upcomingUrl}`)
      const upcomingResponse = await fetch(upcomingUrl)
      console.log(`DEBUG PlayerMatchInfo: Upcoming response status: ${upcomingResponse.status}`)
      
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        console.log(`DEBUG PlayerMatchInfo: Upcoming data:`, upcomingData)
        setUpcomingMatches(upcomingData.upcoming_matches || [])
        setHasMoreUpcoming(upcomingData.has_more_upcoming || false)
      } else {
        console.log(`DEBUG PlayerMatchInfo: Upcoming response not ok: ${upcomingResponse.status}`)
      }
      
    } catch (err) {
      console.error("Greška pri dohvatu utakmica:", err)
      setError("Greška pri učitavanju podataka")
    } finally {
      setLoading(false)
    }
  }

  const toggleShowAllRecent = async () => {
    if (!showAllRecent && hasMoreRecent) {
      // Dohvati sve poslednje utakmice
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/players/${playerId}/recent-matches?limit=10`)
        if (response.ok) {
          const data = await response.json()
          setRecentMatches(data.recent_matches || [])
        }
      } catch (err) {
        console.error("Greška pri dohvatu svih poslednjih utakmica:", err)
      }
    } else if (showAllRecent) {
      // Vrati na originalni limit (3)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/players/${playerId}/recent-matches?limit=3`)
        if (response.ok) {
          const data = await response.json()
          setRecentMatches(data.recent_matches || [])
        }
      } catch (err) {
        console.error("Greška pri dohvatu poslednjih utakmica:", err)
      }
    }
    setShowAllRecent(!showAllRecent)
  }

  const toggleShowAllUpcoming = async () => {
    if (!showAllUpcoming && hasMoreUpcoming) {
      // Dohvati sve sledeće utakmice
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/players/${playerId}/upcoming-matches?limit=10`)
        if (response.ok) {
          const data = await response.json()
          setUpcomingMatches(data.upcoming_matches || [])
        }
      } catch (err) {
        console.error("Greška pri dohvatu svih sledećih utakmica:", err)
      }
    } else if (showAllUpcoming) {
      // Vrati na originalni limit (2)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/players/${playerId}/upcoming-matches?limit=2`)
        if (response.ok) {
          const data = await response.json()
          setUpcomingMatches(data.upcoming_matches || [])
        }
      } catch (err) {
        console.error("Greška pri dohvatu sledećih utakmica:", err)
      }
    }
    setShowAllUpcoming(!showAllUpcoming)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPointsColor = (points) => {
    if (points >= 8) return styles.pointsExcellent
    if (points >= 5) return styles.pointsGood
    if (points >= 2) return styles.pointsAverage
    return styles.pointsPoor
  }

  const getPointsIcon = (points) => {
    if (points >= 8) return "🔥"
    if (points >= 5) return "👍"
    if (points >= 2) return "😐"
    return "😞"
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Učitavanje utakmica...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>⚠️ {error}</span>
        </div>
      </div>
    )
  }

  const displayedRecentMatches = showAllRecent ? recentMatches : recentMatches.slice(0, 3)
  const displayedUpcomingMatches = showAllUpcoming ? upcomingMatches : upcomingMatches.slice(0, 2)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaTrophy className={styles.titleIcon} />
          Utakmice - {playerName}
        </h3>
        <span className={styles.clubName}>{clubName}</span>
      </div>

      {/* Poslednje utakmice */}
      {recentMatches.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <FaCalendarAlt className={styles.sectionIcon} />
            Poslednje utakmice
          </h4>
          <div className={styles.matchesList}>
            {displayedRecentMatches.map((match, index) => (
              <div key={match.match_id} className={styles.matchItem}>
                <div className={styles.matchHeader}>
                  <div className={styles.matchInfo}>
                    <span className={styles.gameweek}>Kolo {match.gameweek}</span>
                    <span className={styles.date}>{formatDate(match.date)}</span>
                  </div>
                  <div className={`${styles.points} ${getPointsColor(match.fantasy_points)}`}>
                    <span className={styles.pointsIcon}>{getPointsIcon(match.fantasy_points)}</span>
                    <span className={styles.pointsValue}>{match.fantasy_points}</span>
                    <span className={styles.pointsLabel}>pts</span>
                  </div>
                </div>
                
                <div className={styles.matchDetails}>
                  <div className={styles.opponent}>
                    {match.is_home ? (
                      <FaHome className={styles.homeIcon} title="Kod kuće" />
                    ) : (
                      <FaPlane className={styles.awayIcon} title="U gostima" />
                    )}
                    <span className={styles.opponentName}>vs {match.opponent}</span>
                  </div>
                  
                  <div className={styles.score}>
                    {match.home_score !== null && match.away_score !== null ? (
                      <span className={styles.scoreText}>
                        {match.home_score} - {match.away_score}
                      </span>
                    ) : (
                      <span className={styles.noScore}>N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hasMoreRecent && (
              <button 
                className={styles.showMoreBtn}
                onClick={toggleShowAllRecent}
              >
                {showAllRecent ? (
                  <>
                    <FaChevronUp className={styles.chevronIcon} />
                    Prikaži manje
                  </>
                ) : (
                  <>
                    <FaChevronDown className={styles.chevronIcon} />
                    Vidi više
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sledeće utakmice */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <FaCalendarAlt className={styles.sectionIcon} />
          Sledeće utakmice
        </h4>
        {upcomingMatches.length > 0 ? (
          <div className={styles.matchesList}>
            {displayedUpcomingMatches.map((match, index) => (
              <div key={match.match_id} className={styles.matchItem}>
                <div className={styles.matchHeader}>
                  <div className={styles.matchInfo}>
                    <span className={styles.gameweek}>Kolo {match.gameweek}</span>
                    <span className={styles.date}>{formatDate(match.date)}</span>
                    <span className={styles.time}>{formatTime(match.date)}</span>
                  </div>
                </div>
                
                <div className={styles.matchDetails}>
                  <div className={styles.opponent}>
                    {match.is_home ? (
                      <FaHome className={styles.homeIcon} title="Kod kuće" />
                    ) : (
                      <FaPlane className={styles.awayIcon} title="U gostima" />
                    )}
                    <span className={styles.opponentName}>vs {match.opponent}</span>
                  </div>
                  
                  <div className={styles.stadium}>
                    <span className={styles.stadiumText}>{match.stadium}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMoreUpcoming && (
              <button 
                className={styles.showMoreBtn}
                onClick={toggleShowAllUpcoming}
              >
                {showAllUpcoming ? (
                  <>
                    <FaChevronUp className={styles.chevronIcon} />
                    Prikaži manje
                  </>
                ) : (
                  <>
                    <FaChevronDown className={styles.chevronIcon} />
                    Vidi više
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className={styles.noMatches}>
            <span>Nema zakazanih utakmica</span>
          </div>
        )}
      </div>

      {/* Poruka ako nema utakmica */}
      {recentMatches.length === 0 && upcomingMatches.length === 0 && (
        <div className={styles.noMatches}>
          <span>Nema dostupnih podataka o utakmicama</span>
        </div>
      )}
    </div>
  )
}
