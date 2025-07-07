"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaBars, FaTimes, FaSearch, FaUser } from "react-icons/fa"
import styles from "../styles/Header.module.css"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
          <Link href="/login" className={styles.loginButton}>
            <FaUser />
            <span>Prijava</span>
          </Link>
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
          </ul>
        </nav>
      </div>
    </header>
  )
}
