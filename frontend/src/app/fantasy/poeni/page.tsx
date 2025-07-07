"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material"
import { EmojiEvents, Sports, Timeline } from "@mui/icons-material"
import styles from "./page.module.css"

export default function PointsHistoryPage() {
  const [selectedGameweek, setSelectedGameweek] = useState("sve")

  const gameweekHistory = [
    {
      gameweek: 19,
      totalPoints: 67,
      rank: 156,
      transfers: 1,
      captain: "Marko Petković",
      captainPoints: 20,
      players: [
        { name: "Nikola Vasilj", position: "GK", team: "Zrinjski", points: 6, played: true },
        { name: "Siniša Saničanin", position: "DEF", team: "Borac", points: 8, played: true },
        { name: "Hrvoje Milićević", position: "DEF", team: "Zrinjski", points: 6, played: true },
        { name: "Tarik Ramić", position: "DEF", team: "Sarajevo", points: 5, played: true },
        { name: "Matej Rodin", position: "DEF", team: "Zrinjski", points: 7, played: true },
        { name: "Stojan Vranješ", position: "MID", team: "Borac", points: 9, played: true },
        { name: "Dino Hotić", position: "MID", team: "Zrinjski", points: 8, played: true },
        { name: "Benjamin Tatar", position: "MID", team: "Sarajevo", points: 6, played: true },
        { name: "Miloš Filipović", position: "MID", team: "Željezničar", points: 7, played: true },
        { name: "Marko Petković", position: "FWD", team: "Borac", points: 10, played: true, captain: true },
        { name: "Nemanja Bilbija", position: "FWD", team: "Zrinjski", points: 9, played: true },
      ],
    },
    {
      gameweek: 18,
      totalPoints: 73,
      rank: 142,
      transfers: 0,
      captain: "Marko Petković",
      captainPoints: 18,
      players: [
        { name: "Nikola Vasilj", position: "GK", team: "Zrinjski", points: 8, played: true },
        { name: "Siniša Saničanin", position: "DEF", team: "Borac", points: 7, played: true },
        { name: "Hrvoje Milićević", position: "DEF", team: "Zrinjski", points: 7, played: true },
        { name: "Tarik Ramić", position: "DEF", team: "Sarajevo", points: 6, played: true },
        { name: "Matej Rodin", position: "DEF", team: "Zrinjski", points: 5, played: true },
        { name: "Stojan Vranješ", position: "MID", team: "Borac", points: 8, played: true },
        { name: "Dino Hotić", position: "MID", team: "Zrinjski", points: 9, played: true },
        { name: "Benjamin Tatar", position: "MID", team: "Sarajevo", points: 8, played: true },
        { name: "Miloš Filipović", position: "MID", team: "Željezničar", points: 6, played: true },
        { name: "Marko Petković", position: "FWD", team: "Borac", points: 9, played: true, captain: true },
        { name: "Nemanja Bilbija", position: "FWD", team: "Zrinjski", points: 8, played: true },
      ],
    },
    {
      gameweek: 17,
      totalPoints: 58,
      rank: 178,
      transfers: 1,
      captain: "Stojan Vranješ",
      captainPoints: 16,
      players: [
        { name: "Nikola Vasilj", position: "GK", team: "Zrinjski", points: 5, played: true },
        { name: "Siniša Saničanin", position: "DEF", team: "Borac", points: 6, played: true },
        { name: "Hrvoje Milićević", position: "DEF", team: "Zrinjski", points: 4, played: true },
        { name: "Tarik Ramić", position: "DEF", team: "Sarajevo", points: 7, played: true },
        { name: "Matej Rodin", position: "DEF", team: "Zrinjski", points: 5, played: true },
        { name: "Stojan Vranješ", position: "MID", team: "Borac", points: 8, played: true, captain: true },
        { name: "Dino Hotić", position: "MID", team: "Zrinjski", points: 6, played: true },
        { name: "Benjamin Tatar", position: "MID", team: "Sarajevo", points: 7, played: true },
        { name: "Miloš Filipović", position: "MID", team: "Željezničar", points: 8, played: true },
        { name: "Stefan Savić", position: "FWD", team: "Velež", points: 3, played: true },
        { name: "Nemanja Bilbija", position: "FWD", team: "Zrinjski", points: 7, played: true },
      ],
    },
  ]

  const overallStats = {
    totalPoints: 1247,
    averagePoints: 65.6,
    highestGameweek: 89,
    lowestGameweek: 34,
    totalTransfers: 8,
    benchPoints: 156,
    captainPoints: 234,
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "GK":
        return "#ff9800"
      case "DEF":
        return "#4caf50"
      case "MID":
        return "#2196f3"
      case "FWD":
        return "#f44336"
      default:
        return "#757575"
    }
  }

  const getPointsColor = (points: number) => {
    if (points >= 8) return "#4caf50"
    if (points >= 5) return "#ff9800"
    return "#f44336"
  }

  const filteredHistory =
    selectedGameweek === "sve"
      ? gameweekHistory
      : gameweekHistory.filter((gw) => gw.gameweek.toString() === selectedGameweek)

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Historija Poena
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Pregled performansi po kolima
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card className={styles.statsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                <Timeline className={styles.sectionIcon} />
                Ukupne Statistike
              </Typography>

              <Box className={styles.statsList}>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Ukupno poena:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.totalPoints}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Prosjek po kolu:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.averagePoints}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Najbolje kolo:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.highestGameweek}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Najgore kolo:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.lowestGameweek}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Ukupno transfera:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.totalTransfers}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Poeni sa klupe:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.benchPoints}
                  </Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Kapetanski poeni:</Typography>
                  <Typography variant="h6" className={styles.statValue}>
                    {overallStats.captainPoints}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card className={styles.historyCard}>
            <CardContent>
              <Box className={styles.historyHeader}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  <EmojiEvents className={styles.sectionIcon} />
                  Historija po Kolima
                </Typography>
                <FormControl size="small" className={styles.gameweekSelect}>
                  <InputLabel>Kolo</InputLabel>
                  <Select value={selectedGameweek} label="Kolo" onChange={(e) => setSelectedGameweek(e.target.value)}>
                    <MenuItem value="sve">Sva kola</MenuItem>
                    {gameweekHistory.map((gw) => (
                      <MenuItem key={gw.gameweek} value={gw.gameweek.toString()}>
                        {gw.gameweek}. kolo
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className={styles.gameweeksList}>
                {filteredHistory.map((gameweek) => (
                  <Card key={gameweek.gameweek} className={styles.gameweekCard}>
                    <CardContent>
                      <Box className={styles.gameweekHeader}>
                        <Box className={styles.gameweekInfo}>
                          <Typography variant="h6" className={styles.gameweekTitle}>
                            {gameweek.gameweek}. Kolo
                          </Typography>
                          <Box className={styles.gameweekStats}>
                            <Chip
                              label={`${gameweek.totalPoints} poena`}
                              color="primary"
                              className={styles.pointsChip}
                            />
                            <Chip label={`Rang #${gameweek.rank}`} variant="outlined" className={styles.rankChip} />
                            {gameweek.transfers > 0 && (
                              <Chip label={`${gameweek.transfers} transfer`} color="warning" size="small" />
                            )}
                          </Box>
                        </Box>
                        <Box className={styles.captainInfo}>
                          <Typography variant="caption" className={styles.captainLabel}>
                            Kapetan:
                          </Typography>
                          <Typography variant="body2" className={styles.captainName}>
                            {gameweek.captain}
                          </Typography>
                          <Typography variant="caption" className={styles.captainPoints}>
                            {gameweek.captainPoints}p
                          </Typography>
                        </Box>
                      </Box>

                      <TableContainer component={Paper} className={styles.playersTable}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Igrač</TableCell>
                              <TableCell align="center">Poz</TableCell>
                              <TableCell align="center">Tim</TableCell>
                              <TableCell align="center">Poeni</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {gameweek.players.map((player, index) => (
                              <TableRow key={index} className={styles.playerRow}>
                                <TableCell>
                                  <Box className={styles.playerInfo}>
                                    <Avatar className={styles.playerAvatar}>
                                      <Sports />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" className={styles.playerName}>
                                        {player.name}
                                        {player.captain && (
                                          <Chip label="C" size="small" className={styles.captainBadge} />
                                        )}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={player.position}
                                    size="small"
                                    style={{
                                      backgroundColor: getPositionColor(player.position),
                                      color: "white",
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="caption">{player.team}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography
                                    variant="body2"
                                    className={styles.playerPoints}
                                    style={{ color: getPointsColor(player.points) }}
                                  >
                                    {player.points}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={player.played ? "Igrao" : "Nije igrao"}
                                    size="small"
                                    color={player.played ? "success" : "default"}
                                    variant={player.played ? "filled" : "outlined"}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
