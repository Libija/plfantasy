import Head from "next/head"
import NewsSection from "../components/NewsSection"
import UpcomingMatches from "../components/UpcomingMatches"
import RecentResults from "../components/RecentResults"
import LeagueTable from "../components/LeagueTable"
import TopScorers from "../components/TopScorers"
import styles from "../styles/Home.module.css"

export default function Home() {
  return (
    <>
      <Head>
        <title>PLKutak - Premijer Liga BiH</title>
        <meta name="description" content="Sve o Premijer ligi Bosne i Hercegovine" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <section className={styles.heroSection}>
          <h1 className={styles.title}>Dobrodošli na PLKutak</h1>
          <p className={styles.subtitle}>Vaš izvor informacija o Premijer ligi BiH</p>
        </section>

        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <NewsSection />
            <div className={styles.matchesContainer}>
              <UpcomingMatches />
              <RecentResults />
            </div>
          </div>
          <div className={styles.sidebar}>
            <LeagueTable />
            <TopScorers />
          </div>
        </div>
      </div>
    </>
  )
}
