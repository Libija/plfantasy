"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import styles from "../../../../styles/AdminPlayerForm.module.css"

export default function CreatePlayer() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    club_id: "",
    position: "",
    number: "",
    fantasyPrice: "",
    nationality: "BIH",
  })
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchClubs = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/clubs`)
      const data = await res.json()
      setClubs(data)
    }
    fetchClubs()
  }, [])

  const nationalities = [
    { value: "BIH", label: "Bosna i Hercegovina", flag: "🇧🇦" },
    { value: "HRV", label: "Hrvatska", flag: "🇭🇷" },
    { value: "SLO", label: "Slovenija", flag: "🇸🇮" },
    { value: "SRB", label: "Srbija", flag: "🇷🇸" },
    { value: "MNE", label: "Crna Gora", flag: "🇲🇪" },
    { value: "MKD", label: "Makedonija", flag: "🇲🇰" },
    { value: "OTHER", label: "Rest of the World", flag: "🌍" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const payload = {
      name: formData.firstName + " " + formData.lastName,
      club_id: Number(formData.club_id),
      position: formData.position,
      price: Number(formData.fantasyPrice),
    }
    if (formData.number) payload.shirt_number = Number(formData.number)
    payload.nationality = formData.nationality;
    console.log("[DEBUG] Player payload:", payload)
    try {
      const res = await fetch(`${apiUrl}/admin/players/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Greška pri kreiranju igrača.")
      router.push("/admin/players?created=1")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Novi igrač | Admin</title>
        <meta name="description" content="Kreiranje novog igrača" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/players" className={styles.backButton}>
            <FaArrowLeft /> Nazad na igrače
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Novi igrač</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Osnovne informacije</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">Ime *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="npr. Kenan"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Prezime *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="npr. Pirić"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="club">Klub *</label>
                  <select id="club" name="club_id" value={formData.club_id} onChange={handleChange} required>
                    <option value="">Odaberite klub</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="position">Pozicija *</label>
                  <select id="position" name="position" value={formData.position} onChange={handleChange} required>
                    <option value="">Odaberite poziciju</option>
                    <option value="GK">Golman</option>
                    <option value="DEF">Odbrana</option>
                    <option value="MID">Veznjak</option>
                    <option value="FWD">Napadač</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="number">Broj dresa</label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="npr. 10"
                    min="1"
                    max="99"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fantasyPrice">Fantasy cijena (M) *</label>
                  <input
                    type="number"
                    id="fantasyPrice"
                    name="fantasyPrice"
                    value={formData.fantasyPrice}
                    onChange={handleChange}
                    required
                    placeholder="npr. 8.5"
                    min="4"
                    max="15"
                    step="0.5"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nationality">Nacionalnost *</label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                >
                  {nationalities.map((nat) => (
                    <option key={nat.value} value={nat.value}>
                      {nat.flag} {nat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/players" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Sačuvaj igrača
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
