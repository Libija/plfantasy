"use client"
import { Card, CardContent, Typography, Box, Avatar, Chip, Button } from "@mui/material"
import { CalendarToday, Schedule } from "@mui/icons-material"
import Link from "next/link"
import styles from "./UpcomingMatches.module.css"

const UpcomingMatches = () => {
  const matches = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Borac Banjaluka",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      date: "2024-01-20",
      time: "15:00",
      round: 19,
      venue: "Stadion Grbavica",
    },
    {
      id: 2,
      homeTeam: "Zrinjski Mostar",
      awayTeam: "Željezničar",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      date: "2024-01-21",
      time: "17:00",
      round: 19,
      venue: "Stadion pod Bijelim Brijegom",
    },
    {
      id: 3,
      homeTeam: "Velež Mostar",
      awayTeam: "Sloboda Tuzla",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      date: "2024-01-21",
      time: "19:30",
      round: 19,
      venue: "Stadion Rođeni",
    },
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bs-BA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Card className={styles.matchesCard}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" className={styles.cardTitle}>
          Nadolazeće Utakmice
        </Typography>

        <Box className={styles.matchesList}>
          {matches.map((match) => (
            <Box key={match.id} className={styles.matchItem}>
              <Box className={styles.matchHeader}>
                <Chip
                  icon={<CalendarToday fontSize="small" />}
                  label={`${match.round}. kolo`}
                  size="small"
                  className={styles.roundChip}
                />
                <Box className={styles.matchDateTime}>
                  <Typography variant="caption" className={styles.matchDate}>
                    {formatDate(match.date)}
                  </Typography>
                  <Box className={styles.timeContainer}>
                    <Schedule fontSize="small" className={styles.timeIcon} />
                    <Typography variant="caption" className={styles.matchTime}>
                      {match.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className={styles.teamsContainer}>
                <Box className={styles.team}>
                  <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                  <Typography variant="body2" className={styles.teamName}>
                    {match.homeTeam}
                  </Typography>
                </Box>

                <Box className={styles.vsContainer}>
                  <Typography variant="body2" className={styles.vsText}>
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

              <Typography variant="caption" className={styles.venue}>
                {match.venue}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box className={styles.cardFooter}>
          <Button component={Link} href="/utakmice" size="small" className={styles.viewMoreBtn}>
            Sve utakmice
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UpcomingMatches
