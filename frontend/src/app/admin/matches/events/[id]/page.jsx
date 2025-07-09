"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from "react-icons/fa"
import styles from "../../../../../styles/AdminMatchEvents.module.css"

export default function MatchEvents() {
  const { id: matchId } = useParams()
  const router = useRouter()
  
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State za događaje
  const [events, setEvents] = useState([])
  const [newEvent, setNewEvent] = useState({
    event_type: "goal",
    player_id: "",
    assist_player_id: "",
    minute: 1
  })
  
  // State za izmjene
  const [substitutions, setSubstitutions] = useState([])
  const [newSubstitution, setNewSubstitution] = useState({
    club_id: "",
    player_out_id: "",
    player_in_id: "",
    minute: 1
  })
  
  // State za podatke
  const [players, setPlayers] = useState({
    home: [],
    away: []
  })
  const [lineups, setLineups] = useState({
    home: [],
    away: []
  })
  const [existingEvents, setExistingEvents] = useState([])
  const [existingSubstitutions, setExistingSubstitutions] = useState([])

  const eventTypes = [
    { value: "goal", label: "Gol" },
    { value: "yellow", label: "Žuti karton" },
    { value: "red", label: "Crveni karton" },
    { value: "own_goal", label: "Autogol" },
    { value: "penalty_saved", label: "Odbranjen penal" },
    { value: "penalty_missed", label: "Propušten penal" }
  ]

  useEffect(() => {
    fetchMatchData()
  }, [matchId])

  useEffect(() => {
    if (match) {
      fetchPlayers()
      fetchLineups()
      fetchExistingEvents()
      fetchExistingSubstitutions()
    }
  }, [match])

  const fetchMatchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/matches/${matchId}/detailed`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      } else {
        console.error('Greška pri učitavanju utakmice')
      }
    } catch (error) {
      console.error('Greška pri učitavanju utakmice:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Fetch igrače za domaći klub
      const homeResponse = await fetch(`${apiUrl}/admin/players?club_id=${parseInt(match.home_club_id)}`)
      const homePlayers = homeResponse.ok ? await homeResponse.json() : []
      
      // Fetch igrače za gostujući klub
      const awayResponse = await fetch(`${apiUrl}/admin/players?club_id=${parseInt(match.away_club_id)}`)
      const awayPlayers = awayResponse.ok ? await awayResponse.json() : []
      
      setPlayers({
        home: homePlayers,
        away: awayPlayers
      })
    } catch (error) {
      console.error('Greška pri učitavanju igrača:', error)
    }
  }

  const fetchLineups = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/match-lineups/match/${matchId}`)
      if (response.ok) {
        const lineupsData = await response.json()
        
        const homeLineup = lineupsData.filter(l => parseInt(l.club_id) === match.home_club_id && l.lineup_type === 'starting')
        const awayLineup = lineupsData.filter(l => parseInt(l.club_id) === match.away_club_id && l.lineup_type === 'starting')
        
        setLineups({
          home: homeLineup,
          away: awayLineup
        })
      }
    } catch (error) {
      console.error('Greška pri učitavanju postava:', error)
    }
  }

  const fetchExistingEvents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/matchevents/match/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setExistingEvents(data)
      }
    } catch (error) {
      console.error('Greška pri učitavanju događaja:', error)
    }
  }

  const fetchExistingSubstitutions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/match-substitutions/match/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setExistingSubstitutions(data)
      }
    } catch (error) {
      console.error('Greška pri učitavanju izmjena:', error)
    }
  }

  // Funkcija za računanje fantasy poena
  const calculateFantasyPoints = (eventType, playerPosition) => {
    switch (eventType) {
      case "goal":
        switch (playerPosition) {
          case "FWD": return 3
          case "MID": return 4
          case "DEF": return 5
          case "GK": return 6
          default: return 3
        }
      case "assist":
        switch (playerPosition) {
          case "FWD": return 2
          case "MID": return 1
          case "DEF": return 3
          case "GK": return 4
          default: return 2
        }
      case "yellow": return -1
      case "red": return -3
      case "own_goal": return -4
      case "penalty_saved": return 4
      case "penalty_missed": return -4
      default: return 0
    }
  }

  const handleEventChange = (e) => {
    const { name, value } = e.target
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubstitutionChange = (e) => {
    const { name, value } = e.target
    setNewSubstitution(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addEvent = () => {
    if (!newEvent.player_id || !newEvent.minute) {
      alert("Molimo unesite igrača i minutu!")
      return
    }

    // Ne dozvoli dodavanje asistencija kao zasebnih događaja
    if (newEvent.event_type === "assist") {
      alert("Asistencije se dodaju kao dio gol događaja!")
      return
    }

    const event = {
      id: Date.now(),
      ...newEvent,
      minute: parseInt(newEvent.minute)
    }

    setEvents([...events, event])
    setNewEvent({
      event_type: "goal",
      player_id: "",
      assist_player_id: "",
      minute: 1
    })
  }

  const addSubstitution = () => {
    if (!newSubstitution.club_id || !newSubstitution.player_out_id || !newSubstitution.player_in_id || !newSubstitution.minute) {
      alert("Molimo unesite sve podatke za izmjenu!")
      return
    }

    const substitution = {
      id: Date.now(),
      ...newSubstitution,
      minute: parseInt(newSubstitution.minute)
    }

    setSubstitutions([...substitutions, substitution])
    setNewSubstitution({
      club_id: "",
      player_out_id: "",
      player_in_id: "",
      minute: 1
    })
  }

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const removeSubstitution = (id) => {
    setSubstitutions(prev => prev.filter(sub => sub.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Sačuvaj događaje
      for (const event of events) {
        // Preskočimo asistencije jer su dio gol događaja
        if (event.event_type === "assist") continue
        
        await fetch(`${apiUrl}/admin/matchevents/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: parseInt(matchId),
            player_id: parseInt(event.player_id),
            event_type: event.event_type,
            minute: parseInt(event.minute),
            assist_player_id: event.assist_player_id ? parseInt(event.assist_player_id) : null
          }),
        })
      }

      // Sačuvaj izmjene
      for (const sub of substitutions) {
        await fetch(`${apiUrl}/admin/match-substitutions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: parseInt(matchId),
            club_id: parseInt(sub.club_id),
            player_out_id: parseInt(sub.player_out_id),
            player_in_id: parseInt(sub.player_in_id),
            minute: parseInt(sub.minute)
          }),
        })
      }

      // Preračunaj fantasy poene
      await fetch(`${apiUrl}/admin/fantasy-points/recalculate/match/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      alert("Događaji, izmjene i fantasy poeni su uspješno sačuvani!")
      
      // Preusmjeri na stranicu sa kolima
      setTimeout(() => {
        router.push('/admin/rounds')
      }, 1000)
      
    } catch (error) {
      console.error('Greška pri čuvanju:', error)
      alert('Greška pri čuvanju podataka')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.container}>Učitavanje...</div>
  }

  if (!match) {
    return <div className={styles.container}>Utakmica nije pronađena</div>
  }

  // Funkcije za dobijanje igrača
  const getPlayersByClub = (clubId) => {
    const clubIdNum = parseInt(clubId)
    return players[clubIdNum === match.home_club_id ? 'home' : 'away'] || []
  }

  const getLineupPlayersByClub = (clubId) => {
    const clubIdNum = parseInt(clubId)
    return lineups[clubIdNum === match.home_club_id ? 'home' : 'away'] || []
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "goal": return "⚽"
      case "assist": return "🎯"
      case "yellow": return "🟨"
      case "red": return "🟥"
      case "own_goal": return "😞"
      case "penalty_saved": return "🥅"
      case "penalty_missed": return "❌"
      default: return "📝"
    }
  }

  const getEventLabel = (type) => {
    return eventTypes.find(et => et.value === type)?.label || type
  }

  return (
    <>
      <Head>
        <title>Događaji utakmice | Admin</title>
        <meta name="description" content="Unos događaja utakmice" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/rounds" className={styles.backButton}>
            <FaArrowLeft /> Nazad na kola
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Događaji utakmice</h1>
            <div className={styles.matchInfo}>
              {match.home_club?.name} {match.home_score}:{match.away_score} {match.away_club?.name}
              <br />
              <small>{new Date(match.date).toLocaleDateString("bs-BA")}</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            {/* Postojeći događaji */}
            <div className={styles.eventsSection}>
              <div className={styles.sectionHeader}>
                <h2>Postojeći događaji</h2>
              </div>

              <div className={styles.eventsList}>
                {existingEvents
                  .filter(event => event.event_type !== "assist") // Filtrirati asistencije jer su dio gol događaja
                  .sort((a, b) => a.minute - b.minute)
                  .map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      <div className={styles.eventIcon}>{getEventIcon(event.event_type)}</div>
                      <div className={styles.eventDetails}>
                        <div className={styles.eventMinute}>{event.minute}'</div>
                        <div className={styles.eventType}>{getEventLabel(event.event_type)}</div>
                        <div className={styles.eventPlayer}>
                          {event.player_name} ({event.club_name})
                          {event.event_type === "goal" && event.assist_player_name && ` - asist: ${event.assist_player_name}`}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Dodavanje događaja */}
            <div className={styles.addEventSection}>
              <div className={styles.sectionHeader}>
                <h2>Dodaj novi događaj</h2>
              </div>

              <div className={styles.eventForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tip događaja</label>
                    <select name="event_type" value={newEvent.event_type} onChange={handleEventChange}>
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Igrač</label>
                    <select name="player_id" value={newEvent.player_id} onChange={handleEventChange}>
                      <option value="">Odaberite igrača</option>
                      {[...getPlayersByClub(match.home_club_id), ...getPlayersByClub(match.away_club_id)].map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.position} ({player.club_name})
                        </option>
                      ))}
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

                {newEvent.event_type === "goal" && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Asistencija (opciono)</label>
                      <select name="assist_player_id" value={newEvent.assist_player_id} onChange={handleEventChange}>
                        <option value="">Bez asistencije</option>
                        {(() => {
                          const selectedPlayer = [...getPlayersByClub(match.home_club_id), ...getPlayersByClub(match.away_club_id)]
                            .find(p => p.id.toString() === newEvent.player_id.toString())
                          if (selectedPlayer) {
                            return getPlayersByClub(selectedPlayer.club_id)
                              .filter(p => p.id.toString() !== newEvent.player_id.toString())
                              .map(player => (
                                <option key={player.id} value={player.id}>
                                  {player.name} - {player.position}
                                </option>
                              ))
                          }
                          return []
                        })()}
                      </select>
                    </div>
                  </div>
                )}

                <button type="button" className={styles.addButton} onClick={addEvent}>
                  <FaPlus /> Dodaj događaj
                </button>
              </div>

              {/* Lista dodanih događaja */}
              {events.length > 0 && (
                <div className={styles.addedEvents}>
                  <h3>Dodani događaji:</h3>
                  {events
                    .filter(event => event.event_type !== "assist") // Filtrirati asistencije jer su dio gol događaja
                    .map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      <div className={styles.eventIcon}>{getEventIcon(event.event_type)}</div>
                      <div className={styles.eventDetails}>
                        <div className={styles.eventMinute}>{event.minute}'</div>
                        <div className={styles.eventType}>{getEventLabel(event.event_type)}</div>
                        <div className={styles.eventPlayer}>
                          {[...getPlayersByClub(match.home_club_id), ...getPlayersByClub(match.away_club_id)]
                            .find(p => p.id.toString() === event.player_id.toString())?.name}
                          {event.event_type === "goal" && event.assist_player_id && ` - asist: ${
                            [...getPlayersByClub(match.home_club_id), ...getPlayersByClub(match.away_club_id)]
                              .find(p => p.id.toString() === event.assist_player_id.toString())?.name
                          }`}
                        </div>
                      </div>
                      <button type="button" className={styles.removeButton} onClick={() => removeEvent(event.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sekcija za izmjene */}
            <div className={styles.substitutionsSection}>
              <div className={styles.sectionHeader}>
                <h2>Izmjene</h2>
              </div>

              <div className={styles.substitutionsList}>
                {existingSubstitutions
                  .sort((a, b) => a.minute - b.minute)
                  .map((sub) => (
                    <div key={sub.id} className={styles.substitutionItem}>
                      <div className={styles.substitutionMinute}>{sub.minute}'</div>
                      <div className={styles.substitutionDetails}>
                        <div className={styles.substitutionClub}>
                          {parseInt(sub.club_id) === match.home_club_id ? match.home_club?.name : match.away_club?.name}
                        </div>
                        <div className={styles.substitutionPlayers}>
                          {sub.player_out_name} → {sub.player_in_name}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className={styles.substitutionForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Klub</label>
                    <select name="club_id" value={newSubstitution.club_id} onChange={handleSubstitutionChange}>
                      <option value="">Odaberite klub</option>
                      <option value={match.home_club_id}>{match.home_club?.name}</option>
                      <option value={match.away_club_id}>{match.away_club?.name}</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Izlazi</label>
                    <select name="player_out_id" value={newSubstitution.player_out_id} onChange={handleSubstitutionChange}>
                      <option value="">Odaberite igrača</option>
                      {newSubstitution.club_id && getLineupPlayersByClub(parseInt(newSubstitution.club_id)).map((player) => (
                        <option key={player.player_id} value={player.player_id}>
                          {player.player_name} - {player.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ulazi</label>
                    <select name="player_in_id" value={newSubstitution.player_in_id} onChange={handleSubstitutionChange}>
                      <option value="">Odaberite igrača</option>
                      {newSubstitution.club_id && getPlayersByClub(parseInt(newSubstitution.club_id))
                        .filter(p => !getLineupPlayersByClub(parseInt(newSubstitution.club_id))
                          .some(lp => lp.player_id.toString() === p.id.toString()))
                        .map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name} - {player.position}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Minuta</label>
                    <input
                      type="number"
                      name="minute"
                      value={newSubstitution.minute}
                      onChange={handleSubstitutionChange}
                      min="1"
                      max="120"
                      placeholder="90"
                    />
                  </div>
                </div>

                <button type="button" className={styles.addButton} onClick={addSubstitution}>
                  <FaPlus /> Dodaj izmjenu
                </button>
              </div>

              {/* Lista dodanih izmjena */}
              {substitutions.length > 0 && (
                <div className={styles.addedSubstitutions}>
                  <h3>Dodane izmjene:</h3>
                  {substitutions.map((sub) => (
                    <div key={sub.id} className={styles.substitutionItem}>
                      <div className={styles.substitutionMinute}>{sub.minute}'</div>
                      <div className={styles.substitutionDetails}>
                        <div className={styles.substitutionClub}>
                          {parseInt(sub.club_id) === match.home_club_id ? match.home_club?.name : match.away_club?.name}
                        </div>
                        <div className={styles.substitutionPlayers}>
                          {getLineupPlayersByClub(parseInt(sub.club_id))
                            .find(p => p.player_id.toString() === sub.player_out_id.toString())?.player_name} → 
                          {getPlayersByClub(parseInt(sub.club_id))
                            .find(p => p.id.toString() === sub.player_in_id.toString())?.name}
                        </div>
                      </div>
                      <button type="button" className={styles.removeButton} onClick={() => removeSubstitution(sub.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/admin/rounds" className={styles.cancelButton}>
              Otkaži
            </Link>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              <FaSave /> {saving ? 'Čuvanje...' : 'Sačuvaj sve'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
