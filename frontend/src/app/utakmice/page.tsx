"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
} from "@mui/material"
import { CalendarToday, Schedule, Stadium } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState(0)

  const currentRound = 19

  const recentMatches = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      homeScore: 2,
      awayScore: 1,
      date: "2024-01-15",
      time: "15:00",
      round: 18,
      venue: "Stadion Grbavica",
      status: "Završeno",
    },
    {
      id: 2,
      homeTeam: "Borac Banjaluka",
      awayTeam: "Zrinjski Mostar",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      homeScore: 1,
      awayScore: 0,
      date: "2024-01-14",
      time: "17:00",
      round: 18,
      venue: "Gradski stadion",
      status: "Završeno",
    },
    {
      id: 3,
      homeTeam: "Velež Mostar",
      awayTeam: "Sloboda Tuzla",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      homeScore: 2,
      awayScore: 1,
      date: "2024-01-13",
      time: "19:30",
      round: 18,
      venue: "Stadion Rođeni",
      status: "Završeno",
    },
    {
      id: 4,
      homeTeam: "Široki Brijeg",
      awayTeam: "Tuzla City",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      homeScore: 0,
      awayScore: 0,
      date: "2024-01-12",
      time: "16:00",
      round: 18,
      venue: "Stadion Pecara",
      status: "Završeno",
    },
    {
      id: 5,
      homeTeam: "Posavina Brčko",
      awayTeam: "Radnik Bijeljina",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      homeScore: 1,
      awayScore: 2,
      date: "2024-01-11",
      time: "14:00",
      round: 18,
      venue: "Gradski stadion Brčko",
      status: "Završeno",
    },
  ]

  const upcomingMatches = [
    {
      id: 6,
      homeTeam: "Zrinjski Mostar",
      awayTeam: "Sarajevo",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-20",
      time: "15:00",
      round: 19,
      venue: "Stadion pod Bijelim Brijegom",
      status: "Najavljeno",
    },
    {
      id: 7,
      homeTeam: "Željezničar",
      awayTeam: "Borac Banjaluka",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-21",
      time: "17:00",
      round: 19,
      venue: "Stadion Grbavica",
      status: "Najavljeno",
    },
    {
      id: 8,
      homeTeam: "Sloboda Tuzla",
      awayTeam: "Široki Brijeg",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-21",
      time: "19:30",
      round: 19,
      venue: "Stadion Tušanj",
      status: "Najavljeno",
    },
    {
      id: 9,
      homeTeam: "Tuzla City",
      awayTeam: "Velež Mostar",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-22",
      time: "16:00",
      round: 19,
      venue: "Stadion Tušanj",
      status: "Najavljeno",
    },
    {
      id: 10,
      homeTeam: "Radnik Bijeljina",
      awayTeam: "Posavina Brčko",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-22",
      time: "14:00",
      round: 19,
      venue: "Stadion Radnik",
      status: "Najavljeno",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bs-BA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Završeno":
        return "success"
      case "Najavljeno":
        return "primary"
      case "Uživo":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h3" className={styles.pageTitle}>
          Utakmice
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Rezultati i raspored utakmica Premier Lige BiH
        </Typography>
      </Box>

      <Box className={styles.tabsContainer}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} className={styles.tabs}>
          <Tab label={`${currentRound - 1}. Kolo (Završeno)`} />
          <Tab label={`${currentRound}. Kolo (Nadolazeće)`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box className={styles.matchesContainer}>
          <Box className={styles.roundHeader}>
            <Typography variant="h5" className={styles.roundTitle}>
              {currentRound - 1}. Kolo - Rezultati
            </Typography>
            <Button variant="outlined" className={styles.allResultsBtn}>
              Svi rezultati
            </Button>
          </Box>

          <Grid container spacing={3}>
            {recentMatches.map((match) => (
              <Grid item xs={12} sm={6} lg={4} key={match.id}>
                <Card className={`${styles.matchCard} card-hover`}>
                  <CardContent className={styles.matchContent}>
                    <Box className={styles.matchHeader}>
                      <Chip
                        icon={<CalendarToday fontSize="small" />}
                        label={`${match.round}. kolo`}
                        size="small"
                        className={styles.roundChip}
                      />
                      <Chip
                        label={match.status}
                        size="small"
                        color={getStatusColor(match.status) as any}
                        className={styles.statusChip}
                      />
                    </Box>

                    <Box className={styles.teamsContainer}>
                      <Box className={styles.team}>
                        <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                        <Typography variant="body2" className={styles.teamName}>
                          {match.homeTeam}
                        </Typography>
                      </Box>

                      <Box className={styles.scoreContainer}>
                        <Typography variant="h4" className={styles.score}>
                          {match.homeScore} - {match.awayScore}
                        </Typography>
                      </Box>

                      <Box className={styles.team}>
                        <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                        <Typography variant="body2" className={styles.teamName}>
                          {match.awayTeam}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider className={styles.divider} />

                    <Box className={styles.matchDetails}>
                      <Box className={styles.detailItem}>
                        <Schedule fontSize="small" className={styles.detailIcon} />
                        <Typography variant="caption">
                          {formatDate(match.date)} • {match.time}
                        </Typography>
                      </Box>
                      <Box className={styles.detailItem}>
                        <Stadium fontSize="small" className={styles.detailIcon} />
                        <Typography variant="caption">{match.venue}</Typography>
                      </Box>
                    </Box>

                    <Button component={Link} href={`/utakmice/${match.id}`} fullWidth className={styles.detailsBtn}>
                      Detalji utakmice
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box className={styles.matchesContainer}>
          <Box className={styles.roundHeader}>
            <Typography variant="h5" className={styles.roundTitle}>
              {currentRound}. Kolo - Nadolazeće utakmice
            </Typography>
            <Button variant="outlined" className={styles.allResultsBtn}>
              Sav raspored
            </Button>
          </Box>

          <Grid container spacing={3}>
            {upcomingMatches.map((match) => (
              <Grid item xs={12} sm={6} lg={4} key={match.id}>
                <Card className={`${styles.matchCard} card-hover`}>
                  <CardContent className={styles.matchContent}>
                    <Box className={styles.matchHeader}>
                      <Chip
                        icon={<CalendarToday fontSize="small" />}
                        label={`${match.round}. kolo`}
                        size="small"
                        className={styles.roundChip}
                      />
                      <Chip
                        label={match.status}
                        size="small"
                        color={getStatusColor(match.status) as any}
                        className={styles.statusChip}
                      />
                    </Box>

                    <Box className={styles.teamsContainer}>
                      <Box className={styles.team}>
                        <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                        <Typography variant="body2" className={styles.teamName}>
                          {match.homeTeam}
                        </Typography>
                      </Box>

                      <Box className={styles.vsContainer}>
                        <Typography variant="h5" className={styles.vsText}>
                          vs
                        </Typography>
                      </Box>

                      <Box className={styles.team}>
                        <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                        <Typography variant="body2" className={styles.teamName}>
                          {match.awayTeam}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider className={styles.divider} />

                    <Box className={styles.matchDetails}>
                      <Box className={styles.detailItem}>
                        <Schedule fontSize="small" className={styles.detailIcon} />
                        <Typography variant="caption">
                          {formatDate(match.date)} • {match.time}
                        </Typography>
                      </Box>
                      <Box className={styles.detailItem}>
                        <Stadium fontSize="small" className={styles.detailIcon} />
                        <Typography variant="caption">{match.venue}</Typography>
                      </Box>
                    </Box>

                    <Button variant="outlined" fullWidth className={styles.previewBtn}>
                      Pregled utakmice
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  )
}
