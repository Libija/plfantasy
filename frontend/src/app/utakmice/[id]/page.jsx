"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "../../../styles/UtakmiceDetalji.module.css"

export default function UtakmiceDetalji() {
  const params = useParams()
  const id = params.id
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)

  // State za podatke
  const [match, setMatch] = useState(null)
  const [events, setEvents] = useState([])
  const [lineups, setLineups] = useState([])
  const [statistics, setStatistics] = useState([])
  const [substitutions, setSubstitutions] = useState([])
  const [h2hMatches, setH2hMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchMatchData()
  }, [id])

  useEffect(() => {
    if (match) {
      fetchMatchDetails()
    }
  }, [match])

  const fetchMatchData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/matches/${id}/detailed`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      } else {
        console.error('Greška pri učitavanju utakmice')
      }
    } catch (error) {
      console.error('Greška pri učitavanju utakmice:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchDetails = async () => {
    if (!match) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    try {
      // Fetch događaje
      const eventsResponse = await fetch(`${apiUrl}/matchevents/match/${id}`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }

      // Fetch postave
      const lineupsResponse = await fetch(`${apiUrl}/match-lineups/match/${id}`)
      if (lineupsResponse.ok) {
        const lineupsData = await lineupsResponse.json()
        console.log('Lineups data received:', lineupsData)
        setLineups(lineupsData)
      } else {
        console.error('Lineups response not ok:', lineupsResponse.status, lineupsResponse.statusText)
      }

      // Fetch sve igrače kluba
      await fetchAllClubPlayers()

      // Fetch statistike (samo za završene utakmice)
      if (match.status === 'completed') {
        const statsResponse = await fetch(`${apiUrl}/match-statistics/match/${id}`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStatistics(statsData)
        }

        const subsResponse = await fetch(`${apiUrl}/match-substitutions/match/${id}`)
        if (subsResponse.ok) {
          const subsData = await subsResponse.json()
          setSubstitutions(subsData)
        }

        // Fetch H2H utakmice
        fetchH2HMatches()
      }
    } catch (error) {
      console.error('Greška pri učitavanju detalja utakmice:', error)
    }
  }

  const fetchH2HMatches = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      // Dohvati sve utakmice između ova dva kluba
      const response = await fetch(`${apiUrl}/matches?home_club_id=${match.home_club_id}&away_club_id=${match.away_club_id}`)
      if (response.ok) {
        const data = await response.json()
        // Filtriraj samo završene utakmice i sortiraj po datumu
        const completedMatches = data
          .filter(m => m.status === 'completed' && m.id !== match.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5) // Zadrži samo zadnjih 5
        setH2hMatches(completedMatches)
      }
    } catch (error) {
      console.error('Greška pri učitavanju H2H utakmica:', error)
    }
  }

  const fetchAllClubPlayers = async () => {
    if (!match) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    try {
      // Dohvati sve igrače za oba kluba
      const [homePlayersResponse, awayPlayersResponse] = await Promise.all([
        fetch(`${apiUrl}/players?club_id=${match.home_club_id}`),
        fetch(`${apiUrl}/players?club_id=${match.away_club_id}`)
      ])

      const homePlayers = homePlayersResponse.ok ? await homePlayersResponse.json() : []
      const awayPlayers = awayPlayersResponse.ok ? await awayPlayersResponse.json() : []

      console.log('Home club players:', homePlayers)
      console.log('Away club players:', awayPlayers)

      setAllClubPlayers({
        [match.home_club_id]: homePlayers,
        [match.away_club_id]: awayPlayers
      })
    } catch (error) {
      console.error('Greška pri učitavanju igrača kluba:', error)
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

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Zakazana'
      case 'in_progress': return 'U toku'
      case 'completed': return 'Završena'
      default: return status
    }
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'goal': return '⚽'
      case 'yellow': return '🟨'
      case 'red': return '🟥'
      case 'own_goal': return '⚽'
      case 'penalty_saved': return '🧤'
      case 'penalty_missed': return '❌'
      case 'substitution': return '🔄'
      default: return '⚽'
    }
  }

  const getEventText = (event) => {
    switch (event.event_type) {
      case 'goal': return `${event.player_name} - Gol`
      case 'yellow': return `${event.player_name} - Žuti karton`
      case 'red': return `${event.player_name} - Crveni karton`
      case 'own_goal': return `${event.player_name} - Autogol`
      case 'penalty_saved': return `${event.player_name} - Odbranjen penal`
      case 'penalty_missed': return `${event.player_name} - Propušten penal`
      case 'substitution': return `Izmjena: ${event.player_name}`
      default: return `${event.player_name} - ${event.event_type}`
    }
  }

  const getLineupsByClub = (clubId) => {
    return lineups.filter(l => l.club_id === clubId)
  }

  const getStartingLineup = (clubId) => {
    return getLineupsByClub(clubId).filter(l => l.lineup_type === 'starting')
  }

  const getSubstitutes = (clubId) => {
    // Klupa = svi ostali igrači kluba koji nisu u prvih 11
    const allClubPlayersList = allClubPlayers[clubId] || []
    const startingPlayers = getStartingLineup(clubId)
    
    // Dohvati ID-ove igrača iz prvih 11
    const startingPlayerIds = startingPlayers.map(p => p.player_id)
    
    // Klupa = svi igrači kluba koji nisu u prvih 11
    const substitutePlayers = allClubPlayersList.filter(p => !startingPlayerIds.includes(p.id))
    
    console.log(`Substitutes for club ${clubId}:`, substitutePlayers)
    return substitutePlayers
  }

  const getStatisticsByClub = (clubId) => {
    return statistics.find(s => s.club_id === clubId)
  }

  const getSubstitutionsByClub = (clubId) => {
    return substitutions.filter(s => s.club_id === clubId)
  }

  const getAllPlayersForClub = (clubId) => {
    return lineups.filter(l => l.club_id === clubId)
  }

  const [allClubPlayers, setAllClubPlayers] = useState({})

  const getUnusedPlayers = (clubId) => {
    // Ostali igrači = svi igrači kluba koji nisu ni u prvih 11 ni na klupi
    // Ali pošto je klupa = svi ostali igrači kluba, ova sekcija će biti prazna
    return []
  }

  const isPlayerSubstituted = (playerId, clubId) => {
    const clubSubstitutions = getSubstitutionsByClub(clubId)
    return clubSubstitutions.some(sub => 
      sub.player_in_id === playerId || sub.player_out_id === playerId
    )
  }

  const getSubstitutionInfo = (playerId, clubId) => {
    const clubSubstitutions = getSubstitutionsByClub(clubId)
    const substitution = clubSubstitutions.find(sub => 
      sub.player_in_id === playerId || sub.player_out_id === playerId
    )
    
    if (!substitution) return null
    
    if (substitution.player_in_id === playerId) {
      return { type: 'in', minute: substitution.minute, replaced: substitution.player_out_name }
    } else {
      return { type: 'out', minute: substitution.minute, replacedBy: substitution.player_in_name }
    }
  }

  const PlayerItem = ({ player, clubId, showSubstitutionInfo = false, isUnusedPlayer = false }) => {
    const substitutionInfo = showSubstitutionInfo ? getSubstitutionInfo(player.player_id || player.id, clubId) : null
    const isSubstituted = isPlayerSubstituted(player.player_id || player.id, clubId)
    
    return (
      <li className={`${styles.player} ${isSubstituted ? styles.substitutedPlayer : ''} ${isUnusedPlayer ? styles.unusedPlayer : ''}`}>
        <span className={styles.playerNumber}>{player.shirt_number || player.number || 'N/A'}</span>
        <span className={styles.playerName}>{player.player_name || player.name}</span>
        <span className={styles.playerPosition}>{player.position || 'N/A'}</span>
        {substitutionInfo && (
          <span className={`${styles.substitutionBadge} ${styles[substitutionInfo.type]}`}>
            {substitutionInfo.type === 'in' ? '🔄' : '🔄'} {substitutionInfo.minute}'
          </span>
        )}
      </li>
    )
  }

  const getAllTimelineEvents = () => {
    const allEvents = []
    
    // Dodaj događaje
    events.forEach(event => {
      allEvents.push({
        ...event,
        type: 'event',
        minute: event.minute || 0
      })
    })
    
    // Dodaj izmjene
    substitutions.forEach(sub => {
      allEvents.push({
        ...sub,
        type: 'substitution',
        minute: sub.minute || 0,
        event_type: 'substitution',
        player_name: `${sub.player_out_name} → ${sub.player_in_name}`,
        club_id: sub.club_id
      })
    })
    
    // Sortiraj po minuti
    return allEvents.sort((a, b) => a.minute - b.minute)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Učitavanje utakmice...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Utakmica nije pronađena</div>
      </div>
    )
  }

  const isCompleted = match.status === 'completed'
  const homeStats = getStatisticsByClub(match.home_club_id)
  const awayStats = getStatisticsByClub(match.away_club_id)

  return (
    <>
      <Head>
        <title>{match.home_club?.name} vs {match.away_club?.name} | PLKutak</title>
        <meta name="description" content={`Detalji utakmice ${match.home_club?.name} vs ${match.away_club?.name}`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/utakmice" className={styles.backButton}>
            ← Nazad na utakmice
          </Link>
        </div>

        <div className={styles.matchInfo}>
          <div className={styles.matchTeams}>
            <div className={styles.teamHome}>
              <div className={styles.teamLogo}>
                {match.home_club?.logo_url ? (
                  <img src={match.home_club.logo_url} alt={match.home_club.name} />
                ) : (
                  <div className={styles.placeholderLogo}>{match.home_club?.name?.charAt(0)}</div>
                )}
              </div>
              <div className={styles.teamName}>{match.home_club?.name}</div>
            </div>

            <div className={styles.scoreContainer}>
              {isCompleted ? (
                <div className={styles.scoreRow}>
                  <div className={styles.score}>{match.home_score}</div>
                  <div className={styles.separator}>-</div>
                  <div className={styles.score}>{match.away_score}</div>
                </div>
              ) : (
                <div className={styles.scheduledText}>VS</div>
              )}
              <div className={`${styles.matchStatus} ${styles[match.status]}`}>{getStatusText(match.status)}</div>
            </div>

            <div className={styles.teamAway}>
              <div className={styles.teamName}>{match.away_club?.name}</div>
              <div className={styles.teamLogo}>
                {match.away_club?.logo_url ? (
                  <img src={match.away_club.logo_url} alt={match.away_club.name} />
                ) : (
                  <div className={styles.placeholderLogo}>{match.away_club?.name?.charAt(0)}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.matchDetails}>
            <div className={styles.matchDetailsContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Datum</div>
                  <div className={styles.detailValue}>{formatDate(match.date)}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Vrijeme</div>
                  <div className={styles.detailValue}>{formatTime(match.date)}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Stadion</div>
                  <div className={styles.detailValue}>{match.stadium}</div>
                </div>
                {match.referee && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>Sudac</div>
                    <div className={styles.detailValue}>{match.referee}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Pregled
          </button>
          {isCompleted && (
            <>
              <button
                className={`${styles.tabButton} ${activeTab === "timeline" ? styles.active : ""}`}
                onClick={() => setActiveTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "lineups" ? styles.active : ""}`}
                onClick={() => setActiveTab("lineups")}
              >
                Sastavi
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "stats" ? styles.active : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                Statistika
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === "h2h" ? styles.active : ""}`}
                onClick={() => setActiveTab("h2h")}
              >
                Head-to-Head
              </button>
            </>
          )}
        </div>

        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.overviewHeader}>
                <h2>Pregled utakmice</h2>
              </div>
              <div className={styles.overviewContent}>
                <p>
                  {isCompleted 
                    ? `Utakmica je završena rezultatom ${match.home_score}:${match.away_score}.`
                    : `Utakmica je zakazana za ${formatDate(match.date)} u ${formatTime(match.date)} na stadionu ${match.stadium}.`
                  }
                </p>
                {!isCompleted && (
                  <div className={styles.scheduledInfo}>
                    <p>Detalji o utakmici će biti dostupni nakon završetka.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "timeline" && isCompleted && (
            <div className={styles.timeline}>
              <div className={styles.timelineHeader}>
                <h2>Timeline</h2>
              </div>
              <div className={styles.timelineContent}>
                {getAllTimelineEvents().length === 0 ? (
                  <p>Nema događaja za prikaz.</p>
                ) : (
                  getAllTimelineEvents().map((event, index) => (
                    <div key={index} className={`${styles.timelineEvent} ${event.club_id === match.home_club_id ? styles.homeEvent : styles.awayEvent} ${event.type === 'substitution' ? styles.substitution : ''}`}>
                      <div className={styles.timelineTime}>{event.minute}'</div>
                      <div className={styles.timelineIcon}>{getEventIcon(event.event_type)}</div>
                      <div className={styles.timelineText}>
                        {getEventText(event)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "lineups" && isCompleted && (
            <div className={styles.lineups}>
              <div className={styles.lineupsHeader}>
                <h2>Sastavi</h2>
              </div>
              <div className={styles.lineupsContent}>
                <div className={styles.teamLineup}>
                  <h3>{match.home_club?.name}</h3>
                  <div className={styles.startingLineup}>
                    <h4>Početni sastav</h4>
                    <ul className={styles.playersList}>
                      {getStartingLineup(match.home_club_id).map((player) => (
                        <PlayerItem key={`home-player-${player.id}`} player={player} clubId={match.home_club_id} showSubstitutionInfo={true} />
                      ))}
                    </ul>
                  </div>
                  <div className={styles.substitutes}>
                    <h4>Klupa</h4>
                    <ul className={styles.playersList}>
                      {getSubstitutes(match.home_club_id).map((player) => (
                        <PlayerItem key={`home-sub-${player.id}`} player={player} clubId={match.home_club_id} showSubstitutionInfo={true} />
                      ))}
                    </ul>
                  </div>
                  
                </div>

                <div className={styles.teamLineup}>
                  <h3>{match.away_club?.name}</h3>
                  <div className={styles.startingLineup}>
                    <h4>Početni sastav</h4>
                    <ul className={styles.playersList}>
                      {getStartingLineup(match.away_club_id).map((player) => (
                        <PlayerItem key={`away-player-${player.id}`} player={player} clubId={match.away_club_id} showSubstitutionInfo={true} />
                      ))}
                    </ul>
                  </div>
                  <div className={styles.substitutes}>
                    <h4>Klupa</h4>
                    <ul className={styles.playersList}>
                      {getSubstitutes(match.away_club_id).map((player) => (
                        <PlayerItem key={`away-sub-${player.id}`} player={player} clubId={match.away_club_id} showSubstitutionInfo={true} />
                      ))}
                    </ul>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && isCompleted && (
            <div className={styles.statistics}>
              <div className={styles.statisticsHeader}>
                <h2>Statistika</h2>
              </div>
              <div className={styles.statsContent}>
                {homeStats && awayStats ? (
                  <>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Posjed lopte</div>
                      <div className={styles.statBars}>
                        <div className={styles.statBarHome} style={{ width: `${homeStats.possession}%` }}>
                          {homeStats.possession}%
                        </div>
                        <div className={styles.statBarAway} style={{ width: `${awayStats.possession}%` }}>
                          {awayStats.possession}%
                        </div>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Udarci</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.shots}</span>
                        <span>{awayStats.shots}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Udarci u okvir</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.shots_on_target}</span>
                        <span>{awayStats.shots_on_target}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Korneri</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.corners}</span>
                        <span>{awayStats.corners}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Prekršaji</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.fouls}</span>
                        <span>{awayStats.fouls}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Žuti kartoni</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.yellow_cards}</span>
                        <span>{awayStats.yellow_cards}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Crveni kartoni</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.red_cards}</span>
                        <span>{awayStats.red_cards}</span>
                      </div>
                    </div>

                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Ofsajdi</div>
                      <div className={styles.statValues}>
                        <span>{homeStats.offsides}</span>
                        <span>{awayStats.offsides}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Statistike nisu dostupne.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "h2h" && isCompleted && (
            <div className={styles.h2h}>
              <div className={styles.h2hHeader}>
                <h2>Head-to-Head</h2>
              </div>
              <div className={styles.h2hContent}>
                {h2hMatches.length > 0 ? (
                  <>
                    <div className={styles.h2hSummary}>
                      <div className={styles.h2hStat}>
                        <span className={styles.h2hTeam}>{match.home_club?.name}</span>
                        <span className={styles.h2hValue}>
                          {h2hMatches.filter(m => 
                            (m.home_club_id === match.home_club_id && m.home_score > m.away_score) ||
                            (m.away_club_id === match.home_club_id && m.away_score > m.home_score)
                          ).length}
                        </span>
                      </div>
                      <div className={styles.h2hStat}>
                        <span className={styles.h2hLabel}>Neriješeno</span>
                        <span className={styles.h2hValue}>
                          {h2hMatches.filter(m => m.home_score === m.away_score).length}
                        </span>
                      </div>
                      <div className={styles.h2hStat}>
                        <span className={styles.h2hTeam}>{match.away_club?.name}</span>
                        <span className={styles.h2hValue}>
                          {h2hMatches.filter(m => 
                            (m.home_club_id === match.away_club_id && m.home_score > m.away_score) ||
                            (m.away_club_id === match.away_club_id && m.away_score > m.home_score)
                          ).length}
                        </span>
                      </div>
                    </div>

                    <div className={styles.h2hMatches}>
                      {h2hMatches.map((game, index) => (
                        <div key={index} className={styles.h2hMatch}>
                          <div className={styles.h2hMatchInfo}>
                            <span className={styles.h2hMatchDate}>{formatDate(game.date)}</span>
                            <span className={styles.h2hMatchCompetition}>Premijer liga BiH</span>
                          </div>
                          <div className={styles.h2hMatchTeams}>
                            <span className={`${styles.h2hMatchTeam} ${game.home_club_id === match.home_club_id ? styles.homeTeam : ""}`}>
                              {game.home_club_name}
                            </span>
                            <span className={styles.h2hMatchScore}>
                              {game.home_score} - {game.away_score}
                            </span>
                            <span className={`${styles.h2hMatchTeam} ${game.away_club_id === match.home_club_id ? styles.homeTeam : ""}`}>
                              {game.away_club_name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Nema prethodnih utakmica između ova dva kluba.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
