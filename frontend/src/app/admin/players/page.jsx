"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminPlayers.module.css"

export default function AdminPlayers() {
  const [players, setPlayers] = useState([
    {
      id: 1,
      firstName: "Kenan",
      lastName: "Pirić",
      club: "Sarajevo",
      position: "GK",
      number: 1,
      age: 28,
      nationality: "BiH",
      height: 185,
      weight: 80,
      fantasyPrice: 8.0,
      marketValue: 500000,
      contractUntil: "2025-06-30",
      photo: null,
      biography: "Iskusni golman reprezentacije BiH",
      goals: 0,
      assists: 0,
      fantasyPoints: 45,
    },
    {
      id: 2,
      firstName: "Amar",
      lastName: "Rahmanović",
      club: "Sarajevo",
      position: "MF",
      number: 10,
      age: 26,
      nationality: "BiH",
      height: 178,
      weight: 75,
      fantasyPrice: 9.0,
      marketValue: 800000,
      contractUntil: "2026-06-30",
      photo: null,
      biography: "Kreativni veznjak i kapiten tima",
      goals: 8,
      assists: 12,
      fantasyPoints: 52,
    },
    {
      id: 3,
      firstName: "Benjamin",
      lastName: "Tatar",
      club: "Sarajevo",
      position: "FW",
      number: 9,
      age: 28,
      nationality: "BiH",
      height: 182,
      weight: 78,
      fantasyPrice: 10.0,
      marketValue: 1000000,
      contractUntil: "2025-12-31",
      photo: null,
      biography: "Najbolji strijelac lige",
      goals: 15,
      assists: 6,
      fantasyPoints: 58,
    },
  ])

  const [filters, setFilters] = useState({
    club: "",
    position: "",
    search: "",
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [photoPreview, setPhotoPreview] = useState(null)

  const clubs = ["Sarajevo", "Borac", "Zrinjski", "Željezničar", "Tuzla City"]
  const positions = [
    { value: "GK", label: "Golman" },
    { value: "DF", label: "Odbrana" },
    { value: "MF", label: "Veznjak" },
    { value: "FW", label: "Napadač" },
  ]
  const nationalities = ["BiH", "Srbija", "Hrvatska", "Crna Gora", "Slovenija", "Makedonija", "Ostalo"]

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const filteredPlayers = players.filter((player) => {
    return (
      (filters.club === "" || player.club === filters.club) &&
      (filters.position === "" || player.position === filters.position) &&
      (filters.search === "" ||
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(filters.search.toLowerCase()))
    )
  })

  const handleDelete = (player) => {
    setSelectedPlayer(player)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setPlayers(players.filter((player) => player.id !== selectedPlayer.id))
    setShowDeleteModal(false)
    setSelectedPlayer(null)
  }

  const handleEdit = (player) => {
    setSelectedPlayer(player)
    setEditFormData({ ...player })
    setPhotoPreview(player.photo)
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditFormData((prev) => ({ ...prev, photo: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setPlayers((prev) => prev.map((player) => (player.id === selectedPlayer.id ? { ...editFormData } : player)))
    setShowEditModal(false)
    setSelectedPlayer(null)
    setEditFormData({})
    setPhotoPreview(null)
  }

  return (
    <>
      <Head>
        <title>Upravljanje igračima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje igračima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje igračima</h1>
            <Link href="/admin/players/create" className={styles.createButton}>
              <FaPlus /> Novi igrač
            </Link>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              name="search"
              placeholder="Pretraži igrače..."
              value={filters.search}
              onChange={handleFilterChange}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <select name="club" value={filters.club} onChange={handleFilterChange} className={styles.filterSelect}>
              <option value="">Svi klubovi</option>
              {clubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">Sve pozicije</option>
              {positions.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.playersTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Ime</div>
            <div className={styles.headerCell}>Klub</div>
            <div className={styles.headerCell}>Pozicija</div>
            <div className={styles.headerCell}>Godine</div>
            <div className={styles.headerCell}>Fantasy cijena</div>
            <div className={styles.headerCell}>Golovi</div>
            <div className={styles.headerCell}>Asistencije</div>
            <div className={styles.headerCell}>Fantasy bodovi</div>
            <div className={styles.headerCell}>Akcije</div>
          </div>

          {filteredPlayers.map((player) => (
            <div key={player.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>
                    {player.firstName} {player.lastName}
                  </div>
                  <div className={styles.playerNationality}>{player.nationality}</div>
                </div>
              </div>
              <div className={styles.tableCell}>{player.club}</div>
              <div className={styles.tableCell}>
                <span className={`${styles.position} ${styles[player.position.toLowerCase()]}`}>
                  {positions.find((p) => p.value === player.position)?.label || player.position}
                </span>
              </div>
              <div className={styles.tableCell}>{player.age}</div>
              <div className={styles.tableCell}>
                <span className={styles.price}>{player.fantasyPrice}M</span>
              </div>
              <div className={styles.tableCell}>{player.goals}</div>
              <div className={styles.tableCell}>{player.assists}</div>
              <div className={styles.tableCell}>
                <span className={styles.fantasyPoints}>{player.fantasyPoints}</span>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.actions}>
                  <button className={styles.actionButton} onClick={() => handleEdit(player)}>
                    <FaEdit />
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(player)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal}>
              <div className={styles.modalHeader}>
                <h3>Uredi igrača</h3>
                <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                <div className={styles.formSection}>
                  <h4>Osnovne informacije</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-firstName">Ime *</label>
                      <input
                        type="text"
                        id="edit-firstName"
                        name="firstName"
                        value={editFormData.firstName || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-lastName">Prezime *</label>
                      <input
                        type="text"
                        id="edit-lastName"
                        name="lastName"
                        value={editFormData.lastName || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-club">Klub *</label>
                      <select
                        id="edit-club"
                        name="club"
                        value={editFormData.club || ""}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Odaberite klub</option>
                        {clubs.map((club) => (
                          <option key={club} value={club}>
                            {club}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-position">Pozicija *</label>
                      <select
                        id="edit-position"
                        name="position"
                        value={editFormData.position || ""}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Odaberite poziciju</option>
                        {positions.map((pos) => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-number">Broj dresa</label>
                      <input
                        type="number"
                        id="edit-number"
                        name="number"
                        value={editFormData.number || ""}
                        onChange={handleEditChange}
                        min="1"
                        max="99"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-age">Godine *</label>
                      <input
                        type="number"
                        id="edit-age"
                        name="age"
                        value={editFormData.age || ""}
                        onChange={handleEditChange}
                        required
                        min="16"
                        max="45"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit-nationality">Nacionalnost *</label>
                    <select
                      id="edit-nationality"
                      name="nationality"
                      value={editFormData.nationality || ""}
                      onChange={handleEditChange}
                      required
                    >
                      {nationalities.map((nat) => (
                        <option key={nat} value={nat}>
                          {nat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Fizičke karakteristike</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-height">Visina (cm)</label>
                      <input
                        type="number"
                        id="edit-height"
                        name="height"
                        value={editFormData.height || ""}
                        onChange={handleEditChange}
                        min="150"
                        max="220"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-weight">Težina (kg)</label>
                      <input
                        type="number"
                        id="edit-weight"
                        name="weight"
                        value={editFormData.weight || ""}
                        onChange={handleEditChange}
                        min="50"
                        max="120"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Fantasy i tržišna vrijednost</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-fantasyPrice">Fantasy cijena (M) *</label>
                      <input
                        type="number"
                        id="edit-fantasyPrice"
                        name="fantasyPrice"
                        value={editFormData.fantasyPrice || ""}
                        onChange={handleEditChange}
                        required
                        min="4"
                        max="15"
                        step="0.5"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-marketValue">Tržišna vrijednost (€)</label>
                      <input
                        type="number"
                        id="edit-marketValue"
                        name="marketValue"
                        value={editFormData.marketValue || ""}
                        onChange={handleEditChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit-contractUntil">Ugovor do</label>
                    <input
                      type="date"
                      id="edit-contractUntil"
                      name="contractUntil"
                      value={editFormData.contractUntil || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Fotografija</h4>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-photo">Fotografija igrača</label>
                    <div className={styles.photoUpload}>
                      <input
                        type="file"
                        id="edit-photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className={styles.photoInput}
                      />
                      <label htmlFor="edit-photo" className={styles.photoUploadLabel}>
                        <FaUpload />
                        <span>Promijeni fotografiju</span>
                      </label>
                      {photoPreview && (
                        <div className={styles.photoPreview}>
                          <img src={photoPreview || "/placeholder.svg"} alt="Photo preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-biography">Biografija</label>
                  <textarea
                    id="edit-biography"
                    name="biography"
                    value={editFormData.biography || ""}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <FaSave /> Sačuvaj promjene
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Potvrdi brisanje</h3>
              </div>
              <div className={styles.modalContent}>
                <p>
                  Da li ste sigurni da želite obrisati igrača "{selectedPlayer?.firstName} {selectedPlayer?.lastName}"?
                </p>
                <div className={styles.modalActions}>
                  <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>
                    Otkaži
                  </button>
                  <button className={styles.confirmButton} onClick={confirmDelete}>
                    Obriši
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
