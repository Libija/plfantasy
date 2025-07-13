"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Head from "next/head"
import Link from "next/link"
import { FaTrophy, FaArrowLeft, FaCopy, FaCheck, FaUsers, FaChartLine } from "react-icons/fa"
import styles from "../../../../styles/FantasyLeague.module.css"

export default function FantasyLeague() {
  const params = useParams()
  const leagueId = params.id
  const [copiedCode, setCopiedCode] = useState(false)

  // Simulirani podaci za ligu
  const [league, setLeague] = useState({
    id: leagueId,
    name: "Prijatelji iz Sarajeva",
    code: "SAR2024",
    members: 8,
    created: "15. Maj 2024",
    creator: "Emir H.",
  })

  // Simulirani podaci za ranking u ligi
  const [leagueRanking, setLeagueRanking] = useState([
    {
      rank: 1,
      name: "Emir H.",
      teamName: "Sarajevo Legenda",
      points: 1356,
      lastWeekPoints: 89,
      isMe: false,
    },
    {
      rank: 2,
      name: "Adnan M.",
      teamName: "Zmajevi Bosne",
      points: 1298,
      lastWeekPoints: 76,
      isMe: false,
    },
    {
      rank: 3,
      name: "Vi",
      teamName: "Bordo Mašina",
      points: 1245,
      lastWeekPoints: 78,
      isMe: true,
    },
    {
      rank: 4,
      name: "Mirza K.",
      teamName: "Željo Navijač",
      points: 1198,
      lastWeekPoints: 65,
      isMe: false,
    },
    {
      rank: 5,
      name: "Haris D.",
      teamName: "Tuzla United",
      points: 1156,
      lastWeekPoints: 82,
      isMe: false,
    },
    {
      rank: 6,
      name: "Kenan P.",
      teamName: "Borac Fans",
      points: 1134,
      lastWeekPoints: 71,
      isMe: false,
    },
    {
      rank: 7,
      name: "Amar S.",
      teamName: "Zrinjski Tim",
      points: 1089,
      lastWeekPoints: 58,
      isMe: false,
    },
    {
      rank: 8,
      name: "Dino M.",
      teamName: "Široki Brijeg FC",
      points: 1045,
      lastWeekPoints: 63,
      isMe: false,
    },
  ])

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
                  <FaUsers /> {league.members} članova
                </span>
                <span>Kreirana: {league.created}</span>
                <span>Kreator: {league.creator}</span>
              </div>
            </div>
          </div>

          <div className={styles.leagueStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{league.members}</div>
              <div className={styles.statLabel}>Ukupno igrača</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{leagueRanking.find((p) => p.isMe)?.rank || "-"}</div>
              <div className={styles.statLabel}>Vaš rang</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{leagueRanking.find((p) => p.isMe)?.points || 0}</div>
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
              <FaChartLine /> Kolo 24 - Završeno
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
              {leagueRanking.map((player) => (
                <div key={player.rank} className={`${styles.tableRow} ${player.isMe ? styles.myRow : ""}`}>
                  <div className={`${styles.rankColumn} ${getRankClass(player.rank)}`}>
                    <div className={styles.rankBadge}>
                      {player.rank === 1 && <FaTrophy />}
                      {player.rank}
                    </div>
                  </div>
                  <div className={styles.playerColumn}>
                    <div className={styles.playerName}>
                      {player.name}
                      {player.isMe && <span className={styles.youBadge}>Vi</span>}
                    </div>
                  </div>
                  <div className={styles.teamColumn}>
                    <div className={styles.teamName}>{player.teamName}</div>
                  </div>
                  <div className={styles.pointsColumn}>
                    <div className={styles.totalPoints}>{player.points}</div>
                  </div>
                  <div className={styles.weekPointsColumn}>
                    <div className={styles.weekPoints}>
                      {player.lastWeekPoints > 0 ? `+${player.lastWeekPoints}` : player.lastWeekPoints}
                    </div>
                  </div>
                </div>
              ))}
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
