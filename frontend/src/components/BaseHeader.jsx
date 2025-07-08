"use client"
import Link from "next/link"
import Image from "next/image"
import { FaBars, FaTimes, FaSearch } from "react-icons/fa"
import { useState } from "react"
import styles from "../styles/Header.module.css"

export default function BaseHeader({ logoHref = "/", children, extraNav, className = "" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((v) => !v)

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href={logoHref}>
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

        {children && <div className={styles.authButtons}>{children}</div>}

        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.active : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}><Link href="/">Početna</Link></li>
            <li className={styles.navItem}><Link href="/vijesti">Vijesti</Link></li>
            <li className={styles.navItem}><Link href="/utakmice">Utakmice</Link></li>
            <li className={styles.navItem}><Link href="/tabela">Tabela</Link></li>
            <li className={styles.navItem}><Link href="/klubovi">Klubovi</Link></li>
            <li className={styles.navItem}><Link href="/fantasy">Fantasy</Link></li>
            {extraNav}
          </ul>
        </nav>
      </div>
    </header>
  )
} 