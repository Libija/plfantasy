import Link from "next/link"
import styles from "../styles/404.module.css"

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 - Stranica nije pronađena</h1>
      <p className={styles.message}>Stranica koju tražite ne postoji ili je premještena.</p>
      <Link href="/" className={styles.homeButton}>
        Povratak na početnu
      </Link>
    </div>
  )
}
