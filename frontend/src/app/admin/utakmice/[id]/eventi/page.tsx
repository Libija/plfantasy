"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material"
import { Add, Delete, ArrowBack, Sports, Assessment } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function MatchEventsPage() {
  const params = useParams()
  const matchId = params.id

  const [match] = useState({
    id: 1,
    homeTeam: "Sarajevo",
    awayTeam: "Borac",
    homeLogo: "/placeholder.svg?height=40&width=40",
    awayLogo: "/placeholder.svg?height=40&width=40",
    homeScore: 2,
    awayScore: 1,
    date: "2024-01-15",
    round: 18,
  })

  const [players] = useState({
    sarajevo: [
      { id: 1, name: "Almedin Ziljkić", position: "NAP" },
      { id: 2, name: "Benjamin Tatar", position: "VEZ" },
      { id: 3, name: "Tarik Ramić", position: "ODB" },
      { id: 4, name: "Nikola Čavlina", position: "GOL" },
    ],
    borac: [
      { id: 5, name: "Marko Petković", position: "NAP" },
      { id: 6, name: "Stojan Vranješ", position: "VEZ" },
      { id: 7, name: "Siniša Saničanin", position: "ODB" },
      { id: 8, name: "Marko Maroš", position: "GOL" },
    ],
  })

  const [events, setEvents] = useState([
    {
      id: 1,
      type: "goal",
      minute: 23,
      player: "Almedin Ziljkić",
      team: "Sarajevo",
      assist: "Benjamin Tatar",
      ownGoal: false,
    },
    {
      id: 2,
      type: "yellow_card",
      minute: 34,
      player: "Stojan Vranješ",
      team: "Borac",
    },
    {
      id: 3,
      type: "goal",
      minute: 67,
      player: "Marko Petković",
      team: "Borac",
      assist: null,
      ownGoal: false,
    },
  ])

  const [eventDialog, setEventDialog] = useState({ open: false, event: null })
  const [statsDialog, setStatsDialog] = useState({ open: false })
  const [playerStats, setPlayerStats] = useState([
    {
      id: 1,
      name: "Almedin Ziljkić",
      team: "Sarajevo",
      position: "NAP",
      goals: 1,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      fantasyPoints: 6,
    },
    {
      id: 2,
      name: "Benjamin Tatar",
      team: "Sarajevo",
      position: "VEZ",
      goals: 0,
      assists: 1,
      yellowCards: 0,
      redCards: 0,
      fantasyPoints: 3,
    },
    {
      id: 5,
      name: "Marko Petković",
      team: "Borac",
      position: "NAP",
      goals: 1,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      fantasyPoints: 6,
    },
    {
      id: 6,
      name: "Stojan Vranješ",
      team: "Borac",
      position: "VEZ",
      goals: 0,
      assists: 0,
      yellowCards: 1,
      redCards: 0,
      fantasyPoints: -1,
    },
  ])

  const eventTypes = [
    { value: "goal", label: "Gol", icon: "⚽" },
    { value: "yellow_card", label: "Žuti karton", icon: "🟨" },
    { value: "red_card", label: "Crveni karton", icon: "🟥" },
    { value: "penalty_saved", label: "Odbranjen penal", icon: "🥅" },
    { value: "clean_sheet", label: "Čist list", icon: "🛡️" },
  ]

  const handleAddEvent = () => {
    setEventDialog({ open: true, event: { type: "", minute: "", player: "", team: "", assist: "", ownGoal: false } })
  }

  const handleSaveEvent = () => {
    if (eventDialog.event.id) {
      setEvents(events.map((event) => (event.id === eventDialog.event.id ? eventDialog.event : event)))
    } else {
      const newEvent = { ...eventDialog.event, id: Date.now() }
      setEvents([...events, newEvent])
    }
    setEventDialog({ open: false, event: null })
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const handleUpdateStats = () => {
    setStatsDialog({ open: true })
  }

  const handleSaveStats = () => {
    console.log("Saving updated stats:", playerStats)
    setStatsDialog({ open: false })
  }

  const updatePlayerStat = (playerId: number, field: string, value: number) => {
    setPlayerStats(playerStats.map((player) => (player.id === playerId ? { ...player, [field]: value } : player)))
  }

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find((et) => et.value === type)
    return eventType ? eventType.icon : "📝"
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "goal":
        return "#4caf50"
      case "yellow_card":
        return "#ff9800"
      case "red_card":
        return "#f44336"
      case "penalty_saved":
        return "#2196f3"
      case "clean_sheet":
        return "#9c27b0"
      default:
        return "#757575"
    }
  }

  const calculateFantasyPoints = () => {
    console.log("Calculating fantasy points...")
    // Recalculate fantasy points based on events
    const updatedStats = playerStats.map((player) => {
      let points = 2 // Base points for playing
      points += player.goals * 4 // 4 points per goal
      points += player.assists * 3 // 3 points per assist
      points -= player.yellowCards * 1 // -1 point per yellow card
      points -= player.redCards * 3 // -3 points per red card
      return { ...player, fantasyPoints: points }
    })
    setPlayerStats(updatedStats)
  }

  const allPlayers = [...players.sarajevo, ...players.borac]

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Button component={Link} href="/admin/utakmice" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na utakmice
        </Button>
        <Typography variant="h4" className={styles.pageTitle}>
          Match Events
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card className={styles.matchCard}>
            <CardContent>
              <Box className={styles.matchHeader}>
                <Box className={styles.teamInfo}>
                  <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                  <Typography variant="h6">{match.homeTeam}</Typography>
                </Box>
                <Box className={styles.scoreInfo}>
                  <Typography variant="h4" className={styles.score}>
                    {match.homeScore} - {match.awayScore}
                  </Typography>
                  <Typography variant="body2">{match.round}. kolo</Typography>
                </Box>
                <Box className={styles.teamInfo}>
                  <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                  <Typography variant="h6">{match.awayTeam}</Typography>
                </Box>
              </Box>

              <Box className={styles.eventsSection}>
                <Box className={styles.eventsHeader}>
                  <Typography variant="h6" className={styles.sectionTitle}>
                    Eventi Utakmice
                  </Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={handleAddEvent} className={styles.addBtn}>
                    Dodaj Event
                  </Button>
                </Box>

                <List className={styles.eventsList}>
                  {events
                    .sort((a, b) => a.minute - b.minute)
                    .map((event) => (
                      <ListItem key={event.id} className={styles.eventItem}>
                        <Box className={styles.eventContent}>
                          <Box className={styles.eventIcon} style={{ backgroundColor: getEventColor(event.type) }}>
                            {getEventIcon(event.type)}
                          </Box>
                          <Box className={styles.eventDetails}>
                            <Typography variant="body1" className={styles.eventText}>
                              {event.minute}' - {event.player} ({event.team})
                            </Typography>
                            <Typography variant="body2" className={styles.eventType}>
                              {eventTypes.find((et) => et.value === event.type)?.label}
                              {event.assist && ` - Asist: ${event.assist}`}
                              {event.ownGoal && " (Autogol)"}
                            </Typography>
                          </Box>
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(event.id)}
                            className={styles.deleteBtn}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </List>

                {events.length === 0 && (
                  <Box className={styles.noEvents}>
                    <Typography variant="body1" color="textSecondary">
                      Nema unesenih evenata za ovu utakmicu
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card className={styles.actionsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Akcije
              </Typography>
              <Box className={styles.actionButtons}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Sports />}
                  onClick={calculateFantasyPoints}
                  className={styles.actionBtn}
                >
                  Izračunaj Fantasy Poene
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={handleUpdateStats}
                  className={styles.actionBtn}
                  style={{ backgroundColor: "#ff9800" }}
                >
                  Ažuriraj Statistike
                </Button>
                <Button variant="outlined" fullWidth className={styles.actionBtn}>
                  Generiraj Izvještaj
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card className={styles.statsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Statistike Utakmice
              </Typography>
              <Box className={styles.statsList}>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Ukupno golova:</Typography>
                  <Typography variant="h6">{events.filter((e) => e.type === "goal").length}</Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Žuti kartoni:</Typography>
                  <Typography variant="h6">{events.filter((e) => e.type === "yellow_card").length}</Typography>
                </Box>
                <Box className={styles.statItem}>
                  <Typography variant="body2">Crveni kartoni:</Typography>
                  <Typography variant="h6">{events.filter((e) => e.type === "red_card").length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Dialog */}
      <Dialog
        open={eventDialog.open}
        onClose={() => setEventDialog({ open: false, event: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dodaj/Uredi Event</DialogTitle>
        <DialogContent>
          <Box className={styles.formFields}>
            <FormControl fullWidth>
              <InputLabel>Tip eventa</InputLabel>
              <Select
                value={eventDialog.event?.type || ""}
                label="Tip eventa"
                onChange={(e) =>
                  setEventDialog({ ...eventDialog, event: { ...eventDialog.event, type: e.target.value } })
                }
              >
                {eventTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Minuta"
              type="number"
              fullWidth
              value={eventDialog.event?.minute || ""}
              onChange={(e) =>
                setEventDialog({
                  ...eventDialog,
                  event: { ...eventDialog.event, minute: Number.parseInt(e.target.value) },
                })
              }
              inputProps={{ min: 1, max: 120 }}
            />

            <FormControl fullWidth>
              <InputLabel>Igrač</InputLabel>
              <Select
                value={eventDialog.event?.player || ""}
                label="Igrač"
                onChange={(e) => {
                  const selectedPlayer = allPlayers.find((p) => p.name === e.target.value)
                  const team = players.sarajevo.find((p) => p.name === e.target.value) ? "Sarajevo" : "Borac"
                  setEventDialog({
                    ...eventDialog,
                    event: { ...eventDialog.event, player: e.target.value, team },
                  })
                }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2" color="primary">
                    Sarajevo
                  </Typography>
                </MenuItem>
                {players.sarajevo.map((player) => (
                  <MenuItem key={player.id} value={player.name}>
                    {player.name} ({player.position})
                  </MenuItem>
                ))}
                <MenuItem disabled>
                  <Typography variant="subtitle2" color="primary">
                    Borac
                  </Typography>
                </MenuItem>
                {players.borac.map((player) => (
                  <MenuItem key={player.id} value={player.name}>
                    {player.name} ({player.position})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {eventDialog.event?.type === "goal" && (
              <FormControl fullWidth>
                <InputLabel>Asistencija (opcionalno)</InputLabel>
                <Select
                  value={eventDialog.event?.assist || ""}
                  label="Asistencija"
                  onChange={(e) =>
                    setEventDialog({ ...eventDialog, event: { ...eventDialog.event, assist: e.target.value } })
                  }
                >
                  <MenuItem value="">Bez asistencije</MenuItem>
                  {allPlayers
                    .filter((p) => p.name !== eventDialog.event?.player)
                    .map((player) => (
                      <MenuItem key={player.id} value={player.name}>
                        {player.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog({ open: false, event: null })}>Otkaži</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialog.open} onClose={() => setStatsDialog({ open: false })} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box className={styles.dialogHeader}>
            <Typography variant="h6">Ažuriraj Statistike Igrača</Typography>
            <Typography variant="body2" color="textSecondary">
              Ručno ažuriraj statistike za preciznije Fantasy poene
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} className={styles.statsTable}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Igrač</TableCell>
                  <TableCell>Tim</TableCell>
                  <TableCell>Pozicija</TableCell>
                  <TableCell align="center">Golovi</TableCell>
                  <TableCell align="center">Asistencije</TableCell>
                  <TableCell align="center">Žuti</TableCell>
                  <TableCell align="center">Crveni</TableCell>
                  <TableCell align="center">Fantasy Poeni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerStats.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {player.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={player.goals}
                        onChange={(e) => updatePlayerStat(player.id, "goals", Number.parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 10, style: { textAlign: "center" } }}
                        className={styles.statInput}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={player.assists}
                        onChange={(e) => updatePlayerStat(player.id, "assists", Number.parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 10, style: { textAlign: "center" } }}
                        className={styles.statInput}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={player.yellowCards}
                        onChange={(e) =>
                          updatePlayerStat(player.id, "yellowCards", Number.parseInt(e.target.value) || 0)
                        }
                        inputProps={{ min: 0, max: 2, style: { textAlign: "center" } }}
                        className={styles.statInput}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={player.redCards}
                        onChange={(e) => updatePlayerStat(player.id, "redCards", Number.parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0, max: 1, style: { textAlign: "center" } }}
                        className={styles.statInput}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color={player.fantasyPoints >= 0 ? "success.main" : "error.main"}
                      >
                        {player.fantasyPoints}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog({ open: false })}>Otkaži</Button>
          <Button onClick={handleSaveStats} variant="contained">
            Sačuvaj Statistike
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
