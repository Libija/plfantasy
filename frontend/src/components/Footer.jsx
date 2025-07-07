import Link from "next/link"
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa"
import styles from "../styles/Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerSection}>
            <h3>O nama</h3>
            <p>
              PLKutak je vaš izvor informacija o Premijer ligi Bosne i Hercegovine. Pratite najnovije vijesti,
              rezultate, tabele i statistike.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h3>Brzi linkovi</h3>
            <ul>
              <li>
                <Link href="/vijesti">Vijesti</Link>
              </li>
              <li>
                <Link href="/utakmice">Utakmice</Link>
              </li>
              <li>
                <Link href="/tabela">Tabela</Link>
              </li>
              <li>
                <Link href="/klubovi">Klubovi</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Kontakt</h3>
            <p>Email: info@plkutak.ba</p>
            <p>Telefon: +387 33 123 456</p>
          </div>

          <div className={styles.footerSection}>
            <h3>Pratite nas</h3>
            <div className={styles.socialIcons}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} PLKutak. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  )
}
