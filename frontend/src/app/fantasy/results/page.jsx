"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaTrophy, FaChartLine } from "react-icons/fa"
import styles from "../../../styles/FantasyResults.module.css"

export default function FantasyResults() {
  const [selectedRound, setSelectedRound] = useState(15)
  const [viewMode, setViewMode] = useState("my-team") // my-team, all-players

  const rounds = Array.from({ length: 30 }, (_, i) => i + 1)

  const [myTeamResults] = useState([
    { id: 1, name: "Kenan Pirić", position: "GK", team: "Sarajevo", points: 6, price: 8.0, status: "played" },
    { id: 2, name: "Siniša Stevanović", position: "DF", team: "Sarajevo", points: 8, price: 6.0, status: "played" },
    { id: 3, name: "Amar Rahmanović", position: "MF", team: "Sarajevo", points: 12, price: 9.0, status: "played" },
    { id: 4, name: "Benjamin Tatar", position: "FW", team: "Sarajevo", points: 15, price: 10.0, status: "played" },
    { id: 5, name: "Nihad Mujakić", position: "DF", team: "Borac", points: 2, price: 5.0, status: "played" },
    { id: 6, name: "Srđan Grahovac", position: "MF", team: "Borac", points: 7, price: 8.0, status: "played" },
    { id: 7, name: "Stojan Vranješ", position: "FW", team: "Borac", points: 9, price: 9.0, status: "played" },
    { id: 8, name: "Ermin Zec", position: "DF", team: "Željezničar", points: 0, price: 5.0, status: "not-played" },
    { id: 9, name: "Dino Beširović", position: "MF", team: "Željezničar", points: 0, price: 7.0, status: "not-played" },
    {
      id: 10,
      name: "Sulejman Krpić",
      position: "FW",
      team: "Željezničar",
      points: 0,
      price: 8.0,
      status: "not-played",
    },
    { id: 11, name: "Hrvoje Barišić", position: "DF", team: "Zrinjski", points: 5, price: 6.0, status: "played" },
  ])

  const [topPerformers] = useState([
    { id: 17, name: "Benjamin Tatar", position: "FW", team: "Sarajevo", points: 15, reason: "2 gola, 1 asistencija" },
    { id: 11, name: "Amar Rahmanović", position: "MF", team: "Sarajevo", points: 12, reason: "1 gol, 2 asistencije" },
    { id: 18, name: "Stojan Vranješ", position: "FW", team: "Borac", points: 11, reason: "1 gol, 1 asistencija" },
    { id: 1, name: "Kenan Pirić", position: "GK", team: "Sarajevo", points: 10, reason: "Čist list, 3 odbrane" },
    { id: 12, name: "Srđan Grahovac", position: "MF", team: "Borac", points: 9, reason: "1 gol" },
  ])

  const calculateTotalPoints = () => {
    return myTeamResults.reduce((total, player) => total + player.points, 0)
  }

  const getPositionColor = (position) => {
    switch (position) {
      case "GK":
        return "#f39c12"
      case "DF":
        return "#3498db"
      case "MF":
        return "#2ecc71"
      case "FW":
        return "#e74c3c"
      default:
        return "#95a5a6"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "played":
        return "✓"
      case "not-played":
        return "○"
      case "injured":
        return "⚕"
      case "suspended":
        return "⚠"
      default:
        return "○"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "played":
        return "#2ecc71"
      case "not-played":
        return "#95a5a6"
      case "injured":
        return "#e74c3c"
      case "suspended":
        return "#f39c12"
      default:
        return "#95a5a6"
    }
  }

  return (
    <>
      <Head>
        <title>Fantasy Rezultati | PLKutak</title>
        <meta name="description" content="Pregled fantasy rezultata po kolima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <Link href="/fantasy" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <h1 className={styles.title}>Fantasy Rezultati</h1>
        </div>

        <div className={styles.controls}>
          <div className={styles.roundSelector}>
            <label htmlFor="round">Kolo:</label>
            <select
              id="round"
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number.parseInt(e.target.value))}
              className={styles.roundSelect}
            >
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round}. kolo
                </option>
              ))}
            </select>
          </div>

          <div className={styles.viewModeSelector}>
            <button
              className={`${styles.viewModeButton} ${viewMode === "my-team" ? styles.active : ""}`}
              onClick={() => setViewMode("my-team")}
            >
              Moj tim
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === "all-players" ? styles.active : ""}`}
              onClick={() => setViewMode("all-players")}
            >
              Svi igrači
            </button>
          </div>
        </div>

        {viewMode === "my-team" && (
          <div className={styles.myTeamSection}>
            <div className={styles.teamSummary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <FaTrophy />
                </div>
                <div className={styles.summaryContent}>
                  <h3>Ukupno bodova</h3>
                  <div className={styles.summaryValue}>{calculateTotalPoints()}</div>
                  <div className={styles.summarySubtext}>{selectedRound}. kolo</div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.summaryContent}>
                  <h3>Prosječno po igraču</h3>
                  <div className={styles.summaryValue}>
                    {(calculateTotalPoints() / myTeamResults.length).toFixed(1)}
                  </div>
                  <div className={styles.summarySubtext}>bodova</div>
                </div>
              </div>
            </div>

            <div className={styles.playersResults}>
              <h2 className={styles.sectionTitle}>Rezultati vašeg tima - {selectedRound}. kolo</h2>

              <div className={styles.resultsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Igrač</div>
                  <div className={styles.headerCell}>Pozicija</div>
                  <div className={styles.headerCell}>Tim</div>
                  <div className={styles.headerCell}>Status</div>
                  <div className={styles.headerCell}>Bodovi</div>
                  <div className={styles.headerCell}>Cijena</div>
                </div>

                {myTeamResults.map((player) => (
                  <div key={player.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <div className={styles.playerInfo}>
                        <div className={styles.playerName}>{player.name}</div>
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.position} style={{ backgroundColor: getPositionColor(player.position) }}>
                        {player.position}
                      </span>
                    </div>
                    <div className={styles.tableCell}>{player.team}</div>
                    <div className={styles.tableCell}>
                      <span className={styles.status} style={{ color: getStatusColor(player.status) }}>
                        {getStatusIcon(player.status)}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span
                        className={`${styles.points} ${player.points > 8 ? styles.highPoints : player.points < 3 ? styles.lowPoints : ""}`}
                      >
                        {player.points}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.price}>{player.price}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "all-players" && (
          <div className={styles.allPlayersSection}>
            <div className={styles.topPerformers}>
              <h2 className={styles.sectionTitle}>Najbolji igrači {selectedRound}. kola</h2>

              <div className={styles.performersGrid}>
                {topPerformers.map((player, index) => (
                  <div key={player.id} className={styles.performerCard}>
                    <div className={styles.performerRank}>#{index + 1}</div>
                    <div className={styles.performerInfo}>
                      <div className={styles.performerName}>{player.name}</div>
                      <div className={styles.performerTeam}>{player.team}</div>
                      <div className={styles.performerReason}>{player.reason}</div>
                    </div>
                    <div className={styles.performerStats}>
                      <span
                        className={styles.performerPosition}
                        style={{ backgroundColor: getPositionColor(player.position) }}
                      >
                        {player.position}
                      </span>
                      <div className={styles.performerPoints}>{player.points}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.roundNavigation}>
          <button
            className={styles.navButton}
            disabled={selectedRound <= 1}
            onClick={() => setSelectedRound(selectedRound - 1)}
          >
            ← Prethodno kolo
          </button>
          <span className={styles.currentRound}>{selectedRound}. kolo</span>
          <button
            className={styles.navButton}
            disabled={selectedRound >= 30}
            onClick={() => setSelectedRound(selectedRound + 1)}
          >
            Sljedeće kolo →
          </button>
        </div>
      </div>
    </>
  )
}
