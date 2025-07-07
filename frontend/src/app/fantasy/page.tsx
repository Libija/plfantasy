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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material"
import { EmojiEvents, Group, TrendingUp, Person, Sports } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function FantasyPage() {
  const [user] = useState({
    name: "Marko Petrović",
    avatar: "/placeholder.svg?height=60&width=60",
    teamName: "Zmajevi BiH",
    totalPoints: 1247,
    rank: 156,
    totalPlayers: 5420,
    gameweek: 19,
    gameweekPoints: 67,
    transfers: 1,
    maxTransfers: 3,
  })

  const myLeagues = [
    {
      id: 1,
      name: "Prijatelji Liga",
      position: 3,
      totalPlayers: 12,
      points: 1247,
    },
    {
      id: 2,
      name: "Sarajevo Fanovi",
      position: 8,
      totalPlayers: 45,
      points: 1247,
    },
    {
      id: 3,
      name: "Globalna Liga",
      position: 156,
      totalPlayers: 5420,
      points: 1247,
    },
  ]

  const topPlayers = [
    {
      name: "Marko Petković",
      team: "Borac",
      position: "NAP",
      points: 142,
      price: 9.5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Stojan Vranješ",
      team: "Borac",
      position: "VEZ",
      points: 128,
      price: 8.2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Nemanja Bilbija",
      team: "Zrinjski",
      position: "NAP",
      points: 125,
      price: 8.8,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const recentTransfers = [
    {
      playerIn: "Almedin Ziljkić",
      playerOut: "Stefan Savić",
      cost: 0.3,
      gameweek: 18,
    },
    {
      playerIn: "Kenan Pirić",
      playerOut: "Darko Bodul",
      cost: 0.0,
      gameweek: 17,
    },
  ]

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h3" className={styles.pageTitle}>
          Fantasy Premier Liga BiH
        </Typography>
        <Typography variant="h6" className={styles.pageSubtitle}>
          Kreiraj svoj tim i takmiči se sa prijateljima
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Stats */}
        <Grid item xs={12} lg={8}>
          <Card className={styles.userCard}>
            <CardContent className={styles.userContent}>
              <Box className={styles.userHeader}>
                <Avatar src={user.avatar} alt={user.name} className={styles.userAvatar}>
                  <Person />
                </Avatar>
                <Box className={styles.userInfo}>
                  <Typography variant="h5" className={styles.userName}>
                    {user.name}
                  </Typography>
                  <Typography variant="body1" className={styles.teamName}>
                    {user.teamName}
                  </Typography>
                </Box>
                <Button component={Link} href="/fantasy/tim" variant="contained" className={styles.manageTeamBtn}>
                  Upravljaj Timom
                </Button>
              </Box>

              <Grid container spacing={3} className={styles.statsGrid}>
                <Grid item xs={6} sm={3}>
                  <Box className={styles.statCard}>
                    <Typography variant="h4" className={styles.statValue}>
                      {user.totalPoints}
                    </Typography>
                    <Typography variant="body2" className={styles.statLabel}>
                      Ukupno Poena
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className={styles.statCard}>
                    <Typography variant="h4" className={styles.statValue}>
                      #{user.rank}
                    </Typography>
                    <Typography variant="body2" className={styles.statLabel}>
                      Globalni Rang
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className={styles.statCard}>
                    <Typography variant="h4" className={styles.statValue}>
                      {user.gameweekPoints}
                    </Typography>
                    <Typography variant="body2" className={styles.statLabel}>
                      {user.gameweek}. Kolo
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className={styles.statCard}>
                    <Typography variant="h4" className={styles.statValue}>
                      {user.transfers}/{user.maxTransfers}
                    </Typography>
                    <Typography variant="body2" className={styles.statLabel}>
                      Transferi
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box className={styles.progressSection}>
                <Typography variant="body2" className={styles.progressLabel}>
                  Rang Progres ({user.rank} od {user.totalPlayers})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((user.totalPlayers - user.rank) / user.totalPlayers) * 100}
                  className={styles.progressBar}
                />
              </Box>
            </CardContent>
          </Card>

          {/* My Leagues */}
          <Card className={styles.leaguesCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                <Group className={styles.sectionIcon} />
                Moje Lige
              </Typography>
              <List className={styles.leaguesList}>
                {myLeagues.map((league) => (
                  <ListItem key={league.id} className={styles.leagueItem}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" className={styles.leagueName}>
                          {league.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" className={styles.leagueInfo}>
                          {league.totalPlayers} igrača • {league.points} poena
                        </Typography>
                      }
                    />
                    <Chip
                      label={`#${league.position}`}
                      color={league.position <= 3 ? "primary" : "default"}
                      className={styles.positionChip}
                    />
                  </ListItem>
                ))}
              </List>
              <Button variant="outlined" fullWidth className={styles.joinLeagueBtn}>
                Pridruži se Ligi
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Top Players */}
          <Card className={styles.sidebarCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                <TrendingUp className={styles.sectionIcon} />
                Najbolji Igrači
              </Typography>
              <List className={styles.playersList}>
                {topPlayers.map((player, index) => (
                  <ListItem key={index} className={styles.playerItem}>
                    <ListItemAvatar>
                      <Avatar src={player.avatar} alt={player.name} className={styles.playerAvatar}>
                        <Sports />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" className={styles.playerName}>
                          {player.name}
                        </Typography>
                      }
                      secondary={
                        <Box className={styles.playerInfo}>
                          <Typography variant="caption">{player.team}</Typography>
                          <Chip label={player.position} size="small" className={styles.positionTag} />
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
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card className={styles.sidebarCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                <EmojiEvents className={styles.sectionIcon} />
                Nedavni Transferi
              </Typography>
              <List className={styles.transfersList}>
                {recentTransfers.map((transfer, index) => (
                  <ListItem key={index} className={styles.transferItem}>
                    <Box className={styles.transferInfo}>
                      <Typography variant="body2" className={styles.transferIn}>
                        ↗ {transfer.playerIn}
                      </Typography>
                      <Typography variant="body2" className={styles.transferOut}>
                        ↙ {transfer.playerOut}
                      </Typography>
                      <Typography variant="caption" className={styles.transferCost}>
                        Kolo {transfer.gameweek} • €{transfer.cost}m
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
