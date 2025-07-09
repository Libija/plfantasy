"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaArrowLeft, FaSave, FaPlus, FaTrash } from "react-icons/fa"
import styles from "../../../../../styles/AdminMatchEvents.module.css"

export default function MatchEvents() {
  const params = useParams()
  const matchId = params.id

  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [substitutions, setSubstitutions] = useState([])
  const [players, setPlayers] = useState({
    home: [],
    away: []
  })
  const [saving, setSaving] = useState(false)

  const eventTypes = [
    { value: "goal", label: "Gol" },
    { value: "yellow", label: "Žuti karton" },
    { value: "red", label: "Crveni karton" },
    { value: "own_goal", label: "Autogol" },
    { value: "penalty_saved", label: "Odbijen penal" },
    { value: "penalty_missed", label: "Propušten penal" }
  ]

  useEffect(() => {
    fetchMatchData()
  }, [matchId])

  useEffect(() => {
    if (match) {
      fetchPlayers()
    }
  }, [match])

  const fetchMatchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/matches/${matchId}/detailed`)
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
      const homeResponse = await fetch(`${apiUrl}/admin/players?club_id=${match.home_club_id}`)
      const homePlayers = homeResponse.ok ? await homeResponse.json() : []
      
      // Fetch igrače za gostujući klub
      const awayResponse = await fetch(`${apiUrl}/admin/players?club_id=${match.away_club_id}`)
      const awayPlayers = awayResponse.ok ? await awayResponse.json() : []
      
      setPlayers({
        home: homePlayers,
        away: awayPlayers
      })
    } catch (error) {
      console.error('Greška pri učitavanju igrača:', error)
    }
  }

  const addEvent = () => {
    setEvents(prev => [...prev, {
      id: Date.now(),
      player_id: "",
      event_type: "goal",
      minute: 0,
      assist_player_id: "" // Dodano za asistenciju
    }])
  }

  const addSubstitution = () => {
    setSubstitutions(prev => [...prev, {
      id: Date.now(),
      club_id: match.home_club_id,
      player_out_id: "",
      player_in_id: "",
      minute: 0
    }])
  }

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const removeSubstitution = (id) => {
    setSubstitutions(prev => prev.filter(sub => sub.id !== id))
  }

  const handleEventChange = (id, field, value) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ))
  }

  const handleSubstitutionChange = (id, field, value) => {
    setSubstitutions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Sačuvaj događaje
      for (const event of events) {
        await fetch(`${apiUrl}/api/matchevents/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: parseInt(matchId),
            player_id: parseInt(event.player_id) || 1,
            event_type: event.event_type,
            minute: parseInt(event.minute),
            assist_player_id: event.assist_player_id ? parseInt(event.assist_player_id) : null
          }),
        })
      }

      // Sačuvaj izmjene
      for (const sub of substitutions) {
        await fetch(`${apiUrl}/api/match-substitutions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: parseInt(matchId),
            club_id: parseInt(sub.club_id),
            player_out_id: parseInt(sub.player_out_id) || 1,
            player_in_id: parseInt(sub.player_in_id) || 1,
            minute: parseInt(sub.minute)
          }),
        })
      }

      alert("Događaji i izmjene su uspješno sačuvani!")
    } catch (error) {
      console.error('Greška pri čuvanju događaja:', error)
      alert('Greška pri čuvanju događaja')
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
          <h1 className={styles.title}>Događaji utakmice</h1>
        </div>

        <div className={styles.matchInfo}>
          <h2>{match.home_club?.name || `Domaći klub (${match.home_club_id})`} vs {match.away_club?.name || `Gostujući klub (${match.away_club_id})`}</h2>
          <p>Datum: {new Date(match.date).toLocaleDateString("bs-BA")}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Događaji */}
          <div className={styles.section}>
            <h2>Događaji u utakmici</h2>
            <button type="button" onClick={addEvent} className={styles.addButton}>
              <FaPlus /> Dodaj događaj
            </button>
            
            {events.map((event) => (
              <div key={event.id} className={styles.eventRow}>
                <select
                  value={event.event_type}
                  onChange={(e) => handleEventChange(event.id, 'event_type', e.target.value)}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={event.player_id}
                  onChange={(e) => handleEventChange(event.id, 'player_id', e.target.value)}
                >
                  <option value="">Izaberi igrača</option>
                  {players.home.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({match.home_club?.name || 'Domaći'})
                    </option>
                  ))}
                  {players.away.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({match.away_club?.name || 'Gostujući'})
                    </option>
                  ))}
                </select>
                {event.event_type === "goal" && (
                  <select
                    value={event.assist_player_id}
                    onChange={(e) => handleEventChange(event.id, 'assist_player_id', e.target.value)}
                  >
                    <option value="">Bez asistencije</option>
                    {players.home.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({match.home_club?.name || 'Domaći'})
                      </option>
                    ))}
                    {players.away.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({match.away_club?.name || 'Gostujući'})
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  placeholder="Minuta"
                  value={event.minute}
                  onChange={(e) => handleEventChange(event.id, 'minute', e.target.value)}
                  min="1"
                  max="90"
                />
                <button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Izmjene */}
          <div className={styles.section}>
            <h2>Izmjene</h2>
            <button type="button" onClick={addSubstitution} className={styles.addButton}>
              <FaPlus /> Dodaj izmjenu
            </button>
            
            {substitutions.map((sub) => (
              <div key={sub.id} className={styles.eventRow}>
                <select
                  value={sub.club_id}
                  onChange={(e) => handleSubstitutionChange(sub.id, 'club_id', e.target.value)}
                >
                  <option value={match.home_club_id}>{match.home_club?.name || `Domaći klub (${match.home_club_id})`}</option>
                  <option value={match.away_club_id}>{match.away_club?.name || `Gostujući klub (${match.away_club_id})`}</option>
                </select>
                <select
                  value={sub.player_out_id}
                  onChange={(e) => handleSubstitutionChange(sub.id, 'player_out_id', e.target.value)}
                >
                  <option value="">Igrač koji izlazi</option>
                  {sub.club_id == match.home_club_id ? 
                    players.home.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    )) :
                    players.away.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))
                  }
                </select>
                <select
                  value={sub.player_in_id}
                  onChange={(e) => handleSubstitutionChange(sub.id, 'player_in_id', e.target.value)}
                >
                  <option value="">Igrač koji ulazi</option>
                  {sub.club_id == match.home_club_id ? 
                    players.home.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    )) :
                    players.away.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))
                  }
                </select>
                <input
                  type="number"
                  placeholder="Minuta"
                  value={sub.minute}
                  onChange={(e) => handleSubstitutionChange(sub.id, 'minute', e.target.value)}
                  min="1"
                  max="90"
                />
                <button
                  type="button"
                  onClick={() => removeSubstitution(sub.id)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            <Link href="/admin/rounds" className={styles.cancelButton}>
              Otkaži
            </Link>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              <FaSave /> {saving ? 'Čuvanje...' : 'Sačuvaj događaje i izmjene'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
