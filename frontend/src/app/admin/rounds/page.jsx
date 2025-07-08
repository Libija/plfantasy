"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaFutbol } from "react-icons/fa"
import styles from "../../../styles/AdminRounds.module.css"

export default function AdminRounds() {
  const [rounds, setRounds] = useState([
    {
      id: 1,
      number: 1,
      season: "2024/25",
      startDate: "2024-08-10",
      endDate: "2024-08-11",
      status: "Završeno",
      matchCount: 6,
    },
    {
      id: 2,
      number: 2,
      season: "2024/25",
      startDate: "2024-08-17",
      endDate: "2024-08-18",
      status: "Završeno",
      matchCount: 6,
    },
    {
      id: 3,
      number: 3,
      season: "2024/25",
      startDate: "2024-08-24",
      endDate: "2024-08-25",
      status: "U toku",
      matchCount: 6,
    },
    {
      id: 4,
      number: 4,
      season: "2024/25",
      startDate: "2024-08-31",
      endDate: "2024-09-01",
      status: "Zakazano",
      matchCount: 6,
    },
    {
      id: 5,
      number: 5,
      season: "2024/25",
      startDate: "2024-09-14",
      endDate: "2024-09-15",
      status: "Zakazano",
      matchCount: 6,
    },
  ])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roundToDelete, setRoundToDelete] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRound, setEditingRound] = useState(null)

  const handleDeleteClick = (round) => {
    setRoundToDelete(round)
    setShowDeleteModal(true)
  }

  const handleEditClick = (round) => {
    setEditingRound({ ...round })
    setShowEditModal(true)
  }

  const confirmDelete = () => {
    setRounds(rounds.filter((round) => round.id !== roundToDelete.id))
    setShowDeleteModal(false)
    setRoundToDelete(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditingRound((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveEditChanges = () => {
    setRounds(
      rounds.map((round) => {
        if (round.id === editingRound.id) {
          return editingRound
        }
        return round
      }),
    )
    setShowEditModal(false)
    setEditingRound(null)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Završeno":
        return styles.statusCompleted
      case "U toku":
        return styles.statusInProgress
      case "Zakazano":
        return styles.statusScheduled
      default:
        return ""
    }
  }

  return (
    <>
      <Head>
        <title>Upravljanje kolima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje kolima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upravljanje kolima</h1>
          <Link href="/admin/rounds/create" className={styles.createButton}>
            <FaPlus /> Kreiraj novo kolo
          </Link>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="seasonFilter">Sezona:</label>
            <select id="seasonFilter" className={styles.filterSelect}>
              <option value="2024/25">2024/25</option>
              <option value="2023/24">2023/24</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">Status:</label>
            <select id="statusFilter" className={styles.filterSelect}>
              <option value="all">Svi statusi</option>
              <option value="completed">Završeno</option>
              <option value="in-progress">U toku</option>
              <option value="scheduled">Zakazano</option>
            </select>
          </div>
        </div>

        <div className={styles.roundsGrid}>
          {rounds.map((round) => (
            <div key={round.id} className={styles.roundCard}>
              <div className={styles.roundHeader}>
                <h2 className={styles.roundNumber}>{round.number}. kolo</h2>
                <span className={`${styles.roundStatus} ${getStatusClass(round.status)}`}>{round.status}</span>
              </div>

              <div className={styles.roundInfo}>
                <div className={styles.infoItem}>
                  <FaCalendarAlt />
                  <span>
                    {new Date(round.startDate).toLocaleDateString("bs-BA")} -{" "}
                    {new Date(round.endDate).toLocaleDateString("bs-BA")}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <FaFutbol />
                  <span>{round.matchCount} utakmica</span>
                </div>
              </div>

              <div className={styles.roundActions}>
                <Link href={`/admin/rounds/${round.id}/matches`} className={styles.viewMatchesButton}>
                  Pregledaj utakmice
                </Link>
                <div className={styles.actionButtons}>
                  <button className={styles.editButton} onClick={() => handleEditClick(round)}>
                    <FaEdit />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(round)}
                    disabled={round.status !== "Zakazano"}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Potvrda brisanja</h2>
              <p className={styles.modalText}>
                Da li ste sigurni da želite obrisati {roundToDelete?.number}. kolo?
                {roundToDelete?.matchCount > 0 && (
                  <span className={styles.warningText}>
                    {" "}
                    Ovo kolo sadrži {roundToDelete.matchCount} utakmica koje će također biti obrisane.
                  </span>
                )}
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
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>Uredi kolo</h2>
              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="number">Broj kola:</label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={editingRound.number}
                    onChange={handleEditChange}
                    min="1"
                    max="33"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="startDate">Datum početka:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={editingRound.startDate}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endDate">Datum završetka:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={editingRound.endDate}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Status:</label>
                  <select id="status" name="status" value={editingRound.status} onChange={handleEditChange}>
                    <option value="Zakazano">Zakazano</option>
                    <option value="U toku">U toku</option>
                    <option value="Završeno">Završeno</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                  Otkaži
                </button>
                <button className={styles.saveButton} onClick={saveEditChanges}>
                  Sačuvaj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
