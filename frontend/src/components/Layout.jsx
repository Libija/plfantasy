import HeaderSwitcher from "./HeaderSwitcher"
import Footer from "./Footer"
import styles from "../styles/Layout.module.css"

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <HeaderSwitcher />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}
