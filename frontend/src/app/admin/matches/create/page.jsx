"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import styles from "../../../../styles/AdminMatchForm.module.css"

export default function CreateMatch() {
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    round: "",
    stadium: "",
    referee: "",
    competition: "Premijer Liga BiH",
    season: "2024/25",
  })

  const clubs = [
    "FK Sarajevo",
    "FK Borac",
    "HŠK Zrinjski",
    "FK Željezničar",
    "FK Tuzla City",
    "NK Široki Brijeg",
    "FK Velež",
    "FK Sloboda",
    "FK Radnik",
    "NK Čelik",
    "FK Igman",
    "FK Zvijezda 09",
  ]

  const rounds = Array.from({ length: 33 }, (_, i) => i + 1)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.homeTeam === formData.awayTeam) {
      alert("Tim ne može igrati protiv sebe!")
      return
    }
    console.log("Creating match:", formData)
    alert("Utakmica je uspješno kreirana!")
  }

  return (
    <>
      <Head>
        <title>Nova utakmica | Admin</title>
        <meta name="description" content="Kreiranje nove utakmice" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/matches" className={styles.backButton}>
            <FaArrowLeft /> Nazad na utakmice
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Nova utakmica</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Osnovne informacije</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="competition">Takmičenje *</label>
                  <select
                    id="competition"
                    name="competition"
                    value={formData.competition}
                    onChange={handleChange}
                    required
                  >
                    <option value="Premijer Liga BiH">Premijer Liga BiH</option>
                    <option value="Kup BiH">Kup BiH</option>
                    <option value="Prijateljska">Prijateljska utakmica</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="season">Sezona *</label>
                  <select id="season" name="season" value={formData.season} onChange={handleChange} required>
                    <option value="2024/25">2024/25</option>
                    <option value="2025/26">2025/26</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="round">Kolo *</label>
                <select id="round" name="round" value={formData.round} onChange={handleChange} required>
                  <option value="">Odaberite kolo</option>
                  {rounds.map((round) => (
                    <option key={round} value={round}>
                      {round}. kolo
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Timovi</h2>

              <div className={styles.teamsSelector}>
                <div className={styles.teamGroup}>
                  <label htmlFor="homeTeam">Domaći tim *</label>
                  <select id="homeTeam" name="homeTeam" value={formData.homeTeam} onChange={handleChange} required>
                    <option value="">Odaberite domaći tim</option>
                    {clubs.map((club) => (
                      <option key={club} value={club} disabled={club === formData.awayTeam}>
                        {club}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.vsIndicator}>VS</div>

                <div className={styles.teamGroup}>
                  <label htmlFor="awayTeam">Gostujući tim *</label>
                  <select id="awayTeam" name="awayTeam" value={formData.awayTeam} onChange={handleChange} required>
                    <option value="">Odaberite gostujući tim</option>
                    {clubs.map((club) => (
                      <option key={club} value={club} disabled={club === formData.homeTeam}>
                        {club}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Datum i vrijeme</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Datum *</label>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time">Vrijeme *</label>
                  <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Lokacija</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="stadium">Stadion *</label>
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
                  <label htmlFor="referee">Sudija</label>
                  <input
                    type="text"
                    id="referee"
                    name="referee"
                    value={formData.referee}
                    onChange={handleChange}
                    placeholder="Ime i prezime sudije"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <Link href="/admin/matches" className={styles.cancelButton}>
                Otkaži
              </Link>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Kreiraj utakmicu
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
