"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa"
import styles from "../../../../../styles/AdminRoundMatches.module.css"

export default function RoundMatches() {
  const params = useParams()
  const roundId = params.id

  const [round, setRound] = useState({
    id: roundId,
    number: 3,
    season: "2024/25",
    startDate: "2024-08-24",
    endDate: "2024-08-25",
    status: "U toku",
  })

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Učitavanje podataka
  useEffect(() => {
    setMounted(true)
    fetchRoundData()
    fetchMatches()
  }, [roundId])

  const fetchRoundData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/gameweeks/${roundId}`)
      if (response.ok) {
        const data = await response.json()
        setRound({
          id: data.id,
          number: data.number,
          season: data.season,
          startDate: data.start_date.split('T')[0],
          endDate: data.end_date.split('T')[0],
          status: data.status === 'scheduled' ? 'Zakazano' : 
                 data.status === 'in_progress' ? 'U toku' : 'Završeno'
        })
      }
    } catch (error) {
      console.error('Greška pri učitavanju podataka kola:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/matches/gameweek/${roundId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Matches data:', data) // Debug log
        setMatches(data)
      } else {
        console.error('Greška pri učitavanju utakmica')
      }
    } catch (error) {
      console.error('Greška pri učitavanju utakmica:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (match) => {
    setMatchToDelete(match)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/matches/${matchToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setMatches(matches.filter((match) => match.id !== matchToDelete.id))
        setShowDeleteModal(false)
        setMatchToDelete(null)
      } else {
        const errorData = await response.json()
        alert(`Greška: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Greška pri brisanju utakmice:', error)
      alert('Greška pri brisanju utakmice')
    }
  }

  const handleEditClick = (match) => {
    setEditingMatch(match)
    setEditFormData({
      date: match.date.split('T')[0],
      time: match.date.split('T')[1].substring(0, 5),
      stadium: match.stadium,
      referee: match.referee || ""
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveEditChanges = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editFormData.date + 'T' + editFormData.time + ':00',
          stadium: editFormData.stadium,
          referee: editFormData.referee || null
        }),
      })
      
      if (response.ok) {
        // Ažuriraj lokalno stanje
        setMatches(matches.map(match => {
          if (match.id === editingMatch.id) {
            return {
              ...match,
              date: editFormData.date + 'T' + editFormData.time + ':00',
              stadium: editFormData.stadium,
              referee: editFormData.referee || null
            }
          }
          return match
        }))
        setShowEditModal(false)
        setEditingMatch(null)
        setEditFormData({})
      } else {
        const errorData = await response.json()
        alert(`Greška: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Greška pri ažuriranju utakmice:', error)
      alert('Greška pri ažuriranju utakmice')
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

  const getTeamInitials = (teamName) => {
    return teamName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!mounted) return dateString
    return new Date(dateString).toLocaleDateString("bs-BA")
  }

  const formatTime = (dateString) => {
    if (!mounted) return "00:00"
    return new Date(dateString).toLocaleTimeString("bs-BA", {hour: '2-digit', minute: '2-digit'})
  }

  return (
    <>
      <Head>
        <title>Utakmice {round.number}. kola | Admin</title>
        <meta name="description" content={`Upravljanje utakmicama ${round.number}. kola`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/rounds" className={styles.backButton}>
            <FaArrowLeft />
            <span>Nazad na kola</span>
          </Link>
          <h1 className={styles.title}>
            Utakmice {round.number}. kola
            <span className={`${styles.roundStatus} ${getStatusClass(round.status)}`}>{round.status}</span>
          </h1>
          <Link href="/admin/matches/create" className={styles.createButton}>
            <FaPlus /> Dodaj utakmicu
          </Link>
        </div>

        <div className={styles.roundInfo}>
          <div className={styles.infoItem}>
            <FaCalendarAlt />
            <span>
              {formatDate(round.startDate)} -{" "}
              {formatDate(round.endDate)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span>Sezona: {round.season}</span>
          </div>
        </div>

        <div className={styles.matchesList}>
          {loading ? (
            <div className={styles.loading}>Učitavanje utakmica...</div>
          ) : matches.length === 0 ? (
            <div className={styles.noMatches}>
              <p>Nema utakmica u ovom kolu.</p>
              <Link href="/admin/matches/create" className={styles.addMatchButton}>
                <FaPlus /> Dodaj prvu utakmicu
              </Link>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <div className={styles.matchDate}>
                    <FaCalendarAlt />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className={styles.matchTime}>
                    <FaClock />
                    <span>{formatTime(match.date)}</span>
                  </div>
                  <div className={styles.matchStadium}>
                    <FaMapMarkerAlt />
                    <span>{match.stadium}</span>
                  </div>
                  <div className={`${styles.matchStatus} ${getStatusClass(match.status)}`}>
                    {match.status === 'scheduled' ? 'Zakazana' : 
                     match.status === 'in_progress' ? 'U toku' : 'Završena'}
                  </div>
                </div>

                <div className={styles.matchTeams}>
                  <div className={styles.team}>
                    <div className={styles.teamLogo}>
                      {match.home_club_logo ? (
                        <img src={match.home_club_logo} alt={match.home_club_name} className={styles.clubLogoImg} />
                      ) : (
                        <div className={styles.teamInitials}>{getTeamInitials(match.home_club_name)}</div>
                      )}
                    </div>
                    <div className={styles.teamName}>{match.home_club_name}</div>
                  </div>

                  <div className={styles.matchScore}>
                    {match.status !== "scheduled" ? (
                      <>
                        <span className={styles.score}>{match.home_score || 0}</span>
                        <span className={styles.scoreSeparator}>:</span>
                        <span className={styles.score}>{match.away_score || 0}</span>
                      </>
                    ) : (
                      <span className={styles.vs}>VS</span>
                    )}
                  </div>

                  <div className={styles.team}>
                    <div className={styles.teamLogo}>
                      {match.away_club_logo ? (
                        <img src={match.away_club_logo} alt={match.away_club_name} className={styles.clubLogoImg} />
                      ) : (
                        <div className={styles.teamInitials}>{getTeamInitials(match.away_club_name)}</div>
                      )}
                    </div>
                    <div className={styles.teamName}>{match.away_club_name}</div>
                  </div>
                </div>

                <div className={styles.matchActions}>
                  {match.status === "scheduled" ? (
                    <>
                      <Link href={`/admin/matches/result/${match.id}`} className={styles.resultButton}>
                        Unesi rezultat
                      </Link>
                      <button className={styles.editButton} onClick={() => handleEditClick(match)}>
                        <FaEdit />
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDeleteClick(match)}>
                        <FaTrash />
                      </button>
                    </>
                  ) : match.status === "in_progress" ? (
                    <>
                      <Link href={`/admin/matches/result/${match.id}`} className={styles.updateButton}>
                        Ažuriraj rezultat
                      </Link>
                      <Link href={`/admin/matches/events/${match.id}`} className={styles.eventsButton}>
                        Događaji
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/admin/matches/events/${match.id}`} className={styles.eventsButton}>
                        Događaji
                      </Link>
                      <button className={styles.editButton} onClick={() => handleEditClick(match)}>
                        <FaEdit />
                      </button>
                    </>
                  )}
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
                Da li ste sigurni da želite obrisati utakmicu {matchToDelete?.home_club_name} vs{" "}
                {matchToDelete?.away_club_name}?
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
              <h2 className={styles.modalTitle}>Uredi utakmicu</h2>
              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="editDate">Datum:</label>
                  <input
                    type="date"
                    id="editDate"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="editTime">Vrijeme:</label>
                  <input
                    type="time"
                    id="editTime"
                    name="time"
                    value={editFormData.time}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="editStadium">Stadion:</label>
                  <input
                    type="text"
                    id="editStadium"
                    name="stadium"
                    value={editFormData.stadium}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="editReferee">Sudija:</label>
                  <input
                    type="text"
                    id="editReferee"
                    name="referee"
                    value={editFormData.referee}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                  Otkaži
                </button>
                <button className={styles.confirmButton} onClick={saveEditChanges}>
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
