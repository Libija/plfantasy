"use client"

import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import styles from "../../styles/Utakmice.module.css"

export default function Utakmice() {
  const [activeTab, setActiveTab] = useState("upcoming")

  // Simulirani podaci za nadolazeće utakmice
  const upcomingMatches = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      date: "25.05.2025.",
      time: "20:00",
      stadium: "Koševo",
      round: "16. kolo",
    },
    {
      id: 2,
      homeTeam: "Borac",
      awayTeam: "Tuzla City",
      date: "26.05.2025.",
      time: "18:00",
      stadium: "Gradski stadion",
      round: "16. kolo",
    },
    {
      id: 3,
      homeTeam: "Zrinjski",
      awayTeam: "Široki Brijeg",
      date: "26.05.2025.",
      time: "20:00",
      stadium: "Pod Bijelim Brijegom",
      round: "16. kolo",
    },
    {
      id: 4,
      homeTeam: "Velež",
      awayTeam: "Sloboda",
      date: "27.05.2025.",
      time: "18:00",
      stadium: "Rođeni",
      round: "16. kolo",
    },
    {
      id: 5,
      homeTeam: "Posušje",
      awayTeam: "Igman",
      date: "27.05.2025.",
      time: "20:00",
      stadium: "Mokri Dolac",
      round: "16. kolo",
    },
    {
      id: 6,
      homeTeam: "Željezničar",
      awayTeam: "Borac",
      date: "01.06.2025.",
      time: "20:00",
      stadium: "Grbavica",
      round: "17. kolo",
    },
  ]

  // Simulirani podaci za nedavne rezultate
  const recentResults = [
    {
      id: 7,
      homeTeam: "Sarajevo",
      homeScore: 2,
      awayTeam: "Zrinjski",
      awayScore: 1,
      date: "19.05.2025.",
      round: "15. kolo",
    },
    {
      id: 8,
      homeTeam: "Željezničar",
      homeScore: 3,
      awayTeam: "Velež",
      awayScore: 0,
      date: "18.05.2025.",
      round: "15. kolo",
    },
    {
      id: 9,
      homeTeam: "Tuzla City",
      homeScore: 1,
      awayTeam: "Borac",
      awayScore: 1,
      date: "18.05.2025.",
      round: "15. kolo",
    },
    {
      id: 10,
      homeTeam: "Široki Brijeg",
      homeScore: 2,
      awayTeam: "Posušje",
      awayScore: 0,
      date: "17.05.2025.",
      round: "15. kolo",
    },
    {
      id: 11,
      homeTeam: "Sloboda",
      homeScore: 1,
      awayTeam: "Igman",
      awayScore: 0,
      date: "17.05.2025.",
      round: "15. kolo",
    },
    {
      id: 12,
      homeTeam: "Borac",
      homeScore: 3,
      awayTeam: "Sarajevo",
      awayScore: 2,
      date: "12.05.2025.",
      round: "14. kolo",
    },
  ]

  return (
    <>
      <Head>
        <title>Utakmice | PLKutak</title>
        <meta name="description" content="Raspored utakmica i rezultati Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Utakmice</h1>
        <p className={styles.subtitle}>Raspored utakmica i rezultati Premijer lige BiH</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "upcoming" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Nadolazeće utakmice
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "results" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Rezultati
          </button>
        </div>

        {activeTab === "upcoming" && (
          <div className={styles.matchesList}>
            {upcomingMatches.map((match) => (
              <div key={match.id} className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <span className={styles.matchRound}>{match.round}</span>
                  <span className={styles.matchDate}>
                    {match.date} | {match.time}
                  </span>
                </div>
                <div className={styles.matchTeams}>
                  <div className={styles.teamHome}>
                    <span className={styles.teamName}>{match.homeTeam}</span>
                  </div>
                  <div className={styles.matchInfo}>
                    <span className={styles.vs}>VS</span>
                    <span className={styles.stadium}>{match.stadium}</span>
                  </div>
                  <div className={styles.teamAway}>
                    <span className={styles.teamName}>{match.awayTeam}</span>
                  </div>
                </div>
                <Link href={`/utakmice/${match.id}`} className={styles.matchLink}>
                  Detalji utakmice
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "results" && (
          <div className={styles.matchesList}>
            {recentResults.map((result) => (
              <div key={result.id} className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <span className={styles.matchRound}>{result.round}</span>
                  <span className={styles.matchDate}>{result.date}</span>
                </div>
                <div className={styles.matchTeams}>
                  <div className={styles.teamHome}>
                    <span className={styles.teamName}>{result.homeTeam}</span>
                    <span className={styles.score}>{result.homeScore}</span>
                  </div>
                  <div className={styles.separator}>-</div>
                  <div className={styles.teamAway}>
                    <span className={styles.score}>{result.awayScore}</span>
                    <span className={styles.teamName}>{result.awayTeam}</span>
                  </div>
                </div>
                <Link href={`/utakmice/${result.id}`} className={styles.matchLink}>
                  Detalji utakmice
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
