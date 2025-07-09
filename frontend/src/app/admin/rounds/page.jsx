"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaFutbol } from "react-icons/fa"
import styles from "../../../styles/AdminRounds.module.css"

export default function AdminRounds() {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState("2024/25")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Učitavanje podataka
  useEffect(() => {
    fetchRounds()
    fetchSeasons()
  }, [selectedSeason, selectedStatus])

  const fetchRounds = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      let url = `${apiUrl}/api/gameweeks`
      const params = new URLSearchParams()
      
      if (selectedSeason !== 'all') {
        params.append('season', selectedSeason)
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRounds(data)
      } else {
        console.error('Greška pri učitavanju kola')
      }
    } catch (error) {
      console.error('Greška pri učitavanju kola:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeasons = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/gameweeks/seasons/list`)
      if (response.ok) {
        const data = await response.json()
        setSeasons(data.seasons)
      }
    } catch (error) {
      console.error('Greška pri učitavanju sezona:', error)
    }
  }
  const [roundToDelete, setRoundToDelete] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRound, setEditingRound] = useState(null)

  const handleDeleteClick = (round) => {
    setRoundToDelete(round)
    setShowDeleteModal(true)
  }

  const handleEditClick = (round) => {
    setEditingRound({ 
      ...round,
      startDate: round.start_date.split('T')[0],
      endDate: round.end_date.split('T')[0],
      status: round.status === 'scheduled' ? 'Zakazano' : 
              round.status === 'in_progress' ? 'U toku' : 'Završeno'
    })
    setShowEditModal(true)
  }

  const confirmDelete = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/gameweeks/${roundToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setRounds(rounds.filter((round) => round.id !== roundToDelete.id))
        setShowDeleteModal(false)
        setRoundToDelete(null)
      } else {
        const errorData = await response.json()
        alert(`Greška: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Greška pri brisanju kola:', error)
      alert('Greška pri brisanju kola')
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditingRound((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveEditChanges = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/gameweeks/${editingRound.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(editingRound.number),
          season: editingRound.season,
          start_date: editingRound.startDate + 'T00:00:00',
          end_date: editingRound.endDate + 'T00:00:00',
          status: editingRound.status === 'Zakazano' ? 'scheduled' : 
                 editingRound.status === 'U toku' ? 'in_progress' : 'completed'
        }),
      })
      
      if (response.ok) {
        // Ažuriraj lokalno stanje sa ispravnim formatom podataka
        setRounds(
          rounds.map((round) => {
            if (round.id === editingRound.id) {
              return {
                ...round,
                number: editingRound.number,
                season: editingRound.season,
                start_date: editingRound.startDate + 'T00:00:00',
                end_date: editingRound.endDate + 'T00:00:00',
                status: editingRound.status === 'Zakazano' ? 'scheduled' : 
                       editingRound.status === 'U toku' ? 'in_progress' : 'completed'
              }
            }
            return round
          }),
        )
        setShowEditModal(false)
        setEditingRound(null)
      } else {
        const errorData = await response.json()
        alert(`Greška: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Greška pri ažuriranju kola:', error)
      alert('Greška pri ažuriranju kola')
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return styles.statusCompleted
      case "in_progress":
        return styles.statusInProgress
      case "scheduled":
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
            <select 
              id="seasonFilter" 
              className={styles.filterSelect}
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="all">Sve sezone</option>
              {seasons.map((season) => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">Status:</label>
            <select 
              id="statusFilter" 
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Svi statusi</option>
              <option value="completed">Završeno</option>
              <option value="in_progress">U toku</option>
              <option value="scheduled">Zakazano</option>
            </select>
          </div>
        </div>

        <div className={styles.roundsGrid}>
          {loading ? (
            <div className={styles.loading}>Učitavanje kola...</div>
          ) : rounds.length === 0 ? (
            <div className={styles.noRounds}>Nema kola za prikaz</div>
          ) : (
            rounds.map((round) => (
              <div key={round.id} className={styles.roundCard}>
                <div className={styles.roundHeader}>
                  <h2 className={styles.roundNumber}>{round.number}. kolo</h2>
                  <span className={`${styles.roundStatus} ${getStatusClass(round.status)}`}>
                    {round.status === 'scheduled' ? 'Zakazano' : 
                     round.status === 'in_progress' ? 'U toku' : 'Završeno'}
                  </span>
                </div>

                <div className={styles.roundInfo}>
                  <div className={styles.infoItem}>
                    <FaCalendarAlt />
                    <span>
                      {new Date(round.start_date).toLocaleDateString("bs-BA")} -{" "}
                      {new Date(round.end_date).toLocaleDateString("bs-BA")}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaFutbol />
                    <span>{round.match_count} utakmica</span>
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
                      disabled={round.status !== "scheduled"}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
