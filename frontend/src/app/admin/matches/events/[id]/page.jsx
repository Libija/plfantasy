"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from "react-icons/fa"
import styles from "../../../../../styles/AdminMatchEvents.module.css"

export default function MatchEvents() {
  const params = useParams()
  const matchId = params.id

  const [match] = useState({
    id: matchId,
    homeTeam: "Sarajevo",
    awayTeam: "Zrinjski",
    homeScore: 2,
    awayScore: 1,
    date: "19.05.2025.",
  })

  const [events, setEvents] = useState([
    {
      id: 1,
      type: "goal",
      team: "home",
      player: "Ahmetović",
      assist: "Rahmanović",
      minute: 15,
      ownGoal: false,
    },
    {
      id: 2,
      type: "goal",
      team: "away",
      player: "Bilbija",
      assist: "",
      minute: 35,
      ownGoal: false,
    },
    {
      id: 3,
      type: "yellow_card",
      team: "home",
      player: "Ahmetović",
      minute: 45,
    },
  ])

  const [newEvent, setNewEvent] = useState({
    type: "goal",
    team: "home",
    player: "",
    assist: "",
    minute: "",
    ownGoal: false,
  })

  const [homePlayers] = useState([
    "Pirić",
    "Stevanović",
    "Šerbečić",
    "Pidro",
    "Mujakić",
    "Rahmanović",
    "Velkoski",
    "Jukić",
    "Tatar",
    "Ahmetović",
    "Fanimo",
  ])

  const [awayPlayers] = useState([
    "Brkić",
    "Barišić",
    "Radić",
    "Jakovljević",
    "Pavlović",
    "Tičinović",
    "Ćorluka",
    "Ramić",
    "P. Brkić",
    "Bilbija",
    "Martinović",
  ])

  const eventTypes = [
    { value: "goal", label: "Gol" },
    { value: "yellow_card", label: "Žuti karton" },
    { value: "red_card", label: "Crveni karton" },
    { value: "penalty_saved", label: "Odbranjen penal" },
    { value: "clean_sheet", label: "Čist list" },
  ]

  const handleEventChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addEvent = () => {
    if (!newEvent.player || !newEvent.minute) {
      alert("Molimo unesite igrača i minutu!")
      return
    }

    const event = {
      id: Date.now(),
      ...newEvent,
      minute: Number.parseInt(newEvent.minute),
    }

    setEvents([...events, event])
    setNewEvent({
      type: "goal",
      team: "home",
      player: "",
      assist: "",
      minute: "",
      ownGoal: false,
    })
  }

  const removeEvent = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  const saveEvents = () => {
    // Ovdje bi se implementirala logika za čuvanje događaja
    console.log("Saving events:", events)
    alert("Događaji su uspješno sačuvani!")
  }

  const calculateFantasyPoints = () => {
    // Ovdje bi se implementirala logika za računanje fantasy bodova
    alert("Fantasy bodovi su preračunati!")
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "goal":
        return "⚽"
      case "yellow_card":
        return "🟨"
      case "red_card":
        return "🟥"
      case "penalty_saved":
        return "🥅"
      case "clean_sheet":
        return "🛡️"
      default:
        return "📝"
    }
  }

  const getEventLabel = (type) => {
    return eventTypes.find((et) => et.value === type)?.label || type
  }

  return (
    <>
      <Head>
        <title>Događaji utakmice | Admin</title>
        <meta name="description" content="Unos događaja utakmice" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/matches" className={styles.backButton}>
            <FaArrowLeft /> Nazad na utakmice
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Događaji utakmice</h1>
            <div className={styles.matchInfo}>
              {match.homeTeam} {match.homeScore}:{match.awayScore} {match.awayTeam}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.eventsSection}>
            <div className={styles.sectionHeader}>
              <h2>Postojeći događaji</h2>
              <div className={styles.headerActions}>
                <button className={styles.calculateButton} onClick={calculateFantasyPoints}>
                  Preračunaj fantasy bodove
                </button>
                <button className={styles.saveButton} onClick={saveEvents}>
                  <FaSave /> Sačuvaj sve
                </button>
              </div>
            </div>

            <div className={styles.eventsList}>
              {events
                .sort((a, b) => a.minute - b.minute)
                .map((event) => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventIcon}>{getEventIcon(event.type)}</div>
                    <div className={styles.eventDetails}>
                      <div className={styles.eventMinute}>{event.minute}'</div>
                      <div className={styles.eventType}>{getEventLabel(event.type)}</div>
                      <div className={styles.eventPlayer}>
                        {event.player} ({event.team === "home" ? match.homeTeam : match.awayTeam})
                        {event.assist && ` - asist: ${event.assist}`}
                        {event.ownGoal && " (autogol)"}
                      </div>
                    </div>
                    <button className={styles.removeButton} onClick={() => removeEvent(event.id)}>
                      <FaTrash />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.addEventSection}>
            <div className={styles.sectionHeader}>
              <h2>Dodaj novi događaj</h2>
            </div>

            <div className={styles.eventForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tip događaja</label>
                  <select name="type" value={newEvent.type} onChange={handleEventChange}>
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tim</label>
                  <select name="team" value={newEvent.team} onChange={handleEventChange}>
                    <option value="home">{match.homeTeam}</option>
                    <option value="away">{match.awayTeam}</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Minuta</label>
                  <input
                    type="number"
                    name="minute"
                    value={newEvent.minute}
                    onChange={handleEventChange}
                    min="1"
                    max="120"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Igrač</label>
                  <select name="player" value={newEvent.player} onChange={handleEventChange}>
                    <option value="">Odaberite igrača</option>
                    {(newEvent.team === "home" ? homePlayers : awayPlayers).map((player) => (
                      <option key={player} value={player}>
                        {player}
                      </option>
                    ))}
                  </select>
                </div>

                {newEvent.type === "goal" && (
                  <div className={styles.formGroup}>
                    <label>Asistencija</label>
                    <select name="assist" value={newEvent.assist} onChange={handleEventChange}>
                      <option value="">Bez asistencije</option>
                      {(newEvent.team === "home" ? homePlayers : awayPlayers)
                        .filter((player) => player !== newEvent.player)
                        .map((player) => (
                          <option key={player} value={player}>
                            {player}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {newEvent.type === "goal" && (
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" name="ownGoal" checked={newEvent.ownGoal} onChange={handleEventChange} />
                      Autogol
                    </label>
                  </div>
                )}
              </div>

              <button className={styles.addButton} onClick={addEvent}>
                <FaPlus /> Dodaj događaj
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
