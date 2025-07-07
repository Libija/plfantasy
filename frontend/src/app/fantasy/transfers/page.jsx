"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import styles from "../../../styles/FantasyTransfers.module.css"

export default function FantasyTransfers() {
  const [selectedFormation, setSelectedFormation] = useState("4-3-3")
  const [selectedPlayers, setSelectedPlayers] = useState({
    GK: { id: 1, name: "Kenan Pirić", team: "Sarajevo", price: 8, points: 45 },
    DF1: { id: 5, name: "Siniša Stevanović", team: "Sarajevo", price: 6, points: 36 },
    DF2: null,
    DF3: null,
    DF4: null,
    MF1: { id: 11, name: "Amar Rahmanović", team: "Sarajevo", price: 9, points: 52 },
    MF2: null,
    MF3: null,
    FW1: { id: 17, name: "Benjamin Tatar", team: "Sarajevo", price: 10, points: 58 },
    FW2: null,
    FW3: null,
    // Bench
    GK_BENCH: null,
    DF_BENCH: null,
    MF_BENCH: null,
    FW_BENCH: null,
  })

  const [budget, setBudget] = useState(67)
  const [showModal, setShowModal] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [activeTab, setActiveTab] = useState("golmani")

  const formations = [
    { value: "4-3-3", label: "4-3-3", positions: { DF: 4, MF: 3, FW: 3 } },
    { value: "4-4-2", label: "4-4-2", positions: { DF: 4, MF: 4, FW: 2 } },
    { value: "3-5-2", label: "3-5-2", positions: { DF: 3, MF: 5, FW: 2 } },
    { value: "5-3-2", label: "5-3-2", positions: { DF: 5, MF: 3, FW: 2 } },
    { value: "4-5-1", label: "4-5-1", positions: { DF: 4, MF: 5, FW: 1 } },
  ]

  const players = {
    golmani: [
      { id: 1, name: "Kenan Pirić", team: "Sarajevo", position: "GK", price: 8, points: 45 },
      { id: 2, name: "Nikola Vasilj", team: "Borac", position: "GK", price: 7, points: 42 },
      { id: 3, name: "Adnan Hadžić", team: "Željezničar", position: "GK", price: 6, points: 38 },
      { id: 4, name: "Ivan Brkić", team: "Zrinjski", position: "GK", price: 7, points: 40 },
    ],
    odbrana: [
      { id: 5, name: "Siniša Stevanović", team: "Sarajevo", position: "DF", price: 6, points: 36 },
      { id: 6, name: "Nihad Mujakić", team: "Borac", position: "DF", price: 5, points: 32 },
      { id: 7, name: "Ermin Zec", team: "Željezničar", position: "DF", price: 5, points: 30 },
      { id: 8, name: "Hrvoje Barišić", team: "Zrinjski", position: "DF", price: 6, points: 34 },
      { id: 9, name: "Besim Šerbečić", team: "Tuzla City", position: "DF", price: 4, points: 28 },
      { id: 10, name: "Marko Mihojević", team: "Široki Brijeg", position: "DF", price: 5, points: 31 },
    ],
    veznjaci: [
      { id: 11, name: "Amar Rahmanović", team: "Sarajevo", position: "MF", price: 9, points: 52 },
      { id: 12, name: "Srđan Grahovac", team: "Borac", position: "MF", price: 8, points: 48 },
      { id: 13, name: "Dino Beširović", team: "Željezničar", position: "MF", price: 7, points: 44 },
      { id: 14, name: "Mario Tičinović", team: "Zrinjski", position: "MF", price: 8, points: 46 },
      { id: 15, name: "Nemanja Mihajlović", team: "Tuzla City", position: "MF", price: 6, points: 40 },
      { id: 16, name: "Ivan Jukić", team: "Široki Brijeg", position: "MF", price: 7, points: 42 },
    ],
    napadaci: [
      { id: 17, name: "Benjamin Tatar", team: "Sarajevo", position: "FW", price: 10, points: 58 },
      { id: 18, name: "Stojan Vranješ", team: "Borac", position: "FW", price: 9, points: 54 },
      { id: 19, name: "Sulejman Krpić", team: "Željezničar", position: "FW", price: 8, points: 50 },
      { id: 20, name: "Petar Brkić", team: "Zrinjski", position: "FW", price: 9, points: 52 },
      { id: 21, name: "Dejan Živković", team: "Tuzla City", position: "FW", price: 7, points: 46 },
      { id: 22, name: "Luka Bilobrk", team: "Široki Brijeg", position: "FW", price: 8, points: 48 },
    ],
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
                <div className={styles.playerTeam}>{selectedPlayers.GK.team}</div>
                <div className={styles.playerPrice}>{selectedPlayers.GK.price}M</div>
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
                  <div className={styles.playerTeam}>{selectedPlayers[`DF${i + 1}`].team}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`DF${i + 1}`].price}M</div>
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
                  <div className={styles.playerTeam}>{selectedPlayers[`MF${i + 1}`].team}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`MF${i + 1}`].price}M</div>
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
                  <div className={styles.playerTeam}>{selectedPlayers[`FW${i + 1}`].team}</div>
                  <div className={styles.playerPrice}>{selectedPlayers[`FW${i + 1}`].price}M</div>
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
      [currentPosition]: player,
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
    }
  }

  const calculateTotalPoints = () => {
    return Object.values(selectedPlayers)
      .filter((player) => player !== null)
      .reduce((total, player) => total + player.points, 0)
  }

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
          <h1 className={styles.title}>Transferi</h1>
        </div>

        <div className={styles.teamSection}>
          <div className={styles.teamHeader}>
            <h2>Vaš Tim</h2>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Budžet:</span>
                <span className={styles.statValue}>{budget} M</span>
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
                {["GK_BENCH", "DF_BENCH", "MF_BENCH", "FW_BENCH"].map((pos) => (
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

          <div className={styles.actionButtons}>
            <button className={styles.resetButton}>Resetuj tim</button>
            <button className={styles.saveTeamButton} disabled={countSelectedPlayers() !== 15}>
              <FaSave />{" "}
              {countSelectedPlayers() === 15 ? "Sačuvaj Tim" : `Odaberite još ${15 - countSelectedPlayers()} igrača`}
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

                  {players[activeTab].map((player) => {
                    const isSelected = Object.values(selectedPlayers).some((p) => p && p.id === player.id)

                    return (
                      <div key={player.id} className={`${styles.playerRow} ${isSelected ? styles.selectedRow : ""}`}>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.playerTeam}>{player.team}</div>
                        <div className={styles.playerPrice}>{player.price} M</div>
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
