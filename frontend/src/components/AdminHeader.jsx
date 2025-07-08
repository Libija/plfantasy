"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  FaBars,
  FaTimes,
  FaNewspaper,
  FaUsers,
  FaUserTie,
  FaFutbol,
  FaChartBar,
  FaTrophy,
  FaSignOutAlt,
  FaHome,
  FaBell,
  FaCog,
  FaUserShield,
} from "react-icons/fa"
import styles from "../styles/AdminHeader.module.css"

export default function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(2)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (showNotifications === false) {
      setNotificationCount(0)
    }
  }

  const handleLogout = () => {
    // Implementacija logout logike
    console.log("Admin logout clicked")
    router.push("/")
  }

  const notifications = [
    {
      id: 1,
      type: "system",
      message: "Sistem je uspješno ažuriran",
      time: "prije 15 minuta",
    },
    {
      id: 2,
      type: "alert",
      message: "Potrebno je odobriti 3 nova komentara",
      time: "prije 1 sat",
    },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/admin" className={styles.logo}>
            <Image src="/logo.png" alt="PLKutak Logo" width={40} height={40} priority />
            <span className={styles.logoText}>PLKutak</span>
            <span className={styles.adminBadge}>Admin</span>
          </Link>
        </div>

        <div className={styles.quickLinks}>
          <Link href="/admin/news/create" className={styles.quickLink}>
            <FaNewspaper />
            <span>Nova vijest</span>
          </Link>
          <Link href="/admin/clubs/create" className={styles.quickLink}>
            <FaUsers />
            <span>Novi klub</span>
          </Link>
          <Link href="/admin/players/create" className={styles.quickLink}>
            <FaUserTie />
            <span>Novi igrač</span>
          </Link>
          <Link href="/admin/matches/create" className={styles.quickLink}>
            <FaFutbol />
            <span>Nova utakmica</span>
          </Link>
          <Link href="/admin/rounds/create" className={styles.quickLink}>
            <FaChartBar />
            <span>Novo kolo</span>
          </Link>
        </div>

        <div className={styles.userActions}>
          <div className={styles.notificationWrapper}>
            <button className={styles.notificationButton} onClick={toggleNotifications}>
              <FaBell />
              {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
            </button>

            {showNotifications && (
              <div className={styles.notificationsDropdown}>
                <h3 className={styles.notificationsTitle}>Admin obavještenja</h3>
                <ul className={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <li key={notification.id} className={styles.notificationItem}>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.notificationsFooter}>
                  <Link href="/admin/notifications" className={styles.viewAllLink}>
                    Pogledaj sva obavještenja
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/" className={styles.viewSite}>
            <FaHome />
            <span>Pogledaj sajt</span>
          </Link>

          <div className={styles.adminDropdown}>
            <button className={styles.adminButton}>
              <FaUserShield />
              <span>Admin</span>
            </button>
            <div className={styles.dropdownContent}>
              <Link href="/admin/settings" className={styles.dropdownItem}>
                <FaCog />
                <span>Postavke</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <FaSignOutAlt />
                <span>Odjavi se</span>
              </button>
            </div>
          </div>
        </div>

        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.active : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/admin">
                <FaHome />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/news">
                <FaNewspaper />
                <span>Vijesti</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/clubs">
                <FaUsers />
                <span>Klubovi</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/players">
                <FaUserTie />
                <span>Igrači</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/matches">
                <FaFutbol />
                <span>Utakmice</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/rounds">
                <FaChartBar />
                <span>Kola</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/statistics">
                <FaChartBar />
                <span>Statistike</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/admin/fantasy">
                <FaTrophy />
                <span>Fantasy</span>
              </Link>
            </li>
            <li className={styles.navDivider}></li>
            <li className={styles.navItem}>
              <Link href="/">
                <FaHome />
                <span>Pogledaj sajt</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <button onClick={handleLogout} className={styles.navLogout}>
                <FaSignOutAlt />
                <span>Odjavi se</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
