"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaArrowLeft, FaSave, FaPlus, FaTrash } from "react-icons/fa"
import styles from "../../../../../styles/AdminMatchResult.module.css"

export default function MatchResult() {
  const params = useParams()
  const matchId = params.id

  const [matchData, setMatchData] = useState({
    homeTeam: "Sarajevo",
    awayTeam: "Zrinjski",
    homeScore: "",
    awayScore: "",
    date: "2025-05-19",
    time: "20:00",
    stadium: "Koševo",
    attendance: "",
    referee: "",
  })

  // Dostupni igrači za svaki tim
  const availablePlayers = {
    home: [
      { id: 1, name: "Kenan Pirić", position: "GK", number: 1 },
      { id: 2, name: "Siniša Stevanović", position: "DF", number: 2 },
      { id: 3, name: "Amar Rahmanović", position: "MF", number: 10 },
      { id: 4, name: "Benjamin Tatar", position: "FW", number: 9 },
      { id: 5, name: "Mirza Mustafić", position: "DF", number: 5 },
      { id: 6, name: "Andrej Đokanović", position: "MF", number: 8 },
      { id: 7, name: "Krste Velkoski", position: "FW", number: 11 },
      { id: 8, name: "Almedin Ziljkić", position: "DF", number: 3 },
      { id: 9, name: "Haris Handzić", position: "MF", number: 6 },
      { id: 10, name: "Mersudin Ahmetović", position: "FW", number: 7 },
      { id: 11, name: "Tarik Ramić", position: "DF", number: 4 },
      { id: 12, name: "Vladan Kovačević", position: "GK", number: 12 },
      { id: 13, name: "Stefan Čolović", position: "MF", number: 14 },
      { id: 14, name: "Amer Dupovac", position: "DF", number: 15 },
    ],
    away: [
      { id: 15, name: "Ivan Brkić", position: "GK", number: 1 },
      { id: 16, name: "Hrvoje Barišić", position: "DF", number: 3 },
      { id: 17, name: "Slobodan Jakovljević", position: "MF", number: 10 },
      { id: 18, name: "Nemanja Bilbija", position: "FW", number: 9 },
      { id: 19, name: "Mario Tičinović", position: "DF", number: 2 },
      { id: 20, name: "Dario Melnjak", position: "MF", number: 8 },
      { id: 21, name: "Matija Malekinušić", position: "FW", number: 11 },
      { id: 22, name: "Kerim Memija", position: "DF", number: 5 },
      { id: 23, name: "Antonio Mance", position: "MF", number: 6 },
      { id: 24, name: "Tomislav Kiš", position: "FW", number: 7 },
      { id: 25, name: "Stipe Radic", position: "DF", number: 4 },
      { id: 26, name: "Marko Marić", position: "GK", number: 12 },
      { id: 27, name: "Luka Menalo", position: "MF", number: 14 },
      { id: 28, name: "Zvonimir Kozulj", position: "DF", number: 15 },
    ],
  }

  const [homeStartingXI, setHomeStartingXI] = useState([])
  const [awayStartingXI, setAwayStartingXI] = useState([])
  const [substitutions, setSubstitutions] = useState([])
  const [statistics, setStatistics] = useState({
    home: {
      possession: "",
      shots: "",
      shotsOnTarget: "",
      corners: "",
      fouls: "",
      yellowCards: "",
      redCards: "",
      offsides: "",
    },
    away: {
      possession: "",
      shots: "",
      shotsOnTarget: "",
      corners: "",
      fouls: "",
      yellowCards: "",
      redCards: "",
      offsides: "",
    },
  })

  const handleMatchDataChange = (e) => {
    const { name, value } = e.target
    setMatchData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStatChange = (team, stat, value) => {
    setStatistics((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [stat]: value,
      },
    }))
  }

  const addPlayerToStartingXI = (team, playerId) => {
    const player = availablePlayers[team].find((p) => p.id === Number.parseInt(playerId))
    if (!player) return

    if (team === "home") {
      if (homeStartingXI.length < 11 && !homeStartingXI.find((p) => p.id === player.id)) {
        setHomeStartingXI((prev) => [...prev, player])
      }
    } else {
      if (awayStartingXI.length < 11 && !awayStartingXI.find((p) => p.id === player.id)) {
        setAwayStartingXI((prev) => [...prev, player])
      }
    }
  }

  const removePlayerFromStartingXI = (team, playerId) => {
    if (team === "home") {
      setHomeStartingXI((prev) => prev.filter((p) => p.id !== playerId))
    } else {
      setAwayStartingXI((prev) => prev.filter((p) => p.id !== playerId))
    }
  }

  const addSubstitution = () => {
    const newSub = {
      id: Date.now(),
      team: "home",
      playerOut: "",
      playerIn: "",
      minute: "",
      reason: "tactical",
    }
    setSubstitutions((prev) => [...prev, newSub])
  }

  const removeSubstitution = (id) => {
    setSubstitutions((prev) => prev.filter((sub) => sub.id !== id))
  }

  const handleSubstitutionChange = (id, field, value) => {
    setSubstitutions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)))
  }

  const getAvailablePlayersForTeam = (team) => {
    const startingXI = team === "home" ? homeStartingXI : awayStartingXI
    return availablePlayers[team].filter((player) => !startingXI.find((p) => p.id === player.id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (homeStartingXI.length !== 11) {
      alert(`${matchData.homeTeam} mora imati 11 igrača u početnoj postavi!`)
      return
    }

    if (awayStartingXI.length !== 11) {
      alert(`${matchData.awayTeam} mora imati 11 igrača u početnoj postavi!`)
      return
    }

    console.log("Saving match result:", { matchData, homeStartingXI, awayStartingXI, substitutions, statistics })
    alert("Rezultat utakmice je uspješno sačuvan!")
  }

  return (
    <>
      <Head>
        <title>Unos rezultata | Admin</title>
        <meta name="description" content="Unos rezultata utakmice" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/matches" className={styles.backButton}>
            <FaArrowLeft /> Nazad na utakmice
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Unos rezultata utakmice</h1>
          <div className={styles.matchInfo}>
            {matchData.homeTeam} vs {matchData.awayTeam}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Rezultat</h2>
              <div className={styles.scoreInput}>
                <div className={styles.teamScore}>
                  <label>{matchData.homeTeam}</label>
                  <input
                    type="number"
                    name="homeScore"
                    value={matchData.homeScore}
                    onChange={handleMatchDataChange}
                    min="0"
                    max="20"
                    required
                  />
                </div>
                <span className={styles.scoreSeparator}>:</span>
                <div className={styles.teamScore}>
                  <input
                    type="number"
                    name="awayScore"
                    value={matchData.awayScore}
                    onChange={handleMatchDataChange}
                    min="0"
                    max="20"
                    required
                  />
                  <label>{matchData.awayTeam}</label>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Početne postave</h2>

              <div className={styles.lineupsContainer}>
                <div className={styles.teamLineup}>
                  <h3>
                    {matchData.homeTeam} ({homeStartingXI.length}/11)
                  </h3>

                  <div className={styles.playerSelector}>
                    <select onChange={(e) => addPlayerToStartingXI("home", e.target.value)} value="">
                      <option value="">Dodaj igrača</option>
                      {getAvailablePlayersForTeam("home").map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.number}. {player.name} ({player.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.startingXI}>
                    {homeStartingXI.map((player) => (
                      <div key={player.id} className={styles.playerCard}>
                        <span className={styles.playerNumber}>{player.number}</span>
                        <span className={styles.playerName}>{player.name}</span>
                        <span className={styles.playerPosition}>{player.position}</span>
                        <button
                          type="button"
                          onClick={() => removePlayerFromStartingXI("home", player.id)}
                          className={styles.removePlayer}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.teamLineup}>
                  <h3>
                    {matchData.awayTeam} ({awayStartingXI.length}/11)
                  </h3>

                  <div className={styles.playerSelector}>
                    <select onChange={(e) => addPlayerToStartingXI("away", e.target.value)} value="">
                      <option value="">Dodaj igrača</option>
                      {getAvailablePlayersForTeam("away").map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.number}. {player.name} ({player.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.startingXI}>
                    {awayStartingXI.map((player) => (
                      <div key={player.id} className={styles.playerCard}>
                        <span className={styles.playerNumber}>{player.number}</span>
                        <span className={styles.playerName}>{player.name}</span>
                        <span className={styles.playerPosition}>{player.position}</span>
                        <button
                          type="button"
                          onClick={() => removePlayerFromStartingXI("away", player.id)}
                          className={styles.removePlayer}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Dodatne informacije</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="attendance">Broj gledalaca</label>
                  <input
                    type="number"
                    id="attendance"
                    name="attendance"
                    value={matchData.attendance}
                    onChange={handleMatchDataChange}
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="referee">Sudija</label>
                  <input
                    type="text"
                    id="referee"
                    name="referee"
                    value={matchData.referee}
                    onChange={handleMatchDataChange}
                    placeholder="Ime i prezime sudije"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Statistike utakmice</h2>
              <div className={styles.statsGrid}>
                <div className={styles.teamStats}>
                  <h3>{matchData.homeTeam}</h3>
                  {Object.entries(statistics.home).map(([stat, value]) => (
                    <div key={stat} className={styles.statRow}>
                      <label>
                        {stat === "possession"
                          ? "Posjed lopte (%)"
                          : stat === "shots"
                            ? "Ukupno šuteva"
                            : stat === "shotsOnTarget"
                              ? "Šutevi u okvir"
                              : stat === "corners"
                                ? "Korneri"
                                : stat === "fouls"
                                  ? "Prekršaji"
                                  : stat === "yellowCards"
                                    ? "Žuti kartoni"
                                    : stat === "redCards"
                                      ? "Crveni kartoni"
                                      : stat === "offsides"
                                        ? "Ofsajdi"
                                        : stat}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleStatChange("home", stat, e.target.value)}
                        min="0"
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.teamStats}>
                  <h3>{matchData.awayTeam}</h3>
                  {Object.entries(statistics.away).map(([stat, value]) => (
                    <div key={stat} className={styles.statRow}>
                      <label>
                        {stat === "possession"
                          ? "Posjed lopte (%)"
                          : stat === "shots"
                            ? "Ukupno šuteva"
                            : stat === "shotsOnTarget"
                              ? "Šutevi u okvir"
                              : stat === "corners"
                                ? "Korneri"
                                : stat === "fouls"
                                  ? "Prekršaji"
                                  : stat === "yellowCards"
                                    ? "Žuti kartoni"
                                    : stat === "redCards"
                                      ? "Crveni kartoni"
                                      : stat === "offsides"
                                        ? "Ofsajdi"
                                        : stat}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleStatChange("away", stat, e.target.value)}
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Izmjene</h2>
                <button type="button" onClick={addSubstitution} className={styles.addButton}>
                  <FaPlus /> Dodaj izmjenu
                </button>
              </div>

              {substitutions.map((sub) => (
                <div key={sub.id} className={styles.substitutionRow}>
                  <select value={sub.team} onChange={(e) => handleSubstitutionChange(sub.id, "team", e.target.value)}>
                    <option value="home">{matchData.homeTeam}</option>
                    <option value="away">{matchData.awayTeam}</option>
                  </select>

                  <select
                    value={sub.playerOut}
                    onChange={(e) => handleSubstitutionChange(sub.id, "playerOut", e.target.value)}
                  >
                    <option value="">Igrač izlazi</option>
                    {(sub.team === "home" ? homeStartingXI : awayStartingXI).map((player) => (
                      <option key={player.id} value={player.name}>
                        {player.number}. {player.name}
                      </option>
                    ))}
                  </select>

                  <span>→</span>

                  <select
                    value={sub.playerIn}
                    onChange={(e) => handleSubstitutionChange(sub.id, "playerIn", e.target.value)}
                  >
                    <option value="">Igrač ulazi</option>
                    {getAvailablePlayersForTeam(sub.team).map((player) => (
                      <option key={player.id} value={player.name}>
                        {player.number}. {player.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Min"
                    value={sub.minute}
                    onChange={(e) => handleSubstitutionChange(sub.id, "minute", e.target.value)}
                    min="1"
                    max="120"
                  />

                  <select
                    value={sub.reason}
                    onChange={(e) => handleSubstitutionChange(sub.id, "reason", e.target.value)}
                  >
                    <option value="tactical">Taktička</option>
                    <option value="injury">Povreda</option>
                    <option value="disciplinary">Disciplinska</option>
                  </select>

                  <button type="button" onClick={() => removeSubstitution(sub.id)} className={styles.removeButton}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/matches" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Sačuvaj rezultat
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
