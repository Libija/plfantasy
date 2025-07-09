"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave, FaCalendarAlt } from "react-icons/fa"
import styles from "../../../../styles/AdminRoundForm.module.css"

export default function CreateRound() {
  const [formData, setFormData] = useState({
    number: "",
    season: "2024/25",
    startDate: "",
    endDate: "",
    status: "Zakazano",
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Ukloni grešku kada korisnik počne da kuca
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.number) newErrors.number = "Broj kola je obavezan"
    if (!formData.startDate) newErrors.startDate = "Datum početka je obavezan"
    if (!formData.endDate) newErrors.endDate = "Datum završetka je obavezan"

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "Datum završetka mora biti nakon datuma početka"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      try {
        const requestData = {
          number: parseInt(formData.number),
          season: formData.season,
          start_date: formData.startDate + 'T00:00:00',
          end_date: formData.endDate + 'T00:00:00',
          status: formData.status === 'Zakazano' ? 'scheduled' : 
                 formData.status === 'U toku' ? 'in_progress' : 'completed'
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        console.log('Sending data:', requestData)
        
        const response = await fetch(`${apiUrl}/admin/gameweeks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })

        if (response.ok) {
          alert("Kolo je uspješno kreirano!")
          window.location.href = '/admin/rounds'
        } else {
          const errorData = await response.json()
          console.error('Server error:', errorData)
          
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n')
            alert(`Greška validacije:\n${errorMessages}`)
          } else {
            alert(`Greška: ${errorData.detail}`)
          }
        }
      } catch (error) {
        console.error('Greška pri kreiranju kola:', error)
        alert('Greška pri kreiranju kola')
      }
    }
  }

  return (
    <>
      <Head>
        <title>Kreiranje kola | Admin Panel</title>
        <meta name="description" content="Kreiranje novog kola" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/rounds" className={styles.backButton}>
            <FaArrowLeft />
            <span>Nazad na kola</span>
          </Link>
          <h1 className={styles.title}>Kreiranje novog kola</h1>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FaCalendarAlt /> Osnovne informacije
              </h2>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="number" className={styles.label}>
                    Broj kola *
                  </label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    min="1"
                    max="33"
                    placeholder="npr. 16"
                    className={`${styles.input} ${errors.number ? styles.error : ""}`}
                  />
                  {errors.number && <span className={styles.errorText}>{errors.number}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="season" className={styles.label}>
                    Sezona
                  </label>
                  <select
                    id="season"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="2024/25">2024/25</option>
                    <option value="2023/24">2023/24</option>
                    <option value="2025/26">2025/26</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="startDate" className={styles.label}>
                    Datum početka *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.startDate ? styles.error : ""}`}
                  />
                  {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endDate" className={styles.label}>
                    Datum završetka *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.endDate ? styles.error : ""}`}
                  />
                  {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.label}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Zakazano">Zakazano</option>
                    <option value="U toku">U toku</option>
                    <option value="Završeno">Završeno</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formInfo}>
              <p>
                <strong>Napomena:</strong> Nakon kreiranja kola, možete dodati utakmice koje pripadaju ovom kolu.
              </p>
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/rounds" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.submitButton}>
                <FaSave /> Kreiraj kolo
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
