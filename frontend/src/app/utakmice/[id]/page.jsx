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
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material"
import { ArrowBack, Schedule, Stadium, Sports, Timeline, BarChart, History } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function MatchDetailPage() {
  const params = useParams()
  const id = params.id
  const [activeTab, setActiveTab] = useState(0)

  // Mock data - u stvarnosti bi se dohvatilo iz API-ja
  const match = {
    id: 1,
    homeTeam: "Sarajevo",
    awayTeam: "Željezničar",
    homeLogo: "/placeholder.svg?height=60&width=60",
    awayLogo: "/placeholder.svg?height=60&width=60",
    homeScore: 2,
    awayScore: 1,
    date: "2024-01-15",
    time: "15:00",
    round: 18,
    venue: "Stadion Grbavica",
    status: "Završeno",
    attendance: 12500,
    referee: "Miloš Gigović",
  }

  const matchEvents = [
    {
      minute: 12,
      type: "goal",
      team: "home",
      player: "Almedin Ziljkić",
      description: "Gol iz slobodnog udarca",
    },
    {
      minute: 25,
      type: "yellow",
      team: "away",
      player: "Miloš Filipović",
      description: "Žuti karton za prekršaj",
    },
    {
      minute: 34,
      type: "goal",
      team: "away",
      player: "Kenan Pirić",
      description: "Gol iz penala",
    },
    {
      minute: 67,
      type: "goal",
      team: "home",
      player: "Mirza Mustafić",
      description: "Gol iz kontrapada",
    },
    {
      minute: 78,
      type: "substitution",
      team: "home",
      player: "Benjamin Tatar",
      playerOut: "Almedin Ziljkić",
      description: "Izmjena",
    },
    {
      minute: 85,
      type: "yellow",
      team: "away",
      player: "Dino Hotić",
      description: "Žuti karton za simuliranje",
    },
  ]

  const homeLineup = {
    formation: "4-3-3",
    players: [
      { number: 1, name: "Vladan Kovačević", position: "GK" },
      { number: 2, name: "Tarik Ramić", position: "RB" },
      { number: 5, name: "Anel Hebibović", position: "CB" },
      { number: 4, name: "Amar Rahmanović", position: "CB" },
      { number: 3, name: "Eldar Civic", position: "LB" },
      { number: 6, name: "Dal Varesanovic", position: "CDM" },
      { number: 8, name: "Benjamin Tatar", position: "CM" },
      { number: 10, name: "Almedin Ziljkić", position: "CAM" },
      { number: 7, name: "Mirza Mustafić", position: "RW" },
      { number: 9, name: "Andrej Đokanović", position: "ST" },
      { number: 11, name: "Krste Velkoski", position: "LW" },
    ],
    substitutes: [
      { number: 12, name: "Emir Hadžić", position: "GK" },
      { number: 13, name: "Hamza Čataković", position: "DF" },
      { number: 14, name: "Haris Handzic", position: "MF" },
      { number: 15, name: "Renan Abner", position: "FW" },
    ],
  }

  const awayLineup = {
    formation: "4-2-3-1",
    players: [
      { number: 1, name: "Irfan Fejzić", position: "GK" },
      { number: 2, name: "Slobodan Simović", position: "RB" },
      { number: 5, name: "Vedran Kjosevski", position: "CB" },
      { number: 4, name: "Damir Zlomislić", position: "CB" },
      { number: 3, name: "Semir Štilić", position: "LB" },
      { number: 6, name: "Miloš Filipović", position: "CDM" },
      { number: 8, name: "Dino Hotić", position: "CDM" },
      { number: 7, name: "Nemanja Tekijaški", position: "RW" },
      { number: 10, name: "Kenan Pirić", position: "CAM" },
      { number: 11, name: "Petar Mišić", position: "LW" },
      { number: 9, name: "Ivan Lendrić", position: "ST" },
    ],
    substitutes: [
      { number: 12, name: "Marko Popović", position: "GK" },
      { number: 13, name: "Nermin Haskić", position: "DF" },
      { number: 14, name: "Ajdin Hasić", position: "MF" },
      { number: 15, name: "Luka Menalo", position: "FW" },
    ],
  }

  const matchStats = {
    possession: { home: 58, away: 42 },
    shots: { home: 14, away: 8 },
    shotsOnTarget: { home: 6, away: 3 },
    corners: { home: 7, away: 4 },
    fouls: { home: 12, away: 18 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
    passes: { home: 487, away: 352 },
    passAccuracy: { home: 84, away: 78 },
    offsides: { home: 3, away: 5 },
  }

  const headToHead = [
    {
      date: "2023-09-15",
      homeTeam: "Željezničar",
      awayTeam: "Sarajevo",
      homeScore: 1,
      awayScore: 2,
      competition: "Premier Liga",
    },
    {
      date: "2023-04-22",
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      homeScore: 0,
      awayScore: 0,
      competition: "Premier Liga",
    },
    {
      date: "2022-11-06",
      homeTeam: "Željezničar",
      awayTeam: "Sarajevo",
      homeScore: 2,
      awayScore: 3,
      competition: "Premier Liga",
    },
    {
      date: "2022-05-14",
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      homeScore: 1,
      awayScore: 1,
      competition: "Premier Liga",
    },
    {
      date: "2021-12-11",
      homeTeam: "Željezničar",
      awayTeam: "Sarajevo",
      homeScore: 0,
      awayScore: 2,
      competition: "Premier Liga",
    },
  ]

  const getEventIcon = (type) => {
    switch (type) {
      case "goal":
        return "⚽"
      case "yellow":
        return "🟨"
      case "red":
        return "🟥"
      case "substitution":
        return "🔄"
      default:
        return "📝"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bs-BA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.backButton}>
        <Button component={Link} href="/utakmice" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na utakmice
        </Button>
      </Box>

      {/* Match Header */}
      <Card className={styles.matchHeader}>
        <CardContent>
          <Box className={styles.matchInfo}>
            <Box className={styles.matchDetails}>
              <Chip icon={<Schedule fontSize="small" />} label={`${match.round}. kolo`} className={styles.roundChip} />
              <Typography variant="h6" className={styles.matchDate}>
                {formatDate(match.date)} • {match.time}
              </Typography>
              <Box className={styles.venueInfo}>
                <Stadium fontSize="small" />
                <Typography variant="body2">{match.venue}</Typography>
              </Box>
            </Box>

            <Box className={styles.teamsContainer}>
              <Box className={styles.team}>
                <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                <Typography variant="h5" className={styles.teamName}>
                  {match.homeTeam}
                </Typography>
              </Box>

              <Box className={styles.scoreContainer}>
                <Typography variant="h2" className={styles.score}>
                  {match.homeScore} - {match.awayScore}
                </Typography>
                <Chip label={match.status} color="success" className={styles.statusChip} />
              </Box>

              <Box className={styles.team}>
                <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                <Typography variant="h5" className={styles.teamName}>
                  {match.awayTeam}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.matchMeta}>
              <Typography variant="body2">Gledalaca: {match.attendance?.toLocaleString()}</Typography>
              <Typography variant="body2">Sudija: {match.referee}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box className={styles.tabsContainer}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} className={styles.tabs}>
          <Tab icon={<Timeline />} label="Pregled" />
          <Tab icon={<Sports />} label="Postave" />
          <Tab icon={<BarChart />} label="Statistike" />
          <Tab icon={<History />} label="Head to Head" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card className={styles.contentCard}>
          <CardContent>
            <Typography variant="h6" className={styles.sectionTitle}>
              Tok Utakmice
            </Typography>
            <List className={styles.eventsList}>
              {matchEvents.map((event, index) => (
                <ListItem key={index} className={styles.eventItem}>
                  <Box className={styles.eventTime}>
                    <Typography variant="body2" className={styles.minute}>
                      {event.minute}'
                    </Typography>
                  </Box>
                  <Box className={styles.eventIcon}>{getEventIcon(event.type)}</Box>
                  <Box
                    className={`${styles.eventContent} ${event.team === "home" ? styles.homeEvent : styles.awayEvent}`}
                  >
                    <Typography variant="body1" className={styles.eventPlayer}>
                      {event.player}
                      {event.playerOut && ` ↔ ${event.playerOut}`}
                    </Typography>
                    <Typography variant="body2" className={styles.eventDescription}>
                      {event.description}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={styles.lineupCard}>
              <CardContent>
                <Box className={styles.lineupHeader}>
                  <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.lineupLogo} />
                  <Typography variant="h6">{match.homeTeam}</Typography>
                  <Chip label={homeLineup.formation} size="small" />
                </Box>
                <Typography variant="subtitle2" className={styles.lineupTitle}>
                  Početna postava
                </Typography>
                <List className={styles.playersList}>
                  {homeLineup.players.map((player) => (
                    <ListItem key={player.number} className={styles.playerItem}>
                      <Box className={styles.playerNumber}>{player.number}</Box>
                      <ListItemText primary={player.name} secondary={player.position} className={styles.playerText} />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="subtitle2" className={styles.lineupTitle}>
                  Rezerve
                </Typography>
                <List className={styles.playersList}>
                  {homeLineup.substitutes.map((player) => (
                    <ListItem key={player.number} className={styles.substituteItem}>
                      <Box className={styles.playerNumber}>{player.number}</Box>
                      <ListItemText primary={player.name} secondary={player.position} className={styles.playerText} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={styles.lineupCard}>
              <CardContent>
                <Box className={styles.lineupHeader}>
                  <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.lineupLogo} />
                  <Typography variant="h6">{match.awayTeam}</Typography>
                  <Chip label={awayLineup.formation} size="small" />
                </Box>
                <Typography variant="subtitle2" className={styles.lineupTitle}>
                  Početna postava
                </Typography>
                <List className={styles.playersList}>
                  {awayLineup.players.map((player) => (
                    <ListItem key={player.number} className={styles.playerItem}>
                      <Box className={styles.playerNumber}>{player.number}</Box>
                      <ListItemText primary={player.name} secondary={player.position} className={styles.playerText} />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="subtitle2" className={styles.lineupTitle}>
                  Rezerve
                </Typography>
                <List className={styles.playersList}>
                  {awayLineup.substitutes.map((player) => (
                    <ListItem key={player.number} className={styles.substituteItem}>
                      <Box className={styles.playerNumber}>{player.number}</Box>
                      <ListItemText primary={player.name} secondary={player.position} className={styles.playerText} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography variant="h6" className={styles.sectionTitle}>
              Statistike Utakmice
            </Typography>
            <Box className={styles.statsContainer}>
              {Object.entries(matchStats).map(([key, value]) => {
                const statName = {
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
                }[key]

                return (
                  <Box key={key} className={styles.statRow}>
                    <Box className={styles.statValue}>{value.home}</Box>
                    <Box className={styles.statInfo}>
                      <Typography variant="body2" className={styles.statName}>
                        {statName}
                      </Typography>
                      {(key === "possession" || key === "passAccuracy") && (
                        <LinearProgress variant="determinate" value={value.home} className={styles.statBar} />
                      )}
                    </Box>
                    <Box className={styles.statValue}>{value.away}</Box>
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card className={styles.headToHeadCard}>
          <CardContent>
            <Typography variant="h6" className={styles.sectionTitle}>
              Međusobni Rezultati (Zadnjih 5 utakmica)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Domaći</TableCell>
                    <TableCell align="center">Rezultat</TableCell>
                    <TableCell>Gostujući</TableCell>
                    <TableCell>Takmičenje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {headToHead.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(match.date).toLocaleDateString("bs-BA")}</TableCell>
                      <TableCell>{match.homeTeam}</TableCell>
                      <TableCell align="center" className={styles.h2hScore}>
                        {match.homeScore} - {match.awayScore}
                      </TableCell>
                      <TableCell>{match.awayTeam}</TableCell>
                      <TableCell>
                        <Chip label={match.competition} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
