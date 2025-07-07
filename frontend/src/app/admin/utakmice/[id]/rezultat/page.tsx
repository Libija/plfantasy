"use client"
import { useState } from "react"
import { Container, Typography, Box, Card, CardContent, Button, TextField, Avatar } from "@mui/material"
import { Save, ArrowBack } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function MatchResultPage() {
  const params = useParams()
  const matchId = params.id

  const [match] = useState({
    id: 1,
    homeTeam: "Sarajevo",
    awayTeam: "Borac",
    homeLogo: "/placeholder.svg?height=60&width=60",
    awayLogo: "/placeholder.svg?height=60&width=60",
    date: "2024-01-20",
    time: "15:00",
    round: 19,
    venue: "Stadion Grbavica",
  })

  const [result, setResult] = useState({
    homeScore: "",
    awayScore: "",
  })

  const handleSave = () => {
    // Logic to save match result
    console.log("Saving result:", result)
    // Redirect to events page after saving
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Box className={styles.header}>
        <Button component={Link} href="/admin/utakmice" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na utakmice
        </Button>
        <Typography variant="h4" className={styles.pageTitle}>
          Unos Rezultata
        </Typography>
      </Box>

      <Card className={styles.matchCard}>
        <CardContent className={styles.matchContent}>
          <Box className={styles.matchInfo}>
            <Typography variant="h6" className={styles.roundInfo}>
              {match.round}. Kolo - {new Date(match.date).toLocaleDateString("bs-BA")} {match.time}
            </Typography>
            <Typography variant="body2" className={styles.venue}>
              {match.venue}
            </Typography>
          </Box>

          <Box className={styles.teamsContainer}>
            <Box className={styles.team}>
              <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
              <Typography variant="h5" className={styles.teamName}>
                {match.homeTeam}
              </Typography>
            </Box>

            <Box className={styles.scoreContainer}>
              <TextField
                type="number"
                value={result.homeScore}
                onChange={(e) => setResult({ ...result, homeScore: e.target.value })}
                className={styles.scoreInput}
                inputProps={{ min: 0, max: 20 }}
              />
              <Typography variant="h4" className={styles.scoreSeparator}>
                :
              </Typography>
              <TextField
                type="number"
                value={result.awayScore}
                onChange={(e) => setResult({ ...result, awayScore: e.target.value })}
                className={styles.scoreInput}
                inputProps={{ min: 0, max: 20 }}
              />
            </Box>

            <Box className={styles.team}>
              <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
              <Typography variant="h5" className={styles.teamName}>
                {match.awayTeam}
              </Typography>
            </Box>
          </Box>

          <Box className={styles.actions}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!result.homeScore || !result.awayScore}
              className={styles.saveBtn}
            >
              Sačuvaj Rezultat
            </Button>
            <Typography variant="body2" className={styles.nextStep}>
              Nakon čuvanja rezultata možete unijeti match events
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
