"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaTrophy, FaUsers, FaExchangeAlt, FaChartLine, FaHistory, FaCog } from "react-icons/fa"
import styles from "../../styles/FantasyDashboard.module.css"

export default function FantasyDashboard() {
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false)
  const [showJoinLeagueModal, setShowJoinLeagueModal] = useState(false)
  const [leagueName, setLeagueName] = useState("")
  const [leagueCode, setLeagueCode] = useState("")

  // Simulirani podaci za fantasy tim
  const fantasyTeam = {
    name: "Bordo Mašina",
    points: 1245,
    rank: 342,
    totalPlayers: 5782,
    value: 102.5,
    lastWeekPoints: 78,
    lastWeekRank: 356,
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

  return (
    <>
      <Head>
        <title>Fantasy Dashboard | PLKutak</title>
        <meta name="description" content="Fantasy fudbal Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div className={styles.teamInfo}>
            <h1 className={styles.teamName}>{fantasyTeam.name}</h1>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{fantasyTeam.points}</span>
                <span className={styles.statLabel}>Ukupno bodova</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {fantasyTeam.rank} <span className={styles.statSubtext}>/ {fantasyTeam.totalPlayers}</span>
                </span>
                <span className={styles.statLabel}>Globalni rang</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{fantasyTeam.value}M</span>
                <span className={styles.statLabel}>Vrijednost tima</span>
              </div>
            </div>
          </div>

          <div className={styles.weeklyPerformance}>
            <h3>Prošla sedmica</h3>
            <div className={styles.weeklyStats}>
              <div className={styles.weeklyStatItem}>
                <span className={styles.weeklyStatValue}>{fantasyTeam.lastWeekPoints}</span>
                <span className={styles.weeklyStatLabel}>Bodova</span>
              </div>
              <div className={styles.weeklyStatItem}>
                <span className={styles.weeklyStatValue}>{fantasyTeam.lastWeekRank}</span>
                <span className={styles.weeklyStatLabel}>Rang</span>
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
              <Link href="/fantasy/points" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.actionContent}>
                  <h3>Bodovi</h3>
                  <p>Pregled bodova tima</p>
                </div>
              </Link>
              <Link href="/fantasy/history" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <FaHistory />
                </div>
                <div className={styles.actionContent}>
                  <h3>Historija</h3>
                  <p>Pregled prethodnih sedmica</p>
                </div>
              </Link>
              <Link href="/fantasy/settings" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <FaCog />
                </div>
                <div className={styles.actionContent}>
                  <h3>Postavke</h3>
                  <p>Uredi postavke tima</p>
                </div>
              </Link>
            </div>

            <div className={styles.leaguesSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FaUsers /> Moje lige
                </h2>
                <div className={styles.leagueActions}>
                  <button className={styles.createLeagueBtn} onClick={() => setShowCreateLeagueModal(true)}>
                    Kreiraj ligu
                  </button>
                  <button className={styles.joinLeagueBtn} onClick={() => setShowJoinLeagueModal(true)}>
                    Pridruži se ligi
                  </button>
                </div>
              </div>

              <div className={styles.leaguesList}>
                {leagues.map((league) => (
                  <div key={league.id} className={styles.leagueCard}>
                    <div className={styles.leagueInfo}>
                      <h3 className={styles.leagueName}>{league.name}</h3>
                      <div className={styles.leagueStats}>
                        <span className={styles.leagueStat}>
                          <strong>Članova:</strong> {league.members}
                        </span>
                        <span className={styles.leagueStat}>
                          <strong>Vaš rang:</strong> {league.rank}
                        </span>
                      </div>
                    </div>
                    <div className={styles.leagueLeader}>
                      <div className={styles.leaderLabel}>Vodeći</div>
                      <div className={styles.leaderName}>{league.leader}</div>
                      <div className={styles.leaderPoints}>{league.leaderPoints} bodova</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sideSection}>
            <div className={styles.globalRanking}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FaTrophy /> Top 5 igrača
                </h2>
              </div>
              <div className={styles.rankingList}>
                {topPlayers.map((player) => (
                  <div key={player.rank} className={styles.rankingItem}>
                    <div className={styles.rankingPosition}>{player.rank}</div>
                    <div className={styles.rankingInfo}>
                      <div className={styles.rankingName}>{player.name}</div>
                      <div className={styles.rankingTeam}>{player.teamName}</div>
                    </div>
                    <div className={styles.rankingPoints}>{player.points}</div>
                  </div>
                ))}
              </div>
              <Link href="/fantasy/rankings" className={styles.viewAllLink}>
                Pogledaj kompletnu tabelu
              </Link>
            </div>

            <div className={styles.upcomingFixtures}>
              <div className={styles.sectionHeader}>
                <h2>Nadolazeće utakmice</h2>
              </div>
              <div className={styles.fixturesList}>
                <div className={styles.fixtureItem}>
                  <div className={styles.fixtureDate}>Sub, 25. Maj</div>
                  <div className={styles.fixtureTeams}>
                    <span>Sarajevo</span>
                    <span className={styles.fixtureVs}>vs</span>
                    <span>Željezničar</span>
                  </div>
                  <div className={styles.fixtureTime}>20:00</div>
                </div>
                <div className={styles.fixtureItem}>
                  <div className={styles.fixtureDate}>Ned, 26. Maj</div>
                  <div className={styles.fixtureTeams}>
                    <span>Borac</span>
                    <span className={styles.fixtureVs}>vs</span>
                    <span>Tuzla City</span>
                  </div>
                  <div className={styles.fixtureTime}>18:00</div>
                </div>
                <div className={styles.fixtureItem}>
                  <div className={styles.fixtureDate}>Ned, 26. Maj</div>
                  <div className={styles.fixtureTeams}>
                    <span>Zrinjski</span>
                    <span className={styles.fixtureVs}>vs</span>
                    <span>Široki Brijeg</span>
                  </div>
                  <div className={styles.fixtureTime}>20:00</div>
                </div>
              </div>
              <Link href="/utakmice" className={styles.viewAllLink}>
                Pogledaj sve utakmice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal za kreiranje lige */}
      {showCreateLeagueModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Kreiraj novu ligu</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowCreateLeagueModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <form onSubmit={handleCreateLeague}>
                <div className={styles.formGroup}>
                  <label htmlFor="leagueName">Naziv lige</label>
                  <input
                    type="text"
                    id="leagueName"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    required
                    placeholder="Unesite naziv lige"
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Kreiraj ligu
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal za pridruživanje ligi */}
      {showJoinLeagueModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Pridruži se ligi</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowJoinLeagueModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <form onSubmit={handleJoinLeague}>
                <div className={styles.formGroup}>
                  <label htmlFor="leagueCode">Kod lige</label>
                  <input
                    type="text"
                    id="leagueCode"
                    value={leagueCode}
                    onChange={(e) => setLeagueCode(e.target.value)}
                    required
                    placeholder="Unesite kod lige"
                  />
                </div>
                <button type="submit" className={styles.submitButton}>
                  Pridruži se
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
