"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaBars, FaTimes, FaSearch, FaUser, FaSignOutAlt, FaBell } from "react-icons/fa"
import styles from "../styles/Header.module.css"

export default function LoggedInHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [showNotifications, setShowNotifications] = useState(false)

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
    console.log("Logout clicked")
    // Redirect na home page nakon logout-a
    // router.push("/")
  }

  const notifications = [
    {
      id: 1,
      type: "match",
      message: "Utakmica Sarajevo - Zrinjski počinje za 1 sat",
      time: "prije 30 minuta",
    },
    {
      id: 2,
      type: "news",
      message: "Nova vijest: Transferi u Premijer ligi",
      time: "prije 2 sata",
    },
    {
      id: 3,
      type: "fantasy",
      message: "Vaš fantasy tim je ostvario 76 bodova",
      time: "prije 1 dan",
    },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <div className={styles.logo}>
              <Image src="/logo.png" alt="PLKutak Logo" width={150} height={50} priority />
            </div>
          </Link>
        </div>

        <div className={styles.searchBar}>
          <input type="text" placeholder="Pretraži..." />
          <button type="submit">
            <FaSearch />
          </button>
        </div>

        <div className={styles.authButtons}>
          <div className={styles.notificationWrapper}>
            <button className={styles.notificationButton} onClick={toggleNotifications}>
              <FaBell />
              {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
            </button>

            {showNotifications && (
              <div className={styles.notificationsDropdown}>
                <h3 className={styles.notificationsTitle}>Obavještenja</h3>
                <ul className={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <li key={notification.id} className={styles.notificationItem}>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.notificationsFooter}>
                  <Link href="/notifications" className={styles.viewAllLink}>
                    Pogledaj sva obavještenja
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className={styles.userDropdown}>
            <button className={styles.userButton}>
              <FaUser />
              <span>Moj Profil</span>
            </button>
            <div className={styles.dropdownContent}>
              <Link href="/profile" className={styles.dropdownItem}>
                Moj profil
              </Link>
              <Link href="/fantasy/my-team" className={styles.dropdownItem}>
                Moj fantasy tim
              </Link>
              <Link href="/settings" className={styles.dropdownItem}>
                Postavke
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
              <Link href="/">Početna</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/vijesti">Vijesti</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/utakmice">Utakmice</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/tabela">Tabela</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/klubovi">Klubovi</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/fantasy">Fantasy</Link>
            </li>
            <li className={styles.navItem}>
              <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                Odjavi se
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
