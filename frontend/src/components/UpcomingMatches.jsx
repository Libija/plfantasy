import Link from "next/link"
import styles from "../styles/UpcomingMatches.module.css"

export default function UpcomingMatches() {
  // Simulirani podaci za nadolazeće utakmice
  const matches = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      date: "25.05.2025.",
      time: "20:00",
      stadium: "Koševo",
    },
    {
      id: 2,
      homeTeam: "Borac",
      awayTeam: "Tuzla City",
      date: "26.05.2025.",
      time: "18:00",
      stadium: "Gradski stadion",
    },
    {
      id: 3,
      homeTeam: "Zrinjski",
      awayTeam: "Široki Brijeg",
      date: "26.05.2025.",
      time: "20:00",
      stadium: "Pod Bijelim Brijegom",
    },
  ]

  return (
    <section className={styles.upcomingMatches}>
      <div className={styles.sectionHeader}>
        <h2>Nadolazeće utakmice</h2>
        <Link href="/utakmice" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.matchesList}>
        {matches.map((match) => (
          <div key={match.id} className={styles.matchCard}>
            <div className={styles.matchDate}>
              <span>{match.date}</span>
              <span>{match.time}</span>
            </div>
            <div className={styles.matchTeams}>
              <div className={styles.teamHome}>
                <span className={styles.teamName}>{match.homeTeam}</span>
              </div>
              <div className={styles.matchInfo}>
                <span className={styles.vs}>VS</span>
                <span className={styles.stadium}>{match.stadium}</span>
              </div>
              <div className={styles.teamAway}>
                <span className={styles.teamName}>{match.awayTeam}</span>
              </div>
            </div>
            <Link href={`/utakmice/${match.id}`} className={styles.matchLink}>
              Detalji
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
