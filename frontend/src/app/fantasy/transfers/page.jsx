"use client"

import { useState, useEffect } from "react"
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/fantasy/transfers/${user.id}`)
      
      if (!res.ok) {
        throw new Error("Greška pri dohvatu podataka")
      }
      
      const data = await res.json()
      
      console.log("DEBUG: Transfer data:", data)
      console.log("DEBUG: Transfer window:", data.transfer_window)
      console.log("DEBUG: Transfers info:", data.transfers_info)
      
      setFantasyTeam(data.fantasy_team)
      setBudget(data.fantasy_team.budget)
      setSelectedFormation(data.fantasy_team.formation)
      setTransferWindow(data.transfer_window)
      setTransfersInfo(data.transfers_info)
      setIsDraftMode(data.is_draft_mode)
      setAllPlayers(data.all_players)
      
      // Ako nije draft mode, učitaj postojeće igrače
      if (!data.is_draft_mode && data.team_players.length > 0) {
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
        setSelectedPlayers(existingPlayers)
      }
      
    } catch (err) {
      setError("Greška pri dohvatu podataka: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormationChange = (formation) => {
    setSelectedFormation(formation)
    // Reset players when changing formation
    const newPlayers = { ...selectedPlayers }

    // Clear all field positions except GK
    Object.keys(newPlayers).forEach((key) => {
      if (key !== "GK" && !key.includes("BENCH")) {
        newPlayers[key] = null
      }
    })

    setSelectedPlayers(newPlayers)
  }

  const getFormationPositions = () => {
    const formation = formations.find((f) => f.value === selectedFormation)
    return formation ? formation.positions : { DF: 4, MF: 3, FW: 3 }
  }

  // Funkcija za generisanje klupe na osnovu formacije, sa unikatnim ključevima
  const getBenchSlots = () => {
    const formation = formations.find((f) => f.value === selectedFormation)
    const fieldCounts = { GK: 1, DF: formation.positions.DF, MF: formation.positions.MF, FW: formation.positions.FW }
    const SQUAD_REQUIREMENTS = { GK: 2, DF: 5, MF: 5, FW: 3 }
    const benchCounts = {
      GK: SQUAD_REQUIREMENTS.GK - fieldCounts.GK,
      DF: SQUAD_REQUIREMENTS.DF - fieldCounts.DF,
      MF: SQUAD_REQUIREMENTS.MF - fieldCounts.MF,
      FW: SQUAD_REQUIREMENTS.FW - fieldCounts.FW
    }
    // Složi niz slotova za klupu sa unikatnim ključevima
    let slots = []
    let idx = 1
    if (benchCounts.GK > 0) for (let i = 1; i <= benchCounts.GK; i++) slots.push(`GK_BENCH_${i}`)
    if (benchCounts.DF > 0) for (let i = 1; i <= benchCounts.DF; i++) slots.push(`DF_BENCH_${i}`)
    if (benchCounts.MF > 0) for (let i = 1; i <= benchCounts.MF; i++) slots.push(`MF_BENCH_${i}`)
    if (benchCounts.FW > 0) for (let i = 1; i <= benchCounts.FW; i++) slots.push(`FW_BENCH_${i}`)
    return slots
  }

  const renderFormationField = () => {
    const positions = getFormationPositions()

    return (
      <div className={styles.field}>
        {/* Golman */}
        <div className={styles.fieldRow}>
          <div
            className={`${styles.playerPosition} ${styles.gkPosition} ${selectedPlayers.GK ? styles.filled : ""}`}
            onClick={() => openPlayerSelection("GK")}
          >
            {selectedPlayers.GK ? (
              <div className={styles.selectedPlayerInfo}>
                <div className={styles.playerName}>{selectedPlayers.GK.name}</div>
                <div className={styles.playerPrice}>{selectedPlayers.GK.price}M</div>
                <div className={styles.playerTeam}>{selectedPlayers.GK.team}</div>
                <div className={styles.captainIcons}>
                  {captainId === selectedPlayers.GK.id && <FaCrown className={styles.captainIcon} />}
                  {viceCaptainId === selectedPlayers.GK.id && <FaStar className={styles.viceCaptainIcon} />}
                </div>
                <button
                  className={styles.removePlayerBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    removePlayer("GK")
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.emptyPosition}>
                <span>GK</span>
                <span className={styles.addPlayerIcon}>+</span>
              </div>
            )}
          </div>
        </div>

        {/* Odbrana */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.DF }, (_, i) => (
            <div
              key={`DF${i + 1}`}
              className={`${styles.playerPosition} ${styles.dfPosition} ${selectedPlayers[`DF${i + 1}`] ? styles.filled : ""}`}
              onClick={() => openPlayerSelection(`DF${i + 1}`)}
            >
              {selectedPlayers[`DF${i + 1}`] ? (
                <div className={styles.selectedPlayerInfo}>
                  <div className={styles.playerName}>{selectedPlayers[`DF${i + 1}`].name}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`DF${i + 1}`].price}M</div>
                  <div className={styles.playerTeam}>{selectedPlayers[`DF${i + 1}`].team}</div>
                  <div className={styles.captainIcons}>
                    {captainId === selectedPlayers[`DF${i + 1}`].id && <FaCrown className={styles.captainIcon} />}
                    {viceCaptainId === selectedPlayers[`DF${i + 1}`].id && <FaStar className={styles.viceCaptainIcon} />}
                  </div>
                  <button
                    className={styles.removePlayerBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlayer(`DF${i + 1}`)
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.emptyPosition}>
                  <span>DF</span>
                  <span className={styles.addPlayerIcon}>+</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Veznjaci */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.MF }, (_, i) => (
            <div
              key={`MF${i + 1}`}
              className={`${styles.playerPosition} ${styles.mfPosition} ${selectedPlayers[`MF${i + 1}`] ? styles.filled : ""}`}
              onClick={() => openPlayerSelection(`MF${i + 1}`)}
            >
              {selectedPlayers[`MF${i + 1}`] ? (
                <div className={styles.selectedPlayerInfo}>
                  <div className={styles.playerName}>{selectedPlayers[`MF${i + 1}`].name}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`MF${i + 1}`].price}M</div>
                  <div className={styles.playerTeam}>{selectedPlayers[`MF${i + 1}`].team}</div>
                  <div className={styles.captainIcons}>
                    {captainId === selectedPlayers[`MF${i + 1}`].id && <FaCrown className={styles.captainIcon} />}
                    {viceCaptainId === selectedPlayers[`MF${i + 1}`].id && <FaStar className={styles.viceCaptainIcon} />}
                  </div>
                  <button
                    className={styles.removePlayerBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlayer(`MF${i + 1}`)
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.emptyPosition}>
                  <span>MF</span>
                  <span className={styles.addPlayerIcon}>+</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Napadači */}
        <div className={styles.fieldRow}>
          {Array.from({ length: positions.FW }, (_, i) => (
            <div
              key={`FW${i + 1}`}
              className={`${styles.playerPosition} ${styles.fwPosition} ${selectedPlayers[`FW${i + 1}`] ? styles.filled : ""}`}
              onClick={() => openPlayerSelection(`FW${i + 1}`)}
            >
              {selectedPlayers[`FW${i + 1}`] ? (
                <div className={styles.selectedPlayerInfo}>
                  <div className={styles.playerName}>{selectedPlayers[`FW${i + 1}`].name}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`FW${i + 1}`].price}M</div>
                  <div className={styles.playerTeam}>{selectedPlayers[`FW${i + 1}`].team}</div>
                  <div className={styles.captainIcons}>
                    {captainId === selectedPlayers[`FW${i + 1}`].id && <FaCrown className={styles.captainIcon} />}
                    {viceCaptainId === selectedPlayers[`FW${i + 1}`].id && <FaStar className={styles.viceCaptainIcon} />}
                  </div>
                  <button
                    className={styles.removePlayerBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      removePlayer(`FW${i + 1}`)
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.emptyPosition}>
                  <span>FW</span>
                  <span className={styles.addPlayerIcon}>+</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Prilagodi openPlayerSelection i selectPlayer za bench slotove
  const openPlayerSelection = (position) => {
    setCurrentPosition(position)
    setShowModal(true)

    if (position.startsWith("GK")) {
      setActiveTab("golmani")
    } else if (position.startsWith("DF")) {
      setActiveTab("odbrana")
    } else if (position.startsWith("MF")) {
      setActiveTab("veznjaci")
    } else if (position.startsWith("FW")) {
      setActiveTab("napadaci")
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setCurrentPosition(null)
  }

  const selectPlayer = (player) => {
    if (!currentPosition) return

    // Provjeri da li je igrač već selektovan na nekoj poziciji
    const isPlayerAlreadySelected = Object.values(selectedPlayers).some((p) => p && p.id === player.id)
    if (isPlayerAlreadySelected) {
      alert("Ovaj igrač je već odabran za drugu poziciju!")
      return
    }

    const oldPlayer = selectedPlayers[currentPosition]
    const newBudget = oldPlayer ? budget + oldPlayer.price - player.price : budget - player.price

    if (newBudget < 0) {
      alert("Nemate dovoljno budžeta za ovog igrača!")
      return
    }

    setSelectedPlayers({
      ...selectedPlayers,
      [currentPosition]: {
        ...player,
        team: player.club_name // Dodaj ime kluba za prikaz na terenu
      },
    })
    setBudget(newBudget)
    closeModal()
  }

  const removePlayer = (position) => {
    const player = selectedPlayers[position]
    if (player) {
      setSelectedPlayers({
        ...selectedPlayers,
        [position]: null,
      })
      setBudget(budget + player.price)
      
      // Remove captain/vice captain if this player was one
      if (captainId === player.id) setCaptainId(null)
      if (viceCaptainId === player.id) setViceCaptainId(null)
    }
  }

  const setCaptain = (playerId) => {
    setCaptainId(playerId)
  }

  const setViceCaptain = (playerId) => {
    setViceCaptainId(playerId)
  }

  const calculateTotalPoints = () => {
    return Object.values(selectedPlayers)
      .filter((player) => player !== null)
      .reduce((total, player) => total + player.points, 0)
  }

  // U funkciji countSelectedPlayers, napravi posebnu funkciju countByPosition koja broji po pozicijama
  const countByPosition = () => {
    const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    
    console.log("=== DEBUG: countByPosition ===");
    console.log("All selectedPlayers:", selectedPlayers);
    
    Object.values(selectedPlayers).forEach((player, idx) => {
      if (player && player.position) {
        console.log(`Player ${idx}: ${player.name} - Position: "${player.position}"`);
        if (player.position === "GK") counts.GK++;
        if (player.position === "DEF") counts.DF++;
        if (player.position === "MID") counts.MF++;
        if (player.position === "FWD") counts.FW++;
      } else if (player) {
        console.log(`Player ${idx}: ${player.name} - NO POSITION!`);
      }
    });
    
    console.log("Final counts:", counts);
    console.log("=== END DEBUG ===");
    
    return counts;
  };

  const countSelectedPlayers = () => {
    return Object.values(selectedPlayers).filter((player) => player !== null).length
  }

  const getPositionName = (position) => {
    if (position === "GK" || position === "GK_BENCH") return "Golman"
    if (position.startsWith("DF")) return "Odbrana"
    if (position.startsWith("MF")) return "Veznjak"
    if (position.startsWith("FW")) return "Napadač"
    return ""
  }

  const handleSaveTeam = async () => {
    // 2. Prilagodi prikaz klupe i validaciju
    const posCounts = countByPosition();
    if (posCounts.GK !== 2 || posCounts.DF !== 5 || posCounts.MF !== 5 || posCounts.FW !== 3) {
      alert("Ekipa mora imati 2 golmana, 5 odbrambenih, 5 veznih i 3 napadača!");
      return;
    }

    if (!captainId) {
      alert("Morate odabrati kapiten!")
      return
    }

    if (!viceCaptainId) {
      alert("Morate odabrati vice-kapiten!")
      return
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
      
      console.log("DEBUG: Sending transfer data:", transferData)

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
            {transfersInfo && (
              <div className={styles.transfersInfo}>
                <p>Besplatni transferi: {transfersInfo.remaining_free_transfers}/3</p>
                {transfersInfo.penalty > 0 && (
                  <p className={styles.penalty}>Penal: -{transfersInfo.penalty} poena</p>
                )}
              </div>
            )}
            {/* Debug info */}
            <div style={{fontSize: '12px', color: 'red', marginTop: '10px'}}>
              DEBUG: transferWindow = {JSON.stringify(transferWindow)}<br/>
              DEBUG: transfersInfo = {JSON.stringify(transfersInfo)}<br/>
              DEBUG: isDraftMode = {isDraftMode.toString()}
            </div>
          </div>
        )}

        <div className={styles.teamSection}>
          <div className={styles.teamHeader}>
            <h2>{fantasyTeam?.name || "Vaš Tim"}</h2>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Budžet:</span>
                <span className={styles.statValue}>{budget.toFixed(1)} M</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Igrači:</span>
                <span className={styles.statValue}>{countSelectedPlayers()}/15</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Bodovi:</span>
                <span className={styles.statValue}>{calculateTotalPoints()}</span>
              </div>
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
                >
                  {formation.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldContainer}>
            {renderFormationField()}

            <div className={styles.benchContainer}>
              <h3>Klupa</h3>
              <div className={styles.benchPlayers}>
                {getBenchSlots().map((pos, idx) => (
                  <div
                    key={pos}
                    className={`${styles.benchPosition} ${selectedPlayers[pos] ? styles.filled : ""}`}
                    onClick={() => openPlayerSelection(pos)}
                  >
                    {selectedPlayers[pos] ? (
                      <div className={styles.selectedPlayerInfo}>
                        <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                        <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
                        <div className={styles.playerPrice}>{selectedPlayers[pos].price}M</div>
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
                ))}
              </div>
            </div>
          </div>

          {/* Captain Selection */}
          <div className={styles.captainSelection}>
            <h3>Odaberite kapiten i vice-kapiten:</h3>
            <div className={styles.captainOptions}>
              {Object.values(selectedPlayers).filter(p => p).map((player) => (
                <div key={player.id} className={styles.captainOption}>
                  <div className={styles.playerInfo}>
                    <span>{player.name}</span>
                    <span className={styles.playerTeam}>{player.team}</span>
                  </div>
                  <div className={styles.captainButtons}>
                    <button
                      className={`${styles.captainBtn} ${captainId === player.id ? styles.active : ""}`}
                      onClick={() => setCaptain(player.id)}
                    >
                      <FaCrown /> Kapiten
                    </button>
                    <button
                      className={`${styles.captainBtn} ${viceCaptainId === player.id ? styles.active : ""}`}
                      onClick={() => setViceCaptain(player.id)}
                    >
                      <FaStar /> Vice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.resetButton}>Resetuj tim</button>
            <button 
              className={styles.saveTeamButton} 
              disabled={countSelectedPlayers() !== 15 || !captainId || !viceCaptainId}
              onClick={handleSaveTeam}
            >
              <FaSave />{" "}
              {countSelectedPlayers() === 15 && captainId && viceCaptainId 
                ? (isDraftMode ? "Kreiraj Tim" : "Sačuvaj Transfer") 
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
                    onClick={() => setActiveTab("golmani")}
                    disabled={!currentPosition?.includes("GK")}
                  >
                    Golmani
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "odbrana" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("odbrana")}
                    disabled={!currentPosition?.includes("DF")}
                  >
                    Odbrana
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "veznjaci" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("veznjaci")}
                    disabled={!currentPosition?.includes("MF")}
                  >
                    Veznjaci
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "napadaci" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("napadaci")}
                    disabled={!currentPosition?.includes("FW")}
                  >
                    Napadači
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
                        <div className={styles.playerPrice}>{player.price}M</div>
                        <div className={styles.playerPoints}>{player.points}</div>
                        <div className={styles.playerAction}>
                          <button
                            className={`${styles.actionButton} ${styles.addButton}`}
                            onClick={() => selectPlayer(player)}
                            disabled={isSelected}
                          >
                            {isSelected ? "Odabran" : "Odaberi"}
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
      </div>
    </>
  )
}
