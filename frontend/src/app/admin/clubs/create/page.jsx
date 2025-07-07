"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaUpload } from "react-icons/fa"
import styles from "../../../../styles/AdminClubForm.module.css"

export default function CreateClub() {
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    city: "",
    founded: "",
    stadium: "",
    capacity: "",
    coach: "",
    president: "",
    website: "",
    primaryColor: "#FF0000",
    secondaryColor: "#FFFFFF",
    logo: null,
    description: "",
  })

  const [logoPreview, setLogoPreview] = useState(null)

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
      setFormData((prev) => ({ ...prev, logo: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Saving club:", formData)
    alert("Klub je uspješno kreiran!")
  }

  return (
    <>
      <Head>
        <title>Novi klub | Admin</title>
        <meta name="description" content="Kreiranje novog kluba" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/clubs" className={styles.backButton}>
            <FaArrowLeft /> Nazad na klubove
          </Link>
        </div>

        <div className={styles.formContainer}>
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="shortName">Kratko ime *</label>
                  <input
                    type="text"
                    id="shortName"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    required
                    placeholder="npr. Sarajevo"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="founded">Godina osnivanja *</label>
                  <input
                    type="number"
                    id="founded"
                    name="founded"
                    value={formData.founded}
                    onChange={handleChange}
                    required
                    placeholder="npr. 1946"
                    min="1800"
                    max="2025"
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="capacity">Kapacitet *</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    placeholder="npr. 34000"
                    min="1000"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Upravljanje</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="coach">Trener</label>
                  <input
                    type="text"
                    id="coach"
                    name="coach"
                    value={formData.coach}
                    onChange={handleChange}
                    placeholder="npr. Husref Musemić"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="president">Predsjednik</label>
                  <input
                    type="text"
                    id="president"
                    name="president"
                    value={formData.president}
                    onChange={handleChange}
                    placeholder="npr. Emir Hadžihafizbegović"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Web stranica</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.fksarajevo.ba"
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Vizuelni identitet</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="primaryColor">Primarna boja *</label>
                  <div className={styles.colorInput}>
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.colorValue}>{formData.primaryColor}</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="secondaryColor">Sekundarna boja *</label>
                  <div className={styles.colorInput}>
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.colorValue}>{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="logo">Logo kluba</label>
                <div className={styles.logoUpload}>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className={styles.logoInput}
                  />
                  <label htmlFor="logo" className={styles.logoUploadLabel}>
                    <FaUpload />
                    <span>Odaberite logo</span>
                  </label>
                  {logoPreview && (
                    <div className={styles.logoPreview}>
                      <img src={logoPreview || "/placeholder.svg"} alt="Logo preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label htmlFor="description">Opis kluba</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Kratki opis historije i značaja kluba"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/clubs" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Sačuvaj klub
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
