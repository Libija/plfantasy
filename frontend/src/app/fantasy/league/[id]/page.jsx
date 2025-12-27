"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Head from "next/head"
import Link from "next/link"
import { FaTrophy, FaArrowLeft, FaCopy, FaCheck, FaUsers, FaChartLine } from "react-icons/fa"
import styles from "../../../../styles/FantasyLeague.module.css"
import useAuth from "../../../../hooks/use-auth"

export default function FantasyLeague() {
  const params = useParams()
  const leagueId = params.id
  const [copiedCode, setCopiedCode] = useState(false)
  const { user, isLoggedIn, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [league, setLeague] = useState(null)
  const [leagueRanking, setLeagueRanking] = useState([])

  useEffect(() => {
    if (authLoading) return
    
    const fetchLeagueData = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        
        // Dohvati detalje lige
        const leagueRes = await fetch(`${apiUrl}/fantasy/leagues/${leagueId}`)
        if (!leagueRes.ok) {
          throw new Error("Liga nije pronađena")
        }
        const leagueData = await leagueRes.json()
        setLeague(leagueData)
        
        // Dohvati ranking lige
        const user_id = user?.id || null
        const rankingUrl = user_id 
          ? `${apiUrl}/fantasy/leagues/${leagueId}/ranking?user_id=${user_id}`
          : `${apiUrl}/fantasy/leagues/${leagueId}/ranking`
        const rankingRes = await fetch(rankingUrl)
        if (rankingRes.ok) {
          const rankingData = await rankingRes.json()
          setLeagueRanking(rankingData.ranking || [])
        }
      } catch (err) {
        console.error("Greška pri dohvatu podataka lige:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeagueData()
  }, [leagueId, authLoading, user])

  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Učitavanje...</p>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "red" }}>Liga nije pronađena</p>
          <Link href="/fantasy" className={styles.backButton}>
            <FaArrowLeft /> Nazad na Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("bs-BA", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    })
  }

  const myRank = leagueRanking.find((p) => p.is_me)

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  const getRankClass = (rank) => {
    if (rank === 1) return styles.goldRank
    if (rank === 2) return styles.silverRank
    if (rank === 3) return styles.bronzeRank
    return ""
  }

  return (
    <>
      <Head>
        <title>{league.name} - Liga Ranking | PLKutak</title>
        <meta name="description" content={`Fantasy liga ${league.name} - pregled rankinga`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/fantasy" className={styles.backButton}>
            <FaArrowLeft /> Nazad na Dashboard
          </Link>
        </div>

        <div className={styles.leagueHeader}>
          <div className={styles.leagueInfo}>
            <h1 className={styles.leagueName}>{league.name}</h1>
            <div className={styles.leagueDetails}>
              <div className={styles.leagueCode}>
                <span>
                  Kod lige: <strong>{league.code}</strong>
                </span>
                <button className={styles.copyButton} onClick={() => copyToClipboard(league.code)} title="Kopiraj kod">
                  {copiedCode ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              <div className={styles.leagueMeta}>
                <span>
                  <FaUsers /> {league.member_count} članova
                </span>
                <span>Kreirana: {formatDate(league.created_at)}</span>
                <span>Kreator: {league.creator_username || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className={styles.leagueStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{league.member_count}</div>
              <div className={styles.statLabel}>Ukupno igrača</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{myRank?.rank || "-"}</div>
              <div className={styles.statLabel}>Vaš rang</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{myRank?.total_points || 0}</div>
              <div className={styles.statLabel}>Vaši bodovi</div>
            </div>
          </div>
        </div>

        <div className={styles.rankingSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <FaTrophy /> Ranking lige
            </h2>
            <div className={styles.weekInfo}>
              <FaChartLine /> Ukupno {leagueRanking.length} igrača
            </div>
          </div>

          <div className={styles.rankingTable}>
            <div className={styles.tableHeader}>
              <div className={styles.rankColumn}>Rang</div>
              <div className={styles.playerColumn}>Igrač</div>
              <div className={styles.teamColumn}>Tim</div>
              <div className={styles.pointsColumn}>Ukupno</div>
              <div className={styles.weekPointsColumn}>Prošla sedmica</div>
            </div>

            <div className={styles.tableBody}>
              {leagueRanking.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-light)" }}>
                  Nema podataka za prikaz
                </div>
              ) : (
                leagueRanking.map((player) => (
                  <div key={player.user_id} className={`${styles.tableRow} ${player.is_me ? styles.myRow : ""}`}>
                    <div className={`${styles.rankColumn} ${getRankClass(player.rank)}`}>
                      <div className={styles.rankBadge}>
                        {player.rank === 1 && <FaTrophy />}
                        {player.rank}
                      </div>
                    </div>
                    <div className={styles.playerColumn}>
                      <div className={styles.playerName}>
                        {player.username}
                        {player.is_me && <span className={styles.youBadge}>Vi</span>}
                      </div>
                    </div>
                    <div className={styles.teamColumn}>
                      <div className={styles.teamName}>{player.team_name || "N/A"}</div>
                    </div>
                    <div className={styles.pointsColumn}>
                      <div className={styles.totalPoints}>{player.total_points}</div>
                    </div>
                    <div className={styles.weekPointsColumn}>
                      <div className={styles.weekPoints}>
                        {player.last_week_points > 0 ? `+${player.last_week_points}` : player.last_week_points || 0}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.actionsSection}>
          <Link href="/fantasy/transfers" className={styles.actionButton}>
            Upravljaj timom
          </Link>
          <button className={styles.actionButton} onClick={() => copyToClipboard(league.code)}>
            {copiedCode ? "Kopirano!" : "Podijeli kod lige"}
          </button>
        </div>
      </div>
    </>
  )
}
