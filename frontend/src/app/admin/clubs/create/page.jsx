"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminClubForm.module.css"
import { useRouter } from "next/navigation"

export default function CreateClub() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    year_founded: "",
    stadium: "",
    stadium_capacity: "",
    coach: "",
    description: "",
    logo_url: "",
    primary_color: "#1a237e",
    secondary_color: "#ffffff",
  })

  const [logoPreview, setLogoPreview] = useState(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setFormData((prev) => ({ ...prev, logo_url: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        year_founded: Number(formData.year_founded),
        stadium: formData.stadium,
        stadium_capacity: Number(formData.stadium_capacity),
        coach: formData.coach,
        description: formData.description,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/clubs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Greška pri kreiranju kluba.")
        setLoading(false)
        return
      }
      setMessage("Klub je uspješno kreiran!")
      setTimeout(() => {
        router.push("/admin/clubs")
      }, 1200)
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Novi klub | Admin</title>
        <meta name="description" content="Kreiranje novog kluba" />
      </Head>

      <div className={styles.container} style={{ background: "#101c36", minHeight: "100vh" }}>
        <div className={styles.header}>
          <Link href="/admin/clubs" className={styles.backButton}>
            <FaArrowLeft /> Nazad na klubove
          </Link>
        </div>

        <div className={styles.formContainer} style={{ background: "#182952", color: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #0008" }}>
          <h1 className={styles.title}>Novi klub</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Osnovne informacije</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Puno ime kluba *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="npr. FK Sarajevo"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="city">Grad *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="npr. Sarajevo"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="year_founded">Godina osnivanja *</label>
                  <input
                    type="number"
                    id="year_founded"
                    name="year_founded"
                    value={formData.year_founded}
                    onChange={handleChange}
                    required
                    placeholder="npr. 1946"
                    min="1800"
                    max="2025"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="coach">Trener</label>
                  <input
                    type="text"
                    id="coach"
                    name="coach"
                    value={formData.coach}
                    onChange={handleChange}
                    placeholder="npr. Husref Musemić"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Stadion</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="stadium">Naziv stadiona *</label>
                  <input
                    type="text"
                    id="stadium"
                    name="stadium"
                    value={formData.stadium}
                    onChange={handleChange}
                    required
                    placeholder="npr. Koševo"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="stadium_capacity">Kapacitet *</label>
                  <input
                    type="number"
                    id="stadium_capacity"
                    name="stadium_capacity"
                    value={formData.stadium_capacity}
                    onChange={handleChange}
                    required
                    placeholder="npr. 34000"
                    min="1000"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Opis i boje</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Opis</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Unesite opis kluba"
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="logo_url">Logo (URL ili upload)</label>
                  <input
                    type="text"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 120, marginTop: 8 }} />
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="primary_color">Primarna boja</label>
                  <input
                    type="color"
                    id="primary_color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="secondary_color">Sekundarna boja</label>
                  <input
                    type="color"
                    id="secondary_color"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    style={{ background: "#222b44", color: "#fff" }}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? "Kreiranje..." : <FaSave />} Sačuvaj klub
            </button>
            {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
          </form>
        </div>
      </div>
    </>
  )
}
