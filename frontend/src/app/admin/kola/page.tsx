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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  List,
  ListItem,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Add, Sports, CalendarToday, Stadium } from "@mui/icons-material"
import styles from "./page.module.css"

export default function RoundsPage() {
  const [openRoundDialog, setOpenRoundDialog] = useState(false)
  const [openMatchDialog, setOpenMatchDialog] = useState(false)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  const [newRound, setNewRound] = useState({
    number: "",
    startDate: "",
    endDate: "",
  })

  const [newMatch, setNewMatch] = useState({
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    venue: "",
    round: "",
  })

  const [rounds] = useState([
    {
      id: 1,
      number: 19,
      startDate: "2024-01-15",
      endDate: "2024-01-21",
      status: "Aktivno",
      matchesCount: 8,
    },
    {
      id: 2,
      number: 20,
      startDate: "2024-01-22",
      endDate: "2024-01-28",
      status: "Nadolazeće",
      matchesCount: 8,
    },
  ])

  const [upcomingMatches] = useState([
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Borac",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-20",
      time: "15:00",
      venue: "Stadion Grbavica",
      round: 19,
      status: "Zakazano",
    },
    {
      id: 2,
      homeTeam: "Željezničar",
      awayTeam: "Zrinjski",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-20",
      time: "17:00",
      venue: "Stadion Grbavica",
      round: 19,
      status: "Zakazano",
    },
    {
      id: 3,
      homeTeam: "Velež",
      awayTeam: "Sloboda",
      homeLogo: "/placeholder.svg?height=40&width=40",
      awayLogo: "/placeholder.svg?height=40&width=40",
      date: "2024-01-21",
      time: "14:00",
      venue: "Stadion Rođeni",
      round: 19,
      status: "Zakazano",
    },
  ])

  const teams = [
    "Sarajevo",
    "Željezničar",
    "Borac",
    "Zrinjski",
    "Velež",
    "Sloboda",
    "Široki Brijeg",
    "Posušje",
    "Radnik",
    "Igman",
  ]

  const venues = [
    "Stadion Grbavica",
    "Stadion Rođeni",
    "Stadion pod Bijelim Brijegom",
    "Stadion Pecara",
    "Stadion Luke",
    "Stadion Tušanj",
  ]

  const handleCreateRound = () => {
    console.log("Creating round:", newRound)
    setOpenRoundDialog(false)
    setNewRound({ number: "", startDate: "", endDate: "" })
  }

  const handleCreateMatch = () => {
    console.log("Creating match:", newMatch)
    setOpenMatchDialog(false)
    setNewMatch({ homeTeam: "", awayTeam: "", date: "", time: "", venue: "", round: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktivno":
        return "success"
      case "Nadolazeće":
        return "primary"
      case "Završeno":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Upravljanje Kolima i Utakmicama
        </Typography>
        <Box className={styles.headerActions}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenRoundDialog(true)}
            className={styles.primaryBtn}
          >
            Novo Kolo
          </Button>
          <Button
            variant="outlined"
            startIcon={<Sports />}
            onClick={() => setOpenMatchDialog(true)}
            className={styles.secondaryBtn}
          >
            Nova Utakmica
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={styles.sectionCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Kola Prvenstva
              </Typography>
              <List className={styles.roundsList}>
                {rounds.map((round) => (
                  <ListItem key={round.id} className={styles.roundItem}>
                    <Box className={styles.roundContent}>
                      <Box className={styles.roundHeader}>
                        <Typography variant="h6" className={styles.roundNumber}>
                          {round.number}. Kolo
                        </Typography>
                        <Chip label={round.status} color={getStatusColor(round.status) as any} size="small" />
                      </Box>
                      <Typography variant="body2" className={styles.roundDates}>
                        {new Date(round.startDate).toLocaleDateString("bs-BA")} -{" "}
                        {new Date(round.endDate).toLocaleDateString("bs-BA")}
                      </Typography>
                      <Typography variant="body2" className={styles.matchesCount}>
                        {round.matchesCount} utakmica
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.sectionCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Nadolazeće Utakmice
              </Typography>
              <List className={styles.matchesList}>
                {upcomingMatches.map((match) => (
                  <ListItem key={match.id} className={styles.matchItem}>
                    <Box className={styles.matchContent}>
                      <Box className={styles.matchHeader}>
                        <Typography variant="body2" className={styles.matchRound}>
                          {match.round}. Kolo
                        </Typography>
                        <Chip label={match.status} color="primary" size="small" />
                      </Box>

                      <Box className={styles.matchTeams}>
                        <Box className={styles.team}>
                          <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                          <Typography variant="body1" className={styles.teamName}>
                            {match.homeTeam}
                          </Typography>
                        </Box>

                        <Typography variant="h6" className={styles.vs}>
                          VS
                        </Typography>

                        <Box className={styles.team}>
                          <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                          <Typography variant="body1" className={styles.teamName}>
                            {match.awayTeam}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className={styles.matchDetails}>
                        <Box className={styles.matchInfo}>
                          <CalendarToday className={styles.infoIcon} />
                          <Typography variant="body2">
                            {new Date(match.date).toLocaleDateString("bs-BA")} u {match.time}
                          </Typography>
                        </Box>
                        <Box className={styles.matchInfo}>
                          <Stadium className={styles.infoIcon} />
                          <Typography variant="body2">{match.venue}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Round Dialog */}
      <Dialog open={openRoundDialog} onClose={() => setOpenRoundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kreiraj Novo Kolo</DialogTitle>
        <DialogContent>
          <Box className={styles.dialogForm}>
            <TextField
              label="Broj kola"
              type="number"
              value={newRound.number}
              onChange={(e) => setNewRound({ ...newRound, number: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Datum početka"
              type="date"
              value={newRound.startDate}
              onChange={(e) => setNewRound({ ...newRound, startDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Datum završetka"
              type="date"
              value={newRound.endDate}
              onChange={(e) => setNewRound({ ...newRound, endDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoundDialog(false)}>Otkaži</Button>
          <Button onClick={handleCreateRound} variant="contained">
            Kreiraj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Match Dialog */}
      <Dialog open={openMatchDialog} onClose={() => setOpenMatchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kreiraj Novu Utakmicu</DialogTitle>
        <DialogContent>
          <Box className={styles.dialogForm}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Kolo</InputLabel>
              <Select value={newMatch.round} onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}>
                {rounds.map((round) => (
                  <MenuItem key={round.id} value={round.number}>
                    {round.number}. Kolo
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Domaći tim</InputLabel>
              <Select
                value={newMatch.homeTeam}
                onChange={(e) => setNewMatch({ ...newMatch, homeTeam: e.target.value })}
              >
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Gostujući tim</InputLabel>
              <Select
                value={newMatch.awayTeam}
                onChange={(e) => setNewMatch({ ...newMatch, awayTeam: e.target.value })}
              >
                {teams
                  .filter((team) => team !== newMatch.homeTeam)
                  .map((team) => (
                    <MenuItem key={team} value={team}>
                      {team}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Datum"
              type="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Vrijeme"
              type="time"
              value={newMatch.time}
              onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Stadion</InputLabel>
              <Select value={newMatch.venue} onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}>
                {venues.map((venue) => (
                  <MenuItem key={venue} value={venue}>
                    {venue}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMatchDialog(false)}>Otkaži</Button>
          <Button onClick={handleCreateMatch} variant="contained">
            Kreiraj
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
