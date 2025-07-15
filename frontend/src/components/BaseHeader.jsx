"use client"
import Link from "next/link"
import Image from "next/image"
import { FaBars, FaTimes } from "react-icons/fa"
import { useState } from "react"
import styles from "../styles/Header.module.css"

export default function BaseHeader({ logoHref = "/", navLinks = [], children, className = "" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((v) => !v)

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href={logoHref}>
            <div className={styles.logo}>
              <Image src="/PL.png" alt="PLKutak Logo" width={150} height={150} priority />
            </div>
          </Link>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.active : ""}`}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li className={styles.navItem} key={link.href}>
                {link.component ? link.component : <Link href={link.href}>{link.label}</Link>}
              </li>
            ))}
          </ul>
        </nav>

        {children && <div className={styles.authButtons}>{children}</div>}

        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  )
} 