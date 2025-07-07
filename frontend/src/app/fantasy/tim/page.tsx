"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material"
import { Sports, SwapHoriz, Search } from "@mui/icons-material"
import styles from "./page.module.css"

export default function MyTeamPage() {
  const [formation, setFormation] = useState("4-4-2")
  const [transfersUsed, setTransfersUsed] = useState(1)
  const [budget, setBudget] = useState(2.3)
  const [openTransferModal, setOpenTransferModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState("")
  const [playerToReplace, setPlayerToReplace] = useState(null)
  const [selectedPlayerInfo, setSelectedPlayerInfo] = useState(null)
  const [filterTeam, setFilterTeam] = useState("sve")
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("")
  const [removeMode, setRemoveMode] = useState(false)

  const myTeam = {
    goalkeeper: {
      starter: {
        name: "Nikola Vasilj",
        team: "Zrinjski",
        points: 89,
        price: 5.2,
        avatar: "/placeholder.svg?height=50&width=50",
        form: [6, 8, 7, 9, 5],
        totalGoals: 0,
        cleanSheets: 8,
        saves: 45,
      },
      bench: {
        name: "Marko Maroš",
        team: "Borac",
        points: 45,
        price: 4.0,
        avatar: "/placeholder.svg?height=50&width=50",
        form: [4, 5, 3, 6, 4],
        totalGoals: 0,
        cleanSheets: 4,
        saves: 23,
      },
    },
    defenders: {
      starters: [
        {
          name: "Siniša Saničanin",
          team: "Borac",
          points: 78,
          price: 5.8,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [7, 6, 8, 7, 9],
          totalGoals: 2,
          assists: 1,
          cleanSheets: 6,
        },
        {
          name: "Hrvoje Milićević",
          team: "Zrinjski",
          points: 72,
          price: 5.5,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [6, 7, 5, 8, 6],
          totalGoals: 1,
          assists: 3,
          cleanSheets: 5,
        },
        {
          name: "Tarik Ramić",
          team: "Sarajevo",
          points: 65,
          price: 5.0,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [5, 6, 7, 5, 6],
          totalGoals: 0,
          assists: 2,
          cleanSheets: 4,
        },
        {
          name: "Matej Rodin",
          team: "Zrinjski",
          points: 58,
          price: 4.8,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [4, 5, 6, 5, 7],
          totalGoals: 1,
          assists: 1,
          cleanSheets: 3,
        },
      ],
      bench: [],
    },
    midfielders: {
      starters: [
        {
          name: "Stojan Vranješ",
          team: "Borac",
          points: 128,
          price: 8.2,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [9, 8, 10, 9, 8],
          totalGoals: 4,
          assists: 12,
          cleanSheets: 0,
        },
        {
          name: "Dino Hotić",
          team: "Zrinjski",
          points: 95,
          price: 6.8,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [7, 8, 6, 9, 7],
          totalGoals: 3,
          assists: 10,
          cleanSheets: 0,
        },
        {
          name: "Benjamin Tatar",
          team: "Sarajevo",
          points: 87,
          price: 6.2,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [6, 7, 8, 6, 7],
          totalGoals: 2,
          assists: 9,
          cleanSheets: 0,
        },
        {
          name: "Miloš Filipović",
          team: "Željezničar",
          points: 76,
          price: 5.8,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [5, 6, 7, 6, 8],
          totalGoals: 1,
          assists: 8,
          cleanSheets: 0,
        },
      ],
      bench: [
        {
          name: "Haris Hadžić",
          team: "Velež",
          points: 42,
          price: 4.5,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [4, 5, 3, 6, 4],
          totalGoals: 1,
          assists: 3,
          cleanSheets: 0,
        },
      ],
    },
    forwards: {
      starters: [
        {
          name: "Marko Petković",
          team: "Borac",
          points: 142,
          price: 9.5,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [10, 9, 8, 10, 9],
          totalGoals: 18,
          assists: 3,
          cleanSheets: 0,
        },
        {
          name: "Nemanja Bilbija",
          team: "Zrinjski",
          points: 125,
          price: 8.8,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [8, 9, 7, 8, 9],
          totalGoals: 15,
          assists: 2,
          cleanSheets: 0,
        },
      ],
      bench: [
        {
          name: "Stefan Savić",
          team: "Velež",
          points: 38,
          price: 4.2,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [3, 4, 5, 3, 4],
          totalGoals: 4,
          assists: 1,
          cleanSheets: 0,
        },
        {
          name: "Darko Bodul",
          team: "Tuzla City",
          points: 35,
          price: 4.0,
          avatar: "/placeholder.svg?height=50&width=50",
          form: [3, 4, 3, 5, 3],
          totalGoals: 3,
          assists: 2,
          cleanSheets: 0,
        },
      ],
    },
  }

  const availablePlayers = [
    // Golmani
    {
      name: "Miloš Popović",
      team: "Sarajevo",
      position: "GOL",
      points: 67,
      price: 4.8,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [5, 6, 7, 5, 6],
      totalGoals: 0,
      cleanSheets: 5,
      saves: 32,
    },
    {
      name: "Stefan Đorđević",
      team: "Željezničar",
      position: "GOL",
      points: 58,
      price: 4.2,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [4, 5, 6, 4, 5],
      totalGoals: 0,
      cleanSheets: 3,
      saves: 28,
    },
    // Odbrana
    {
      name: "Petar Mišić",
      team: "Zrinjski",
      position: "ODB",
      points: 71,
      price: 5.2,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [5, 6, 7, 5, 6],
      totalGoals: 1,
      assists: 4,
      cleanSheets: 4,
    },
    {
      name: "Marko Stanić",
      team: "Borac",
      position: "ODB",
      points: 68,
      price: 5.0,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [5, 6, 6, 7, 5],
      totalGoals: 2,
      assists: 2,
      cleanSheets: 5,
    },
    // Vezni red
    {
      name: "Amer Dupovac",
      team: "Borac",
      position: "VEZ",
      points: 82,
      price: 5.8,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [6, 7, 5, 8, 6],
      totalGoals: 3,
      assists: 5,
      cleanSheets: 0,
    },
    {
      name: "Luka Menalo",
      team: "Zrinjski",
      position: "VEZ",
      points: 79,
      price: 5.6,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [6, 6, 7, 6, 7],
      totalGoals: 2,
      assists: 6,
      cleanSheets: 0,
    },
    // Napad
    {
      name: "Almedin Ziljkić",
      team: "Sarajevo",
      position: "NAP",
      points: 98,
      price: 7.2,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [7, 8, 6, 9, 7],
      totalGoals: 12,
      assists: 2,
      cleanSheets: 0,
    },
    {
      name: "Kenan Pirić",
      team: "Željezničar",
      position: "NAP",
      points: 89,
      price: 6.8,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [6, 7, 8, 6, 7],
      totalGoals: 11,
      assists: 1,
      cleanSheets: 0,
    },
    {
      name: "Miloš Nikolić",
      team: "Široki Brijeg",
      position: "NAP",
      points: 76,
      price: 6.2,
      avatar: "/placeholder.svg?height=40&width=40",
      form: [5, 6, 7, 5, 6],
      totalGoals: 8,
      assists: 3,
      cleanSheets: 0,
    },
  ]

  const teams = ["Borac", "Zrinjski", "Sarajevo", "Željezničar", "Velež", "Široki Brijeg", "Tuzla City", "Sloboda"]

  const formations = ["4-4-2", "4-3-3", "3-5-2", "5-3-2", "4-5-1"]

  const handlePlayerClick = (player: any, position: string) => {
    if (removeMode) {
      // Logic za uklanjanje igrača
      handleRemovePlayer(player, position)
    } else {
      setSelectedPlayerInfo(player)
      setPlayerToReplace(player)
      setSelectedPosition(position)
    }
  }

  const handleRemovePlayer = (player: any, position: string) => {
    // Logic za uklanjanje igrača iz tima
    console.log("Removing player:", player.name, "from position:", position)
    setRemoveMode(false)
  }

  const handleTransferClick = () => {
    if (selectedPlayerInfo) {
      // Postavi filter pozicije na osnovu trenutno izabranog igrača
      setPositionFilter(selectedPosition)
    }
    setOpenTransferModal(true)
  }

  const handleTransfer = (newPlayer: any) => {
    // Logic for making transfer
    setOpenTransferModal(false)
    setTransfersUsed(transfersUsed + 1)
  }

  const getPositionFromRole = (role: string) => {
    switch (role) {
      case "golman":
        return "GOL"
      case "odbrana":
        return "ODB"
      case "vezni":
        return "VEZ"
      case "napad":
        return "NAP"
      default:
        return ""
    }
  }

  const filteredPlayers = availablePlayers.filter((player) => {
    const matchesTeam = filterTeam === "sve" || player.team === filterTeam
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !positionFilter || player.position === getPositionFromRole(positionFilter)
    return matchesTeam && matchesSearch && matchesPosition
  })

  const totalPoints = Object.values(myTeam)
    .flat()
    .reduce((sum: number, section: any) => {
      if (section.starter) return sum + section.starter.points
      if (section.starters) return sum + section.starters.reduce((s: number, p: any) => s + p.points, 0)
      return sum
    }, 0)

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Moj Tim
        </Typography>
        <Box className={styles.teamStats}>
          <Chip label={`${totalPoints} poena`} color="primary" className={styles.statChip} />
          <Chip label={`€${budget}m budžet`} color="secondary" className={styles.statChip} />
          <Chip
            label={`${transfersUsed}/3 transfera`}
            color={transfersUsed >= 3 ? "error" : "default"}
            className={styles.statChip}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card className={styles.pitchCard}>
            <CardContent className={styles.pitchContent}>
              <Box className={styles.formationSelector}>
                <FormControl size="small">
                  <InputLabel>Formacija</InputLabel>
                  <Select value={formation} label="Formacija" onChange={(e) => setFormation(e.target.value)}>
                    {formations.map((form) => (
                      <MenuItem key={form} value={form}>
                        {form}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className={styles.pitch}>
                {/* Field lines */}
                <Box className={styles.fieldLines}>
                  <Box className={styles.centerCircle}></Box>
                  <Box className={styles.centerLine}></Box>
                  <Box className={styles.penaltyArea + " " + styles.topPenalty}></Box>
                  <Box className={styles.penaltyArea + " " + styles.bottomPenalty}></Box>
                  <Box className={styles.goalArea + " " + styles.topGoal}></Box>
                  <Box className={styles.goalArea + " " + styles.bottomGoal}></Box>
                </Box>

                {/* Goalkeeper */}
                <Box className={styles.goalkeepers}>
                  <Box
                    className={`${styles.playerCard} ${selectedPlayerInfo?.name === myTeam.goalkeeper.starter.name ? styles.selectedPlayer : ""}`}
                    onClick={() => handlePlayerClick(myTeam.goalkeeper.starter, "golman")}
                  >
                    <Avatar src={myTeam.goalkeeper.starter.avatar} className={styles.playerAvatar}>
                      <Sports />
                    </Avatar>
                    <Typography variant="caption" className={styles.playerName}>
                      {myTeam.goalkeeper.starter.name.split(" ")[1]}
                    </Typography>
                    <Typography variant="caption" className={styles.playerPoints}>
                      {myTeam.goalkeeper.starter.points}p
                    </Typography>
                    <Typography variant="caption" className={styles.playerPrice}>
                      €{myTeam.goalkeeper.starter.price}m
                    </Typography>
                  </Box>
                </Box>

                {/* Defenders */}
                <Box className={styles.defenders}>
                  {myTeam.defenders.starters.map((player, index) => (
                    <Box
                      key={index}
                      className={`${styles.playerCard} ${selectedPlayerInfo?.name === player.name ? styles.selectedPlayer : ""}`}
                      onClick={() => handlePlayerClick(player, "odbrana")}
                    >
                      <Avatar src={player.avatar} className={styles.playerAvatar}>
                        <Sports />
                      </Avatar>
                      <Typography variant="caption" className={styles.playerName}>
                        {player.name.split(" ")[1]}
                      </Typography>
                      <Typography variant="caption" className={styles.playerPoints}>
                        {player.points}p
                      </Typography>
                      <Typography variant="caption" className={styles.playerPrice}>
                        €{player.price}m
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Midfielders */}
                <Box className={styles.midfielders}>
                  {myTeam.midfielders.starters.map((player, index) => (
                    <Box
                      key={index}
                      className={`${styles.playerCard} ${selectedPlayerInfo?.name === player.name ? styles.selectedPlayer : ""}`}
                      onClick={() => handlePlayerClick(player, "vezni")}
                    >
                      <Avatar src={player.avatar} className={styles.playerAvatar}>
                        <Sports />
                      </Avatar>
                      <Typography variant="caption" className={styles.playerName}>
                        {player.name.split(" ")[1]}
                      </Typography>
                      <Typography variant="caption" className={styles.playerPoints}>
                        {player.points}p
                      </Typography>
                      <Typography variant="caption" className={styles.playerPrice}>
                        €{player.price}m
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Forwards */}
                <Box className={styles.forwards}>
                  {myTeam.forwards.starters.map((player, index) => (
                    <Box
                      key={index}
                      className={`${styles.playerCard} ${selectedPlayerInfo?.name === player.name ? styles.selectedPlayer : ""}`}
                      onClick={() => handlePlayerClick(player, "napad")}
                    >
                      <Avatar src={player.avatar} className={styles.playerAvatar}>
                        <Sports />
                      </Avatar>
                      <Typography variant="caption" className={styles.playerName}>
                        {player.name.split(" ")[1]}
                      </Typography>
                      <Typography variant="caption" className={styles.playerPoints}>
                        {player.points}p
                      </Typography>
                      <Typography variant="caption" className={styles.playerPrice}>
                        €{player.price}m
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Bench */}
              <Box className={styles.bench}>
                <Typography variant="h6" className={styles.benchTitle}>
                  Klupa
                </Typography>
                <Box className={styles.benchPlayers}>
                  <Box
                    className={`${styles.benchPlayer} ${selectedPlayerInfo?.name === myTeam.goalkeeper.bench.name ? styles.selectedPlayer : ""}`}
                    onClick={() => handlePlayerClick(myTeam.goalkeeper.bench, "golman")}
                  >
                    <Avatar src={myTeam.goalkeeper.bench.avatar} className={styles.benchAvatar}>
                      <Sports />
                    </Avatar>
                    <Typography variant="caption">{myTeam.goalkeeper.bench.name.split(" ")[1]}</Typography>
                    <Typography variant="caption" className={styles.playerPrice}>
                      €{myTeam.goalkeeper.bench.price}m
                    </Typography>
                  </Box>
                  {myTeam.midfielders.bench.map((player, index) => (
                    <Box
                      key={index}
                      className={`${styles.benchPlayer} ${selectedPlayerInfo?.name === player.name ? styles.selectedPlayer : ""}`}
                      onClick={() => handlePlayerClick(player, "vezni")}
                    >
                      <Avatar src={player.avatar} className={styles.benchAvatar}>
                        <Sports />
                      </Avatar>
                      <Typography variant="caption">{player.name.split(" ")[1]}</Typography>
                      <Typography variant="caption" className={styles.playerPrice}>
                        €{player.price}m
                      </Typography>
                    </Box>
                  ))}
                  {myTeam.forwards.bench.map((player, index) => (
                    <Box
                      key={index}
                      className={`${styles.benchPlayer} ${selectedPlayerInfo?.name === player.name ? styles.selectedPlayer : ""}`}
                      onClick={() => handlePlayerClick(player, "napad")}
                    >
                      <Avatar src={player.avatar} className={styles.benchAvatar}>
                        <Sports />
                      </Avatar>
                      <Typography variant="caption">{player.name.split(" ")[1]}</Typography>
                      <Typography variant="caption" className={styles.playerPrice}>
                        €{player.price}m
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Player Info Panel */}
          {selectedPlayerInfo && (
            <Card className={styles.playerInfoCard}>
              <CardContent>
                <Box className={styles.playerInfoHeader}>
                  <Avatar src={selectedPlayerInfo.avatar} className={styles.playerInfoAvatar}>
                    <Sports />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className={styles.playerInfoName}>
                      {selectedPlayerInfo.name}
                    </Typography>
                    <Typography variant="body2" className={styles.playerInfoTeam}>
                      {selectedPlayerInfo.team}
                    </Typography>
                  </Box>
                </Box>

                <Box className={styles.playerStats}>
                  <Box className={styles.statRow}>
                    <Typography variant="body2">Ukupno poena:</Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {selectedPlayerInfo.points}
                    </Typography>
                  </Box>
                  <Box className={styles.statRow}>
                    <Typography variant="body2">Cijena:</Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      €{selectedPlayerInfo.price}m
                    </Typography>
                  </Box>
                  <Box className={styles.statRow}>
                    <Typography variant="body2">Golovi:</Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {selectedPlayerInfo.totalGoals || 0}
                    </Typography>
                  </Box>
                  <Box className={styles.statRow}>
                    <Typography variant="body2">Asistencije:</Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {selectedPlayerInfo.assists || 0}
                    </Typography>
                  </Box>
                  {selectedPlayerInfo.cleanSheets !== undefined && (
                    <Box className={styles.statRow}>
                      <Typography variant="body2">Čisti listovi:</Typography>
                      <Typography variant="body2" className={styles.statValue}>
                        {selectedPlayerInfo.cleanSheets}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box className={styles.formSection}>
                  <Typography variant="body2" className={styles.formTitle}>
                    Forma (zadnjih 5):
                  </Typography>
                  <Box className={styles.formBars}>
                    {selectedPlayerInfo.form?.map((score: number, index: number) => (
                      <Box key={index} className={styles.formBar}>
                        <Box
                          className={styles.formBarFill}
                          style={{
                            height: `${(score / 10) * 100}%`,
                            backgroundColor: score >= 7 ? "#4caf50" : score >= 5 ? "#ff9800" : "#f44336",
                          }}
                        />
                        <Typography variant="caption">{score}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  className={styles.transferBtn}
                  onClick={handleTransferClick}
                  startIcon={<SwapHoriz />}
                >
                  Zamijeni Igrača
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  className={styles.removeBtn}
                  onClick={() => setRemoveMode(!removeMode)}
                  color={removeMode ? "primary" : "default"}
                >
                  {removeMode ? "Otkaži Uklanjanje" : "Ukloni Igrača"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className={styles.actionsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Akcije
              </Typography>
              <Box className={styles.actionButtons}>
                <Button variant="contained" fullWidth className={styles.actionBtn}>
                  Potvrdi Tim
                </Button>
                <Button variant="outlined" fullWidth className={styles.actionBtn}>
                  Auto Pick
                </Button>
                <Button variant="outlined" fullWidth className={styles.actionBtn}>
                  Resetuj Tim
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transfer Modal */}
      <Dialog open={openTransferModal} onClose={() => setOpenTransferModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box className={styles.modalHeader}>
            <Typography variant="h6">Izaberi Igrača</Typography>
            <SwapHoriz className={styles.transferIcon} />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box className={styles.modalFilters}>
            <TextField
              placeholder="Pretraži igrače..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search className={styles.searchIcon} />,
              }}
              className={styles.searchField}
            />
            <FormControl size="small" className={styles.filterSelect}>
              <InputLabel>Tim</InputLabel>
              <Select value={filterTeam} label="Tim" onChange={(e) => setFilterTeam(e.target.value)}>
                <MenuItem value="sve">Svi timovi</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" className={styles.filterSelect}>
              <InputLabel>Pozicija</InputLabel>
              <Select value={positionFilter} label="Pozicija" onChange={(e) => setPositionFilter(e.target.value)}>
                <MenuItem value="">Sve pozicije</MenuItem>
                <MenuItem value="golman">Golman</MenuItem>
                <MenuItem value="odbrana">Odbrana</MenuItem>
                <MenuItem value="vezni">Vezni</MenuItem>
                <MenuItem value="napad">Napad</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <List className={styles.playersList}>
            {filteredPlayers.map((player, index) => (
              <ListItem key={index} className={styles.playerItem} onClick={() => handleTransfer(player)}>
                <ListItemAvatar>
                  <Avatar src={player.avatar}>
                    <Sports />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondary={
                    <Box className={styles.playerInfo}>
                      <Typography variant="caption">{player.team}</Typography>
                      <Chip label={player.position} size="small" className={styles.positionChip} />
                    </Box>
                  }
                />
                <Box className={styles.playerStats}>
                  <Typography variant="body2" className={styles.playerPoints}>
                    {player.points}p
                  </Typography>
                  <Typography variant="caption" className={styles.playerPrice}>
                    €{player.price}m
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
