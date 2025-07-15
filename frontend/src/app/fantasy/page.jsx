"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaTrophy, FaUsers, FaExchangeAlt, FaChartLine, FaHistory, FaCog } from "react-icons/fa"
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
      } catch (err) {
        console.error("Greška pri dohvatu rezultata ili leaderboarda:", err)
      }
    }
    fetchResultsAndLeaderboard()
  }, [authLoading, isLoggedIn, user])

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
      // Top 3 igrača po poenima iz prošlog kola
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

  // Simulirani podaci za lige
  const leagues = [
    {
      id: 1,
      name: "Prijatelji iz Sarajeva",
      members: 8,
      rank: 3,
      leader: "Emir H.",
      leaderPoints: 1356,
    },
    {
      id: 2,
      name: "Kolege sa posla",
      members: 12,
      rank: 5,
      leader: "Adnan M.",
      leaderPoints: 1289,
    },
  ]

  // Simulirani podaci za top igrače
  const topPlayers = [
    { rank: 1, name: "Amar K.", teamName: "Sarajevo Šampioni", points: 1567 },
    { rank: 2, name: "Mirza H.", teamName: "Željo Zauvijek", points: 1543 },
    { rank: 3, name: "Edin D.", teamName: "Zmajevi BiH", points: 1521 },
    { rank: 4, name: "Haris M.", teamName: "Bordo Armija", points: 1498 },
    { rank: 5, name: "Kenan P.", teamName: "Tuzla City Fans", points: 1476 },
  ]

  const handleCreateLeague = (e) => {
    e.preventDefault()
    // Ovdje bi se implementirala logika za kreiranje lige
    alert(`Liga "${leagueName}" je uspješno kreirana!`)
    setLeagueName("")
    setShowCreateLeagueModal(false)
  }

  const handleJoinLeague = (e) => {
    e.preventDefault()
    // Ovdje bi se implementirala logika za pridruživanje ligi
    alert(`Uspješno ste se pridružili ligi sa kodom: ${leagueCode}`)
    setLeagueCode("")
    setShowJoinLeagueModal(false)
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
