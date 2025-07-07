"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "../../../styles/UtakmiceDetalji.module.css"

export default function UtakmiceDetalji() {
  const params = useParams()
  const id = params.id
  const [activeTab, setActiveTab] = useState("overview")

  // Simulirani podaci za utakmicu
  const match = {
    id: id,
    homeTeam: "Sarajevo",
    awayTeam: "Zrinjski",
    homeScore: 2,
    awayScore: 1,
    date: "19.05.2025.",
    time: "20:00",
    stadium: "Koševo",
    attendance: 8500,
    referee: "Irfan Peljto",
    round: "15. kolo",
    status: "Završena",
    homeGoals: [
      { player: "Ahmetović", minute: 15, type: "Gol iz igre" },
      { player: "Rahmanović", minute: 78, type: "Gol iz igre" },
    ],
    awayGoals: [{ player: "Bilbija", minute: 35, type: "Gol iz igre" }],
    homeCards: [
      { player: "Ahmetović", minute: 45, type: "Žuti karton" },
      { player: "Sarić", minute: 67, type: "Žuti karton" },
    ],
    awayCards: [
      { player: "Bilbija", minute: 23, type: "Žuti karton" },
      { player: "Barišić", minute: 56, type: "Žuti karton" },
      { player: "Jakovljević", minute: 89, type: "Crveni karton" },
    ],
    homeLineup: [
      { number: 1, player: "Kenan Pirić", position: "GK" },
      { number: 2, player: "Siniša Stevanović", position: "DF" },
      { number: 5, player: "Besim Šerbečić", position: "DF" },
      { number: 6, player: "Selmir Pidro", position: "DF" },
      { number: 3, player: "Nihad Mujakić", position: "DF" },
      { number: 8, player: "Amar Rahmanović", position: "MF" },
      { number: 10, player: "Krste Velkoski", position: "MF" },
      { number: 20, player: "Ivan Jukić", position: "MF" },
      { number: 7, player: "Benjamin Tatar", position: "FW" },
      { number: 9, player: "Mersudin Ahmetović", position: "FW" },
      { number: 11, player: "Matthias Fanimo", position: "FW" },
    ],
    homeSubs: [
      { number: 12, player: "Belmin Dizdarević", position: "GK" },
      { number: 4, player: "Aleksandar Vojnović", position: "DF" },
      { number: 15, player: "Dino Ćorić", position: "MF" },
      { number: 17, player: "Almir Bekić", position: "MF" },
      { number: 19, player: "Kerim Memija", position: "DF" },
      { number: 21, player: "Andrej Đokanović", position: "FW" },
      { number: 23, player: "Amar Beganović", position: "MF" },
    ],
    awayLineup: [
      { number: 1, player: "Ivan Brkić", position: "GK" },
      { number: 2, player: "Hrvoje Barišić", position: "DF" },
      { number: 5, player: "Stipe Radić", position: "DF" },
      { number: 6, player: "Slobodan Jakovljević", position: "DF" },
      { number: 3, player: "Daniel Pavlović", position: "DF" },
      { number: 8, player: "Mario Tičinović", position: "MF" },
      { number: 10, player: "Josip Ćorluka", position: "MF" },
      { number: 20, player: "Tarik Ramić", position: "MF" },
      { number: 7, player: "Petar Brkić", position: "FW" },
      { number: 9, player: "Nemanja Bilbija", position: "FW" },
      { number: 11, player: "Marko Martinović", position: "FW" },
    ],
    awaySubs: [
      { number: 12, player: "Marijan Antolović", position: "GK" },
      { number: 4, player: "Matija Malekinušić", position: "DF" },
      { number: 15, player: "Josip Ćužić", position: "MF" },
      { number: 17, player: "Matija Smrekar", position: "MF" },
      { number: 19, player: "Tomislav Kiš", position: "FW" },
      { number: 21, player: "Dario Čanađija", position: "MF" },
      { number: 23, player: "Marko Grbešić", position: "DF" },
    ],
    stats: {
      possession: { home: 58, away: 42 },
      shots: { home: 15, away: 9 },
      shotsOnTarget: { home: 7, away: 4 },
      corners: { home: 8, away: 3 },
      fouls: { home: 12, away: 15 },
      offsides: { home: 2, away: 3 },
    },
    h2h: [
      {
        date: "10.12.2024.",
        competition: "Premijer liga BiH",
        home: "Zrinjski",
        away: "Sarajevo",
        homeScore: 2,
        awayScore: 2,
      },
      {
        date: "15.09.2024.",
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Zrinjski",
        homeScore: 1,
        awayScore: 0,
      },
      {
        date: "20.04.2024.",
        competition: "Premijer liga BiH",
        home: "Zrinjski",
        away: "Sarajevo",
        homeScore: 3,
        awayScore: 1,
      },
      {
        date: "05.11.2023.",
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Zrinjski",
        homeScore: 2,
        awayScore: 0,
      },
    ],
  }

  if (!id) {
    return null // Ili neki loading state
  }

  return (
    <>
      <Head>
        <title>
          {match.homeTeam} {match.status === "Završena" ? `${match.homeScore}:${match.awayScore}` : "vs"}{" "}
          {match.awayTeam} | PLKutak
        </title>
        <meta
          name="description"
          content={`${match.homeTeam} ${
            match.status === "Završena" ? `${match.homeScore}:${match.awayScore}` : "vs"
          } ${match.awayTeam} - ${match.round} Premijer lige BiH`}
        />
      </Head>

      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/utakmice">Utakmice</Link> /{" "}
          <span>
            {match.homeTeam} vs {match.awayTeam}
          </span>
        </div>

        <div className={styles.matchHeader}>
          <div className={styles.matchInfo}>
            <div className={styles.matchRound}>{match.round}</div>
            <div className={styles.matchDate}>
              {match.date} | {match.time}
            </div>
            <div className={styles.matchStatus}>{match.status}</div>
          </div>

          <div className={styles.matchTeams}>
            <div className={styles.teamHome}>
              <div className={styles.teamLogo}>
                <div className={styles.logoPlaceholder}>{match.homeTeam.charAt(0)}</div>
              </div>
              <div className={styles.teamName}>{match.homeTeam}</div>
            </div>

            <div className={styles.scoreContainer}>
              {match.status === "Završena" ? (
                <div className={styles.score}>
                  <span>{match.homeScore}</span>
                  <span>:</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : (
                <div className={styles.vs}>VS</div>
              )}
              <div className={styles.stadium}>{match.stadium}</div>
            </div>

            <div className={styles.teamAway}>
              <div className={styles.teamLogo}>
                <div className={styles.logoPlaceholder}>{match.awayTeam.charAt(0)}</div>
              </div>
              <div className={styles.teamName}>{match.awayTeam}</div>
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
            H2H
          </button>
        </div>

        <div className={styles.matchContent}>
          {activeTab === "overview" && (
            <>
              <div className={styles.matchDetails}>
                <div className={styles.detailsHeader}>
                  <h2>Detalji utakmice</h2>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Stadion</span>
                    <span className={styles.detailValue}>{match.stadium}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Gledatelja</span>
                    <span className={styles.detailValue}>{match.attendance.toLocaleString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Sudija</span>
                    <span className={styles.detailValue}>{match.referee}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Kolo</span>
                    <span className={styles.detailValue}>{match.round}</span>
                  </div>
                </div>
              </div>

              <div className={styles.timeline}>
                <div className={styles.timelineHeader}>
                  <h2>Timeline</h2>
                </div>

                <div className={styles.timelineContent}>
                  {/* Golovi domaćih */}
                  {match.homeGoals.map((goal, index) => (
                    <div key={`home-goal-${index}`} className={`${styles.timelineEvent} ${styles.homeEvent}`}>
                      <div className={styles.timelineTime}>{goal.minute}'</div>
                      <div className={styles.timelineIcon}>⚽</div>
                      <div className={styles.timelineText}>
                        <strong>{goal.player}</strong> - {goal.type}
                      </div>
                    </div>
                  ))}

                  {/* Golovi gostiju */}
                  {match.awayGoals.map((goal, index) => (
                    <div key={`away-goal-${index}`} className={`${styles.timelineEvent} ${styles.awayEvent}`}>
                      <div className={styles.timelineTime}>{goal.minute}'</div>
                      <div className={styles.timelineIcon}>⚽</div>
                      <div className={styles.timelineText}>
                        <strong>{goal.player}</strong> - {goal.type}
                      </div>
                    </div>
                  ))}

                  {/* Kartoni domaćih */}
                  {match.homeCards.map((card, index) => (
                    <div key={`home-card-${index}`} className={`${styles.timelineEvent} ${styles.homeEvent}`}>
                      <div className={styles.timelineTime}>{card.minute}'</div>
                      <div className={styles.timelineIcon}>{card.type === "Žuti karton" ? "🟨" : "🟥"}</div>
                      <div className={styles.timelineText}>
                        <strong>{card.player}</strong> - {card.type}
                      </div>
                    </div>
                  ))}

                  {/* Kartoni gostiju */}
                  {match.awayCards.map((card, index) => (
                    <div key={`away-card-${index}`} className={`${styles.timelineEvent} ${styles.awayEvent}`}>
                      <div className={styles.timelineTime}>{card.minute}'</div>
                      <div className={styles.timelineIcon}>{card.type === "Žuti karton" ? "🟨" : "🟥"}</div>
                      <div className={styles.timelineText}>
                        <strong>{card.player}</strong> - {card.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "lineups" && (
            <div className={styles.lineups}>
              <div className={styles.lineupsHeader}>
                <h2>Sastavi</h2>
              </div>

              <div className={styles.lineupsContent}>
                <div className={styles.teamLineup}>
                  <h3>{match.homeTeam}</h3>
                  <div className={styles.startingLineup}>
                    <h4>Početni sastav</h4>
                    <ul className={styles.playersList}>
                      {match.homeLineup.map((player) => (
                        <li key={`home-player-${player.number}`} className={styles.player}>
                          <span className={styles.playerNumber}>{player.number}</span>
                          <span className={styles.playerName}>{player.player}</span>
                          <span className={styles.playerPosition}>{player.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.substitutes}>
                    <h4>Klupa</h4>
                    <ul className={styles.playersList}>
                      {match.homeSubs.map((player) => (
                        <li key={`home-sub-${player.number}`} className={styles.player}>
                          <span className={styles.playerNumber}>{player.number}</span>
                          <span className={styles.playerName}>{player.player}</span>
                          <span className={styles.playerPosition}>{player.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.teamLineup}>
                  <h3>{match.awayTeam}</h3>
                  <div className={styles.startingLineup}>
                    <h4>Početni sastav</h4>
                    <ul className={styles.playersList}>
                      {match.awayLineup.map((player) => (
                        <li key={`away-player-${player.number}`} className={styles.player}>
                          <span className={styles.playerNumber}>{player.number}</span>
                          <span className={styles.playerName}>{player.player}</span>
                          <span className={styles.playerPosition}>{player.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.substitutes}>
                    <h4>Klupa</h4>
                    <ul className={styles.playersList}>
                      {match.awaySubs.map((player) => (
                        <li key={`away-sub-${player.number}`} className={styles.player}>
                          <span className={styles.playerNumber}>{player.number}</span>
                          <span className={styles.playerName}>{player.player}</span>
                          <span className={styles.playerPosition}>{player.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className={styles.statistics}>
              <div className={styles.statisticsHeader}>
                <h2>Statistika</h2>
              </div>

              <div className={styles.statsContent}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Posjed lopte</div>
                  <div className={styles.statBars}>
                    <div className={styles.statBarHome} style={{ width: `${match.stats.possession.home}%` }}>
                      {match.stats.possession.home}%
                    </div>
                    <div className={styles.statBarAway} style={{ width: `${match.stats.possession.away}%` }}>
                      {match.stats.possession.away}%
                    </div>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Udarci</div>
                  <div className={styles.statValues}>
                    <span>{match.stats.shots.home}</span>
                    <span>{match.stats.shots.away}</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Udarci u okvir</div>
                  <div className={styles.statValues}>
                    <span>{match.stats.shotsOnTarget.home}</span>
                    <span>{match.stats.shotsOnTarget.away}</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Korneri</div>
                  <div className={styles.statValues}>
                    <span>{match.stats.corners.home}</span>
                    <span>{match.stats.corners.away}</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Prekršaji</div>
                  <div className={styles.statValues}>
                    <span>{match.stats.fouls.home}</span>
                    <span>{match.stats.fouls.away}</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Ofsajdi</div>
                  <div className={styles.statValues}>
                    <span>{match.stats.offsides.home}</span>
                    <span>{match.stats.offsides.away}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "h2h" && (
            <div className={styles.h2h}>
              <div className={styles.h2hHeader}>
                <h2>Međusobni dueli</h2>
              </div>

              <div className={styles.h2hContent}>
                <div className={styles.h2hSummary}>
                  <div className={styles.h2hStat}>
                    <span className={styles.h2hTeam}>{match.homeTeam}</span>
                    <span className={styles.h2hValue}>2</span>
                  </div>
                  <div className={styles.h2hStat}>
                    <span className={styles.h2hLabel}>Neriješeno</span>
                    <span className={styles.h2hValue}>1</span>
                  </div>
                  <div className={styles.h2hStat}>
                    <span className={styles.h2hTeam}>{match.awayTeam}</span>
                    <span className={styles.h2hValue}>1</span>
                  </div>
                </div>

                <div className={styles.h2hMatches}>
                  {match.h2h.map((game, index) => (
                    <div key={index} className={styles.h2hMatch}>
                      <div className={styles.h2hMatchInfo}>
                        <span className={styles.h2hMatchDate}>{game.date}</span>
                        <span className={styles.h2hMatchCompetition}>{game.competition}</span>
                      </div>
                      <div className={styles.h2hMatchTeams}>
                        <span
                          className={`${styles.h2hMatchTeam} ${game.home === match.homeTeam ? styles.homeTeam : ""}`}
                        >
                          {game.home}
                        </span>
                        <span className={styles.h2hMatchScore}>
                          {game.homeScore} - {game.awayScore}
                        </span>
                        <span
                          className={`${styles.h2hMatchTeam} ${game.away === match.homeTeam ? styles.homeTeam : ""}`}
                        >
                          {game.away}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
