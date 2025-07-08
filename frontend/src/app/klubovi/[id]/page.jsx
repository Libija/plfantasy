"use client"

import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "../../../styles/KluboviDetalji.module.css"

const POSITION_LABELS = {
  GK: "Golmani",
  DEF: "Odbrana",
  MID: "Vezni",
  FWD: "Napad",
};

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"];

export default function KluboviDetalji() {
  const params = useParams()
  const id = params.id
  const [club, setClub] = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState("")

  // Hardkodirani podaci za prikaz (igraci, trofeji, utakmice)
  const hardcoded = {
    fullName: "Fudbalski klub Sarajevo",
    nickname: "Bordo tim",
    website: "www.fcsarajevo.ba",
    address: "Patriotske lige 2, 71000 Sarajevo",
    description: `FK Sarajevo je bosanskohercegovački fudbalski klub iz Sarajeva. Osnovan je 1946. godine i jedan je od najuspješnijih klubova u Bosni i Hercegovini.\n\nKlub je osvojio brojne trofeje, uključujući nekoliko titula prvaka Premijer lige BiH i Kupa BiH. FK Sarajevo je također učestvovao u evropskim takmičenjima, uključujući kvalifikacije za Ligu prvaka i Ligu Evrope.\n\nDomaće utakmice igra na stadionu Koševo, koji je jedan od najvećih stadiona u Bosni i Hercegovini. Tradicionalne boje kluba su bordo i bijela, po čemu su dobili nadimak \"Bordo tim\".`,
    trophies: [
      { name: "Premijer liga BiH", count: 5, years: "2006/07, 2014/15, 2018/19, 2019/20, 2020/21" },
      { name: "Kup BiH", count: 6, years: "1996/97, 1997/98, 2001/02, 2004/05, 2013/14, 2018/19" },
      { name: "Prvenstvo Jugoslavije", count: 2, years: "1966/67, 1984/85" },
      { name: "Kup Jugoslavije", count: 1, years: "1966/67" },
    ],
    squad: [
      { number: 1, name: "Kenan Pirić", position: "Golman", age: 28, nationality: "BiH" },
      { number: 2, name: "Siniša Stevanović", position: "Odbrana", age: 30, nationality: "BiH" },
      { number: 5, name: "Besim Šerbečić", position: "Odbrana", age: 26, nationality: "BiH" },
      { number: 6, name: "Selmir Pidro", position: "Odbrana", age: 25, nationality: "BiH" },
      { number: 3, name: "Nihad Mujakić", position: "Odbrana", age: 27, nationality: "BiH" },
      { number: 8, name: "Amar Rahmanović", position: "Veznjak", age: 26, nationality: "BiH" },
      { number: 10, name: "Krste Velkoski", position: "Veznjak", age: 29, nationality: "Sjeverna Makedonija" },
      { number: 20, name: "Ivan Jukić", position: "Veznjak", age: 24, nationality: "BiH" },
      { number: 7, name: "Benjamin Tatar", position: "Napadač", age: 28, nationality: "BiH" },
      { number: 9, name: "Mersudin Ahmetović", position: "Napadač", age: 27, nationality: "BiH" },
      { number: 11, name: "Matthias Fanimo", position: "Napadač", age: 26, nationality: "Engleska" },
      { number: 12, name: "Belmin Dizdarević", position: "Golman", age: 22, nationality: "BiH" },
      { number: 4, name: "Aleksandar Vojnović", position: "Odbrana", age: 23, nationality: "BiH" },
      { number: 15, name: "Dino Ćorić", position: "Veznjak", age: 24, nationality: "BiH" },
      { number: 17, name: "Almir Bekić", position: "Veznjak", age: 22, nationality: "BiH" },
      { number: 19, name: "Kerim Memija", position: "Odbrana", age: 27, nationality: "BiH" },
      { number: 21, name: "Andrej Đokanović", position: "Napadač", age: 21, nationality: "BiH" },
      { number: 23, name: "Amar Beganović", position: "Veznjak", age: 20, nationality: "BiH" },
    ],
    recentMatches: [
      {
        id: 1,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Zrinjski",
        homeScore: 2,
        awayScore: 1,
        date: "19.05.2025.",
      },
      {
        id: 2,
        competition: "Premijer liga BiH",
        home: "Borac",
        away: "Sarajevo",
        homeScore: 3,
        awayScore: 2,
        date: "12.05.2025.",
      },
      {
        id: 3,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Tuzla City",
        homeScore: 3,
        awayScore: 0,
        date: "05.05.2025.",
      },
      {
        id: 4,
        competition: "Kup BiH",
        home: "Sarajevo",
        away: "Željezničar",
        homeScore: 2,
        awayScore: 1,
        date: "01.05.2025.",
      },
      {
        id: 5,
        competition: "Premijer liga BiH",
        home: "Široki Brijeg",
        away: "Sarajevo",
        homeScore: 0,
        awayScore: 2,
        date: "28.04.2025.",
      },
    ],
    upcomingMatches: [
      {
        id: 6,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Željezničar",
        date: "25.05.2025.",
        time: "20:00",
      },
      {
        id: 7,
        competition: "Premijer liga BiH",
        home: "Velež",
        away: "Sarajevo",
        date: "01.06.2025.",
        time: "18:00",
      },
      {
        id: 8,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Sloboda",
        date: "08.06.2025.",
        time: "20:00",
      },
    ],
  }

  useEffect(() => {
    if (!id) return
    const fetchClub = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/clubs/${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setClub(data)
      } catch {
        setError("Greška pri dohvatu kluba.")
      }
    }
    fetchClub()
  }, [id])

  useEffect(() => {
    if (!id) return
    const fetchPlayers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const res = await fetch(`${apiUrl}/admin/players?club_id=${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setPlayers(data)
      } catch {
        // Ne prikazuj error, samo pusti prazno
      }
    }
    fetchPlayers()
  }, [id])

  if (!id) return null
  if (error) return <div className={styles.container}><p style={{ color: "red" }}>{error}</p></div>
  if (!club) return <div className={styles.container}><p>Učitavanje...</p></div>

  // Grupiraj igrače po pozicijama
  const playersByPosition = POSITION_ORDER.reduce((acc, pos) => {
    acc[pos] = players.filter((p) => p.position === pos)
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>{club.name} | PLKutak</title>
        <meta name="description" content={`Informacije o klubu ${club.name} - Premijer liga BiH`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/klubovi">Klubovi</Link> / <span>{club.name}</span>
        </div>

        <div className={styles.clubHeader} style={{ backgroundColor: club.primary_color || "#1a1a2e" }}>
          <div className={styles.clubLogo}>
            {club.logo_url ? (
              <img src={club.logo_url} alt={club.name} style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover" }} />
            ) : (
              <div className={styles.logoPlaceholder} style={{ backgroundColor: club.primary_color || "#4361ee", color: club.secondary_color || "#fff" }}>
                {club.name.charAt(0)}
              </div>
            )}
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <p className={styles.clubFullName}>{hardcoded.fullName}</p>
            <div className={styles.clubBasicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Osnovan</span>
                <span className={styles.infoValue}>{club.year_founded}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Grad</span>
                <span className={styles.infoValue}>{club.city}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stadion</span>
                <span className={styles.infoValue}>{club.stadium}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kapacitet</span>
                <span className={styles.infoValue}>{club.stadium_capacity?.toLocaleString?.() || club.stadium_capacity}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Trener</span>
                <span className={styles.infoValue}>{club.coach}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.clubContent}>
          <div className={styles.aboutClub}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>O klubu</h2>
            </div>
            <div className={styles.aboutContent}>
              <div className={styles.description}>
                {club.description ? club.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                )) : <p>Nema opisa.</p>}
              </div>
            </div>
          </div>

          <div className={styles.trophies}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>Trofeji</h2>
            </div>
            <div className={styles.trophiesContent}>
              {hardcoded.trophies.map((trophy, index) => (
                <div key={index} className={styles.trophyItem}>
                  <div className={styles.trophyIcon}>🏆</div>
                  <div className={styles.trophyInfo}>
                    <div className={styles.trophyName}>
                      {trophy.name} <span className={styles.trophyCount}>x{trophy.count}</span>
                    </div>
                    <div className={styles.trophyYears}>{trophy.years}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.squad}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>Igrači</h2>
            </div>
            <div className={styles.squadContent}>
              {POSITION_ORDER.map((pos) =>
                playersByPosition[pos] && playersByPosition[pos].length > 0 ? (
                  <div className={styles.positionGroup} key={pos}>
                    <h3>{POSITION_LABELS[pos]}</h3>
                    <div className={styles.playersList}>
                      {playersByPosition[pos].map((player) => (
                        <div className={styles.playerCard} key={player.id}>
                          <div className={styles.playerNumber}>{player.shirt_number || "-"}</div>
                          <div className={styles.playerInfo}>
                            <div className={styles.playerName}>{player.name}</div>
                            <div className={styles.playerDetails}>
                              <span>{player.nationality}</span>
                              
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className={styles.matches}>
            <div className={styles.sectionHeader} style={{ backgroundColor: club.primary_color || "#16213e" }}>
              <h2>Utakmice</h2>
            </div>
            <div className={styles.matchesContent}>
              <div className={styles.matchesGroup}>
                <h3>Nedavne utakmice</h3>
                <div className={styles.matchesList}>
                  {hardcoded.recentMatches.map((match) => (
                    <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                      <div className={styles.matchInfo}>
                        <span className={styles.matchCompetition}>{match.competition}</span>
                        <span className={styles.matchDate}>{match.date}</span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div className={`${styles.matchTeam} ${match.home === club.name ? styles.homeTeam : styles.awayTeam}`}>{match.home}</div>
                        <div className={styles.matchScore}>{match.homeScore} - {match.awayScore}</div>
                        <div className={`${styles.matchTeam} ${match.away === club.name ? styles.homeTeam : styles.awayTeam}`}>{match.away}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className={styles.matchesGroup}>
                <h3>Nadolazeće utakmice</h3>
                <div className={styles.matchesList}>
                  {hardcoded.upcomingMatches.map((match) => (
                    <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                      <div className={styles.matchInfo}>
                        <span className={styles.matchCompetition}>{match.competition}</span>
                        <span className={styles.matchDate}>{match.date} | {match.time}</span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div className={`${styles.matchTeam} ${match.home === club.name ? styles.homeTeam : styles.awayTeam}`}>{match.home}</div>
                        <div className={styles.matchVs}>VS</div>
                        <div className={`${styles.matchTeam} ${match.away === club.name ? styles.homeTeam : styles.awayTeam}`}>{match.away}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

