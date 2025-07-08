"use client"

import BaseHeader from "./BaseHeader"
import Link from "next/link"
import { FaUser, FaSignOutAlt, FaBell } from "react-icons/fa"
import useAuth from "../hooks/use-auth"
import { useState } from "react"
import styles from "../styles/Header.module.css"

export default function LoggedInHeader() {
  const { logout } = useAuth()
  const [notificationCount, setNotificationCount] = useState(3)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) setNotificationCount(0)
  }

  const notifications = [
    { id: 1, message: "Utakmica Sarajevo - Zrinjski počinje za 1 sat", time: "prije 30 minuta" },
    { id: 2, message: "Nova vijest: Transferi u Premijer ligi", time: "prije 2 sata" },
    { id: 3, message: "Vaš fantasy tim je ostvario 76 bodova", time: "prije 1 dan" },
  ]

  return (
    <BaseHeader>
      <div className={styles.notificationWrapper}>
        <button className={styles.notificationButton} onClick={toggleNotifications}>
          <FaBell />
          {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
        </button>
        {showNotifications && (
          <div className={styles.notificationsDropdown}>
            <h3 className={styles.notificationsTitle}>Obavještenja</h3>
            <ul className={styles.notificationsList}>
              {notifications.map((n) => (
                <li key={n.id} className={styles.notificationItem}>
                  <p className={styles.notificationMessage}>{n.message}</p>
                  <span className={styles.notificationTime}>{n.time}</span>
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
          <Link href="/profile" className={styles.dropdownItem}>Moj profil</Link>
          <Link href="/fantasy/my-team" className={styles.dropdownItem}>Moj fantasy tim</Link>
          <Link href="/settings" className={styles.dropdownItem}>Postavke</Link>
          <button onClick={logout} className={styles.logoutButton}>
            <FaSignOutAlt />
            <span>Odjavi se</span>
          </button>
        </div>
      </div>
    </BaseHeader>
  )
}
