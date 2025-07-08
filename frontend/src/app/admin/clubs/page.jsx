"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaUsers, FaEllipsisV, FaSave } from "react-icons/fa"
import styles from "../../../styles/AdminClubs.module.css"

export default function AdminClubs() {
  const [clubs, setClubs] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [logoPreview, setLogoPreview] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        const data = await res.json()
        setClubs(data)
      } catch {
        setError("Greška pri dohvatu klubova.")
      }
    }
    fetchClubs()
  }, [])

  const handleDelete = (club) => {
    setSelectedClub(club)
    setShowDeleteModal(true)
    setActionMenuOpen(null)
  }

  const confirmDelete = async () => {
    setLoading(true)
    setError("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/clubs/${selectedClub.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setClubs((prev) => prev.filter((club) => club.id !== selectedClub.id))
      setShowDeleteModal(false)
      setSelectedClub(null)
    } catch {
      setError("Greška pri brisanju kluba.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (club) => {
    setSelectedClub(club)
    setEditFormData({ ...club })
    setLogoPreview(club.logo_url)
    setShowEditModal(true)
    setActionMenuOpen(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setEditFormData((prev) => ({ ...prev, logo_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const payload = { ...editFormData, year_founded: Number(editFormData.year_founded), stadium_capacity: Number(editFormData.stadium_capacity) }
      const res = await fetch(`${apiUrl}/admin/clubs/${selectedClub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setClubs((prev) => prev.map((club) => (club.id === selectedClub.id ? { ...payload, id: selectedClub.id } : club)))
      setShowEditModal(false)
      setSelectedClub(null)
      setEditFormData({})
      setLogoPreview(null)
      setMessage("Klub je uspješno ažuriran!")
    } catch {
      setError("Greška pri ažuriranju kluba.")
    } finally {
      setLoading(false)
    }
  }

  const handleActionMenu = (clubId) => {
    setActionMenuOpen(actionMenuOpen === clubId ? null : clubId)
  }

  return (
    <>
      <Head>
        <title>Upravljanje klubovima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje klubovima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje klubovima</h1>
            <Link href="/admin/clubs/create" className={styles.createButton}>
              <FaPlus /> Novi klub
            </Link>
          </div>
        </div>

        {message && <p style={{ color: "green", marginBottom: 10 }}>{message}</p>}
        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <div key={club.id} className={styles.clubCard} style={{ border: `2px solid ${club.primary_color || "#1a237e"}` }}>
              <div className={styles.clubHeader}>
                <div className={styles.clubLogo} style={{ backgroundColor: club.primary_color || "#1a237e" }}>
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} style={{ maxWidth: 48, maxHeight: 48, borderRadius: 8 }} />
                  ) : (
                    <div className={styles.logoPlaceholder} style={{ color: club.secondary_color || "#fff" }}>
                      {club.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.clubInfo}>
                  <h3 className={styles.clubName}>{club.name}</h3>
                  <p className={styles.clubCity}>{club.city}</p>
                </div>
                <div style={{ marginLeft: "auto", position: "relative" }}>
                  <button className={styles.actionButton} style={{ background: "#e9ecef", color: "#333", padding: 8 }} onClick={() => handleActionMenu(club.id)}>
                    <FaEllipsisV />
                  </button>
                  {actionMenuOpen === club.id && (
                    <div style={{ position: "absolute", right: 0, top: 36, background: "#fff", border: "1px solid #ccc", borderRadius: 6, zIndex: 10, minWidth: 120, boxShadow: "0 2px 8px #0002" }}>
                      <button className={styles.actionButton} style={{ background: "#ffc107", color: "#212529", borderRadius: 0, width: "100%" }} onClick={() => handleEdit(club)}>
                        <FaEdit /> Uredi
                      </button>
                      <button className={styles.actionButton} style={{ background: "#dc3545", color: "#fff", borderRadius: 0, width: "100%" }} onClick={() => handleDelete(club)}>
                        <FaTrash /> Obriši
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.clubDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Osnovan:</span>
                  <span className={styles.detailValue}>{club.year_founded}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Stadion:</span>
                  <span className={styles.detailValue}>{club.stadium}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Kapacitet:</span>
                  <span className={styles.detailValue}>{club.stadium_capacity?.toLocaleString?.() || club.stadium_capacity}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trener:</span>
                  <span className={styles.detailValue}>{club.coach}</span>
                </div>
              </div>
              <div className={styles.clubActions}>
                <Link href={`/admin/players?club=${club.id}`} className={styles.actionButton} style={{ background: "#17a2b8", color: "#fff" }}>
                  <FaUsers /> Igrači
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal} style={{ background: "#182952", color: "#fff", borderRadius: 12, minWidth: 340, maxWidth: 420, boxShadow: "0 2px 16px #0008" }}>
              <div className={styles.modalHeader}>
                <h3>Uredi klub</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", marginLeft: "auto" }}>&times;</button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Puno ime kluba *</label>
                  <input type="text" name="name" value={editFormData.name || ""} onChange={handleEditChange} required style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Grad *</label>
                  <input type="text" name="city" value={editFormData.city || ""} onChange={handleEditChange} required style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Godina osnivanja *</label>
                  <input type="number" name="year_founded" value={editFormData.year_founded || ""} onChange={handleEditChange} required min="1800" max="2025" style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Stadion *</label>
                  <input type="text" name="stadium" value={editFormData.stadium || ""} onChange={handleEditChange} required style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Kapacitet *</label>
                  <input type="number" name="stadium_capacity" value={editFormData.stadium_capacity || ""} onChange={handleEditChange} required min="1000" style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Trener</label>
                  <input type="text" name="coach" value={editFormData.coach || ""} onChange={handleEditChange} style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Opis</label>
                  <textarea name="description" value={editFormData.description || ""} onChange={handleEditChange} style={{ background: "#222b44", color: "#fff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Logo (URL ili upload)</label>
                  <input type="text" name="logo_url" value={editFormData.logo_url || ""} onChange={handleEditChange} placeholder="https://..." style={{ background: "#222b44", color: "#fff" }} />
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                  {logoPreview && <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 80, marginTop: 8 }} />}
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Primarna boja</label>
                    <input type="color" name="primary_color" value={editFormData.primary_color || "#1a237e"} onChange={handleEditChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Sekundarna boja</label>
                    <input type="color" name="secondary_color" value={editFormData.secondary_color || "#ffffff"} onChange={handleEditChange} />
                  </div>
                </div>
                <button type="submit" className={styles.saveButton} disabled={loading} style={{ marginTop: 16 }}>
                  {loading ? "Spremanje..." : <><FaSave /> Spremi</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal} style={{ background: "#222b44", color: "#fff", borderRadius: 12, minWidth: 320, maxWidth: 400, boxShadow: "0 2px 16px #0008" }}>
              <div className={styles.modalHeader}>
                <h3>Potvrda brisanja</h3>
                <button onClick={() => setShowDeleteModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", marginLeft: "auto" }}>&times;</button>
              </div>
              <div className={styles.modalContent}>
                <p className={styles.warning}>Jeste li sigurni da želite obrisati klub <b>{selectedClub?.name}</b>?</p>
                {error && <p style={{ color: "red" }}>{error}</p>}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)} disabled={loading}>Otkaži</button>
                <button className={styles.confirmButton} onClick={confirmDelete} disabled={loading}>{loading ? "Brisanje..." : "Obriši"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
