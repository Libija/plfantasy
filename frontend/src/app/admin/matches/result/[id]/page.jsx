"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import styles from "../../../../../styles/AdminMatchForm.module.css"

export default function MatchResult() {
  const { id: matchId } = useParams()
  const router = useRouter()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resultData, setResultData] = useState({
    home_score: 0,
    away_score: 0
  })
  const [statistics, setStatistics] = useState({
    home: {
      possession: 50,
      shots: 0,
      shots_on_target: 0,
      corners: 0,
      fouls: 0,
      yellow_cards: 0,
      red_cards: 0,
      offsides: 0
    },
    away: {
      possession: 50,
      shots: 0,
      shots_on_target: 0,
      corners: 0,
      fouls: 0,
      yellow_cards: 0,
      red_cards: 0,
      offsides: 0
    }
  })


  // Dodaj state za prvu postavu
  const [lineups, setLineups] = useState({
    home: Array(11).fill(''),
    away: Array(11).fill(''),
  })

  // Dodaj state za igrače
  const [players, setPlayers] = useState({
    home: [],
    away: []
  })

  useEffect(() => {
    fetchMatchData()
  }, [matchId])

  // Dodaj novi useEffect za fetch igrača
  useEffect(() => {
    if (match) {
      fetchPlayers()
      fetchLineups()
    }
  }, [match])

  const fetchMatchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
              const response = await fetch(`${apiUrl}/admin/matches/${matchId}/detailed`)
      if (response.ok) {
        const data = await response.json()

        setMatch(data)
        setResultData({
          home_score: data.home_score || 0,
          away_score: data.away_score || 0
        })
      } else {
        console.error('Greška pri učitavanju utakmice')
      }
    } catch (error) {
      console.error('Greška pri učitavanju utakmice:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLineups = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/match-lineups/match/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setLineups(data)
      } else {
        console.error('Greška pri učitavanju sastava')
      }
    } catch (error) {
      console.error('Greška pri učitavanju sastava:', error)
    }
  }

  const handleResultChange = (e) => {
    const { name, value } = e.target
    setResultData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }))
  }

  const handleStatisticsChange = (team, stat, value) => {
    setStatistics(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [stat]: parseInt(value) || 0
      }
    }))
  }



  // Handleri za unos prvu postavu
  const handleLineupChange = (team, idx, value) => {
    setLineups(prev => ({
      ...prev,
      [team]: prev[team].map((v, i) => (i === idx ? value : v)),
    }))
  }

  // Funkcija za provjeru da li je igrač već izabran
  const isPlayerSelected = (team, playerId, currentIndex) => {
    if (!playerId) return false
    
    // Konvertuj playerId u string za poređenje
    const playerIdStr = playerId.toString()
    
    // Provjeri da li je igrač već izabran u nekoj drugoj poziciji
    return lineups[team].some((id, idx) => {
      const idStr = id.toString()
      return idStr === playerIdStr && idx !== currentIndex
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    // Validacija da li su svi igrači različiti
    const homePlayerIds = lineups.home.filter(id => id !== '')
    const awayPlayerIds = lineups.away.filter(id => id !== '')
    
    const homeDuplicates = homePlayerIds.filter((id, index) => homePlayerIds.indexOf(id) !== index)
    const awayDuplicates = awayPlayerIds.filter((id, index) => awayPlayerIds.indexOf(id) !== index)
    
    if (homeDuplicates.length > 0) {
      alert('Greška: Isti igrač je izabran više puta u domaćoj postavi!')
      setSaving(false)
      return
    }
    
    if (awayDuplicates.length > 0) {
      alert('Greška: Isti igrač je izabran više puta u gostujućoj postavi!')
      setSaving(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      // Ažuriraj rezultat
      const resultResponse = await fetch(`${apiUrl}/admin/matches/${matchId}/score`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          home_score: resultData.home_score,
          away_score: resultData.away_score
        }),
      })

      if (resultResponse.ok) {
        // Sačuvaj statistike za domaći tim
        const homeStatsResponse = await fetch(`${apiUrl}/admin/match-statistics/match/${matchId}/club/${match.home_club.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statistics.home),
        })

        // Sačuvaj statistike za gostujući tim
        const awayStatsResponse = await fetch(`${apiUrl}/admin/match-statistics/match/${matchId}/club/${match.away_club.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statistics.away),
        })

        // Sačuvaj prvu postavu
        const lineupData = []
        
        // Dodaj domaću postavu
        lineups.home.forEach((playerId, index) => {
          if (playerId) {
            const player = players.home.find(p => p.id == playerId)
            if (player) {
              lineupData.push({
                match_id: parseInt(matchId),
                player_id: parseInt(playerId),
                club_id: match.home_club_id,
                lineup_type: "starting",
                shirt_number: player.shirt_number || index + 1,
                position: player.position,
                is_captain: false
              })
            }
          }
        })

        // Dodaj gostujuću postavu
        lineups.away.forEach((playerId, index) => {
          if (playerId) {
            const player = players.away.find(p => p.id == playerId)
            if (player) {
              lineupData.push({
                match_id: parseInt(matchId),
                player_id: parseInt(playerId),
                club_id: match.away_club_id,
                lineup_type: "starting",
                shirt_number: player.shirt_number || index + 1,
                position: player.position,
                is_captain: false
              })
            }
          }
        })

        // Sačuvaj postave u bazu
        if (lineupData.length > 0) {
          // Obriši postojeće postave
          await fetch(`${apiUrl}/admin/match-lineups/match/${matchId}`, {
            method: 'DELETE'
          })

          // Kreiraj nove postave
          const lineupResponse = await fetch(`${apiUrl}/admin/match-lineups/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              match_id: parseInt(matchId),
              lineups: lineupData
            }),
          })

          if (!lineupResponse.ok) {
            console.error('Greška pri čuvanju postava')
          }
        }

        alert("Rezultat je uspješno sačuvan!")
        
        // Preusmjeri na stranicu sa kolima nakon kratkog kašnjenja
        setTimeout(() => {
          router.push('/admin/rounds')
        }, 1000)
      } else {
        const errorData = await resultResponse.json()
        alert(`Greška: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Greška pri čuvanju rezultata:', error)
      alert('Greška pri čuvanju rezultata')
    } finally {
      setSaving(false)
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

  if (loading) {
    return <div className={styles.container}>Učitavanje...</div>
  }

  if (!match) {
    return <div className={styles.container}>Utakmica nije pronađena</div>
  }

  // Funkcija za dobijanje liste izabranih igrača
  const getSelectedPlayers = (team) => {
    return lineups[team]
      .map((playerId, index) => {
        if (!playerId) return null
        const player = players[team].find(p => p.id.toString() === playerId.toString())
        return player ? `${index + 1}. ${player.name} (${player.position})` : null
      })
      .filter(Boolean)
  }

  const selectedHomePlayers = getSelectedPlayers('home')
  const selectedAwayPlayers = getSelectedPlayers('away')

  return (
    <>
      <Head>
        <title>Rezultat utakmice | Admin</title>
        <meta name="description" content="Unos rezultata utakmice" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/rounds" className={styles.backButton}>
            <FaArrowLeft /> Nazad na kola
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Rezultat utakmice</h1>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Informacije o utakmici</h2>
            <div className={styles.teamsSelector}>
              <div className={styles.teamGroup}>
                <label>{match.home_club?.name || `Domaći klub (${match.home_club_id || 'N/A'})`}</label>
              </div>
              <div className={styles.vsIndicator}>VS</div>
              <div className={styles.teamGroup}>
                <label>{match.away_club?.name || `Gostujući klub (${match.away_club_id || 'N/A'})`}</label>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Datum</label>
                <input type="text" value={new Date(match.date).toLocaleDateString("bs-BA")} disabled />
              </div>
              <div className={styles.formGroup}>
                <label>Stadion</label>
                <input type="text" value={match.stadium} disabled />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Rezultat */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Rezultat utakmice</h2>
              <div className={styles.teamsSelector}>
                <div className={styles.teamGroup}>
                  <label>{match.home_club?.name || `Domaći klub (${match.home_club_id || 'N/A'})`}</label>
                  <input
                    type="number"
                    name="home_score"
                    value={resultData.home_score}
                    onChange={handleResultChange}
                    min="0"
                    required
                  />
                </div>
                <div className={styles.vsIndicator}>:</div>
                <div className={styles.teamGroup}>
                  <label>{match.away_club?.name || `Gostujući klub (${match.away_club_id || 'N/A'})`}</label>
                  <input
                    type="number"
                    name="away_score"
                    value={resultData.away_score}
                    onChange={handleResultChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Prva postava */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Prva postava</h2>
              
              {/* Informacija o izabranim igračima */}
              <div className={styles.noteInfo}>
                <strong>Napomena:</strong> Igrači koji su već izabrani u drugoj poziciji će biti onemogućeni u dropdown-ovima. 
                Potrebno je izabrati 11 igrača za svaki tim.
                <br />
                <strong>Status:</strong> Domaći tim: {selectedHomePlayers.length}/11, Gostujući tim: {selectedAwayPlayers.length}/11
              </div>

              {/* Prikaz izabranih igrača */}
              {(selectedHomePlayers.length > 0 || selectedAwayPlayers.length > 0) && (
                <div className={styles.selectedPlayersInfo}>
                  <strong>Izabrani igrači:</strong>
                  <div className={styles.selectedPlayersGrid}>
                    <div>
                      <strong>{match.home_club?.name}:</strong>
                      {selectedHomePlayers.length > 0 ? (
                        <ul className={styles.selectedPlayersList}>
                          {selectedHomePlayers.map((player, index) => (
                            <li key={index}>{player}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.noPlayersMessage}>Nema izabranih igrača</p>
                      )}
                    </div>
                    <div>
                      <strong>{match.away_club?.name}:</strong>
                      {selectedAwayPlayers.length > 0 ? (
                        <ul className={styles.selectedPlayersList}>
                          {selectedAwayPlayers.map((player, index) => (
                            <li key={index}>{player}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.noPlayersMessage}>Nema izabranih igrača</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <h3>{match.home_club?.name || `Domaći klub (${match.home_club_id})`}</h3>
                  {lineups.home.map((playerId, idx) => (
                    <select
                      key={idx}
                      value={playerId}
                      onChange={e => handleLineupChange('home', idx, e.target.value)}
                      className={styles.formGroup}
                    >
                      <option value="">Izaberi igrača #{idx + 1}</option>
                      {players.home.map(player => (
                        <option 
                          key={player.id} 
                          value={player.id}
                          disabled={isPlayerSelected('home', player.id, idx)}
                        >
                          {player.name} - {player.position}
                          {isPlayerSelected('home', player.id, idx) ? ' (već izabran u drugoj poziciji)' : ''}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
                <div className={styles.formGroup}>
                  <h3>{match.away_club?.name || `Gostujući klub (${match.away_club_id})`}</h3>
                  {lineups.away.map((playerId, idx) => (
                    <select
                      key={idx}
                      value={playerId}
                      onChange={e => handleLineupChange('away', idx, e.target.value)}
                      className={styles.formGroup}
                    >
                      <option value="">Izaberi igrača #{idx + 1}</option>
                      {players.away.map(player => (
                        <option 
                          key={player.id} 
                          value={player.id}
                          disabled={isPlayerSelected('away', player.id, idx)}
                        >
                          {player.name} - {player.position}
                          {isPlayerSelected('away', player.id, idx) ? ' (već izabran u drugoj poziciji)' : ''}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistike */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Statistike utakmice</h2>
              
              {/* Domaći tim */}
              <div className={styles.formSection}>
                <h3>{match.home_club?.name || `Domaći klub (${match.home_club_id || 'N/A'})`}</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Posjed lopte (%)</label>
                    <input
                      type="number"
                      value={statistics.home.possession}
                      onChange={(e) => handleStatisticsChange('home', 'possession', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ukupno šuteva</label>
                    <input
                      type="number"
                      value={statistics.home.shots}
                      onChange={(e) => handleStatisticsChange('home', 'shots', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Šutevi u okvir</label>
                    <input
                      type="number"
                      value={statistics.home.shots_on_target}
                      onChange={(e) => handleStatisticsChange('home', 'shots_on_target', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Korneri</label>
                    <input
                      type="number"
                      value={statistics.home.corners}
                      onChange={(e) => handleStatisticsChange('home', 'corners', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Prekršaji</label>
                    <input
                      type="number"
                      value={statistics.home.fouls}
                      onChange={(e) => handleStatisticsChange('home', 'fouls', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Žuti kartoni</label>
                    <input
                      type="number"
                      value={statistics.home.yellow_cards}
                      onChange={(e) => handleStatisticsChange('home', 'yellow_cards', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Crveni kartoni</label>
                    <input
                      type="number"
                      value={statistics.home.red_cards}
                      onChange={(e) => handleStatisticsChange('home', 'red_cards', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ofsajdi</label>
                    <input
                      type="number"
                      value={statistics.home.offsides}
                      onChange={(e) => handleStatisticsChange('home', 'offsides', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Gostujući tim */}
              <div className={styles.formSection}>
                <h3>{match.away_club?.name || `Gostujući klub (${match.away_club_id || 'N/A'})`}</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Posjed lopte (%)</label>
                    <input
                      type="number"
                      value={statistics.away.possession}
                      onChange={(e) => handleStatisticsChange('away', 'possession', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ukupno šuteva</label>
                    <input
                      type="number"
                      value={statistics.away.shots}
                      onChange={(e) => handleStatisticsChange('away', 'shots', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Šutevi u okvir</label>
                    <input
                      type="number"
                      value={statistics.away.shots_on_target}
                      onChange={(e) => handleStatisticsChange('away', 'shots_on_target', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Korneri</label>
                    <input
                      type="number"
                      value={statistics.away.corners}
                      onChange={(e) => handleStatisticsChange('away', 'corners', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Prekršaji</label>
                    <input
                      type="number"
                      value={statistics.away.fouls}
                      onChange={(e) => handleStatisticsChange('away', 'fouls', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Žuti kartoni</label>
                    <input
                      type="number"
                      value={statistics.away.yellow_cards}
                      onChange={(e) => handleStatisticsChange('away', 'yellow_cards', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Crveni kartoni</label>
                    <input
                      type="number"
                      value={statistics.away.red_cards}
                      onChange={(e) => handleStatisticsChange('away', 'red_cards', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ofsajdi</label>
                    <input
                      type="number"
                      value={statistics.away.offsides}
                      onChange={(e) => handleStatisticsChange('away', 'offsides', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>



            <div className={styles.formActions}>
              <Link href="/admin/rounds" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button 
                type="submit" 
                className={styles.saveButton} 
                disabled={saving || selectedHomePlayers.length < 11 || selectedAwayPlayers.length < 11}
              >
                <FaSave /> {saving ? 'Čuvanje...' : 'Sačuvaj rezultat'}
                {!saving && (selectedHomePlayers.length < 11 || selectedAwayPlayers.length < 11) && 
                  ` (Potrebno ${11 - Math.min(selectedHomePlayers.length, selectedAwayPlayers.length)} igrača više)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
