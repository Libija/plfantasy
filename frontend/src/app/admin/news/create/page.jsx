"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaEye, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminNewsForm.module.css"

export default function CreateNews() {
  const [formData, setFormData] = useState({
    title: "",
    category: "Utakmice",
    relatedClubs: [],
    content: "",
    excerpt: "",
    status: "draft",
    featured: false,
    image: null,
  })

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleClubChange = (e) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      relatedClubs: checked ? [...prev.relatedClubs, value] : prev.relatedClubs.filter((club) => club !== value),
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Saving news:", formData)
    alert("Vijest je uspješno kreirana!")
  }

  const handlePreview = () => {
    alert("Pregled vijesti...")
  }

  return (
    <>
      <Head>
        <title>Nova vijest | Admin</title>
        <meta name="description" content="Kreiranje nove vijesti" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/news" className={styles.backButton}>
            <FaArrowLeft /> Nazad na vijesti
          </Link>
          <div className={styles.headerActions}>
            <button className={styles.previewButton} onClick={handlePreview}>
              <FaEye /> Pregled
            </button>
          </div>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Nova vijest</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Naslov vijesti *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Unesite naslov vijesti"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="category">Kategorija *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                  <option value="draft">Draft</option>
                  <option value="published">Objavljeno</option>
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
                      checked={formData.relatedClubs.includes(club)}
                      onChange={handleClubChange}
                    />
                    <span>{club}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Slika vijesti</label>
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.imageInput}
                />
                <label htmlFor="image" className={styles.imageUploadLabel}>
                  <FaUpload />
                  <span>Odaberite sliku</span>
                </label>
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="excerpt">Kratki opis</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Kratki opis vijesti koji će se prikazati na listi"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content">Sadržaj vijesti *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="15"
                required
                placeholder="Unesite pun sadržaj vijesti"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                Istaknuta vijest
              </label>
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/news" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Sačuvaj vijest
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
