import Head from "next/head"
import styles from "../../styles/Tabela.module.css"

export default function Tabela() {
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
      form: ["W", "W", "D", "W", "W"],
    },
    {
      position: 2,
      team: "Borac",
      played: 30,
      won: 20,
      drawn: 6,
      lost: 4,
      goalsFor: 55,
      goalsAgainst: 25,
      points: 66,
      form: ["W", "W", "W", "L", "D"],
    },
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
      form: ["L", "W", "W", "W", "D"],
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
      form: ["W", "D", "W", "D", "W"],
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
      form: ["D", "W", "L", "W", "W"],
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
      form: ["W", "D", "D", "W", "L"],
    },
    {
      position: 7,
      team: "Velež",
      played: 30,
      won: 12,
      drawn: 6,
      lost: 12,
      goalsFor: 38,
      goalsAgainst: 40,
      points: 42,
      form: ["L", "W", "L", "D", "W"],
    },
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
      form: ["W", "L", "L", "W", "D"],
    },
    {
      position: 9,
      team: "Posušje",
      played: 30,
      won: 8,
      drawn: 10,
      lost: 12,
      goalsFor: 30,
      goalsAgainst: 35,
      points: 34,
      form: ["D", "D", "L", "W", "L"],
    },
    {
      position: 10,
      team: "Igman",
      played: 30,
      won: 7,
      drawn: 8,
      lost: 15,
      goalsFor: 25,
      goalsAgainst: 45,
      points: 29,
      form: ["L", "L", "D", "L", "W"],
    },
    {
      position: 11,
      team: "Radnik",
      played: 30,
      won: 5,
      drawn: 7,
      lost: 18,
      goalsFor: 20,
      goalsAgainst: 50,
      points: 22,
      form: ["L", "L", "L", "D", "L"],
    },
    {
      position: 12,
      team: "Zvijezda",
      played: 30,
      won: 2,
      drawn: 5,
      lost: 23,
      goalsFor: 15,
      goalsAgainst: 55,
      points: 11,
      form: ["L", "L", "L", "L", "D"],
    },
  ]

  // Funkcija za prikaz forme
  const renderForm = (form) => {
    return (
      <div className={styles.formContainer}>
        {form.map((result, index) => (
          <span
            key={index}
            className={`${styles.formBadge} ${
              result === "W" ? styles.win : result === "D" ? styles.draw : styles.loss
            }`}
          >
            {result}
          </span>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Tabela | PLKutak</title>
        <meta name="description" content="Tabela Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Tabela</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.seasonSelector}>
              <label htmlFor="season">Sezona:</label>
              <select id="season" className={styles.seasonSelect}>
                <option value="2024/25">2024/25</option>
                <option value="2023/24">2023/24</option>
                <option value="2022/23">2022/23</option>
              </select>
            </div>
            <div className={styles.tableInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#4cc9f0" }}></span>
                <span className={styles.infoText}>Liga prvaka</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#4361ee" }}></span>
                <span className={styles.infoText}>Evropska liga</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoBox} style={{ backgroundColor: "#f72585" }}></span>
                <span className={styles.infoText}>Ispadanje</span>
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.positionCol}>#</th>
                  <th className={styles.teamCol}>Tim</th>
                  <th className={styles.statsCol}>OU</th>
                  <th className={styles.statsCol}>P</th>
                  <th className={styles.statsCol}>N</th>
                  <th className={styles.statsCol}>I</th>
                  <th className={styles.statsCol}>GD</th>
                  <th className={styles.statsCol}>GP</th>
                  <th className={styles.statsCol}>GR</th>
                  <th className={styles.pointsCol}>BOD</th>
                  <th className={styles.formCol}>Forma</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.position} className={styles.tableRow}>
                    <td className={styles.positionCol}>{row.position}</td>
                    <td className={styles.teamCol}>{row.team}</td>
                    <td className={styles.statsCol}>{row.played}</td>
                    <td className={styles.statsCol}>{row.won}</td>
                    <td className={styles.statsCol}>{row.drawn}</td>
                    <td className={styles.statsCol}>{row.lost}</td>
                    <td className={styles.statsCol}>{row.goalsFor}</td>
                    <td className={styles.statsCol}>{row.goalsAgainst}</td>
                    <td className={styles.statsCol}>{row.goalsFor - row.goalsAgainst}</td>
                    <td className={styles.pointsCol}>{row.points}</td>
                    <td className={styles.formCol}>{renderForm(row.form)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
