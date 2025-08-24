"use client"

import { useState, useEffect, useCallback } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaCrown, FaStar } from "react-icons/fa"
import styles from "../../../styles/FantasyTransfers.module.css"
import useAuth from "../../../hooks/use-auth"

export default function FantasyTransfers() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3")
  const [selectedPlayers, setSelectedPlayers] = useState({
    GK: null,
    DF1: null,
    DF2: null,
    DF3: null,
    DF4: null,
    MF1: null,
    MF2: null,
    MF3: null,
    FW1: null,
    FW2: null,
    FW3: null,
    // Bench
    GK_BENCH: null,
    DF_BENCH: null,
    MF_BENCH: null,
    FW_BENCH: null,
  })
  const [captainId, setCaptainId] = useState(null)
  const [viceCaptainId, setViceCaptainId] = useState(null)
  const [budget, setBudget] = useState(100)
  const [totalBudget, setTotalBudget] = useState(100)
  const [showModal, setShowModal] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [activeTab, setActiveTab] = useState("golmani")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDraftMode, setIsDraftMode] = useState(false)
  const [transferWindow, setTransferWindow] = useState(null)
  const [transfersInfo, setTransfersInfo] = useState(null)
  const [fantasyTeam, setFantasyTeam] = useState(null)
  const [allPlayers, setAllPlayers] = useState({
    golmani: [],
    odbrana: [],
    veznjaci: [],
    napadaci: []
  })
  const [currentGameweekPoints, setCurrentGameweekPoints] = useState(null)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapPlayer, setSwapPlayer] = useState(null)
  const [swapOptions, setSwapOptions] = useState([])
  const { user, isLoggedIn, loading: authLoading } = useAuth()

  // 1. Definiši konstante za broj igrača po poziciji
  const SQUAD_REQUIREMENTS = { GK: 2, DF: 5, MF: 5, FW: 3 };

  const formations = [
    { value: "4-3-3", label: "4-3-3", positions: { DF: 4, MF: 3, FW: 3 } },
    { value: "4-4-2", label: "4-4-2", positions: { DF: 4, MF: 4, FW: 2 } },
    { value: "3-5-2", label: "3-5-2", positions: { DF: 3, MF: 5, FW: 2 } },
    { value: "5-3-2", label: "5-3-2", positions: { DF: 5, MF: 3, FW: 2 } },
    { value: "4-5-1", label: "4-5-1", positions: { DF: 4, MF: 5, FW: 1 } },
  ]

  useEffect(() => {

    if (authLoading) return
    if (!isLoggedIn) {
      window.location.href = "/login"
      return
    }
    fetchTransfersData()
  }, [authLoading, isLoggedIn, user])

  const fetchTransfersData = async () => {
    try {
      console.log('DEBUG fetchTransfersData - počinjem dohvatanje podataka')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/fantasy/transfers/${user.id}`)
      
      if (!res.ok) {
        throw new Error("Greška pri dohvatu podataka")
      }
      
      const data = await res.json()
      console.log('DEBUG fetchTransfersData - podaci dohvaćeni:', {
        fantasy_team: data.fantasy_team?.formation,
        team_players_count: data.team_players?.length,
        transfer_window: data.transfer_window?.is_open,
        is_draft_mode: data.is_draft_mode
      })
      

      
      setFantasyTeam(data.fantasy_team)
      // Budget logika: budget je dostupni budžet iz baze
      setBudget(data.fantasy_team.budget)
      
      // Izračunaj ukupan budžet na osnovu dostupnog budžeta + vrijednost tima
      const currentTeamValue = data.team_players.reduce((acc, tp) => acc + (tp.price || 0), 0)
      setTotalBudget(data.fantasy_team.budget + currentTeamValue)
      
      setSelectedFormation(data.fantasy_team.formation)
      setTransferWindow(data.transfer_window)
      setTransfersInfo(data.transfers_info)
      console.log('DEBUG fetchTransfersData - transfersInfo:', JSON.stringify(data.transfers_info, null, 2))
      setIsDraftMode(data.is_draft_mode)
      setAllPlayers(data.all_players)
      
      // Ako nije draft mode i transfer window je zatvoren, dohvati fantasy poene
      if (!data.is_draft_mode && data.transfer_window && !data.transfer_window.is_open && data.fantasy_team) {
        console.log('DEBUG fetchTransfersData - dohvaćam fantasy poene')
        await fetchCurrentGameweekPoints(data.fantasy_team.id)
      }
      
      // Ako nije draft mode, učitaj postojeće igrače
      if (!data.is_draft_mode && data.team_players.length > 0) {
        console.log('DEBUG fetchTransfersData - učitavam postojeće igrače')
        const existingPlayers = {}
        data.team_players.forEach(tp => {
  
          existingPlayers[tp.formation_position] = {
            id: tp.player_id,
            name: tp.player_name,
            team: tp.club_name,
            price: tp.price,
            points: tp.points,
            club_id: tp.club_id,
            position: tp.player_position // Dodaj poziciju igrača
          }
          if (tp.is_captain) setCaptainId(tp.player_id)
          if (tp.is_vice_captain) setViceCaptainId(tp.player_id)
        })

        console.log('DEBUG fetchTransfersData - postojeći igrači:', Object.keys(existingPlayers))
        setSelectedPlayers(existingPlayers)
      }
      
    } catch (err) {
      console.error('DEBUG fetchTransfersData - greška:', err)
      setError("Greška pri dohvatu podataka: " + err.message)
          } finally {
        setLoading(false)
      }
    }

  const fetchCurrentGameweekPoints = async (fantasyTeamId) => {
    try {
      console.log('DEBUG fetchCurrentGameweekPoints - dohvaćam poene za tim:', fantasyTeamId)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const res = await fetch(`${apiUrl}/fantasy/team/${fantasyTeamId}/gameweek/current`)
      
      if (!res.ok) {
        throw new Error("Greška pri dohvatu fantasy poena")
      }
      
      const data = await res.json()
      console.log('DEBUG fetchCurrentGameweekPoints - poeni dohvaćeni:', {
        players_count: data.players?.length,
        total_points: data.total_points
      })

      setCurrentGameweekPoints(data)
    } catch (err) {
      console.error("Greška pri dohvatu fantasy poena:", err)
    }
  }

  const handleFormationChange = (formation) => {
    console.log('DEBUG handleFormationChange - mijenjam formaciju na:', formation)

    // Ne dozvoli promenu formacije kada je transfer window zatvoren (osim za draft mode)
    if (!isDraftMode && transferWindow && !transferWindow.is_open) {
      console.log('DEBUG handleFormationChange - transfer window zatvoren')
      alert("Transfer window je zatvoren. Ne možete menjati formaciju u ovom trenutku.")
      return
    }
    
    const oldFormation = selectedFormation
    const [oldDF, oldMF, oldFW] = oldFormation.split('-').map(Number)
    const [newDF, newMF, newFW] = formation.split('-').map(Number)
    
    console.log('DEBUG handleFormationChange - stara formacija:', oldFormation, 'nova formacija:', formation)
    console.log('DEBUG handleFormationChange - stari brojevi:', { oldDF, oldMF, oldFW })
    console.log('DEBUG handleFormationChange - novi brojevi:', { newDF, newMF, newFW })
    
    // 1. Sačuvaj sve postojeće igrače grupisane po poziciji
    const gkPlayers = []
    const dfPlayers = []
    const mfPlayers = []
    const fwPlayers = []
    
    Object.entries(selectedPlayers).forEach(([position, player]) => {
      if (player) {
        // Proveri poziciju na osnovu ključa, ne na osnovu player.position
        if (position === 'GK') {
          gkPlayers.push(player)
        } else if (position.startsWith('DF')) {
          dfPlayers.push(player)
        } else if (position.startsWith('MF')) {
          mfPlayers.push(player)
        } else if (position.startsWith('FW')) {
          fwPlayers.push(player)
        } else if (position === 'GK_BENCH_1') {
          gkPlayers.push(player)
        } else if (position.startsWith('DF_BENCH')) {
          dfPlayers.push(player)
        } else if (position.startsWith('MF_BENCH')) {
          mfPlayers.push(player)
        } else if (position.startsWith('FW_BENCH')) {
          fwPlayers.push(player)
        }
      }
    })
    
    console.log('DEBUG: Igrači po poziciji:', {
      GK: gkPlayers.length,
      DF: dfPlayers.length,
      MF: mfPlayers.length,
      FW: fwPlayers.length
    })
    
    // 2. Kreiraj novi selectedPlayers objekat
    const newPlayers = {}
    
    // Dodaj GK poziciju (uvijek postoji)
    newPlayers['GK'] = null
    
    // Dodaj DF pozicije za novu formaciju
    for (let i = 1; i <= newDF; i++) {
      newPlayers[`DF${i}`] = null
    }
    
    // Dodaj MF pozicije za novu formaciju
    for (let i = 1; i <= newMF; i++) {
      newPlayers[`MF${i}`] = null
    }
    
    // Dodaj FW pozicije za novu formaciju
    for (let i = 1; i <= newFW; i++) {
      newPlayers[`FW${i}`] = null
    }
    
    // Dodaj bench pozicije za novu formaciju
    const benchSlots = getBenchSlotsForFormation(formation)
    benchSlots.forEach(slot => {
      newPlayers[slot] = null
    })
    
    console.log('DEBUG: Novi selectedPlayers objekat:', newPlayers)
    console.log('DEBUG: Broj pozicija:', Object.keys(newPlayers).length)
    
    // 3. Popuni pozicije sa igračima prema njihovoj poziciji
    
    // Popuni GK poziciju
    if (gkPlayers.length > 0) {
      newPlayers['GK'] = gkPlayers[0]
      gkPlayers.splice(0, 1) // Ukloni korišćenog igrača
    }
    
    // Popuni DF pozicije
    for (let i = 1; i <= newDF; i++) {
      if (dfPlayers.length > 0) {
        newPlayers[`DF${i}`] = dfPlayers[0]
        dfPlayers.splice(0, 1) // Ukloni korišćenog igrača
      }
    }
    
    // Popuni MF pozicije
    for (let i = 1; i <= newMF; i++) {
      if (mfPlayers.length > 0) {
        newPlayers[`MF${i}`] = mfPlayers[0]
        mfPlayers.splice(0, 1) // Ukloni korišćenog igrača
      }
    }
    
    // Popuni FW pozicije
    for (let i = 1; i <= newFW; i++) {
      if (fwPlayers.length > 0) {
        newPlayers[`FW${i}`] = fwPlayers[0]
        fwPlayers.splice(0, 1) // Ukloni korišćenog igrača
      }
    }
    
    // 4. Popuni bench pozicije sa preostalim igračima
    // Prvo popuni GK_BENCH_1 sa preostalim GK igračima
    if (gkPlayers.length > 0 && benchSlots.includes('GK_BENCH_1')) {
      newPlayers['GK_BENCH_1'] = gkPlayers[0]
      gkPlayers.splice(0, 1)
    }
    
    // Popuni DF bench pozicije
    const dfBenchSlots = benchSlots.filter(slot => slot.startsWith('DF_BENCH'))
    dfBenchSlots.forEach(slot => {
      if (dfPlayers.length > 0) {
        newPlayers[slot] = dfPlayers[0]
        dfPlayers.splice(0, 1)
      }
    })
    
    // Popuni MF bench pozicije
    const mfBenchSlots = benchSlots.filter(slot => slot.startsWith('MF_BENCH'))
    mfBenchSlots.forEach(slot => {
      if (mfPlayers.length > 0) {
        newPlayers[slot] = mfPlayers[0]
        mfPlayers.splice(0, 1)
      }
    })
    
    // Popuni FW bench pozicije
    const fwBenchSlots = benchSlots.filter(slot => slot.startsWith('FW_BENCH'))
    fwBenchSlots.forEach(slot => {
      if (fwPlayers.length > 0) {
        newPlayers[slot] = fwPlayers[0]
        fwPlayers.splice(0, 1)
      }
    })
    
    // 5. Ako imaš još igrača, popuni preostale bench pozicije
    const remainingPlayers = [...gkPlayers, ...dfPlayers, ...mfPlayers, ...fwPlayers]
    const emptyBenchSlots = benchSlots.filter(slot => !newPlayers[slot])
    
    remainingPlayers.forEach((player, index) => {
      if (index < emptyBenchSlots.length) {
        newPlayers[emptyBenchSlots[index]] = player
      }
    })
    
    console.log('DEBUG: Final players state:', newPlayers)
    console.log('DEBUG: Broj pozicija nakon popunjavanja:', Object.keys(newPlayers).length)
    console.log('DEBUG: Broj popunjenih pozicija:', Object.values(newPlayers).filter(p => p !== null).length)
    
    setSelectedPlayers(newPlayers)
    setSelectedFormation(formation)
  }

  const getFormationPositions = () => {
    const formation = formations.find((f) => f.value === selectedFormation)
    const positions = formation ? formation.positions : { DF: 4, MF: 3, FW: 3 }

    console.log('DEBUG getFormationPositions - formacija:', selectedFormation, 'pozicije:', positions)

    return positions
  }

  // Funkcija za generisanje klupe - UVIJEK vraća tačno 4 slotova za svaku formaciju
  const getBenchSlots = useCallback(() => {
    return getBenchSlotsForFormation(selectedFormation)
  }, [selectedFormation, formations])

  // Funkcija za generisanje klupe za određenu formaciju
  const getBenchSlotsForFormation = (formation) => {
    // Fiksiran sastav ekipe (15 igrača):
    // GK: 2 igrača (1 na terenu + 1 na klupi)
    // DF: 5 igrača (X na terenu + Y na klupi) 
    // MF: 5 igrača (X na terenu + Y na klupi)
    // FW: 3 igrača (X na terenu + Y na klupi)
    
    const formationData = formations.find((f) => f.value === formation)
    if (!formationData) return ['GK_BENCH_1', 'DF_BENCH_1', 'MF_BENCH_1', 'MF_BENCH_2']
    
    const { DF, MF, FW } = formationData.positions
    
    // Za svaku formaciju trebamo tačno 4 bench slotova:
    let benchSlots = []
    
    // GK_BENCH_1 - uvijek (jer imamo 2 GK, 1 na terenu)
    benchSlots.push('GK_BENCH_1')
    
    // DF bench slotovi - zavise od formacije
    if (DF === 3) {
      // 3-5-2, 3-4-3: trebamo 2 DF na klupi (jer imamo 5 DF ukupno)
      benchSlots.push('DF_BENCH_1', 'DF_BENCH_2')
    } else {
      // 4-3-3, 4-4-2, 4-5-1, 5-3-2: trebamo 1 DF na klupi (jer imamo 5 DF ukupno)
      benchSlots.push('DF_BENCH_1')
    }
    
    // MF bench slotovi - zavise od formacije
    if (MF === 3) {
      // 4-3-3, 3-5-2, 5-3-2: trebamo 2 MF na klupi (jer imamo 5 MF ukupno)
      benchSlots.push('MF_BENCH_1', 'MF_BENCH_2')
    } else if (MF === 4) {
      // 4-4-2: trebamo 1 MF na klupi (jer imamo 5 MF ukupno)
      benchSlots.push('MF_BENCH_1')
    } else if (MF === 5) {
      // 3-5-2, 4-5-1: trebamo 0 MF na klupi (jer imamo 5 MF ukupno)
      // Ne dodajemo MF bench slotove
    }
    
    // FW bench slotovi - zavise od formacije
    if (FW === 2) {
      // 4-4-2, 3-5-2, 5-3-2: trebamo 1 FW na klupi (jer imamo 3 FW ukupno)
      benchSlots.push('FW_BENCH_1')
    } else if (FW === 1) {
      // 4-5-1: trebamo 2 FW na klupi (jer imamo 3 FW ukupno)
      benchSlots.push('FW_BENCH_1', 'FW_BENCH_2')
    }
    // FW === 3: ne trebamo FW na klupi (jer imamo 3 FW ukupno)
    
    // Ako nemamo 4 slotova, dodaj dodatne slotove
    while (benchSlots.length < 4) {
      if (benchSlots.length === 3) {
        // Dodaj još jedan slot prema potrebi
        if (!benchSlots.includes('MF_BENCH_2')) {
          benchSlots.push('MF_BENCH_2')
        } else if (!benchSlots.includes('FW_BENCH_2')) {
          benchSlots.push('FW_BENCH_2')
        } else if (!benchSlots.includes('DF_BENCH_2')) {
          benchSlots.push('DF_BENCH_2')
        }
      } else {
        // Dodaj FW_BENCH_2 kao default
        benchSlots.push('FW_BENCH_2')
      }
    }
    
    // Osiguraj da imamo tačno 4 slotova
    return benchSlots.slice(0, 4)
  }

  const renderFormationField = () => {
    const positions = getFormationPositions()
    console.log('DEBUG renderFormationField - pozicije za formaciju:', positions)

    return (
      <div className={styles.field}>
        {/* Golman */}
        <div className={styles.fieldRow}>
          {(() => {
            const position = "GK"
            const player = selectedPlayers[position]
            console.log('DEBUG renderField - GK pozicija:', position, 'igrač:', player?.name || 'null')
            
            return (
              <div
                className={`${styles.playerPosition} ${styles.gkPosition} ${selectedPlayers.GK ? styles.filled : ""} ${selectedPlayers.GK ? styles.positionGK : ""} ${!isDraftMode && transferWindow && !transferWindow.is_open ? styles.disabled : ""}`}
                onClick={() => openPlayerSelection("GK")}
                title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (selectedPlayers.GK ? `Odaberi golmana (trenutno: ${selectedPlayers.GK.name})` : "Odaberi golmana")}
              >
                {selectedPlayers.GK ? (
                  <div className={styles.selectedPlayerInfo}>
                    <div className={styles.playerName}>{selectedPlayers.GK.name}</div>
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? (
                      <div className={styles.playerPoints}>
                        {(() => {
                          const pointsInfo = getPlayerPointsInfo(selectedPlayers.GK.id)

                          if (pointsInfo) {
                            const className = pointsInfo.is_captain ? styles.pointsValue + ' ' + styles.captain : styles.pointsValue
                            const bonusText = pointsInfo.is_captain ? ' (C)' : pointsInfo.is_vice_captain ? ' (VC)' : ''
                            return (
                              <span className={className} title={`Osnovni poeni: ${pointsInfo.points}${bonusText}`}>
                                {pointsInfo.final_points} pts
                              </span>
                            )
                          } else {
                            return <span className={styles.noPoints}>N/A</span>
                          }
                        })()}
                      </div>
                    ) : (
                      <div className={styles.playerPrice}>{Number(selectedPlayers.GK?.price).toFixed(2)}M</div>
                    )}
                    <div className={styles.playerTeam}>{selectedPlayers.GK.team}</div>
                    <div className={styles.captainIcons}>
                      {captainId === selectedPlayers.GK.id && <FaCrown className={styles.captainIcon} />}
                      {viceCaptainId === selectedPlayers.GK.id && <FaStar className={styles.viceCaptainIcon} />}

                    </div>
                    <div className={styles.playerButtons}>
                      <button
                        className={styles.swapBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSwapModal(selectedPlayers.GK, "GK")
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Zameni sa klupom"}
                      >
                        🔄
                      </button>
                      <button
                        className={styles.removePlayerBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          removePlayer("GK")
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Ukloni igrača"}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyPosition}>
                    <span>GK</span>
                    <span className={styles.addPlayerIcon}>+</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Odbrana */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.DF }, (_, i) => {
            const position = `DF${i + 1}`
            const player = selectedPlayers[position]
            console.log('DEBUG renderField - DF pozicija:', position, 'igrač:', player?.name || 'null')
            
            return (
              <div
                key={position}
                className={`${styles.playerPosition} ${styles.dfPosition} ${selectedPlayers[position] ? styles.filled : ""} ${selectedPlayers[position] ? styles.positionDEF : ""} ${!isDraftMode && transferWindow && !transferWindow.is_open ? styles.disabled : ""}`}
                onClick={() => openPlayerSelection(position)}
                title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (selectedPlayers[position] ? `Odaberi odbrambenog igrača (trenutno: ${selectedPlayers[position].name})` : "Odaberi odbrambenog igrača")}

              >
                {selectedPlayers[position] ? (
                  <div className={styles.selectedPlayerInfo}>
                    <div className={styles.playerName}>{selectedPlayers[position].name}</div>
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? (
                      <div className={styles.playerPoints}>
                        {(() => {
                          const pointsInfo = getPlayerPointsInfo(selectedPlayers[position].id)

                          if (pointsInfo) {
                            const className = pointsInfo.is_captain ? styles.pointsValue + ' ' + styles.captain : styles.pointsValue
                            const bonusText = pointsInfo.is_captain ? ' (C)' : pointsInfo.is_vice_captain ? ' (VC)' : ''
                            return (
                              <span className={className} title={`Osnovni poeni: ${pointsInfo.points}${bonusText}`}>
                                {pointsInfo.final_points} pts
                              </span>
                            )
                          } else {
                            return <span className={styles.noPoints}>N/A</span>
                          }
                        })()}
                      </div>
                    ) : (
                      <div className={styles.playerPrice}>{Number(selectedPlayers[position]?.price).toFixed(2)}M</div>
                    )}
                    <div className={styles.playerTeam}>{selectedPlayers[position].team}</div>
                    <div className={styles.captainIcons}>
                      {captainId === selectedPlayers[position].id && <FaCrown className={styles.captainIcon} />}
                      {viceCaptainId === selectedPlayers[position].id && <FaStar className={styles.viceCaptainIcon} />}

                    </div>
                    <div className={styles.playerButtons}>
                      <button
                        className={styles.swapBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSwapModal(selectedPlayers[position], position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Zameni sa klupom"}
                      >
                        🔄
                      </button>
                      <button
                        className={styles.removePlayerBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          removePlayer(position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Ukloni igrača"}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyPosition}>
                    <span>DF</span>
                    <span className={styles.addPlayerIcon}>+</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Veznjaci */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.MF }, (_, i) => {
            const position = `MF${i + 1}`
            const player = selectedPlayers[position]
            console.log('DEBUG renderField - MF pozicija:', position, 'igrač:', player?.name || 'null')
            
            return (
              <div
                key={position}
                className={`${styles.playerPosition} ${styles.mfPosition} ${selectedPlayers[position] ? styles.filled : ""} ${selectedPlayers[position] ? styles.positionMID : ""} ${!isDraftMode && transferWindow && !transferWindow.is_open ? styles.disabled : ""}`}
                onClick={() => openPlayerSelection(position)}
                title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (selectedPlayers[position] ? `Odaberi veznjaka (trenutno: ${selectedPlayers[position].name})` : "Odaberi veznjaka")}

              >
                {selectedPlayers[position] ? (
                  <div className={styles.selectedPlayerInfo}>
                    <div className={styles.playerName}>{selectedPlayers[position].name}</div>
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? (
                      <div className={styles.playerPoints}>
                        {(() => {
                          const pointsInfo = getPlayerPointsInfo(selectedPlayers[position].id)

                          if (pointsInfo) {
                            const className = pointsInfo.is_captain ? styles.pointsValue + ' ' + styles.captain : styles.pointsValue
                            const bonusText = pointsInfo.is_captain ? ' (C)' : pointsInfo.is_vice_captain ? ' (VC)' : ''
                            return (
                              <span className={className} title={`Osnovni poeni: ${pointsInfo.points}${bonusText}`}>
                                {pointsInfo.final_points} pts
                              </span>
                            )
                          } else {
                            return <span className={styles.noPoints}>N/A</span>
                          }
                        })()}
                      </div>
                    ) : (
                      <div className={styles.playerPrice}>{Number(selectedPlayers[position]?.price).toFixed(2)}M</div>
                    )}
                    <div className={styles.playerTeam}>{selectedPlayers[position].team}</div>
                    <div className={styles.captainIcons}>
                      {captainId === selectedPlayers[position].id && <FaCrown className={styles.captainIcon} />}
                      {viceCaptainId === selectedPlayers[position].id && <FaStar className={styles.viceCaptainIcon} />}

                    </div>
                    <div className={styles.playerButtons}>
                      <button
                        className={styles.swapBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSwapModal(selectedPlayers[position], position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Zameni sa klupom"}
                      >
                        🔄
                      </button>
                      <button
                        className={styles.removePlayerBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          removePlayer(position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Ukloni igrača"}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyPosition}>
                    <span>MF</span>
                    <span className={styles.addPlayerIcon}>+</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Napadači */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.FW }, (_, i) => {
            const position = `FW${i + 1}`
            const player = selectedPlayers[position]
            console.log('DEBUG renderField - FW pozicija:', position, 'igrač:', player?.name || 'null')
            
            return (
              <div
                key={position}
                className={`${styles.playerPosition} ${styles.fwPosition} ${selectedPlayers[position] ? styles.filled : ""} ${selectedPlayers[position] ? styles.positionFWD : ""} ${!isDraftMode && transferWindow && !transferWindow.is_open ? styles.disabled : ""}`}
                onClick={() => openPlayerSelection(position)}
                title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (selectedPlayers[position] ? `Odaberi napadača (trenutno: ${selectedPlayers[position].name})` : "Odaberi napadača")}

              >
                {selectedPlayers[position] ? (
                  <div className={styles.selectedPlayerInfo}>
                    <div className={styles.playerName}>{selectedPlayers[position].name}</div>
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? (
                      <div className={styles.playerPoints}>
                        {(() => {
                          const pointsInfo = getPlayerPointsInfo(selectedPlayers[position].id)

                          if (pointsInfo) {
                            const className = pointsInfo.is_captain ? styles.pointsValue + ' ' + styles.captain : styles.pointsValue
                            const bonusText = pointsInfo.is_captain ? ' (C)' : pointsInfo.is_vice_captain ? ' (VC)' : ''
                            return (
                              <span className={className} title={`Osnovni poeni: ${pointsInfo.points}${bonusText}`}>
                                {pointsInfo.final_points} pts
                              </span>
                            )
                          } else {
                            return <span className={styles.noPoints}>N/A</span>
                          }
                        })()}
                      </div>
                    ) : (
                      <div className={styles.playerPrice}>{Number(selectedPlayers[position]?.price).toFixed(2)}M</div>
                    )}
                    <div className={styles.playerTeam}>{selectedPlayers[position].team}</div>
                    <div className={styles.captainIcons}>
                      {captainId === selectedPlayers[position].id && <FaCrown className={styles.captainIcon} />}
                      {viceCaptainId === selectedPlayers[position].id && <FaStar className={styles.viceCaptainIcon} />}

                    </div>
                    <div className={styles.playerButtons}>
                      <button
                        className={styles.swapBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSwapModal(selectedPlayers[position], position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Zameni sa klupom"}
                      >
                        🔄
                      </button>
                      <button
                        className={styles.removePlayerBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          removePlayer(position)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Ukloni igrača"}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyPosition}>
                    <span>FW</span>
                    <span className={styles.addPlayerIcon}>+</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Prilagodi openPlayerSelection i selectPlayer za bench slotove
  const openPlayerSelection = (position) => {
    console.log('DEBUG openPlayerSelection - otvaram modal za poziciju:', position)

    // Ne dozvoli odabir igrača kada je transfer window zatvoren (osim za draft mode)
    if (!isDraftMode && transferWindow && !transferWindow.is_open) {
      console.log('DEBUG openPlayerSelection - transfer window zatvoren')
      alert("Transfer window je zatvoren. Ne možete menjati igrače u ovom trenutku.")
      return
    }
    
    setCurrentPosition(position)
    setShowModal(true)

    let newTab = "golmani"
    if (position.startsWith("GK")) {
      newTab = "golmani"
    } else if (position.startsWith("DF")) {
      newTab = "odbrana"
    } else if (position.startsWith("MF")) {
      newTab = "veznjaci"
    } else if (position.startsWith("FW")) {
      newTab = "napadaci"
    }
    
    console.log('DEBUG openPlayerSelection - postavljam tab:', newTab)

    setActiveTab(newTab)
  }

  const openSwapModal = (player, position) => {
    // Ne dozvoli swap kada je transfer window zatvoren (osim za draft mode)
    if (!isDraftMode && transferWindow && !transferWindow.is_open) {
      alert("Transfer window je zatvoren. Ne možete menjati igrače u ovom trenutku.")
      return
    }
    
    setSwapPlayer({ ...player, position })
    
    // Pronađi sve igrače sa klupe sa iste pozicije
    const benchPlayers = Object.entries(selectedPlayers)
      .filter(([key, value]) => {
        if (!key.includes('BENCH') || !value) return false
        
        // Mapiraj pozicije
        if (player.position === 'GK' && key.startsWith('GK_BENCH')) return true
        if (player.position === 'DEF' && key.startsWith('DF_BENCH')) return true
        if (player.position === 'MID' && key.startsWith('MF_BENCH')) return true
        if (player.position === 'FWD' && key.startsWith('FW_BENCH')) return true
        
        return false
      })
      .map(([key, value]) => ({ ...value, benchKey: key }))
    
    setSwapOptions(benchPlayers)
    setShowSwapModal(true)
  }

  const performSwap = (benchPlayer) => {
    if (!swapPlayer || !benchPlayer) return
    
    const newPlayers = { ...selectedPlayers }
    
    // Pronađi poziciju igrača na terenu
    let fieldPosition = null
    Object.keys(newPlayers).forEach(key => {
      if (newPlayers[key] && newPlayers[key].id === swapPlayer.id && !key.includes('BENCH')) {
        fieldPosition = key
      }
    })
    
    if (!fieldPosition) {
      console.error('Nije pronađena pozicija igrača na terenu')
      return
    }
    
    // Uradi swap
    newPlayers[fieldPosition] = { ...benchPlayer, isUsedForFormation: true }
    newPlayers[benchPlayer.benchKey] = { ...swapPlayer, isUsedForFormation: false }
    
    setSelectedPlayers(newPlayers)
    setShowSwapModal(false)
    setSwapPlayer(null)
    setSwapOptions([])
  }

  const closeModal = () => {
    console.log('DEBUG closeModal - zatvaram modal')
    setShowModal(false)
    setCurrentPosition(null)
  }

  const selectPlayer = (player) => {
    if (!currentPosition) {
      console.log('DEBUG selectPlayer - nema currentPosition')
      return
    }

    console.log('DEBUG selectPlayer - odabiranje igrača:', player.name, 'za poziciju:', currentPosition)

    // Provjeri da li je igrač već selektovan na nekoj poziciji
    const isPlayerAlreadySelected = Object.values(selectedPlayers).some((p) => p && p.id === player.id)
    if (isPlayerAlreadySelected) {
      console.log('DEBUG selectPlayer - igrač već odabran:', player.name)
      alert("Ovaj igrač je već odabran za drugu poziciju!")
      return
    }

    const oldPlayer = selectedPlayers[currentPosition]
    console.log('DEBUG selectPlayer - stari igrač na poziciji:', oldPlayer?.name)
    
    // Za transfer mode, koristi dostupni budžet iz baze
    if (!isDraftMode) {
      const priceDifference = player.price - (oldPlayer?.price || 0)
      const newBudget = budget - priceDifference
      
      console.log('DEBUG selectPlayer - transfer mode - cijena:', player.price, 'stara cijena:', oldPlayer?.price, 'razlika:', priceDifference, 'novi budžet:', newBudget)
      
      if (newBudget < 0) {
        console.log('DEBUG selectPlayer - nedovoljno budžeta')
        alert("Nemate dovoljno budžeta za ovog igrača!")
        return
      }
      
      setBudget(newBudget)
    } else {
      // Za draft mode, koristi ukupnu vrijednost tima
      const newBudget = oldPlayer ? budget + oldPlayer.price - player.price : budget - player.price
      
      console.log('DEBUG selectPlayer - draft mode - novi budžet:', newBudget)
      
      if (newBudget < 0) {
        console.log('DEBUG selectPlayer - nedovoljno budžeta')
        alert("Nemate dovoljno budžeta za ovog igrača!")
        return
      }
      
      setBudget(newBudget)
    }

    const newPlayerData = {
      ...player,
      team: player.club_name, // Dodaj ime kluba za prikaz na terenu
      position: player.position // Osiguraj da se pozicija sačuva
    }
    
    console.log('DEBUG selectPlayer - novi igrač:', newPlayerData)

    setSelectedPlayers({
      ...selectedPlayers,
      [currentPosition]: newPlayerData,
    })
    closeModal()
  }

  const removePlayer = (position) => {
    console.log('DEBUG removePlayer - uklanjanje igrača sa pozicije:', position)

    // Ne dozvoli uklanjanje igrača kada je transfer window zatvoren (osim za draft mode)
    if (!isDraftMode && transferWindow && !transferWindow.is_open) {
      console.log('DEBUG removePlayer - transfer window zatvoren')
      alert("Transfer window je zatvoren. Ne možete menjati igrače u ovom trenutku.")
      return
    }
    
    const player = selectedPlayers[position]
    if (player) {
      console.log('DEBUG removePlayer - uklanjanje igrača:', player.name, 'sa pozicije:', position)

      setSelectedPlayers({
        ...selectedPlayers,
        [position]: null,
      })
      
      // Za transfer mode, vrati cijenu igrača u dostupni budžet
      if (!isDraftMode) {
        setBudget(budget + player.price)
        console.log('DEBUG removePlayer - transfer mode - vraćam cijenu:', player.price, 'novi budžet:', budget + player.price)
      } else {
        // Za draft mode, vrati cijenu u ukupni budžet
        setBudget(budget + player.price)
        console.log('DEBUG removePlayer - draft mode - vraćam cijenu:', player.price, 'novi budžet:', budget + player.price)
      }
      
      // Remove captain/vice captain if this player was one
      if (captainId === player.id) {
        console.log('DEBUG removePlayer - uklanjam kapiten:', player.name)
        setCaptainId(null)
      }
      if (viceCaptainId === player.id) {
        console.log('DEBUG removePlayer - uklanjam vice-kapiten:', player.name)
        setViceCaptainId(null)
      }
    } else {
      console.log('DEBUG removePlayer - nema igrača na poziciji:', position)
    }
  }

  const setCaptain = (playerId) => {
    console.log('DEBUG setCaptain - postavljam kapiten:', playerId)
    setCaptainId(playerId)
  }

  const setViceCaptain = (playerId) => {
    console.log('DEBUG setViceCaptain - postavljam vice-kapiten:', playerId)
    setViceCaptainId(playerId)
  }

  const calculateTotalPoints = () => {
    // Ako je transfer window zatvoren, koristi fantasy poene iz trenutnog kola
    if (!isDraftMode && transferWindow && !transferWindow.is_open && currentGameweekPoints) {
      // Saberi final_points SAMO za igrače iz prvih 11 (bez klupe)
      const starting11Players = currentGameweekPoints.players.filter(player => !player.is_bench)
      const benchPlayers = currentGameweekPoints.players.filter(player => player.is_bench)
      
      const playerPoints = starting11Players.reduce((total, player) => total + player.final_points, 0)
      const benchPoints = benchPlayers.reduce((total, player) => total + player.final_points, 0)
      
      // Dodaj transfer penalty ako postoji
      const penalty = transfersInfo?.penalty || 0
      console.log('DEBUG calculateTotalPoints:', { 
        starting11Players: starting11Players.length,
        benchPlayers: benchPlayers.length,
        starting11Points: playerPoints,
        benchPoints: benchPoints,
        playerPoints, 
        penalty, 
        transfersInfo: JSON.stringify(transfersInfo, null, 2), 
        totalWithPenalty: playerPoints - penalty 
      })
      
      // Loguj detalje o igračima
      console.log('DEBUG calculateTotalPoints - starting 11 igrači:', starting11Players.map(p => `${p.name}: ${p.final_points} pts (bench: ${p.is_bench})`))
      console.log('DEBUG calculateTotalPoints - bench igrači:', benchPlayers.map(p => `${p.name}: ${p.final_points} pts (bench: ${p.is_bench})`))
      
      const totalWithPenalty = playerPoints - penalty
      
      return totalWithPenalty
    }
    
    // Inače koristi poene iz player objekta (za draft mode ili kada transfer window nije zatvoren)
    const total = Object.values(selectedPlayers)
      .filter((player) => player !== null)
      .reduce((total, player) => total + (player.points || 0), 0)

    return total
  }

  // U funkciji countSelectedPlayers, napravi posebnu funkciju countByPosition koja broji po pozicijama
  const countByPosition = () => {
    const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    
    Object.values(selectedPlayers).forEach((player) => {
      if (player && player.position) {
        if (player.position === "GK") counts.GK++;
        if (player.position === "DEF") counts.DF++;
        if (player.position === "MID") counts.MF++;
        if (player.position === "FWD") counts.FW++;
      }
    });
    
    console.log('DEBUG countByPosition - broj igrača po pozicijama:', counts)
    console.log('DEBUG countByPosition - ukupan broj igrača:', Object.values(selectedPlayers).filter(p => p !== null).length)
    console.log('DEBUG countByPosition - bench igrači:', Object.keys(selectedPlayers).filter(key => key.includes('BENCH')).map(key => `${key}: ${selectedPlayers[key] ? selectedPlayers[key].name : 'null'}`))

    return counts;
  };

  const countSelectedPlayers = () => {
    // Broji samo pozicije koje su potrebne za trenutnu formaciju
    const validPositions = ['GK']
    
    // Dodaj field pozicije za trenutnu formaciju
    const formation = selectedFormation || '4-3-3'
    const [df, mf, fw] = formation.split('-').map(Number)
    
    for (let i = 1; i <= df; i++) {
      validPositions.push(`DF${i}`)
    }
    
    for (let i = 1; i <= mf; i++) {
      validPositions.push(`MF${i}`)
    }
    
    for (let i = 1; i <= fw; i++) {
      validPositions.push(`FW${i}`)
    }
    
    // Dodaj bench pozicije
    const benchSlots = getBenchSlotsForFormation(formation)
    validPositions.push(...benchSlots)
    
    // Broji samo igrače na validnim pozicijama
    const count = validPositions.filter(pos => selectedPlayers[pos] !== null).length

    console.log('DEBUG countSelectedPlayers - ukupan broj odabranih igrača:', count)
    console.log('DEBUG countSelectedPlayers - validne pozicije:', validPositions)
    console.log('DEBUG countSelectedPlayers - selectedPlayers keys:', Object.keys(selectedPlayers))

    return count
  }

  const getPositionName = (position) => {
    let name = ""
    if (position === "GK" || position === "GK_BENCH") name = "Golman"
    else if (position.startsWith("DF")) name = "Odbrana"
    else if (position.startsWith("MF")) name = "Veznjak"
    else if (position.startsWith("FW")) name = "Napadač"
    
    console.log('DEBUG getPositionName - position:', position, 'name:', name)
    
    return name
  }

  const getPlayerCurrentPoints = (playerId) => {
    if (!currentGameweekPoints || !currentGameweekPoints.players) {
      console.log('DEBUG getPlayerCurrentPoints - nema currentGameweekPoints')
      return null
    }
    
    const player = currentGameweekPoints.players.find(p => p.player_id === playerId)
    const points = player ? player.final_points : null

    console.log('DEBUG getPlayerCurrentPoints - igrač:', playerId, 'poeni:', points)

    return points
  }

  const getPlayerPointsInfo = (playerId) => {
    if (!currentGameweekPoints || !currentGameweekPoints.players) {
      console.log('DEBUG getPlayerPointsInfo - nema currentGameweekPoints')
      return null
    }
    
    const player = currentGameweekPoints.players.find(p => p.player_id === playerId)
    if (!player) {
      console.log('DEBUG getPlayerPointsInfo - igrač nije pronađen:', playerId)
      return null
    }
    
    const info = {
      points: player.points,
      final_points: player.final_points,
      is_captain: player.is_captain,
      is_vice_captain: player.is_vice_captain
    }
    
    console.log('DEBUG getPlayerPointsInfo - igrač:', playerId, 'info:', info)

    return info
  }

  const isPlayerInStarting11 = (playerId) => {
    if (!selectedPlayers) return false
    
    // Prvih 11 pozicija su: GK, DF1-DF5, MF1-MF5, FW1-FW3 (zavisno od formaciji)
    const startingPositions = ['GK']
    
    // Dodaj odbrambene pozicije (zavisno od formaciji)
    const formation = selectedFormation || '4-3-3'
    const [df, mf, fw] = formation.split('-').map(Number)
    
    for (let i = 1; i <= df; i++) {
      startingPositions.push(`DF${i}`)
    }
    
    for (let i = 1; i <= mf; i++) {
      startingPositions.push(`MF${i}`)
    }
    
    for (let i = 1; i <= fw; i++) {
      startingPositions.push(`FW${i}`)
    }
    
    // Provjeri da li je igrač na jednoj od starting pozicija
    const isStarting = startingPositions.some(pos => selectedPlayers[pos] && selectedPlayers[pos].id === playerId)
    
    console.log('DEBUG isPlayerInStarting11:', {
      playerId,
      formation,
      startingPositions,
      isStarting,
      playerPosition: Object.keys(selectedPlayers).find(key => selectedPlayers[key] && selectedPlayers[key].id === playerId)
    })

    return isStarting
  }

  const handleSaveTeam = async () => {

    // Proveri da li je transfer window otvoren (osim za draft mode)
    if (!isDraftMode && transferWindow && !transferWindow.is_open) {
      alert("Transfer window je zatvoren. Transferi nisu dozvoljeni u ovom trenutku.")
      return
    }

    // 2. Prilagodi prikaz klupe i validaciju
    const posCounts = countByPosition();

    if (posCounts.GK !== 2 || posCounts.DF !== 5 || posCounts.MF !== 5 || posCounts.FW !== 3) {
      console.error('DEBUG handleSaveTeam - validacija neuspješna:', posCounts)
      alert("Ekipa mora imati 2 golmana, 5 odbrambenih, 5 veznih i 3 napadača!");
      return;
    }

    console.log('DEBUG handleSaveTeam - validacija uspješna:', posCounts)

    if (!captainId) {
      alert("Morate odabrati kapiten!")
      return
    }

    if (!viceCaptainId) {
      alert("Morate odabrati vice-kapiten!")
      return
    }

    // Validacija budžeta
    if (isDraftMode) {
      // Za draft mode: provjeri da li ukupna vrijednost tima ne prelazi 100M
      const totalTeamValue = Object.values(selectedPlayers).reduce((acc, p) => acc + (p?.price || 0), 0)

      if (totalTeamValue > 100.0) {
        alert('Vrijednost tima prelazi budžet od 100M!')
        return
      }
    } else {
      // Za transfer mode: provjeri dostupni budžet

      if (budget < 0) {
        alert('Nemate dovoljno budžeta za ove transfere!')
        return
      }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const transferData = {
        is_draft_mode: isDraftMode,
        selected_players: selectedPlayers,
        formation: selectedFormation,
        captain_id: captainId,
        vice_captain_id: viceCaptainId
      }

      const res = await fetch(`${apiUrl}/fantasy/transfers/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Greška pri spremanju tima")
      }

      const result = await res.json()
      
      // Prikaži informaciju o transferima
      if (result.transfers_made && result.transfers_made > 0) {
        alert(`Tim uspješno sačuvan! Napravljeno ${result.transfers_made} transfera za kolo ${result.next_gameweek}.`)
      } else {
        alert("Tim uspješno sačuvan!")
      }
      
      // Refresh data
      fetchTransfersData()
      
    } catch (error) {
      alert("Greška pri spremanju tima: " + error.message)
    }
  }

  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>
          <p>Učitavanje...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Fantasy Transferi | PLKutak</title>
        <meta name="description" content="Upravljajte svojim fantasy timom u Premijer ligi BiH" />
      </Head>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <Link href="/fantasy" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <h1 className={styles.title}>
            {isDraftMode ? "Kreiraj Tim" : "Transferi"}
          </h1>
        </div>

        {/* Transfer Window Info */}
        {!isDraftMode && transferWindow && (
          <div className={styles.transferWindowInfo}>
            <h3>Transfer Window</h3>
            <p>
              Status: {transferWindow.is_open ? "Otvoren" : "Zatvoren"}
              {transferWindow.is_open && transferWindow.next_gameweek_name && (
                <>
                  <br />
                  {transferWindow.next_gameweek_name}
                </>
              )}
            </p>
            {/* Prikaži informacije o transferima samo kada je transfer window otvoren */}
            {transferWindow.is_open && transfersInfo && (
              <div className={styles.transfersInfo}>
                <p>Besplatni transferi: {transfersInfo.remaining_free_transfers}/3</p>
                {transfersInfo.penalty > 0 && (
                  <p className={styles.penalty}>Penal: -{transfersInfo.penalty} poena</p>
                )}
                {/* Upozorenje o -4 poena kada su besplatni transferi iscrpljeni */}
                {transfersInfo.remaining_free_transfers === 0 && (
                  <div className={styles.transferWarning}>
                    <p>⚠️ Upozorenje: Svaki sledeći transfer vam donosi -4 poena!</p>
                  </div>
                )}
              </div>
            )}
            {/* Poruka kada je transfer window zatvoren */}
            {!transferWindow.is_open && (
              <div className={styles.transferWindowClosed}>
                <p>Transfer window je trenutno zatvoren. Transferi nisu dozvoljeni.</p>
                {currentGameweekPoints && currentGameweekPoints.current_gameweek && (
                  <p>Prikazuju se poeni za {currentGameweekPoints.current_gameweek.name} (kapiten x2)</p>
                )}
              </div>
            )}

          </div>
        )}

        <div className={styles.teamSection}>
          <div className={styles.teamHeader}>
            <h2>{fantasyTeam?.name || "Vaš Tim"}</h2>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>
                  {isDraftMode ? "Budžet:" : "Dostupni budžet:"}
                </span>
                <span className={styles.statValue}>{budget.toFixed(1)} M</span>
              </div>
              {!isDraftMode && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Ukupan budžet:</span>
                  <span className={styles.statValue}>{totalBudget.toFixed(1)} M</span>
                </div>
              )}
              {!isDraftMode && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Vrijednost tima:</span>
                  <span className={styles.statValue}>
                    {Object.values(selectedPlayers).reduce((acc, p) => acc + (p?.price || 0), 0).toFixed(1)} M
                  </span>
                </div>
              )}
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Igrači:</span>
                <span className={styles.statValue}>{countSelectedPlayers()}/15</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>
                  {!isDraftMode && transferWindow && !transferWindow.is_open && currentGameweekPoints?.current_gameweek 
                    ? `Bodovi (${currentGameweekPoints.current_gameweek.name}):` 
                    : "Bodovi:"}
                </span>
                <span className={styles.statValue}>
                  {calculateTotalPoints()}
                  {!isDraftMode && transferWindow && !transferWindow.is_open && currentGameweekPoints && (
                    <span style={{fontSize: '0.8rem', color: '#6c757d', marginLeft: '0.5rem'}}>
                      (sa bonusom{transfersInfo?.penalty > 0 ? ` i penalom -${transfersInfo.penalty}` : ''})
                    </span>
                  )}
                </span>
              </div>
              {!isDraftMode && transferWindow && transferWindow.is_open && transfersInfo && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Besplatni transferi:</span>
                  <span className={styles.statValue}>{transfersInfo.remaining_free_transfers}/3</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formationSelector}>
            <h3>Odaberite formaciju:</h3>
            <div className={styles.formationButtons}>
              {formations.map((formation) => (
                <button
                  key={formation.value}
                  className={`${styles.formationButton} ${selectedFormation === formation.value ? styles.active : ""}`}
                  onClick={() => handleFormationChange(formation.value)}
                  disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                  title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : `Promeni formaciju na ${formation.label}`}
                >
                  {!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : formation.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldContainer}>
            {renderFormationField()}

            <div className={styles.benchContainer}>
              <h3>Klupa</h3>
              <div className={styles.benchPlayers}>
                {(() => {
                  const benchSlots = getBenchSlotsForFormation(selectedFormation)
                  console.log('DEBUG renderBench - bench slotovi:', benchSlots)
                  return benchSlots.map((pos, idx) => {
                    const playerPositionClass = selectedPlayers[pos] ? 
                      (selectedPlayers[pos].position === 'GK' ? styles.positionGK :
                       selectedPlayers[pos].position === 'DEF' ? styles.positionDEF :
                       selectedPlayers[pos].position === 'MID' ? styles.positionMID :
                       selectedPlayers[pos].position === 'FWD' ? styles.positionFWD : '') : ''
                    
                    console.log('DEBUG renderBench - pozicija:', pos, 'igrač:', selectedPlayers[pos]?.name || 'null')
                    
                    return (
                      <div
                        key={pos}
                        className={`${styles.benchPosition} ${selectedPlayers[pos] ? styles.filled : ""} ${playerPositionClass} ${!isDraftMode && transferWindow && !transferWindow.is_open ? styles.disabled : ""}`}
                        onClick={() => openPlayerSelection(pos)}
                        title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (selectedPlayers[pos] ? `Odaberi ${getPositionName(pos.split("_")[0])} (trenutno: ${selectedPlayers[pos].name})` : `Odaberi ${getPositionName(pos.split("_")[0])}`)}

                      >
                        {selectedPlayers[pos] ? (
                          <div className={styles.selectedPlayerInfo}>
                            <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                            {!isDraftMode && transferWindow && !transferWindow.is_open ? (
                              <div className={styles.playerPoints}>
                                {(() => {
                                  const pointsInfo = getPlayerPointsInfo(selectedPlayers[pos].id)

                                  if (pointsInfo) {
                                    const className = pointsInfo.is_captain ? styles.pointsValue + ' ' + styles.captain : styles.pointsValue
                                    const bonusText = pointsInfo.is_captain ? ' (C)' : pointsInfo.is_vice_captain ? ' (VC)' : ''
                                    return (
                                      <span className={className} title={`Osnovni poeni: ${pointsInfo.points}${bonusText}`}>
                                        {pointsInfo.final_points} pts
                                      </span>
                                    )
                                  } else {
                                    return <span className={styles.noPoints}>N/A</span>
                                  }
                                })()}
                              </div>
                            ) : (
                              <div className={styles.playerPrice}>{Number(selectedPlayers[pos]?.price).toFixed(2)}M</div>
                            )}
                            <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
                            <div className={styles.captainIcons}>
                              {captainId === selectedPlayers[pos].id && <FaCrown className={styles.captainIcon} />}
                              {viceCaptainId === selectedPlayers[pos].id && <FaStar className={styles.viceCaptainIcon} />}

                            </div>
                            <button
                              className={styles.removePlayerBtn}
                              onClick={(e) => {
                                e.stopPropagation()
                                removePlayer(pos)
                              }}
                              disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
                              title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Ukloni igrača"}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className={styles.emptyPosition}>
                            <span>{getPositionName(pos.split("_")[0])}</span>
                            <span className={styles.addPlayerIcon}>+</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* Captain Selection */}
          <div className={styles.captainSelection}>
            <h3>Odaberite kapiten i vice-kapiten:</h3>
            <div className={styles.captainOptions}>
              {Object.values(selectedPlayers).filter(p => p).map((player) => {
                const isInStarting11 = isPlayerInStarting11(player.id)
                console.log('DEBUG captainSelection - igrač:', player.name, 'isInStarting11:', isInStarting11)
                
                return (
                  <div key={player.id} className={`${styles.captainOption} ${!isInStarting11 ? styles.benchPlayer : ''}`}>
                    <div className={styles.playerInfo}>
                      <span>{player.name}</span>
                      <span className={styles.playerTeam}>{player.team}</span>
                      {!isInStarting11 && <span className={styles.benchLabel}>Klupa</span>}
                    </div>
                    <div className={styles.captainButtons}>
                      <button
                        className={`${styles.captainBtn} ${captainId === player.id ? styles.active : ""}`}
                        onClick={() => {

                          setCaptain(player.id)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open || !isInStarting11}
                        title={!isInStarting11 ? "Samo igrači iz prvih 11 mogu biti kapiten" : 
                               !isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : 
                               "Postavi kao kapiten"}
                      >
                        <FaCrown /> {!isInStarting11 ? "Klupa" : !isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Kapiten"}
                      </button>
                      <button
                        className={`${styles.captainBtn} ${viceCaptainId === player.id ? styles.active : ""}`}
                        onClick={() => {

                          setViceCaptain(player.id)
                        }}
                        disabled={!isDraftMode && transferWindow && !transferWindow.is_open || !isInStarting11}
                        title={!isInStarting11 ? "Samo igrači iz prvih 11 mogu biti vice-kapiten" : 
                               !isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : 
                               "Postavi kao vice-kapiten"}
                      >
                        <FaStar /> {!isInStarting11 ? "Klupa" : !isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Vice"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button 
              className={styles.resetButton}
              disabled={!isDraftMode && transferWindow && !transferWindow.is_open}
              title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (isDraftMode ? "Resetuj tim na početno stanje" : "Resetuj na postojeće igrače")}
              onClick={() => {
                if (!isDraftMode && transferWindow && !transferWindow.is_open) {
                  alert("Transfer window je zatvoren. Ne možete resetovati tim u ovom trenutku.")
                  return
                }
                
                if (isDraftMode) {
                  // Reset tima na početno stanje za draft mode
                  setSelectedPlayers({
                    GK: null,
                    DF1: null,
                    DF2: null,
                    DF3: null,
                    DF4: null,
                    MF1: null,
                    MF2: null,
                    MF3: null,
                    FW1: null,
                    FW2: null,
                    FW3: null,
                    GK_BENCH: null,
                    DF_BENCH: null,
                    MF_BENCH: null,
                    FW_BENCH: null,
                  })
                  setCaptainId(null)
                  setViceCaptainId(null)
                  setBudget(100)
                } else {
                  // Reset na postojeće igrače za transfer mode
                  fetchTransfersData()
                }
              }}
            >
              {!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer Window Zatvoren" : (isDraftMode ? "Resetuj tim" : "Resetuj na postojeće")}
            </button>
            <button 
              className={styles.saveTeamButton} 
              disabled={countSelectedPlayers() !== 15 || !captainId || !viceCaptainId || (!isDraftMode && transferWindow && !transferWindow.is_open)}
              onClick={handleSaveTeam}
              title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : (isDraftMode ? "Kreiraj novi tim" : "Sačuvaj transfer")}
            >
              <FaSave />{" "}
              {countSelectedPlayers() === 15 && captainId && viceCaptainId 
                ? (isDraftMode ? "Kreiraj Tim" : (transferWindow && !transferWindow.is_open ? "Transfer Window Zatvoren" : "Sačuvaj Transfer"))
                : `Odaberite još ${15 - countSelectedPlayers()} igrača, kapiten i vice-kapiten`}
            </button>
          </div>
        </div>

        {/* Player Selection Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Odaberite igrača - {getPositionName(currentPosition)}</h3>
                <button className={styles.closeModalBtn} onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "golmani" ? styles.activeTab : ""}`}
                    onClick={() => {
                      
                      setActiveTab("golmani")
                    }}
                    disabled={!currentPosition?.includes("GK") || (!isDraftMode && transferWindow && !transferWindow.is_open)}
                    title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Prikaži golmane"}
                  >
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Golmani"}
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "odbrana" ? styles.activeTab : ""}`}
                    onClick={() => {
                      
                      setActiveTab("odbrana")
                    }}
                    disabled={!currentPosition?.includes("DF") || (!isDraftMode && transferWindow && !transferWindow.is_open)}
                    title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Prikaži odbrambene igrače"}
                  >
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Odbrana"}
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "veznjaci" ? styles.activeTab : ""}`}
                    onClick={() => {
                      
                      setActiveTab("veznjaci")
                    }}
                    disabled={!currentPosition?.includes("MF") || (!isDraftMode && transferWindow && !transferWindow.is_open)}
                    title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Prikaži veznjake"}
                  >
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Veznjaci"}
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "napadaci" ? styles.activeTab : ""}`}
                    onClick={() => {
                      
                      setActiveTab("napadaci")
                    }}
                    disabled={!currentPosition?.includes("FW") || (!isDraftMode && transferWindow && !transferWindow.is_open)}
                    title={!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : "Prikaži napadače"}
                  >
                    {!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Napadači"}
                  </button>
                </div>

                <div className={styles.playersList}>
                  <div className={styles.playersHeader}>
                    <div className={styles.playerHeaderName}>Igrač</div>
                    <div className={styles.playerHeaderTeam}>Tim</div>
                    <div className={styles.playerHeaderPrice}>Cijena</div>
                    <div className={styles.playerHeaderPoints}>Bodovi</div>
                    <div className={styles.playerHeaderAction}></div>
                  </div>

                  {allPlayers[activeTab]?.map((player) => {
                    const isSelected = Object.values(selectedPlayers).some((p) => p && p.id === player.id)

                    return (
                      <div key={player.id} className={`${styles.playerRow} ${isSelected ? styles.selectedRow : ""}`}>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.playerTeam}>{player.club_name}</div>
                        <div className={styles.playerPrice}>{Number(player.price).toFixed(2)}M</div>
                        <div className={styles.playerPoints}>{player.points}</div>
                        <div className={styles.playerAction}>
                          <button
                            className={`${styles.actionButton} ${styles.addButton}`}
                            onClick={() => selectPlayer(player)}
                            disabled={isSelected || (!isDraftMode && transferWindow && !transferWindow.is_open)}
                            title={isSelected ? "Igrač je već odabran" : (!isDraftMode && transferWindow && !transferWindow.is_open ? "Transfer window je zatvoren" : `Odaberi ${player.name}`)}
                          >
                            {isSelected ? "Odabran" : (!isDraftMode && transferWindow && !transferWindow.is_open ? "Zatvoren" : "Odaberi")}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Swap Modal */}
        {showSwapModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Zameni {swapPlayer?.name} sa klupom</h3>
                <button className={styles.closeModalBtn} onClick={() => setShowSwapModal(false)}>
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.swapInfo}>
                  <p>Odaberite igrača sa klupe sa iste pozicije ({swapPlayer?.position}) da zamenite sa {swapPlayer?.name}</p>
                </div>

                <div className={styles.playersList}>
                  <div className={styles.playersHeader}>
                    <div className={styles.playerHeaderName}>Igrač</div>
                    <div className={styles.playerHeaderTeam}>Tim</div>
                    <div className={styles.playerHeaderPrice}>Cijena</div>
                    <div className={styles.playerHeaderPoints}>Bodovi</div>
                    <div className={styles.playerHeaderAction}></div>
                  </div>

                  {swapOptions.map((player) => (
                    <div key={player.id} className={styles.playerRow}>
                      <div className={styles.playerName}>{player.name}</div>
                      <div className={styles.playerTeam}>{player.team}</div>
                      <div className={styles.playerPrice}>{Number(player.price).toFixed(2)}M</div>
                      <div className={styles.playerPoints}>{player.points || 0}</div>
                      <div className={styles.playerAction}>
                        <button
                          className={`${styles.actionButton} ${styles.swapButton}`}
                          onClick={() => performSwap(player)}
                          title={`Zameni ${swapPlayer?.name} sa ${player.name}`}
                        >
                          Zameni
                        </button>
                      </div>
                    </div>
                  ))}

                  {swapOptions.length === 0 && (
                    <div className={styles.noSwapOptions}>
                      <p>Nema igrača sa klupe sa pozicije {swapPlayer?.position}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
