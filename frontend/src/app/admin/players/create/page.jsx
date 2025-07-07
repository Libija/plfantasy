"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminPlayerForm.module.css"

export default function CreatePlayer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    club: "",
    position: "",
    number: "",
    age: "",
    nationality: "BiH",
    height: "",
    weight: "",
    fantasyPrice: "",
    marketValue: "",
    contractUntil: "",
    photo: null,
    biography: "",
  })

  const [photoPreview, setPhotoPreview] = useState(null)

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

  const positions = [
    { value: "GK", label: "Golman" },
    { value: "DF", label: "Odbrana" },
    { value: "MF", label: "Veznjak" },
    { value: "FW", label: "Napadač" },
  ]

  const nationalities = ["BiH", "Srbija", "Hrvatska", "Crna Gora", "Slovenija", "Makedonija", "Ostalo"]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Saving player:", formData)
    alert("Igrač je uspješno kreiran!")
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
                  <select id="club" name="club" value={formData.club} onChange={handleChange} required>
                    <option value="">Odaberite klub</option>
                    {clubs.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="position">Pozicija *</label>
                  <select id="position" name="position" value={formData.position} onChange={handleChange} required>
                    <option value="">Odaberite poziciju</option>
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
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
                  <label htmlFor="age">Godine *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    placeholder="npr. 25"
                    min="16"
                    max="45"
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
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Fizičke karakteristike</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="height">Visina (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="npr. 185"
                    min="150"
                    max="220"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="weight">Težina (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="npr. 75"
                    min="50"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Fantasy i tržišna vrijednost</h2>

              <div className={styles.formRow}>
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

                <div className={styles.formGroup}>
                  <label htmlFor="marketValue">Tržišna vrijednost (€)</label>
                  <input
                    type="number"
                    id="marketValue"
                    name="marketValue"
                    value={formData.marketValue}
                    onChange={handleChange}
                    placeholder="npr. 500000"
                    min="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contractUntil">Ugovor do</label>
                <input
                  type="date"
                  id="contractUntil"
                  name="contractUntil"
                  value={formData.contractUntil}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Fotografija</h2>

              <div className={styles.formGroup}>
                <label htmlFor="photo">Fotografija igrača</label>
                <div className={styles.photoUpload}>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={styles.photoInput}
                  />
                  <label htmlFor="photo" className={styles.photoUploadLabel}>
                    <FaUpload />
                    <span>Odaberite fotografiju</span>
                  </label>
                  {photoPreview && (
                    <div className={styles.photoPreview}>
                      <img src={photoPreview || "/placeholder.svg"} alt="Photo preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label htmlFor="biography">Biografija</label>
                <textarea
                  id="biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Kratka biografija i karijera igrača"
                />
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
