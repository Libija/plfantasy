import Link from "next/link"
import styles from "../styles/RecentResults.module.css"

export default function RecentResults() {
  // Simulirani podaci za nedavne rezultate
  const results = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      homeScore: 2,
      awayTeam: "Zrinjski",
      awayScore: 1,
      date: "19.05.2025.",
    },
    {
      id: 2,
      homeTeam: "Željezničar",
      homeScore: 3,
      awayTeam: "Velež",
      awayScore: 0,
      date: "18.05.2025.",
    },
    {
      id: 3,
      homeTeam: "Tuzla City",
      homeScore: 1,
      awayTeam: "Borac",
      awayScore: 1,
      date: "18.05.2025.",
    },
  ]

  return (
    <section className={styles.recentResults}>
      <div className={styles.sectionHeader}>
        <h2>Nedavni rezultati</h2>
        <Link href="/rezultati" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.resultsList}>
        {results.map((result) => (
          <div key={result.id} className={styles.resultCard}>
            <div className={styles.resultDate}>{result.date}</div>
            <div className={styles.resultTeams}>
              <div className={styles.teamHome}>
                <span className={styles.teamName}>{result.homeTeam}</span>
                <span className={styles.score}>{result.homeScore}</span>
              </div>
              <div className={styles.separator}>-</div>
              <div className={styles.teamAway}>
                <span className={styles.score}>{result.awayScore}</span>
                <span className={styles.teamName}>{result.awayTeam}</span>
              </div>
            </div>
            <Link href={`/utakmice/${result.id}`} className={styles.resultLink}>
              Detalji
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
