import { Container, Grid, Typography, Box } from "@mui/material"
import NewsSection from "../components/home/NewsSection"
import LeagueTable from "../components/home/LeagueTable"
import TopScorers from "../components/home/TopScorers"
import UpcomingMatches from "../components/home/UpcomingMatches"
import styles from "./page.module.css"

export default function HomePage() {
  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.hero}>
        <Typography variant="h3" component="h1" className={styles.heroTitle}>
          Premier Liga BiH
        </Typography>
        <Typography variant="h6" className={styles.heroSubtitle}>
          Vaš kutak za sve informacije o Premier Ligi Bosne i Hercegovine
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <NewsSection />
        </Grid>
        <Grid item xs={12} lg={3}>
          <Box className={styles.sidebar}>
            <LeagueTable />
            <TopScorers />
            <UpcomingMatches />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
