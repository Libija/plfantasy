"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaNewspaper, FaUsers, FaUserTie, FaFutbol, FaChartBar, FaTrophy, FaExchangeAlt, FaPoll } from "react-icons/fa"
import styles from "../../styles/AdminDashboard.module.css"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    news: { total: 0 },
    clubs: { total: 0 },
    players: { total: 0 },
    matches: { total: 0 },
    users: { total: 0 },
  })

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const fetchStats = async () => {
      try {
        const [newsRes, clubsRes, playersRes, matchesRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/admin/news/`),
          fetch(`${apiUrl}/admin/clubs/`),
          fetch(`${apiUrl}/admin/players/`),
          fetch(`${apiUrl}/admin/matches/`),
          fetch(`${apiUrl}/admin/users/`),
        ])
        const [news, clubs, players, matches, users] = await Promise.all([
          newsRes.ok ? newsRes.json() : [],
          clubsRes.ok ? clubsRes.json() : [],
          playersRes.ok ? playersRes.json() : [],
          matchesRes.ok ? matchesRes.json() : [],
          usersRes.ok ? usersRes.json() : [],
        ])
        setStats({
          news: { total: news.length },
          clubs: { total: clubs.length },
          players: { total: players.length },
          matches: { total: matches.length },
          users: { total: users.length },
        })
      } catch (err) {
        // fallback: ne prikazuj ništa
      }
    }
    fetchStats()
  }, [])

  const [recentActivity] = useState([
    { id: 1, type: "news", action: "Kreirana nova vijest", item: "Sarajevo pobjedilo Zrinjski", time: "prije 2 sata" },
    { id: 2, type: "match", action: "Unesen rezultat", item: "Željezničar 3-0 Velež", time: "prije 4 sata" },
    { id: 3, type: "player", action: "Dodан novi igrač", item: "Marko Marković - Borac", time: "prije 1 dan" },
    { id: 4, type: "club", action: "Ažuriran klub", item: "FK Tuzla City", time: "prije 2 dana" },
  ])

  return (
    <>
      <Head>
        <title>Admin Dashboard | PLKutak</title>
        <meta name="description" content="Administratorski panel za PLKutak" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Dobrodošli u administratorski panel PLKutak</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaNewspaper />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.news?.total || 0}</h3>
              <p className={styles.statLabel}>Ukupno vijesti</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUsers />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.clubs?.total || 0}</h3>
              <p className={styles.statLabel}>Klubovi</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUserTie />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.players?.total || 0}</h3>
              <p className={styles.statLabel}>Igrači</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaFutbol />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.matches?.total || 0}</h3>
              <p className={styles.statLabel}>Utakmice</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUsers />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.users?.total || 0}</h3>
              <p className={styles.statLabel}>Korisnici</p>
            </div>
          </div>
        </div>

        

        {/* Centrirani blok za upravljanje sadržajem */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 32 }}>
          <div style={{ maxWidth: 1050, width: '100%' }}>
            <div className={styles.section} style={{ margin: 0 }}>
              <h2 className={styles.sectionTitle}>Upravljanje sadržajem</h2>
              <div className={styles.menuGrid} style={{ justifyContent: 'center', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                <Link href="/admin/news" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaNewspaper />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Vijesti</h3>
                    <p>Upravljanje vijestima i člancima</p>
                  </div>
                </Link>

                <Link href="/admin/clubs" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaUsers />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Klubovi</h3>
                    <p>Upravljanje klubovima lige</p>
                  </div>
                </Link>

                <Link href="/admin/players" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaUserTie />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Igrači</h3>
                    <p>Upravljanje igračima i transferima</p>
                  </div>
                </Link>

                <Link href="/admin/rounds" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaChartBar />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Kola</h3>
                    <p>Upravljanje kolima i rasporedom</p>
                  </div>
                </Link>

                <Link href="/admin/transfer-windows" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaExchangeAlt />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Transfer Windows</h3>
                    <p>Upravljanje transfer window-ima</p>
                  </div>
                </Link>

                <Link href="/admin/polls" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaPoll />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Ankete</h3>
                    <p>Upravljanje anketama i rezultatima</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
