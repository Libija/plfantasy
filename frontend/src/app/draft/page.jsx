"use client"

import { useState } from "react"
import Head from "next/head"
import styles from "../../styles/Draft.module.css"

export default function Draft() {
  const [selectedPlayers, setSelectedPlayers] = useState({
    GK: null,
    DF1: null,
    DF2: null,
    DF3: null,
    DF4: null,
    MF1: null,
    MF2: null,
    MF3: null,
    MF4: null,
    FW1: null,
    FW2: null,
    FW3: null,
    // Bench
    GK_BENCH: null,
    DF_BENCH: null,
    MF_BENCH: null,
    FW_BENCH: null,
  })
  const [budget, setBudget] = useState(100)
  const [showModal, setShowModal] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [activeTab, setActiveTab] = useState("golmani")

  // Simulirani podaci za igrače
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

  const openPlayerSelection = (position) => {
    setCurrentPosition(position)
    setShowModal(true)

    // Set the active tab based on the position type
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

    // Check if player is already selected in another position
    const isPlayerAlreadySelected = Object.values(selectedPlayers).some((p) => p && p.id === player.id)

    if (isPlayerAlreadySelected) {
      alert("Ovaj igrač je već odabran za drugu poziciju!")
      return
    }

    // Calculate new budget
    const oldPlayer = selectedPlayers[currentPosition]
    const newBudget = oldPlayer ? budget + oldPlayer.price - player.price : budget - player.price

    // Check if we have enough budget
    if (newBudget < 0) {
      alert("Nemate dovoljno budžeta za ovog igrača!")
      return
    }

    // Update selected players and budget
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
        <title>Fantasy Draft | PLKutak</title>
        <meta name="description" content="Kreirajte svoj fantasy tim u Premijer ligi BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Fantasy Draft</h1>
        <p className={styles.subtitle}>Kreirajte svoj tim od igrača Premijer lige BiH</p>

        <div className={styles.draftContainer}>
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

            <div className={styles.fieldContainer}>
              <div className={styles.field}>
                {/* Golman */}
                <div className={styles.fieldRow}>
                  <div
                    className={`${styles.playerPosition} ${styles.gkPosition} ${selectedPlayers.GK ? styles.filled : ""}`}
                    onClick={() => openPlayerSelection("GK")}
                  >
                    {selectedPlayers.GK ? (
                      <div className={styles.selectedPlayerInfo}>
                        <div className={styles.playerNumber}>{selectedPlayers.GK.id}</div>
                        <div className={styles.playerName}>{selectedPlayers.GK.name}</div>
                        <div className={styles.playerTeam}>{selectedPlayers.GK.team}</div>
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
                  {["DF1", "DF2", "DF3", "DF4"].map((pos) => (
                    <div
                      key={pos}
                      className={`${styles.playerPosition} ${styles.dfPosition} ${selectedPlayers[pos] ? styles.filled : ""}`}
                      onClick={() => openPlayerSelection(pos)}
                    >
                      {selectedPlayers[pos] ? (
                        <div className={styles.selectedPlayerInfo}>
                          <div className={styles.playerNumber}>{selectedPlayers[pos].id}</div>
                          <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                          <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
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
                          <span>DF</span>
                          <span className={styles.addPlayerIcon}>+</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Veznjaci */}
                <div className={styles.fieldRow}>
                  {["MF1", "MF2", "MF3", "MF4"].map((pos) => (
                    <div
                      key={pos}
                      className={`${styles.playerPosition} ${styles.mfPosition} ${selectedPlayers[pos] ? styles.filled : ""}`}
                      onClick={() => openPlayerSelection(pos)}
                    >
                      {selectedPlayers[pos] ? (
                        <div className={styles.selectedPlayerInfo}>
                          <div className={styles.playerNumber}>{selectedPlayers[pos].id}</div>
                          <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                          <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
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
                          <span>MF</span>
                          <span className={styles.addPlayerIcon}>+</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Napadači */}
                <div className={styles.fieldRow}>
                  {["FW1", "FW2", "FW3"].map((pos) => (
                    <div
                      key={pos}
                      className={`${styles.playerPosition} ${styles.fwPosition} ${selectedPlayers[pos] ? styles.filled : ""}`}
                      onClick={() => openPlayerSelection(pos)}
                    >
                      {selectedPlayers[pos] ? (
                        <div className={styles.selectedPlayerInfo}>
                          <div className={styles.playerNumber}>{selectedPlayers[pos].id}</div>
                          <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                          <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
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
                          <span>FW</span>
                          <span className={styles.addPlayerIcon}>+</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                          <div className={styles.playerNumber}>{selectedPlayers[pos].id}</div>
                          <div className={styles.playerName}>{selectedPlayers[pos].name}</div>
                          <div className={styles.playerTeam}>{selectedPlayers[pos].team}</div>
                          <div className={styles.playerPositionLabel}>
                            {getPositionName(selectedPlayers[pos].position)}
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

            <button className={styles.saveTeamButton} disabled={countSelectedPlayers() !== 15}>
              {countSelectedPlayers() === 15 ? "Sačuvaj Tim" : `Odaberite još ${15 - countSelectedPlayers()} igrača`}
            </button>
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
                      // Check if player is already selected
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
      </div>
    </>
  )
}
