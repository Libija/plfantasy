"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminNews.module.css"

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [clubs, setClubs] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/news`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setNews(data)
      } catch {
        setError("Greška pri dohvatu vijesti!")
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClubs(data)
      } catch {
        // ignore
      }
    }
    fetchClubs()
  }, [])

  const getClubName = (club_id) => {
    if (!club_id) return "-"
    const club = clubs.find((c) => c.id === club_id)
    return club ? club.name : "-"
  }

  const categories = ["Utakmice", "Transferi", "Klubovi", "Liga", "Infrastruktura", "Ostalo"]

  const CATEGORY_LABELS = {
    transfer: "Transferi",
    injury: "Povrede",
    preview: "Najave",
    result: "Rezultati",
    general: "Ostalo",
  };

  const handleDelete = (newsItem) => {
    setSelectedNews(newsItem)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    try {
      const res = await fetch(`${apiUrl}/admin/news/${selectedNews.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setNews(news.filter((item) => item.id !== selectedNews.id))
      setShowDeleteModal(false)
      setSelectedNews(null)
    } catch {
      alert("Greška pri brisanju vijesti!")
    }
  }

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem)
    setEditFormData({ ...newsItem })
    setImagePreview(newsItem.image_url)
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClubChange = (e) => {
    const { value, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      relatedClubs: checked ? [...prev.relatedClubs, value] : prev.relatedClubs.filter((club) => club !== value),
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setEditFormData((prev) => ({ ...prev, image_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const payload = {
      title: editFormData.title,
      content: editFormData.content,
      image_url: editFormData.image_url || null,
      category: editFormData.category,
      club_id: editFormData.club_id ? Number(editFormData.club_id) : null,
      date_posted: editFormData.date_posted,
    }
    try {
      const res = await fetch(`${apiUrl}/admin/news/${selectedNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setNews((prev) => prev.map((item) => (item.id === selectedNews.id ? updated : item)))
      setShowEditModal(false)
      setSelectedNews(null)
      setEditFormData({})
      setImagePreview(null)
    } catch {
      alert("Greška pri ažuriranju vijesti!")
    }
  }

  return (
    <>
      <Head>
        <title>Upravljanje vijestima | Admin</title>
        <meta name="description" content="Administratorski panel za upravljanje vijestima" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backButton}>
            <FaArrowLeft /> Nazad na dashboard
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Upravljanje vijestima</h1>
            <Link href="/admin/news/create" className={styles.createButton}>
              <FaPlus /> Nova vijest
            </Link>
          </div>
        </div>

        <div className={styles.newsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Naslov</div>
            <div className={styles.headerCell}>Kategorija</div>
            <div className={styles.headerCell}>Klub</div>
            <div className={styles.headerCell}>Datum</div>
            <div className={styles.headerCell}>Akcije</div>
          </div>

          {loading ? (
            <p>Učitavanje vijesti...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : news.length === 0 ? (
            <p>Nema vijesti za prikaz.</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.newsTitle}>{item.title}</div>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.category}>{CATEGORY_LABELS[item.category] || item.category}</span>
                </div>
                <div className={styles.tableCell}>{getClubName(item.club_id)}</div>
                <div className={styles.tableCell}>{item.date_posted ? new Date(item.date_posted).toLocaleDateString() : "-"}</div>
                <div className={styles.tableCell}>
                  <div className={styles.actions}>
                    <Link href={`/vijesti/${item.id}`} className={styles.actionButton}>
                      <FaEye />
                    </Link>
                    <button className={styles.actionButton} onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(item)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal}>
              <div className={styles.modalHeader}>
                <h3>Uredi vijest</h3>
                <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-title">Naslov vijesti *</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editFormData.title || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-category">Kategorija *</label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category || ""}
                      onChange={handleEditChange}
                      required
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-club">Klub (opcionalno)</label>
                    <select
                      id="edit-club"
                      name="club_id"
                      value={editFormData.club_id || ""}
                      onChange={handleEditChange}
                    >
                      <option value="">Bez kluba</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-image">Slika vijesti</label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      id="edit-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.imageInput}
                    />
                    <label htmlFor="edit-image" className={styles.imageUploadLabel}>
                      <FaUpload />
                      <span>Promijeni sliku</span>
                    </label>
                    {imagePreview && (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-content">Sadržaj vijesti *</label>
                  <textarea
                    id="edit-content"
                    name="content"
                    value={editFormData.content || ""}
                    onChange={handleEditChange}
                    rows="10"
                    required
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
                <p>Da li ste sigurni da želite obrisati vijest "{selectedNews?.title}"?</p>
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
