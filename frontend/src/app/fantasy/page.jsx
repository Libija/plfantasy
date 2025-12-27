"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaTrophy, FaUsers, FaExchangeAlt, FaChartLine, FaHistory, FaCog, FaCrown } from "react-icons/fa"
import styles from "../../styles/FantasyDashboard.module.css"
import useAuth from "../../hooks/use-auth"

export default function FantasyDashboard() {
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false)
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState(false)
  const [leagueName, setLeagueName] = useState("")
  const [leagueCode, setLeagueCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [fantasyTeam, setFantasyTeam] = useState(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, isLoggedIn, loading: authLoading } = useAuth()
  const [userResults, setUserResults] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [favoriteClubsStats, setFavoriteClubsStats] = useState([])
  const [bestTeam, setBestTeam] = useState(null)
  const [clubRank, setClubRank] = useState(null)

  useEffect(() => {
    // Ako se još učitava auth, ne radi ništa
    if (authLoading) {
      return
    }

    // Ako korisnik nije ulogovan, preusmjeri na login
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    const loadFantasyTeam = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
        
        if (!res.ok) {
          throw new Error("Greška pri dohvatu fantasy tima")
        }
        
        const teams = await res.json()
        
        if (teams.length === 0) {
          // Korisnik nema fantasy tim, preusmjeri na kreiranje
          router.push("/fantasy/create-team")
          return
        }
        
        // Korisnik ima tim, postavi prvi tim kao aktivan
        setFantasyTeam(teams[0])
      } catch (err) {
        console.error("Greška pri dohvatu fantasy tima:", err)
        setError("Greška pri dohvatu fantasy tima!")
      } finally {
        setLoading(false)
      }
    }

    loadFantasyTeam()

    // Slušaj custom event za osvježavanje fantasy tima
    const onFantasyTeamChanged = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
        
        if (!res.ok) {
          throw new Error("Greška pri dohvatu fantasy tima")
        }
        
        const teams = await res.json()
        
        if (teams.length === 0) {
          // Korisnik nema fantasy tim, preusmjeri na kreiranje
          router.push("/fantasy/create-team")
          return
        }
        
        // Korisnik ima tim, postavi prvi tim kao aktivan
        setFantasyTeam(teams[0])
      } catch (err) {
        console.error("Greška pri dohvatu fantasy tima:", err)
        setError("Greška pri dohvatu fantasy tima!")
      } finally {
        setLoading(false)
      }
    }
    
    window.addEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    
    return () => {
      window.removeEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    }
  }, [authLoading, isLoggedIn, user, router])

  useEffect(() => {
    if (authLoading || !isLoggedIn) return
    const fetchResultsAndLeaderboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const [resultsRes, leaderboardRes] = await Promise.all([
          fetch(`${apiUrl}/fantasy/results/${user.id}`),
          fetch(`${apiUrl}/fantasy/leaderboard`)
        ])
        const results = resultsRes.ok ? await resultsRes.json() : []
        const leaderboardData = leaderboardRes.ok ? await leaderboardRes.json() : []
        setUserResults(results)
        setLeaderboard(leaderboardData)
        
        // Dohvati favorite clubs stats odvojeno
        try {
          const favoriteClubsRes = await fetch(`${apiUrl}/fantasy/favorite-clubs-stats`)
          if (favoriteClubsRes.ok) {
            const favoriteClubsData = await favoriteClubsRes.json()
            setFavoriteClubsStats(favoriteClubsData.stats || [])
          }
        } catch (err) {
          console.error("Greška pri dohvatu favorite clubs stats:", err)
          setFavoriteClubsStats([])
        }
        
        // Dohvati najbolji tim kola
        try {
          const bestTeamRes = await fetch(`${apiUrl}/gameweek-teams/best-team/last-gameweek`)
          if (bestTeamRes.ok) {
            const bestTeamData = await bestTeamRes.json()
            setBestTeam(bestTeamData)
          } else {
            // Ako nema završenih kola ili timova, setBestTeam ostaje null
            setBestTeam(null)
          }
        } catch (err) {
          console.error("Greška pri dohvatu najboljeg tima:", err)
          setBestTeam(null)
        }
        
        // Dohvati rank po klubu (ako korisnik ima favorite_club_id)
        if (fantasyTeam?.favorite_club_id !== undefined && fantasyTeam?.favorite_club_id !== null) {
          try {
            const clubRankRes = await fetch(`${apiUrl}/fantasy/club-rank/${fantasyTeam.favorite_club_id}?user_id=${user.id}`)
            if (clubRankRes.ok) {
              const clubRankData = await clubRankRes.json()
              setClubRank(clubRankData)
            }
          } catch (err) {
            console.error("Greška pri dohvatu ranka po klubu:", err)
          }
        } else if (fantasyTeam?.favorite_club_id === null) {
          // Fan cijele lige - koristi club_id=0
          try {
            const clubRankRes = await fetch(`${apiUrl}/fantasy/club-rank/0?user_id=${user.id}`)
            if (clubRankRes.ok) {
              const clubRankData = await clubRankRes.json()
              setClubRank(clubRankData)
            }
          } catch (err) {
            console.error("Greška pri dohvatu ranka po klubu:", err)
          }
        }
      } catch (err) {
        console.error("Greška pri dohvatu rezultata ili leaderboarda:", err)
      }
    }
    fetchResultsAndLeaderboard()
  }, [authLoading, isLoggedIn, user, fantasyTeam])

  // Pravi podaci za dashboard
  let teamStats = {
    name: fantasyTeam?.name || "",
    points: 0,
    rank: 0,
    totalPlayers: leaderboard.length,
    value: 0,
    lastWeekPoints: 0,
  }
  let top3Players = []
  if (userResults && userResults.length > 0) {
    // Ukupni bodovi
    teamStats.points = userResults.reduce((acc, gw) => acc + (gw.total_points || 0), 0)
    // Zadnji snapshot (zadnje kolo)
    const lastSnapshot = userResults.reduce((a, b) => (a.gameweek_number > b.gameweek_number ? a : b))
    // Vrijednost tima (suma cijena igrača iz zadnjeg kola)
    if (lastSnapshot && lastSnapshot.players) {
      teamStats.value = lastSnapshot.players.reduce((acc, p) => acc + (p.price || 0), 0).toFixed(2)
      teamStats.lastWeekPoints = lastSnapshot.total_points
      // Top 3 igrača po poenima iz prošlog kola (iz tvoje ekipe)
      top3Players = [...lastSnapshot.players]
        .filter(p => !p.is_bench)
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
    }
    // Globalni rank
    const myEntry = leaderboard.find(l => l.user_id === user.id)
    if (myEntry) {
      teamStats.rank = myEntry.rank
    }
  }

  const [leagues, setLeagues] = useState([])
  const [loadingLeagues, setLoadingLeagues] = useState(false)

  // Dohvati lige korisnika
  useEffect(() => {
    if (authLoading || !isLoggedIn || !user) return
    
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/fantasy/leagues/my-leagues?user_id=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setLeagues(data)
        }
      } catch (err) {
        console.error("Greška pri dohvatu liga:", err)
      } finally {
        setLoadingLeagues(false)
      }
    }
    
    fetchLeagues()
  }, [authLoading, isLoggedIn, user])

  const handleCreateLeague = async (e) => {
    e.preventDefault()
    if (!user) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/fantasy/leagues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leagueName.trim(),
          creator_id: user.id
        })
      })
      
      if (!res.ok) {
        const error = await res.json()
        alert(error.detail || "Greška pri kreiranju lige!")
        return
      }
      
      const createdLeague = await res.json()
      setLeagueName("")
      setShowCreateLeagueModal(false)
      
      // Osveži listu liga
      const leaguesRes = await fetch(`${apiUrl}/fantasy/leagues/my-leagues?user_id=${user.id}`)
      if (leaguesRes.ok) {
        const data = await leaguesRes.json()
        setLeagues(data)
      }
    } catch (err) {
      console.error("Greška pri kreiranju lige:", err)
      alert("Greška pri kreiranju lige!")
    }
  }

  const handleJoinLeague = async (e) => {
    e.preventDefault()
    if (!user) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/fantasy/leagues/join?user_id=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: leagueCode.trim().toUpperCase()
        })
      })
      
      if (!res.ok) {
        const error = await res.json()
        alert(error.detail || "Greška pri pridruživanju ligi!")
        return
      }
      
      const joinedLeague = await res.json()
      setLeagueCode("")
      setShowJoinLeagueModal(false)
      
      // Osveži listu liga
      const leaguesRes = await fetch(`${apiUrl}/fantasy/leagues/my-leagues?user_id=${user.id}`)
      if (leaguesRes.ok) {
        const data = await leaguesRes.json()
        setLeagues(data)
      }
    } catch (err) {
      console.error("Greška pri pridruživanju ligi:", err)
      alert("Greška pri pridruživanju ligi!")
    }
  }

  // Prikaži loading dok se provjerava tim
  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Provjeravam fantasy tim...</p>
        </div>
      </div>
    )
  }

  // Prikaži error ako je došlo do greške
  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => window.location.reload()}>Pokušaj ponovo</button>
        </div>
      </div>
    )
  }

  // Ako nema fantasy tima, neće se prikazati jer će se preusmjeriti
  if (!fantasyTeam) {
    return null
  }

  return (
    <>
      <Head>
        <title>Fantasy Dashboard | PLKutak</title>
        <meta name="description" content="Fantasy fudbal Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div className={styles.teamInfo}>
            <h1 className={styles.teamName}>{teamStats.name}</h1>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{teamStats.points}</span>
                <span className={styles.statLabel}>Ukupno bodova</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {teamStats.rank} <span className={styles.statSubtext}>/ {teamStats.totalPlayers}</span>
                </span>
                <span className={styles.statLabel}>Globalni rang</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{teamStats.value}M</span>
                <span className={styles.statLabel}>Vrijednost tima</span>
              </div>
            </div>
          </div>

          <div className={styles.weeklyPerformance}>
            <h3>Prošla sedmica</h3>
            <div className={styles.weeklyStats}>
              <div className={styles.weeklyStatItem}>
                <span className={styles.weeklyStatValue}>{teamStats.lastWeekPoints}</span>
                <span className={styles.weeklyStatLabel}>Bodova</span>
              </div>
             
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.mainSection}>
            <div className={styles.quickActions}>
              <Link href="/fantasy/transfers" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <FaExchangeAlt />
                </div>
                <div className={styles.actionContent}>
                  <h3>Transferi</h3>
                  <p>Upravljaj svojim timom</p>
                </div>
              </Link>
              <Link href="/fantasy/results" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.actionContent}>
                  <h3>Rezultati</h3>
                  <p>Pregled rezultata tima</p>
                </div>
              </Link>
              {bestTeam && (
                <Link href="/fantasy/best-team" className={styles.actionCard}>
                  <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)' }}>
                    <FaCrown />
                  </div>
                  <div className={styles.actionContent}>
                    <h3>Najbolji Tim Kola</h3>
                    <p>{bestTeam.username} - {bestTeam.formation} - {bestTeam.total_points} pts</p>
                  </div>
                </Link>
              )}
            </div>
            {/* Uklonjene sekcije za historiju i postavke */}
          </div>
          <div className={styles.sideSection}>
            <div className={styles.globalRanking}>
              <div className={styles.sectionHeader}>
                <h2>Top 3 igrača prošle sedmice</h2>
              </div>
              <div className={styles.rankingList}>
                {top3Players.map((player, idx) => (
                  <div key={player.player_id} className={styles.rankingItem}>
                    <div className={styles.rankingPosition}>{idx + 1}</div>
                    <div className={styles.rankingInfo}>
                      <div className={styles.rankingName}>{player.player_name}</div>
                      <div className={styles.rankingTeam}>{player.position}</div>
                    </div>
                    <div className={styles.rankingPoints}>{player.points} pts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank po klubu */}
            {clubRank && clubRank.total_fans > 0 && (
              <div className={styles.globalRanking} style={{ marginTop: '20px' }}>
                <div className={styles.sectionHeader}>
                  <h2>Rank u odnosu na fanove {clubRank.club_name}</h2>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    #{clubRank.user_rank || '?'}
                  </div>
                  <div style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                    od {clubRank.total_fans} fanova
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {clubRank.user_points} bodova
                  </div>
                </div>
              </div>
            )}

            {/* Favorite Clubs Stats - mala sekcija */}
            {favoriteClubsStats.length > 0 && (
              <div className={styles.globalRanking} style={{ marginTop: '20px' }}>
                <div className={styles.sectionHeader}>
                  <h2>Omiljeni klubovi fanova</h2>
                </div>
                <div className={styles.rankingList}>
                  {favoriteClubsStats.slice(0, 3).map((stat, idx) => (
                    <div key={stat.club_name} className={styles.rankingItem}>
                      <div className={styles.rankingPosition}>{idx + 1}</div>
                      <div className={styles.rankingInfo}>
                        <div className={styles.rankingName}>{stat.club_name}</div>
                      </div>
                      <div className={styles.rankingPoints}>{stat.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lige sekcija */}
            <div className={styles.globalRanking} style={{ marginTop: '20px' }}>
              <div className={styles.sectionHeader}>
                <h2>Moje lige</h2>
                <div className={styles.leagueActions}>
                  <button 
                    className={styles.createLeagueBtn}
                    onClick={() => setShowCreateLeagueModal(true)}
                  >
                    <FaTrophy /> Kreiraj
                  </button>
                  <button 
                    className={styles.joinLeagueBtn}
                    onClick={() => setShowJoinLeagueModal(true)}
                  >
                    <FaUsers /> Pridruži se
                  </button>
                </div>
              </div>
              {loadingLeagues ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  Učitavanje liga...
                </div>
              ) : leagues.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  Niste član nijedne lige. Kreirajte novu ili se pridružite postojećoj!
                </div>
              ) : (
                <div className={styles.leaguesList}>
                  {leagues.map((league) => (
                    <Link 
                      key={league.id} 
                      href={`/fantasy/league/${league.id}`}
                      className={styles.leagueCard}
                    >
                      <div>
                        <div className={styles.leagueName}>{league.name}</div>
                        <div className={styles.leagueStats}>
                          <span className={styles.leagueStat}>
                            <FaUsers /> {league.member_count} članova
                          </span>
                          <span className={styles.leagueStat}>
                            Kod: {league.code}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Create League Modal */}
        {showCreateLeagueModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Kreiraj novu ligu</h3>
                <button className={styles.closeButton} onClick={() => setShowCreateLeagueModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateLeague} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="leagueName">Naziv lige</label>
                  <input
                    type="text"
                    id="leagueName"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    placeholder="Unesite naziv lige"
                    required
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowCreateLeagueModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit" className={styles.createButton}>
                    Kreiraj ligu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join League Modal */}
        {showJoinLeagueModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Pridruži se ligi</h3>
                <button className={styles.closeButton} onClick={() => setShowJoinLeagueModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleJoinLeague} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="leagueCode">Kod lige</label>
                  <input
                    type="text"
                    id="leagueCode"
                    value={leagueCode}
                    onChange={(e) => setLeagueCode(e.target.value)}
                    placeholder="Unesite kod lige"
                    required
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowJoinLeagueModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit" className={styles.joinButton}>
                    Pridruži se
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
