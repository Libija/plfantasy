"use client"
import { useState } from "react"
import { Container, Typography, Box, Card, CardContent, TextField, Button, Avatar, Divider } from "@mui/material"
import { ArrowBack, Save, BarChart } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function MatchStatisticsPage() {
  const params = useParams()
  const matchId = params.id

  // Mock match data
  const match = {
    id: 1,
    homeTeam: "Sarajevo",
    awayTeam: "Željezničar",
    homeLogo: "/placeholder.svg?height=60&width=60",
    awayLogo: "/placeholder.svg?height=60&width=60",
    date: "2024-01-15",
    round: 18,
  }

  const [stats, setStats] = useState({
    home: {
      possession: 58,
      shots: 14,
      shotsOnTarget: 6,
      corners: 7,
      fouls: 12,
      yellowCards: 2,
      redCards: 0,
      passes: 487,
      passAccuracy: 84,
      offsides: 3,
      saves: 2,
      crosses: 18,
      tackles: 23,
      interceptions: 15,
    },
    away: {
      possession: 42,
      shots: 8,
      shotsOnTarget: 3,
      corners: 4,
      fouls: 18,
      yellowCards: 3,
      redCards: 0,
      passes: 352,
      passAccuracy: 78,
      offsides: 5,
      saves: 4,
      crosses: 12,
      tackles: 28,
      interceptions: 19,
    },
  })

  const handleStatChange = (team, stat, value) => {
    setStats((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [stat]: Number.parseInt(value) || 0,
      },
    }))
  }

  const handleSave = () => {
    console.log("Saving statistics:", stats)
    // Ovdje bi se poslali podaci na server
    alert("Statistike su uspješno sačuvane!")
  }

  const statLabels = {
    possession: "Posjed lopte (%)",
    shots: "Šutevi",
    shotsOnTarget: "Šutevi u okvir",
    corners: "Korneri",
    fouls: "Prekršaji",
    yellowCards: "Žuti kartoni",
    redCards: "Crveni kartoni",
    passes: "Dodavanja",
    passAccuracy: "Preciznost dodavanja (%)",
    offsides: "Ofsajdi",
    saves: "Odbrane",
    crosses: "Centaršutevi",
    tackles: "Startovi",
    interceptions: "Presretanja",
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Button
          component={Link}
          href={`/admin/utakmice/${matchId}`}
          startIcon={<ArrowBack />}
          className={styles.backBtn}
        >
          Nazad na utakmicu
        </Button>
        <Typography variant="h4" className={styles.pageTitle}>
          Unos Statistika Utakmice
        </Typography>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave} className={styles.saveBtn}>
          Sačuvaj
        </Button>
      </Box>

      {/* Match Info */}
      <Card className={styles.matchCard}>
        <CardContent>
          <Box className={styles.matchInfo}>
            <Box className={styles.team}>
              <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
              <Typography variant="h6">{match.homeTeam}</Typography>
            </Box>
            <Box className={styles.vsSection}>
              <Typography variant="h5" className={styles.vsText}>
                VS
              </Typography>
              <Typography variant="body2">{match.round}. kolo</Typography>
              <Typography variant="body2">{new Date(match.date).toLocaleDateString("bs-BA")}</Typography>
            </Box>
            <Box className={styles.team}>
              <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
              <Typography variant="h6">{match.awayTeam}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Form */}
      <Card className={styles.statsCard}>
        <CardContent>
          <Typography variant="h6" className={styles.sectionTitle}>
            <BarChart className={styles.sectionIcon} />
            Statistike Utakmice
          </Typography>

          <Box className={styles.statsForm}>
            {Object.entries(statLabels).map(([key, label]) => (
              <Box key={key} className={styles.statRow}>
                <Box className={styles.statInputs}>
                  <TextField
                    type="number"
                    value={stats.home[key]}
                    onChange={(e) => handleStatChange("home", key, e.target.value)}
                    className={styles.statInput}
                    inputProps={{
                      min: 0,
                      max: key.includes("percentage") || key === "possession" || key === "passAccuracy" ? 100 : 999,
                    }}
                  />
                </Box>

                <Box className={styles.statLabel}>
                  <Typography variant="body1" className={styles.statName}>
                    {label}
                  </Typography>
                </Box>

                <Box className={styles.statInputs}>
                  <TextField
                    type="number"
                    value={stats.away[key]}
                    onChange={(e) => handleStatChange("away", key, e.target.value)}
                    className={styles.statInput}
                    inputProps={{
                      min: 0,
                      max: key.includes("percentage") || key === "possession" || key === "passAccuracy" ? 100 : 999,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <Divider className={styles.divider} />

          <Box className={styles.formActions}>
            <Button
              variant="outlined"
              component={Link}
              href={`/admin/utakmice/${matchId}`}
              className={styles.cancelBtn}
            >
              Otkaži
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} className={styles.saveBtn}>
              Sačuvaj Statistike
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
