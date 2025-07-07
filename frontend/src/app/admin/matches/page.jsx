"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaList, FaCalendarAlt } from "react-icons/fa"
import styles from "../../../styles/AdminMatches.module.css"

export default function AdminMatches() {
  const [activeTab, setActiveTab] = useState("results")
  const [selectedRound, setSelectedRound] = useState(15)

  const [matches, setMatches] = useState([
    {
      id: 1,
      round: 15,
      homeTeam: "Sarajevo",
      awayTeam: "Zrinjski",
      homeScore: 2,
      awayScore: 1,
      date: "19.05.2025.",
      time: "20:00",
      stadium: "Koševo",
      status: "Završena",
      eventsEntered: true,
    },
    {
      id: 2,
      round: 15,
      homeTeam: "Željezničar",
      awayTeam: "Velež",
      homeScore: 3,
      awayScore: 0,
      date: "18.05.2025.",
      time: "18:00",
      stadium: "Grbavica",
      status: "Završena",
      eventsEntered: false,
    },
    {
      id: 3,
      round: 16,
      homeTeam: "Borac",
      awayTeam: "Tuzla City",
      homeScore: null,
      awayScore: null,
      date: "26.05.2025.",
      time: "18:00",
      stadium: "Gradski stadion",
      status: "Zakazana",
      eventsEntered: false,
    },
  ])

  const rounds = Array.from({ length: 30 }, (_, i) => i + 1)

  const filteredMatches = matches.filter((match) =>
    activeTab === "results" ? match.status === "Završena" : match.round === selectedRound,
  )

  return (
    <>
      <Head>
        <title>Upravljanje utakmicama | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje utakmicama" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje utakmicama</h1>
            <div className={styles.headerActions}>
              <Link href="/admin/matches/schedule" className={styles.actionButton}>
                <FaCalendarAlt /> Raspored
              </Link>
              <Link href="/admin/matches/create" className={styles.actionButton}>
                <FaPlus /> Nova utakmica
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "results" ? styles.active : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Rezultati
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "schedule" ? styles.active : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            Raspored
          </button>
        </div>

        {activeTab === "schedule" && (
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
        )}

        <div className={styles.matchesList}>
          {filteredMatches.map((match) => (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <div className={styles.matchRound}>{match.round}. kolo</div>
                <div className={styles.matchDate}>
                  {match.date} | {match.time}
                </div>
                <div className={`${styles.matchStatus} ${styles[match.status.toLowerCase()]}`}>{match.status}</div>
              </div>

              <div className={styles.matchTeams}>
                <div className={styles.teamHome}>
                  <span className={styles.teamName}>{match.homeTeam}</span>
                  {match.status === "Završena" && <span className={styles.score}>{match.homeScore}</span>}
                </div>

                <div className={styles.matchInfo}>
                  {match.status === "Završena" ? (
                    <span className={styles.separator}>:</span>
                  ) : (
                    <span className={styles.vs}>VS</span>
                  )}
                  <span className={styles.stadium}>{match.stadium}</span>
                </div>

                <div className={styles.teamAway}>
                  {match.status === "Završena" && <span className={styles.score}>{match.awayScore}</span>}
                  <span className={styles.teamName}>{match.awayTeam}</span>
                </div>
              </div>

              <div className={styles.matchActions}>
                {match.status === "Završena" ? (
                  <>
                    <Link
                      href={`/admin/matches/events/${match.id}`}
                      className={`${styles.actionButton} ${match.eventsEntered ? styles.completed : styles.pending}`}
                    >
                      <FaList /> {match.eventsEntered ? "Uredi događaje" : "Unesi događaje"}
                    </Link>
                    <Link href={`/admin/matches/edit/${match.id}`} className={styles.actionButton}>
                      <FaEdit /> Uredi rezultat
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={`/admin/matches/result/${match.id}`} className={styles.actionButton}>
                      <FaEdit /> Unesi rezultat
                    </Link>
                    <Link href={`/admin/matches/edit/${match.id}`} className={styles.actionButton}>
                      <FaEdit /> Uredi utakmicu
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
