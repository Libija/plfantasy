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

  useEffect(() => {
    if (playerId) {
      fetchPlayerMatches()
    }
  }, [playerId])

  const fetchPlayerMatches = async () => {
    setLoading(true)
    setError("")
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Dohvati poslednje utakmice
      const recentResponse = await fetch(`${apiUrl}/players/${playerId}/recent-matches?limit=5`)
      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setRecentMatches(recentData.recent_matches || [])
      }
      
      // Dohvati sledeće utakmice
      const upcomingResponse = await fetch(`${apiUrl}/players/${playerId}/upcoming-matches?limit=3`)
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        setUpcomingMatches(upcomingData.upcoming_matches || [])
      }
      
    } catch (err) {
      console.error("Greška pri dohvatu utakmica:", err)
      setError("Greška pri učitavanju podataka")
    } finally {
      setLoading(false)
    }
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
            
            {recentMatches.length > 3 && (
              <button 
                className={styles.showMoreBtn}
                onClick={() => setShowAllRecent(!showAllRecent)}
              >
                {showAllRecent ? (
                  <>
                    <FaChevronUp className={styles.chevronIcon} />
                    Prikaži manje
                  </>
                ) : (
                  <>
                    <FaChevronDown className={styles.chevronIcon} />
                    Prikaži sve ({recentMatches.length})
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
            
            {upcomingMatches.length > 2 && (
              <button 
                className={styles.showMoreBtn}
                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
              >
                {showAllUpcoming ? (
                  <>
                    <FaChevronUp className={styles.chevronIcon} />
                    Prikaži manje
                  </>
                ) : (
                  <>
                    <FaChevronDown className={styles.chevronIcon} />
                    Prikaži sve ({upcomingMatches.length})
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
