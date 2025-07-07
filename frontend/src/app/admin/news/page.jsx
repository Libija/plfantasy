"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminNews.module.css"

export default function AdminNews() {
  const [news, setNews] = useState([
    {
      id: 1,
      title: "Sarajevo pobjedilo Zrinjski u derbiju kola",
      category: "Utakmice",
      author: "Admin",
      date: "22.05.2025.",
      status: "Objavljeno",
      views: 1245,
      relatedClubs: ["FK Sarajevo", "HŠK Zrinjski"],
      excerpt: "Uzbudljiv derbi završen je pobjedom domaćina",
      content: "Sarajevo je u uzbudljivom derbiju savladalo Zrinjski rezultatom 2:1...",
      featured: true,
      image: null,
    },
    {
      id: 2,
      title: "Tuzla City doveo novo pojačanje iz Hrvatske",
      category: "Transferi",
      author: "Admin",
      date: "21.05.2025.",
      status: "Objavljeno",
      views: 856,
      relatedClubs: ["FK Tuzla City"],
      excerpt: "Novi igrač stiže iz Hrvatske",
      content: "FK Tuzla City je doveo novo pojačanje...",
      featured: false,
      image: null,
    },
    {
      id: 3,
      title: "Borac se priprema za evropske izazove",
      category: "Klubovi",
      author: "Admin",
      date: "20.05.2025.",
      status: "Draft",
      views: 0,
      relatedClubs: ["FK Borac"],
      excerpt: "Priprema za evropska takmičenja",
      content: "FK Borac intenzivno radi na pripremama...",
      featured: false,
      image: null,
    },
  ])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [imagePreview, setImagePreview] = useState(null)

  const categories = ["Utakmice", "Transferi", "Klubovi", "Liga", "Infrastruktura", "Ostalo"]
  const clubs = [
    "FK Sarajevo",
    "FK Borac",
    "HŠK Zrinjski",
    "FK Željezničar",
    "FK Tuzla City",
    "NK Široki Brijeg",
    "FK Velež",
    "FK Sloboda",
  ]

  const handleDelete = (newsItem) => {
    setSelectedNews(newsItem)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setNews(news.filter((item) => item.id !== selectedNews.id))
    setShowDeleteModal(false)
    setSelectedNews(null)
  }

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem)
    setEditFormData({ ...newsItem })
    setImagePreview(newsItem.image)
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
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
      setEditFormData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setNews((prev) => prev.map((item) => (item.id === selectedNews.id ? { ...editFormData } : item)))
    setShowEditModal(false)
    setSelectedNews(null)
    setEditFormData({})
    setImagePreview(null)
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
            <div className={styles.headerCell}>Autor</div>
            <div className={styles.headerCell}>Datum</div>
            <div className={styles.headerCell}>Status</div>
            <div className={styles.headerCell}>Pregledi</div>
            <div className={styles.headerCell}>Akcije</div>
          </div>

          {news.map((item) => (
            <div key={item.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.newsTitle}>{item.title}</div>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.category}>{item.category}</span>
              </div>
              <div className={styles.tableCell}>{item.author}</div>
              <div className={styles.tableCell}>{item.date}</div>
              <div className={styles.tableCell}>
                <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>{item.status}</span>
              </div>
              <div className={styles.tableCell}>{item.views}</div>
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
          ))}
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit-status">Status *</label>
                    <select
                      id="edit-status"
                      name="status"
                      value={editFormData.status || ""}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="Draft">Draft</option>
                      <option value="Objavljeno">Objavljeno</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Povezani klubovi</label>
                  <div className={styles.clubsGrid}>
                    {clubs.map((club) => (
                      <label key={club} className={styles.clubCheckbox}>
                        <input
                          type="checkbox"
                          value={club}
                          checked={editFormData.relatedClubs?.includes(club) || false}
                          onChange={handleClubChange}
                        />
                        <span>{club}</span>
                      </label>
                    ))}
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
                  <label htmlFor="edit-excerpt">Kratki opis</label>
                  <textarea
                    id="edit-excerpt"
                    name="excerpt"
                    value={editFormData.excerpt || ""}
                    onChange={handleEditChange}
                    rows="3"
                  />
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

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={editFormData.featured || false}
                      onChange={handleEditChange}
                    />
                    Istaknuta vijest
                  </label>
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
