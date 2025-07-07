import Link from "next/link"
import styles from "../styles/TopScorers.module.css"

export default function TopScorers() {
  // Simulirani podaci za najbolje strijelce
  const scorers = [
    { position: 1, player: "Edin Džeko", team: "Sarajevo", goals: 18 },
    { position: 2, player: "Marko Marković", team: "Borac", goals: 15 },
    { position: 3, player: "Adnan Hasić", team: "Zrinjski", goals: 14 },
    { position: 4, player: "Haris Harba", team: "Željezničar", goals: 13 },
    { position: 5, player: "Anel Hebibović", team: "Tuzla City", goals: 12 },
  ]

  return (
    <section className={styles.topScorers}>
      <div className={styles.sectionHeader}>
        <h2>Najbolji strijelci</h2>
        <Link href="/statistika/strijelci" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.scorersContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.positionCol}>#</th>
              <th className={styles.playerCol}>Igrač</th>
              <th className={styles.teamCol}>Tim</th>
              <th className={styles.goalsCol}>G</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((scorer) => (
              <tr key={scorer.position} className={styles.tableRow}>
                <td className={styles.positionCol}>{scorer.position}</td>
                <td className={styles.playerCol}>{scorer.player}</td>
                <td className={styles.teamCol}>{scorer.team}</td>
                <td className={styles.goalsCol}>{scorer.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
