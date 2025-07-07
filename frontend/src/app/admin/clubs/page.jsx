"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaUsers, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../styles/AdminClubs.module.css"

export default function AdminClubs() {
  const [clubs, setClubs] = useState([
    {
      id: 1,
      name: "FK Sarajevo",
      shortName: "Sarajevo",
      city: "Sarajevo",
      founded: 1946,
      stadium: "Koševo",
      capacity: 34000,
      coach: "Husref Musemić",
      president: "Emir Hadžihafizbegović",
      website: "https://www.fksarajevo.ba",
      primaryColor: "#8B0000",
      secondaryColor: "#FFFFFF",
      logo: null,
      description: "Najstariji i najuspješniji klub u BiH",
      players: 25,
    },
    {
      id: 2,
      name: "FK Borac",
      shortName: "Borac",
      city: "Banja Luka",
      founded: 1926,
      stadium: "Gradski stadion",
      capacity: 9730,
      coach: "Vinko Marinović",
      president: "Vukašin Dokić",
      website: "https://www.fkborac.com",
      primaryColor: "#FF0000",
      secondaryColor: "#0000FF",
      logo: null,
      description: "Ponos Banje Luke",
      players: 23,
    },
    {
      id: 3,
      name: "HŠK Zrinjski",
      shortName: "Zrinjski",
      city: "Mostar",
      founded: 1905,
      stadium: "Pod Bijelim Brijegom",
      capacity: 9000,
      coach: "Sergej Jakirović",
      president: "Marinko Bošnjak",
      website: "https://www.hskzrinjski.ba",
      primaryColor: "#FFFFFF",
      secondaryColor: "#000000",
      logo: null,
      description: "Najstariji klub u BiH",
      players: 24,
    },
  ])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [logoPreview, setLogoPreview] = useState(null)

  const handleDelete = (club) => {
    setSelectedClub(club)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setClubs(clubs.filter((club) => club.id !== selectedClub.id))
    setShowDeleteModal(false)
    setSelectedClub(null)
  }

  const handleEdit = (club) => {
    setSelectedClub(club)
    setEditFormData({ ...club })
    setLogoPreview(club.logo)
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditFormData((prev) => ({ ...prev, logo: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setClubs((prev) => prev.map((club) => (club.id === selectedClub.id ? { ...editFormData } : club)))
    setShowEditModal(false)
    setSelectedClub(null)
    setEditFormData({})
    setLogoPreview(null)
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

        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <div key={club.id} className={styles.clubCard}>
              <div className={styles.clubHeader}>
                <div className={styles.clubLogo} style={{ backgroundColor: club.primaryColor }}>
                  {club.logo ? (
                    <img src={club.logo || "/placeholder.svg"} alt={club.name} />
                  ) : (
                    <div className={styles.logoPlaceholder} style={{ color: club.secondaryColor }}>
                      {club.shortName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.clubInfo}>
                  <h3 className={styles.clubName}>{club.name}</h3>
                  <p className={styles.clubCity}>{club.city}</p>
                </div>
              </div>

              <div className={styles.clubDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Osnovan:</span>
                  <span className={styles.detailValue}>{club.founded}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Stadion:</span>
                  <span className={styles.detailValue}>{club.stadium}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Kapacitet:</span>
                  <span className={styles.detailValue}>{club.capacity.toLocaleString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trener:</span>
                  <span className={styles.detailValue}>{club.coach}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Igrači:</span>
                  <span className={styles.detailValue}>{club.players}</span>
                </div>
              </div>

              <div className={styles.clubActions}>
                <Link href={`/admin/players?club=${club.id}`} className={styles.actionButton}>
                  <FaUsers /> Igrači
                </Link>
                <button className={styles.actionButton} onClick={() => handleEdit(club)}>
                  <FaEdit /> Uredi
                </button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(club)}>
                  <FaTrash /> Obriši
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.editModal}>
              <div className={styles.modalHeader}>
                <h3>Uredi klub</h3>
                <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                <div className={styles.formSection}>
                  <h4>Osnovne informacije</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-name">Puno ime kluba *</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={editFormData.name || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-shortName">Kratko ime *</label>
                      <input
                        type="text"
                        id="edit-shortName"
                        name="shortName"
                        value={editFormData.shortName || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-city">Grad *</label>
                      <input
                        type="text"
                        id="edit-city"
                        name="city"
                        value={editFormData.city || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-founded">Godina osnivanja *</label>
                      <input
                        type="number"
                        id="edit-founded"
                        name="founded"
                        value={editFormData.founded || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Stadion</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-stadium">Naziv stadiona *</label>
                      <input
                        type="text"
                        id="edit-stadium"
                        name="stadium"
                        value={editFormData.stadium || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-capacity">Kapacitet *</label>
                      <input
                        type="number"
                        id="edit-capacity"
                        name="capacity"
                        value={editFormData.capacity || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Upravljanje</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-coach">Trener</label>
                      <input
                        type="text"
                        id="edit-coach"
                        name="coach"
                        value={editFormData.coach || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-president">Predsjednik</label>
                      <input
                        type="text"
                        id="edit-president"
                        name="president"
                        value={editFormData.president || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-website">Web stranica</label>
                    <input
                      type="url"
                      id="edit-website"
                      name="website"
                      value={editFormData.website || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4>Vizuelni identitet</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-primaryColor">Primarna boja *</label>
                      <div className={styles.colorInput}>
                        <input
                          type="color"
                          id="edit-primaryColor"
                          name="primaryColor"
                          value={editFormData.primaryColor || "#FF0000"}
                          onChange={handleEditChange}
                          required
                        />
                        <span className={styles.colorValue}>{editFormData.primaryColor}</span>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-secondaryColor">Sekundarna boja *</label>
                      <div className={styles.colorInput}>
                        <input
                          type="color"
                          id="edit-secondaryColor"
                          name="secondaryColor"
                          value={editFormData.secondaryColor || "#FFFFFF"}
                          onChange={handleEditChange}
                          required
                        />
                        <span className={styles.colorValue}>{editFormData.secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit-logo">Logo kluba</label>
                    <div className={styles.logoUpload}>
                      <input
                        type="file"
                        id="edit-logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className={styles.logoInput}
                      />
                      <label htmlFor="edit-logo" className={styles.logoUploadLabel}>
                        <FaUpload />
                        <span>Promijeni logo</span>
                      </label>
                      {logoPreview && (
                        <div className={styles.logoPreview}>
                          <img src={logoPreview || "/placeholder.svg"} alt="Logo preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-description">Opis kluba</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description || ""}
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
                <p>Da li ste sigurni da želite obrisati klub "{selectedClub?.name}"?</p>
                <p className={styles.warning}>Ova akcija će obrisati i sve igrače koji pripadaju ovom klubu!</p>
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
