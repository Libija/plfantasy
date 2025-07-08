"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaEye, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminNewsForm.module.css"
import { useRouter } from "next/navigation"

export default function CreateNews() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    club_id: "",
    content: "",
    image_url: "",
  })
  const [error, setError] = useState("")
  const [clubs, setClubs] = useState([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    { value: "transfer", label: "Transferi" },
    { value: "injury", label: "Povrede" },
    { value: "preview", label: "Najave" },
    { value: "result", label: "Rezultati" },
    { value: "general", label: "Ostalo" },
  ]

  useEffect(() => {
    const fetchClubs = async () => {
      setLoadingClubs(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClubs(data)
      } catch {
        setError("Greška pri dohvatu klubova!")
      } finally {
        setLoadingClubs(false)
      }
    }
    fetchClubs()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setFormData((prev) => ({ ...prev, image_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const payload = {
      title: formData.title,
      content: formData.content,
      image_url: formData.image_url || null,
      category: formData.category,
      club_id: formData.club_id ? Number(formData.club_id) : null,
      date_posted: new Date().toISOString(),
    }
    try {
      const res = await fetch(`${apiUrl}/admin/news/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Greška pri kreiranju vijesti")
      router.push("/admin/news")
    } catch (err) {
      setError("Greška pri kreiranju vijesti!")
    }
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
        </div>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Nova vijest</h1>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
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
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="club_id">Klub (opcionalno)</label>
                {loadingClubs ? (
                  <div>Učitavanje klubova...</div>
                ) : (
                  <select id="club_id" name="club_id" value={formData.club_id} onChange={handleChange}>
                    <option value="">Bez kluba</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                )}
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
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content">Sadržaj vijesti *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="10"
                required
                placeholder="Unesite pun sadržaj vijesti"
              />
            </div>
            <div className={styles.formGroup}>
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
