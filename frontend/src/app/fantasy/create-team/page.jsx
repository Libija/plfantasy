"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { FaTrophy, FaUsers, FaHeart } from "react-icons/fa"
import styles from "../../../styles/CreateFantasyTeam.module.css"
import useAuth from "../../../hooks/use-auth"

export default function CreateFantasyTeam() {
  const [teamName, setTeamName] = useState("")
  const [favoriteClub, setFavoriteClub] = useState("")
  const [clubs, setClubs] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, isLoggedIn, loading: authLoading } = useAuth()

  const checkExistingTeam = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
      
      if (res.ok) {
        const teams = await res.json()
        if (teams.length > 0) {
          // Korisnik već ima tim, preusmjeri na dashboard
          router.push("/fantasy")
          return
        }
      }
    } catch (err) {
      console.error("Greška pri provjeri postojećeg tima:", err)
    }
  }

  const fetchClubs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/admin/clubs`)
      if (!res.ok) throw new Error("Greška pri dohvatu klubova")
      const data = await res.json()
      setClubs(data)
    } catch (err) {
      setError("Greška pri dohvatu klubova!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Ako se još učitava auth, ne radi ništa
    if (authLoading) {
      return
    }

    // Ako korisnik nije ulogovan, preusmjeri na login
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // Prvo provjeri da li korisnik već ima tim
    checkExistingTeam()
    // Zatim dohvati klubove
    fetchClubs()
  }, [authLoading, isLoggedIn, user, router])

  // Dodaj event listener za osvježavanje kada se kreira tim
  useEffect(() => {
    const onFantasyTeamChanged = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/fantasy/teams/user/${user.id}`)
        
        if (res.ok) {
          const teams = await res.json()
          if (teams.length > 0) {
            // Korisnik već ima tim, preusmjeri na dashboard
            router.push("/fantasy")
            return
          }
        }
      } catch (err) {
        console.error("Greška pri provjeri postojećeg tima:", err)
      }
    }

    window.addEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    
    return () => {
      window.removeEventListener("fantasyTeamChanged", onFantasyTeamChanged)
    }
  }, [user, router])

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
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const teamData = {
        user_id: user.id,
        name: teamName.trim(),
        favorite_club_id: favoriteClub === "fan_of_league" ? null : Number(favoriteClub),
      }

      const res = await fetch(`${apiUrl}/fantasy/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Greška pri kreiranju tima")
      }

      const createdTeam = await res.json()
      console.log("Kreiran tim:", createdTeam)

      // Emituj event da je fantasy tim kreiran
      window.dispatchEvent(new Event("fantasyTeamChanged"))

      // Preusmjeri na fantasy dashboard
      router.push("/fantasy")
    } catch (error) {
      console.error("Greška pri kreiranju tima:", error)
      setError(error.message || "Došlo je do greške. Molimo pokušajte ponovo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.createTeamCard}>
          <p>Učitavanje...</p>
        </div>
      </div>
    )
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

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

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
