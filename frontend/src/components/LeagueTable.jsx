import Link from "next/link"
import styles from "../styles/LeagueTable.module.css"

export default function LeagueTable() {
  // Simulirani podaci za tabelu
  const tableData = [
    {
      position: 1,
      team: "Sarajevo",
      played: 30,
      won: 22,
      drawn: 5,
      lost: 3,
      goalsFor: 60,
      goalsAgainst: 20,
      points: 71,
    },
    { position: 2, team: "Borac", played: 30, won: 20, drawn: 6, lost: 4, goalsFor: 55, goalsAgainst: 25, points: 66 },
    {
      position: 3,
      team: "Zrinjski",
      played: 30,
      won: 19,
      drawn: 5,
      lost: 6,
      goalsFor: 50,
      goalsAgainst: 30,
      points: 62,
    },
    {
      position: 4,
      team: "Željezničar",
      played: 30,
      won: 17,
      drawn: 8,
      lost: 5,
      goalsFor: 48,
      goalsAgainst: 28,
      points: 59,
    },
    {
      position: 5,
      team: "Tuzla City",
      played: 30,
      won: 15,
      drawn: 7,
      lost: 8,
      goalsFor: 45,
      goalsAgainst: 35,
      points: 52,
    },
    {
      position: 6,
      team: "Široki Brijeg",
      played: 30,
      won: 13,
      drawn: 9,
      lost: 8,
      goalsFor: 40,
      goalsAgainst: 30,
      points: 48,
    },
    { position: 7, team: "Velež", played: 30, won: 12, drawn: 6, lost: 12, goalsFor: 38, goalsAgainst: 40, points: 42 },
    {
      position: 8,
      team: "Sloboda",
      played: 30,
      won: 10,
      drawn: 8,
      lost: 12,
      goalsFor: 35,
      goalsAgainst: 38,
      points: 38,
    },
  ]

  return (
    <section className={styles.leagueTable}>
      <div className={styles.sectionHeader}>
        <h2>Tabela</h2>
        <Link href="/tabela" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.positionCol}>#</th>
              <th className={styles.teamCol}>Tim</th>
              <th className={styles.statsCol}>OU</th>
              <th className={styles.statsCol}>BOD</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.position} className={styles.tableRow}>
                <td className={styles.positionCol}>{row.position}</td>
                <td className={styles.teamCol}>{row.team}</td>
                <td className={styles.statsCol}>{row.played}</td>
                <td className={styles.statsCol}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
