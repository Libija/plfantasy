"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { FaNewspaper, FaUsers, FaUserTie, FaFutbol, FaChartBar, FaTrophy } from "react-icons/fa"
import styles from "../../styles/AdminDashboard.module.css"

export default function AdminDashboard() {
  const [stats] = useState({
    news: { total: 45, published: 38, drafts: 7 },
    clubs: { total: 12, active: 12 },
    players: { total: 284, active: 268, injured: 16 },
    matches: { total: 180, completed: 165, upcoming: 15 },
  })

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
              <h3 className={styles.statNumber}>{stats.news.total}</h3>
              <p className={styles.statLabel}>Ukupno vijesti</p>
              <div className={styles.statDetails}>
                <span>{stats.news.published} objavljeno</span>
                <span>{stats.news.drafts} draft</span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUsers />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.clubs.total}</h3>
              <p className={styles.statLabel}>Klubovi</p>
              <div className={styles.statDetails}>
                <span>{stats.clubs.active} aktivno</span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaUserTie />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.players.total}</h3>
              <p className={styles.statLabel}>Igrači</p>
              <div className={styles.statDetails}>
                <span>{stats.players.active} aktivno</span>
                <span>{stats.players.injured} povrijeđeno</span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaFutbol />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.matches.total}</h3>
              <p className={styles.statLabel}>Utakmice</p>
              <div className={styles.statDetails}>
                <span>{stats.matches.completed} završeno</span>
                <span>{stats.matches.upcoming} predstoji</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Brze akcije</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/news/create" className={styles.actionCard}>
              <FaNewspaper />
              <span>Nova vijest</span>
            </Link>
            <Link href="/admin/clubs/create" className={styles.actionCard}>
              <FaUsers />
              <span>Novi klub</span>
            </Link>
            <Link href="/admin/players/create" className={styles.actionCard}>
              <FaUserTie />
              <span>Novi igrač</span>
            </Link>
            <Link href="/admin/matches/create" className={styles.actionCard}>
              <FaFutbol />
              <span>Nova utakmica</span>
            </Link>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Upravljanje sadržajem</h2>
              <div className={styles.menuGrid}>
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

                <Link href="/admin/matches" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaFutbol />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Utakmice</h3>
                    <p>Rezultati i događaji utakmica</p>
                  </div>
                </Link>

                <Link href="/admin/statistics" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaChartBar />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Statistike</h3>
                    <p>Pregled svih statistika lige</p>
                  </div>
                </Link>

                <Link href="/admin/fantasy" className={styles.menuCard}>
                  <div className={styles.menuIcon}>
                    <FaTrophy />
                  </div>
                  <div className={styles.menuContent}>
                    <h3>Fantasy</h3>
                    <p>Upravljanje fantasy sistemom</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Nedavne aktivnosti</h2>
              <div className={styles.activityList}>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.type === "news" && <FaNewspaper />}
                      {activity.type === "match" && <FaFutbol />}
                      {activity.type === "player" && <FaUserTie />}
                      {activity.type === "club" && <FaUsers />}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityAction}>{activity.action}</p>
                      <p className={styles.activityItem}>{activity.item}</p>
                      <span className={styles.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
