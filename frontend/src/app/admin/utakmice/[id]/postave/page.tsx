"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material"
import { Save, ArrowBack, Add, Delete } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function MatchLineupsPage() {
  const params = useParams()
  const matchId = params.id

  const [match] = useState({
    id: 1,
    homeTeam: "Sarajevo",
    awayTeam: "Željezničar",
    homeLogo: "/placeholder.svg?height=60&width=60",
    awayLogo: "/placeholder.svg?height=60&width=60",
    date: "2024-01-20",
    time: "15:00",
    round: 19,
  })

  const [formations] = useState(["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-5-1", "3-4-3"])

  const [homeFormation, setHomeFormation] = useState("4-3-3")
  const [awayFormation, setAwayFormation] = useState("4-2-3-1")

  const [homeLineup, setHomeLineup] = useState({
    goalkeeper: null,
    defenders: [],
    midfielders: [],
    forwards: [],
  })

  const [awayLineup, setAwayLineup] = useState({
    goalkeeper: null,
    defenders: [],
    midfielders: [],
    forwards: [],
  })

  const [playerDialog, setPlayerDialog] = useState({
    open: false,
    team: "",
    position: "",
    positionIndex: null,
  })

  // Mock players data
  const homePlayers = [
    { id: 1, name: "Vladan Kovačević", number: 1, position: "GK" },
    { id: 2, name: "Tarik Ramić", number: 2, position: "DEF" },
    { id: 3, name: "Anel Šabanagić", number: 5, position: "DEF" },
    { id: 4, name: "Krste Velkoski", number: 6, position: "DEF" },
    { id: 5, name: "Amar Rahmanović", number: 3, position: "DEF" },
    { id: 6, name: "Miralem Pjanić", number: 10, position: "MID" },
    { id: 7, name: "Benjamin Tatar", number: 8, position: "MID" },
    { id: 8, name: "Dal Varesanović", number: 14, position: "MID" },
    { id: 9, name: "Edin Džeko", number: 9, position: "FWD" },
    { id: 10, name: "Mirza Mustafić", number: 11, position: "FWD" },
    { id: 11, name: "Andrej Đokanović", number: 7, position: "FWD" },
  ]

  const awayPlayers = [
    { id: 12, name: "Kenan Pirić", number: 12, position: "GK" },
    { id: 13, name: "Slobodan Simović", number: 4, position: "DEF" },
    { id: 14, name: "Nemanja Bilbija", number: 15, position: "DEF" },
    { id: 15, name: "Dario Canadanović", number: 23, position: "DEF" },
    { id: 16, name: "Matej Rodin", number: 77, position: "DEF" },
    { id: 17, name: "Almedin Ziljkić", number: 6, position: "MID" },
    { id: 18, name: "Petar Mišić", number: 8, position: "MID" },
    { id: 19, name: "Haris Hajradinović", number: 10, position: "MID" },
    { id: 20, name: "Nemanja Tekijaški", number: 7, position: "FWD" },
    { id: 21, name: "Mihlali Mayambela", number: 11, position: "FWD" },
    { id: 22, name: "Ante Rebić", number: 9, position: "FWD" },
  ]

  const getFormationPositions = (formation: string) => {
    const formations = {
      "4-4-2": { defenders: 4, midfielders: 4, forwards: 2 },
      "4-3-3": { defenders: 4, midfielders: 3, forwards: 3 },
      "4-2-3-1": { defenders: 4, midfielders: 5, forwards: 1 },
      "3-5-2": { defenders: 3, midfielders: 5, forwards: 2 },
      "5-3-2": { defenders: 5, midfielders: 3, forwards: 2 },
      "4-5-1": { defenders: 4, midfielders: 5, forwards: 1 },
      "3-4-3": { defenders: 3, midfielders: 4, forwards: 3 },
    }
    return formations[formation] || { defenders: 4, midfielders: 3, forwards: 3 }
  }

  const openPlayerDialog = (team: string, position: string, index: number = null) => {
    setPlayerDialog({
      open: true,
      team,
      position,
      positionIndex: index,
    })
  }

  const selectPlayer = (player: any) => {
    const { team, position, positionIndex } = playerDialog

    if (team === "home") {
      const newLineup = { ...homeLineup }
      if (position === "goalkeeper") {
        newLineup.goalkeeper = player
      } else {
        if (positionIndex !== null) {
          newLineup[position][positionIndex] = player
        } else {
          newLineup[position].push(player)
        }
      }
      setHomeLineup(newLineup)
    } else {
      const newLineup = { ...awayLineup }
      if (position === "goalkeeper") {
        newLineup.goalkeeper = player
      } else {
        if (positionIndex !== null) {
          newLineup[position][positionIndex] = player
        } else {
          newLineup[position].push(player)
        }
      }
      setAwayLineup(newLineup)
    }

    setPlayerDialog({ open: false, team: "", position: "", positionIndex: null })
  }

  const removePlayer = (team: string, position: string, index: number = null) => {
    if (team === "home") {
      const newLineup = { ...homeLineup }
      if (position === "goalkeeper") {
        newLineup.goalkeeper = null
      } else {
        newLineup[position].splice(index, 1)
      }
      setHomeLineup(newLineup)
    } else {
      const newLineup = { ...awayLineup }
      if (position === "goalkeeper") {
        newLineup.goalkeeper = null
      } else {
        newLineup[position].splice(index, 1)
      }
      setAwayLineup(newLineup)
    }
  }

  const getAvailablePlayers = () => {
    const { team, position } = playerDialog
    const players = team === "home" ? homePlayers : awayPlayers

    if (position === "goalkeeper") {
      return players.filter((p) => p.position === "GK")
    } else if (position === "defenders") {
      return players.filter((p) => p.position === "DEF")
    } else if (position === "midfielders") {
      return players.filter((p) => p.position === "MID")
    } else if (position === "forwards") {
      return players.filter((p) => p.position === "FWD")
    }
    return players
  }

  const saveLineups = () => {
    console.log("Saving lineups:", { homeLineup, awayLineup, homeFormation, awayFormation })
    // Logic to save lineups
  }

  const renderPositionSlots = (team: string, position: string, lineup: any, formation: string) => {
    const positions = getFormationPositions(formation)
    const slots = []

    if (position === "goalkeeper") {
      slots.push(
        <Box key="gk" className={styles.playerSlot}>
          {lineup.goalkeeper ? (
            <Box className={styles.selectedPlayer}>
              <Typography variant="body2">
                {lineup.goalkeeper.number}. {lineup.goalkeeper.name}
              </Typography>
              <IconButton size="small" onClick={() => removePlayer(team, "goalkeeper")} className={styles.removeBtn}>
                <Delete />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              onClick={() => openPlayerDialog(team, "goalkeeper")}
              className={styles.addPlayerBtn}
            >
              <Add /> Dodaj Golmana
            </Button>
          )}
        </Box>,
      )
    } else {
      const count = positions[position]
      const currentPlayers = lineup[position] || []

      for (let i = 0; i < count; i++) {
        slots.push(
          <Box key={i} className={styles.playerSlot}>
            {currentPlayers[i] ? (
              <Box className={styles.selectedPlayer}>
                <Typography variant="body2">
                  {currentPlayers[i].number}. {currentPlayers[i].name}
                </Typography>
                <IconButton size="small" onClick={() => removePlayer(team, position, i)} className={styles.removeBtn}>
                  <Delete />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => openPlayerDialog(team, position, i)}
                className={styles.addPlayerBtn}
              >
                <Add /> Dodaj
              </Button>
            )}
          </Box>,
        )
      }
    }

    return slots
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Button component={Link} href="/admin/utakmice" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na utakmice
        </Button>
        <Typography variant="h4" className={styles.pageTitle}>
          Početne Postave
        </Typography>
        <Button variant="contained" startIcon={<Save />} onClick={saveLineups} className={styles.saveBtn}>
          Sačuvaj Postave
        </Button>
      </Box>

      <Card className={styles.matchCard}>
        <CardContent>
          <Box className={styles.matchInfo}>
            <Typography variant="h6">
              {match.homeTeam} vs {match.awayTeam}
            </Typography>
            <Typography variant="body2">
              {match.round}. Kolo - {new Date(match.date).toLocaleDateString("bs-BA")} {match.time}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={styles.teamCard}>
            <CardContent>
              <Box className={styles.teamHeader}>
                <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                <Typography variant="h6">{match.homeTeam}</Typography>
                <FormControl size="small" className={styles.formationSelect}>
                  <InputLabel>Formacija</InputLabel>
                  <Select value={homeFormation} onChange={(e) => setHomeFormation(e.target.value)} label="Formacija">
                    {formations.map((formation) => (
                      <MenuItem key={formation} value={formation}>
                        {formation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className={styles.lineupBuilder}>
                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Golman
                  </Typography>
                  {renderPositionSlots("home", "goalkeeper", homeLineup, homeFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Odbrana
                  </Typography>
                  {renderPositionSlots("home", "defenders", homeLineup, homeFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Vezni red
                  </Typography>
                  {renderPositionSlots("home", "midfielders", homeLineup, homeFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Napad
                  </Typography>
                  {renderPositionSlots("home", "forwards", homeLineup, homeFormation)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.teamCard}>
            <CardContent>
              <Box className={styles.teamHeader}>
                <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                <Typography variant="h6">{match.awayTeam}</Typography>
                <FormControl size="small" className={styles.formationSelect}>
                  <InputLabel>Formacija</InputLabel>
                  <Select value={awayFormation} onChange={(e) => setAwayFormation(e.target.value)} label="Formacija">
                    {formations.map((formation) => (
                      <MenuItem key={formation} value={formation}>
                        {formation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className={styles.lineupBuilder}>
                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Golman
                  </Typography>
                  {renderPositionSlots("away", "goalkeeper", awayLineup, awayFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Odbrana
                  </Typography>
                  {renderPositionSlots("away", "defenders", awayLineup, awayFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Vezni red
                  </Typography>
                  {renderPositionSlots("away", "midfielders", awayLineup, awayFormation)}
                </Box>

                <Box className={styles.positionGroup}>
                  <Typography variant="subtitle2" className={styles.positionTitle}>
                    Napad
                  </Typography>
                  {renderPositionSlots("away", "forwards", awayLineup, awayFormation)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Player Selection Dialog */}
      <Dialog
        open={playerDialog.open}
        onClose={() => setPlayerDialog({ open: false, team: "", position: "", positionIndex: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Izaberi Igrača -{" "}
          {playerDialog.position === "goalkeeper"
            ? "Golman"
            : playerDialog.position === "defenders"
              ? "Odbrana"
              : playerDialog.position === "midfielders"
                ? "Vezni red"
                : "Napad"}
        </DialogTitle>
        <DialogContent>
          <List>
            {getAvailablePlayers().map((player) => (
              <ListItem key={player.id} button onClick={() => selectPlayer(player)} className={styles.playerListItem}>
                <ListItemAvatar>
                  <Chip label={player.number} size="small" color="primary" />
                </ListItemAvatar>
                <ListItemText primary={player.name} secondary={`Pozicija: ${player.position}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerDialog({ open: false, team: "", position: "", positionIndex: null })}>
            Otkaži
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
