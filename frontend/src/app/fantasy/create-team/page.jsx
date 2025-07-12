"use client"

import { useState } from "react"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { FaTrophy, FaUsers, FaHeart } from "react-icons/fa"
import styles from "../../../styles/CreateFantasyTeam.module.css"

export default function CreateFantasyTeam() {
  const [teamName, setTeamName] = useState("")
  const [favoriteClub, setFavoriteClub] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Simulirani podaci za klubove
  const clubs = [
    { id: 1, name: "FK Sarajevo", logo: "/clubs/sarajevo.png" },
    { id: 2, name: "FK Željezničar", logo: "/clubs/zeljeznicar.png" },
    { id: 3, name: "FK Borac Banja Luka", logo: "/clubs/borac.png" },
    { id: 4, name: "HŠK Zrinjski", logo: "/clubs/zrinjski.png" },
    { id: 5, name: "FK Tuzla City", logo: "/clubs/tuzla.png" },
    { id: 6, name: "NK Široki Brijeg", logo: "/clubs/siroki.png" },
    { id: 7, name: "FK Sloboda Tuzla", logo: "/clubs/sloboda.png" },
    { id: 8, name: "FK Velež", logo: "/clubs/velez.png" },
    { id: 9, name: "NK Čelik", logo: "/clubs/celik.png" },
    { id: 10, name: "FK Igman Konjic", logo: "/clubs/igman.png" },
    { id: 11, name: "FK Radnik Bijeljina", logo: "/clubs/radnik.png" },
    { id: 12, name: "FK Leotar", logo: "/clubs/leotar.png" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!teamName.trim()) {
      alert("Molimo unesite naziv tima!")
      return
    }

    if (!favoriteClub) {
      alert("Molimo odaberite omiljeni klub!")
      return
    }

    setIsSubmitting(true)

    try {
      // Ovdje bi se implementirala logika za kreiranje tima
      const teamData = {
        name: teamName.trim(),
        favorite_club: favoriteClub,
        created_at: new Date().toISOString(),
      }

      // Simulacija API poziva
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Kreiran tim:", teamData)

      // Preusmjeri na draft stranicu
      router.push("/draft")
    } catch (error) {
      console.error("Greška pri kreiranju tima:", error)
      alert("Došlo je do greške. Molimo pokušajte ponovo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Kreiraj Fantasy Tim | PLKutak</title>
        <meta name="description" content="Kreiraj svoj fantasy tim za Premijer ligu BiH" />
      </Head>

      <div className={styles.container}>
        <div className={styles.createTeamCard}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <FaTrophy className={styles.headerIcon} />
            </div>
            <h1 className={styles.title}>Dobrodošli u Fantasy Ligu!</h1>
            <p className={styles.subtitle}>
              Kreirajte svoj tim i takmičite se sa prijateljima u najuzbudljivijoj fantasy ligi BiH
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="teamName" className={styles.label}>
                <FaUsers className={styles.labelIcon} />
                Naziv vašeg tima
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="npr. Bordo Mašina, Zmajevi BiH, Plavi Anđeli..."
                className={styles.input}
                maxLength={30}
                required
              />
              <div className={styles.charCount}>{teamName.length}/30 karaktera</div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="favoriteClub" className={styles.label}>
                <FaHeart className={styles.labelIcon} />
                Omiljeni klub
              </label>
              <select
                id="favoriteClub"
                value={favoriteClub}
                onChange={(e) => setFavoriteClub(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Odaberite klub...</option>
                <option value="fan_of_league">🏆 Fan sam cijele lige</option>
                <optgroup label="Klubovi Premijer lige BiH">
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className={styles.selectHint}>
                Ovo neće uticati na vaš tim, već je samo za statistike i personalizaciju
              </div>
            </div>

            <div className={styles.infoBox}>
              <h3>Šta sljedeće?</h3>
              <ul>
                <li>Odabrat ćete 15 igrača za svoj tim</li>
                <li>Imate budžet od 100 miliona €</li>
                <li>Možete imati maksimalno 3 igrača iz istog kluba</li>
                <li>Svake sedmice možete napraviti transfere</li>
              </ul>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  Kreiram tim...
                </>
              ) : (
                <>
                  <FaTrophy />
                  Kreiraj tim i počni
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Već imate tim? <a href="/fantasy">Idite na dashboard</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
