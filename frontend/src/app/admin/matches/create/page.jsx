"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import styles from "../../../../styles/AdminMatchForm.module.css"
import { useRouter, useSearchParams } from "next/navigation"

function getDatesInRange(startDate, endDate) {
  const dates = []
  let current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export default function CreateMatch() {
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    round: "",
    stadium: "",
    referee: "",
    season: "2024/25",
  })

  const [clubs, setClubs] = useState([])
  const [rounds, setRounds] = useState([])
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateOptions, setDateOptions] = useState([])
  const [matchesInRound, setMatchesInRound] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const back = searchParams.get('back')

  // Učitavanje podataka iz baze
  useEffect(() => {
    fetchClubs()
    fetchRounds()
  }, [])

  const fetchClubs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/clubs`)
      if (response.ok) {
        const data = await response.json()
        setClubs(data)
      } else {
        console.error('Greška pri učitavanju klubova')
      }
    } catch (error) {
      console.error('Greška pri učitavanju klubova:', error)
    }
  }

  const fetchRounds = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/admin/gameweeks`)
      if (response.ok) {
        const data = await response.json()
        setRounds(data)
        
        // Izvuci jedinstvene sezone iz kola
        const uniqueSeasons = [...new Set(data.map(round => round.season))]
        setSeasons(uniqueSeasons)
        
        // Ako imamo kola, postavimo prvu sezonu kao default
        if (data.length > 0) {
          const firstRound = data[0]
          setFormData(prev => ({
            ...prev,
            season: firstRound.season
          }))
        }
      } else {
        console.error('Greška pri učitavanju kola')
      }
    } catch (error) {
      console.error('Greška pri učitavanju kola:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Ako se promijeni sezona, resetuj odabrano kolo
    if (name === 'season') {
      setFormData(prev => ({
        ...prev,
        round: "",
        date: ""
      }))
      setDateOptions([])
      setMatchesInRound([])
    }

    // Ako se promijeni kolo, generiši datume i dohvati utakmice
    if (name === 'round') {
      const selectedRound = rounds.find(r => r.id.toString() === value)
      if (selectedRound) {
        const dates = getDatesInRange(selectedRound.start_date, selectedRound.end_date)
        setDateOptions(dates)
        setFormData(prev => ({
          ...prev,
          date: dates[0] || "",
          homeTeam: "", // Resetuj odabrane timove
          awayTeam: "", // jer se možda promijenila dostupnost
          stadium: ""   // Resetuj stadion jer se resetuje domaći tim
        }))
        // Dohvati utakmice za to kolo
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/matches/gameweek/${selectedRound.id}`)
        if (res.ok) {
          const data = await res.json()
          setMatchesInRound(data)
        } else {
          setMatchesInRound([])
        }
      } else {
        setDateOptions([])
        setFormData(prev => ({ 
          ...prev, 
          date: "",
          homeTeam: "",
          awayTeam: "",
          stadium: ""
        }))
        setMatchesInRound([])
      }
    }

    // Ako se promijeni domaći tim, automatski popuni stadion i resetuj gostujući tim
    if (name === 'homeTeam') {
      const selectedClub = clubs.find(c => c.id.toString() === value)
      if (selectedClub) {
        setFormData(prev => ({
          ...prev,
          stadium: selectedClub.stadium || "",
          awayTeam: "" // Resetuj gostujući tim jer se možda promijenila dostupnost
        }))
      }
    }

    // Ako se promijeni gostujući tim, resetuj domaći tim ako je postao nedostupan
    if (name === 'awayTeam') {
      const selectedClub = clubs.find(c => c.id.toString() === value)
      if (selectedClub && formData.homeTeam === value) {
        setFormData(prev => ({
          ...prev,
          homeTeam: "" // Resetuj domaći tim jer je isti kao gostujući
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validacija da li su izabrani različiti timovi
    if (formData.homeTeam === formData.awayTeam) {
      alert("Tim ne može igrati protiv sebe!")
      return
    }
    
    // Validacija da li su timovi već zauzeti u tom kolu
    const selectedHomeClub = parseInt(formData.homeTeam)
    const selectedAwayClub = parseInt(formData.awayTeam)
    
    if (usedClubIds.has(selectedHomeClub)) {
      alert("Domaći tim već igra u ovom kolu!")
      return
    }
    
    if (usedClubIds.has(selectedAwayClub)) {
      alert("Gostujući tim već igra u ovom kolu!")
      return
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const requestData = {
        home_club_id: parseInt(formData.homeTeam),
        away_club_id: parseInt(formData.awayTeam),
        gameweek_id: parseInt(formData.round),
        date: formData.date + 'T' + formData.time + ':00',
        stadium: formData.stadium,
        referee: formData.referee || null,
        status: 'scheduled'
      }
      
      console.log('Creating match:', requestData)
      
      const response = await fetch(`${apiUrl}/admin/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        alert("Utakmica je uspješno kreirana!")
        router.push('/admin/rounds')
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
      console.error('Greška pri kreiranju utakmice:', error)
      alert('Greška pri kreiranju utakmice')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Učitavanje podataka...</div>
      </div>
    )
  }

  const usedClubIds = new Set()
  matchesInRound.forEach(match => {
    usedClubIds.add(match.home_club_id)
    usedClubIds.add(match.away_club_id)
  })

  // Funkcija za provjeru da li je klub već izabran u drugom dropdown-u
  const isClubSelectedInOtherTeam = (clubId, currentTeam) => {
    if (currentTeam === 'home') {
      return formData.awayTeam === clubId.toString()
    } else {
      return formData.homeTeam === clubId.toString()
    }
  }

  // Funkcija za provjeru dostupnih timova
  const getAvailableTeams = (currentTeam) => {
    return clubs.filter(club => 
      !usedClubIds.has(club.id) && 
      !isClubSelectedInOtherTeam(club.id, currentTeam)
    )
  }

  const availableHomeTeams = getAvailableTeams('home')
  const availableAwayTeams = getAvailableTeams('away')

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
                  <label htmlFor="season">Sezona *</label>
                  <select id="season" name="season" value={formData.season} onChange={handleChange} required>
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="round">Kolo *</label>
                  <select id="round" name="round" value={formData.round} onChange={handleChange} required>
                    <option value="">Odaberite kolo</option>
                    {rounds
                      .filter(round => round.season === formData.season)
                      .map((round) => (
                        <option key={round.id} value={round.id}>
                          {round.number}. kolo - {round.season}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Timovi</h2>

              {matchesInRound.length > 0 && (
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#92400e'
                }}>
                  <strong>Napomena:</strong> Sljedeći timovi već igraju u ovom kolu:
                  <ul style={{ margin: '8px 0 0 20px' }}>
                    {matchesInRound.map(match => (
                      <li key={match.id}>
                        {match.home_club?.name || `Klub ${match.home_club_id}`} vs {match.away_club?.name || `Klub ${match.away_club_id}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {usedClubIds.size >= clubs.length && (
                <div style={{ 
                  background: '#fee2e2', 
                  border: '1px solid #ef4444', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#991b1b'
                }}>
                  <strong>Upozorenje:</strong> Svi timovi već igraju u ovom kolu. Nije moguće dodati novu utakmicu.
                </div>
              )}

              {usedClubIds.size > 0 && usedClubIds.size < clubs.length && (
                <div style={{ 
                  background: '#dbeafe', 
                  border: '1px solid #3b82f6', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#1e40af'
                }}>
                  <strong>Info:</strong> Dostupno je {clubs.length - usedClubIds.size} od {clubs.length} timova za ovu utakmicu.
                </div>
              )}

              {availableHomeTeams.length === 0 && availableAwayTeams.length === 0 && (
                <div style={{ 
                  background: '#fee2e2', 
                  border: '1px solid #ef4444', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#991b1b'
                }}>
                  <strong>Upozorenje:</strong> Nema dostupnih timova za kreiranje nove utakmice u ovom kolu.
                </div>
              )}

              {formData.homeTeam && formData.awayTeam && (
                <div style={{ 
                  background: '#dcfce7', 
                  border: '1px solid #22c55e', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#166534'
                }}>
                  <strong>Odabrani timovi:</strong> {clubs.find(c => c.id.toString() === formData.homeTeam)?.name} vs {clubs.find(c => c.id.toString() === formData.awayTeam)?.name}
                </div>
              )}

              <div className={styles.teamsSelector}>
                <div className={styles.teamGroup}>
                  <label htmlFor="homeTeam">Domaći tim *</label>
                  <select id="homeTeam" name="homeTeam" value={formData.homeTeam} onChange={handleChange} required>
                    <option value="">Odaberite domaći tim</option>
                    {availableHomeTeams.length === 0 ? (
                      <option value="" disabled>Nema dostupnih timova</option>
                    ) : (
                      availableHomeTeams.map((club) => (
                        <option 
                          key={club.id} 
                          value={club.id} 
                        >
                          {club.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.vsIndicator}>VS</div>

                <div className={styles.teamGroup}>
                  <label htmlFor="awayTeam">Gostujući tim *</label>
                  <select id="awayTeam" name="awayTeam" value={formData.awayTeam} onChange={handleChange} required>
                    <option value="">Odaberite gostujući tim</option>
                    {availableAwayTeams.length === 0 ? (
                      <option value="" disabled>Nema dostupnih timova</option>
                    ) : (
                      availableAwayTeams.map((club) => (
                        <option 
                          key={club.id} 
                          value={club.id} 
                        >
                          {club.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Datum i vrijeme</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Datum *</label>
                  <select id="date" name="date" value={formData.date} onChange={handleChange} required>
                    <option value="">Odaberite datum</option>
                    {dateOptions.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
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
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={availableHomeTeams.length === 0 || availableAwayTeams.length === 0}
              >
                <FaSave /> {(availableHomeTeams.length === 0 || availableAwayTeams.length === 0) ? 'Nema dostupnih timova' : 'Kreiraj utakmicu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
