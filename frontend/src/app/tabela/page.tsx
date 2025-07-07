"use client"
import { useState } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from "@mui/material"
import { Sports, EmojiEvents, AssistWalker } from "@mui/icons-material"
import styles from "./page.module.css"

export default function TablePage() {
  const [activeTab, setActiveTab] = useState(0)

  const teams = [
    {
      position: 1,
      name: "Borac Banjaluka",
      played: 18,
      won: 14,
      drawn: 3,
      lost: 1,
      gf: 42,
      ga: 12,
      gd: 30,
      points: 45,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["W", "W", "W", "D", "W"],
    },
    {
      position: 2,
      name: "Zrinjski Mostar",
      played: 18,
      won: 13,
      drawn: 2,
      lost: 3,
      gf: 38,
      ga: 18,
      gd: 20,
      points: 41,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["W", "W", "L", "W", "W"],
    },
    {
      position: 3,
      name: "Sarajevo",
      played: 18,
      won: 11,
      drawn: 4,
      lost: 3,
      gf: 35,
      ga: 20,
      gd: 15,
      points: 37,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["W", "D", "W", "W", "D"],
    },
    {
      position: 4,
      name: "Željezničar",
      played: 18,
      won: 9,
      drawn: 5,
      lost: 4,
      gf: 28,
      ga: 22,
      gd: 6,
      points: 32,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["L", "W", "D", "W", "L"],
    },
    {
      position: 5,
      name: "Velež Mostar",
      played: 18,
      won: 8,
      drawn: 3,
      lost: 7,
      gf: 25,
      ga: 25,
      gd: 0,
      points: 27,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["W", "L", "D", "W", "L"],
    },
    {
      position: 6,
      name: "Široki Brijeg",
      played: 18,
      won: 7,
      drawn: 4,
      lost: 7,
      gf: 22,
      ga: 24,
      gd: -2,
      points: 25,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["D", "L", "W", "D", "L"],
    },
    {
      position: 7,
      name: "Tuzla City",
      played: 18,
      won: 6,
      drawn: 5,
      lost: 7,
      gf: 20,
      ga: 26,
      gd: -6,
      points: 23,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["L", "D", "L", "W", "D"],
    },
    {
      position: 8,
      name: "Sloboda Tuzla",
      played: 18,
      won: 5,
      drawn: 4,
      lost: 9,
      gf: 18,
      ga: 28,
      gd: -10,
      points: 19,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["L", "L", "W", "L", "D"],
    },
    {
      position: 9,
      name: "Posavina Brčko",
      played: 18,
      won: 3,
      drawn: 6,
      lost: 9,
      gf: 15,
      ga: 30,
      gd: -15,
      points: 15,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["D", "L", "L", "D", "L"],
    },
    {
      position: 10,
      name: "Radnik Bijeljina",
      played: 18,
      won: 2,
      drawn: 4,
      lost: 12,
      gf: 12,
      ga: 36,
      gd: -24,
      points: 10,
      logo: "/placeholder.svg?height=30&width=30",
      form: ["L", "L", "D", "L", "L"],
    },
  ]

  const topScorers = [
    {
      position: 1,
      name: "Marko Petković",
      team: "Borac Banjaluka",
      goals: 18,
      matches: 16,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 2,
      name: "Nemanja Bilbija",
      team: "Zrinjski Mostar",
      goals: 15,
      matches: 17,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 3,
      name: "Almedin Ziljkić",
      team: "Sarajevo",
      goals: 12,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 4,
      name: "Kenan Pirić",
      team: "Željezničar",
      goals: 11,
      matches: 15,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 5,
      name: "Stefan Savić",
      team: "Velež Mostar",
      goals: 9,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 6,
      name: "Miloš Nikolić",
      team: "Široki Brijeg",
      goals: 8,
      matches: 16,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 7,
      name: "Darko Bodul",
      team: "Tuzla City",
      goals: 7,
      matches: 17,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 8,
      name: "Mirza Mustafić",
      team: "Sarajevo",
      goals: 6,
      matches: 15,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const topAssists = [
    {
      position: 1,
      name: "Stojan Vranješ",
      team: "Borac Banjaluka",
      assists: 12,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 2,
      name: "Dino Hotić",
      team: "Zrinjski Mostar",
      assists: 10,
      matches: 16,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 3,
      name: "Benjamin Tatar",
      team: "Sarajevo",
      assists: 9,
      matches: 17,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 4,
      name: "Miloš Filipović",
      team: "Željezničar",
      assists: 8,
      matches: 18,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      position: 5,
      name: "Haris Hadžić",
      team: "Velež Mostar",
      assists: 7,
      matches: 15,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getPositionColor = (position: number) => {
    if (position <= 2) return styles.champions
    if (position <= 4) return styles.europa
    if (position >= 9) return styles.relegation
    return ""
  }

  const getFormColor = (result: string) => {
    switch (result) {
      case "W":
        return styles.win
      case "D":
        return styles.draw
      case "L":
        return styles.loss
      default:
        return ""
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h3" className={styles.pageTitle}>
          Tabela Premier Lige BiH
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Kompletna tabela, strijelci i asistenti
        </Typography>
      </Box>

      <Box className={styles.tabsContainer}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} className={styles.tabs}>
          <Tab label="Tabela" />
          <Tab label="Strijelci" />
          <Tab label="Asistenti" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Card className={styles.tableCard}>
          <CardContent>
            <Box className={styles.legend}>
              <Box className={styles.legendItem}>
                <Box className={`${styles.legendColor} ${styles.champions}`}></Box>
                <Typography variant="caption">Liga prvaka</Typography>
              </Box>
              <Box className={styles.legendItem}>
                <Box className={`${styles.legendColor} ${styles.europa}`}></Box>
                <Typography variant="caption">Konferencijska liga</Typography>
              </Box>
              <Box className={styles.legendItem}>
                <Box className={`${styles.legendColor} ${styles.relegation}`}></Box>
                <Typography variant="caption">Ispadanje</Typography>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.headerCell}>#</TableCell>
                    <TableCell className={styles.headerCell}>Tim</TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      O
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      P
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      N
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      I
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      GD
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      GR
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      B
                    </TableCell>
                    <TableCell align="center" className={styles.headerCell}>
                      Forma
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.position} className={styles.tableRow}>
                      <TableCell className={`${styles.positionCell} ${getPositionColor(team.position)}`}>
                        {team.position}
                      </TableCell>
                      <TableCell className={styles.teamCell}>
                        <Box className={styles.teamInfo}>
                          <Avatar src={team.logo} alt={team.name} className={styles.teamLogo} />
                          <Typography variant="body2" className={styles.teamName}>
                            {team.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{team.played}</TableCell>
                      <TableCell align="center">{team.won}</TableCell>
                      <TableCell align="center">{team.drawn}</TableCell>
                      <TableCell align="center">{team.lost}</TableCell>
                      <TableCell align="center" className={team.gd >= 0 ? styles.positive : styles.negative}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </TableCell>
                      <TableCell align="center">
                        {team.gf}:{team.ga}
                      </TableCell>
                      <TableCell align="center" className={styles.pointsCell}>
                        <strong>{team.points}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <Box className={styles.formContainer}>
                          {team.form.map((result, index) => (
                            <Box key={index} className={`${styles.formResult} ${getFormColor(result)}`}>
                              {result}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography variant="h5" className={styles.statsTitle}>
              <EmojiEvents className={styles.statsIcon} />
              Najbolji Strijelci
            </Typography>
            <List className={styles.statsList}>
              {topScorers.map((player) => (
                <ListItem key={player.position} className={styles.statsItem}>
                  <Box className={styles.positionBadge}>{player.position}</Box>
                  <ListItemAvatar>
                    <Avatar src={player.avatar} alt={player.name}>
                      <Sports />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" className={styles.playerName}>
                        {player.name}
                      </Typography>
                    }
                    secondary={
                      <Box className={styles.playerInfo}>
                        <Typography variant="body2" className={styles.teamName}>
                          {player.team}
                        </Typography>
                        <Typography variant="caption" className={styles.matchInfo}>
                          {player.matches} utakmica
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip label={`${player.goals} golova`} color="primary" className={styles.statsChip} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography variant="h5" className={styles.statsTitle}>
              <AssistWalker className={styles.statsIcon} />
              Najbolji Asistenti
            </Typography>
            <List className={styles.statsList}>
              {topAssists.map((player) => (
                <ListItem key={player.position} className={styles.statsItem}>
                  <Box className={styles.positionBadge}>{player.position}</Box>
                  <ListItemAvatar>
                    <Avatar src={player.avatar} alt={player.name}>
                      <Sports />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" className={styles.playerName}>
                        {player.name}
                      </Typography>
                    }
                    secondary={
                      <Box className={styles.playerInfo}>
                        <Typography variant="body2" className={styles.teamName}>
                          {player.team}
                        </Typography>
                        <Typography variant="caption" className={styles.matchInfo}>
                          {player.matches} utakmica
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip label={`${player.assists} asistencija`} color="secondary" className={styles.statsChip} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
