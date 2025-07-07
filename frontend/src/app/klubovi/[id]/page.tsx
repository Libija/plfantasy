"use client"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material"
import { ArrowBack, Stadium, EmojiEvents, Group, LocationOn, Sports } from "@mui/icons-material"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "./page.module.css"

export default function ClubDetailPage() {
  const params = useParams()
  const id = params.id

  // Mock data - u stvarnosti bi se dohvatilo iz API-ja
  const club = {
    id: 1,
    name: "FK Borac Banjaluka",
    shortName: "Borac",
    logo: "/placeholder.svg?height=120&width=120",
    stadium: "Gradski stadion",
    capacity: 9730,
    founded: 1926,
    city: "Banjaluka",
    position: 1,
    points: 45,
    titles: 1,
    colors: ["#dc143c", "#ffffff"],
    description:
      "FK Borac Banjaluka je najstariji fudbalski klub u Republici Srpskoj, osnovan 1926. godine. Klub je poznat po svojoj bogatoj tradiciji i odanim navijačima.",
    coach: "Mladen Žižović",
    website: "www.fkborac.com",
    address: "Cara Dušana 4, Banjaluka",
  }

  const players = [
    {
      number: 1,
      name: "Marko Maroš",
      position: "Golman",
      age: 28,
      nationality: "BiH",
      goals: 0,
      assists: 0,
      yellowCards: 2,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      number: 4,
      name: "Siniša Saničanin",
      position: "Odbrana",
      age: 32,
      nationality: "SRB",
      goals: 2,
      assists: 1,
      yellowCards: 5,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      number: 10,
      name: "Stojan Vranješ",
      position: "Vezni red",
      age: 29,
      nationality: "SRB",
      goals: 4,
      assists: 12,
      yellowCards: 3,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      number: 9,
      name: "Marko Petković",
      position: "Napad",
      age: 26,
      nationality: "SRB",
      goals: 18,
      assists: 3,
      yellowCards: 2,
      redCards: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      number: 7,
      name: "Amer Dupovac",
      position: "Vezni red",
      age: 24,
      nationality: "BiH",
      goals: 3,
      assists: 5,
      yellowCards: 4,
      redCards: 1,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const recentMatches = [
    {
      opponent: "Zrinjski",
      result: "2-1",
      date: "2024-01-15",
      home: true,
      competition: "Premier Liga",
    },
    {
      opponent: "Sarajevo",
      result: "1-0",
      date: "2024-01-08",
      home: false,
      competition: "Premier Liga",
    },
    {
      opponent: "Željezničar",
      result: "3-2",
      date: "2024-01-01",
      home: true,
      competition: "Premier Liga",
    },
  ]

  const achievements = [
    "Prvak Premier Lige BiH (2020/21)",
    "Finalist Kupa BiH (2019/20, 2021/22)",
    "Učešće u Ligi konferencije (2021/22)",
  ]

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.backButton}>
        <Button component={Link} href="/klubovi" startIcon={<ArrowBack />} className={styles.backBtn}>
          Nazad na klubove
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card className={styles.clubInfoCard}>
            <CardContent className={styles.clubInfoContent}>
              <Box className={styles.clubHeader}>
                <Avatar src={club.logo} alt={club.name} className={styles.clubLogo}>
                  <Stadium />
                </Avatar>
                <Typography variant="h4" className={styles.clubName}>
                  {club.shortName}
                </Typography>
                <Typography variant="h6" className={styles.clubFullName}>
                  {club.name}
                </Typography>
                <Chip label={`#${club.position} u ligi`} color="primary" className={styles.positionChip} />
              </Box>

              <Box className={styles.clubDetails}>
                <Box className={styles.detailItem}>
                  <LocationOn className={styles.detailIcon} />
                  <Box>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Grad
                    </Typography>
                    <Typography variant="body1">{club.city}</Typography>
                  </Box>
                </Box>

                <Box className={styles.detailItem}>
                  <Stadium className={styles.detailIcon} />
                  <Box>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Stadion
                    </Typography>
                    <Typography variant="body1">{club.stadium}</Typography>
                  </Box>
                </Box>

                <Box className={styles.detailItem}>
                  <Group className={styles.detailIcon} />
                  <Box>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Kapacitet
                    </Typography>
                    <Typography variant="body1">{club.capacity.toLocaleString()}</Typography>
                  </Box>
                </Box>

                <Box className={styles.detailItem}>
                  <EmojiEvents className={styles.detailIcon} />
                  <Box>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Osnovan
                    </Typography>
                    <Typography variant="body1">{club.founded}</Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="body1" className={styles.clubDescription}>
                {club.description}
              </Typography>

              <Box className={styles.achievements}>
                <Typography variant="h6" className={styles.achievementsTitle}>
                  Uspjesi
                </Typography>
                <List className={styles.achievementsList}>
                  {achievements.map((achievement, index) => (
                    <ListItem key={index} className={styles.achievementItem}>
                      <ListItemText primary={achievement} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card className={styles.playersCard}>
            <CardContent>
              <Typography variant="h5" className={styles.sectionTitle}>
                <Sports className={styles.sectionIcon} />
                Roster Igrača
              </Typography>

              <TableContainer className={styles.playersTable}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className={styles.headerCell}>#</TableCell>
                      <TableCell className={styles.headerCell}>Igrač</TableCell>
                      <TableCell className={styles.headerCell}>Pozicija</TableCell>
                      <TableCell align="center" className={styles.headerCell}>
                        God.
                      </TableCell>
                      <TableCell align="center" className={styles.headerCell}>
                        G
                      </TableCell>
                      <TableCell align="center" className={styles.headerCell}>
                        A
                      </TableCell>
                      <TableCell align="center" className={styles.headerCell}>
                        ŽK
                      </TableCell>
                      <TableCell align="center" className={styles.headerCell}>
                        CK
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow key={player.number} className={styles.playerRow}>
                        <TableCell className={styles.numberCell}>{player.number}</TableCell>
                        <TableCell className={styles.playerCell}>
                          <Box className={styles.playerInfo}>
                            <Avatar src={player.avatar} alt={player.name} className={styles.playerAvatar}>
                              <Sports />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" className={styles.playerName}>
                                {player.name}
                              </Typography>
                              <Typography variant="caption" className={styles.playerNationality}>
                                {player.nationality}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={player.position} size="small" className={styles.positionChip} />
                        </TableCell>
                        <TableCell align="center">{player.age}</TableCell>
                        <TableCell align="center" className={styles.goalsCell}>
                          {player.goals}
                        </TableCell>
                        <TableCell align="center" className={styles.assistsCell}>
                          {player.assists}
                        </TableCell>
                        <TableCell align="center" className={styles.yellowCard}>
                          {player.yellowCards}
                        </TableCell>
                        <TableCell align="center" className={styles.redCard}>
                          {player.redCards}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card className={styles.matchesCard}>
            <CardContent>
              <Typography variant="h6" className={styles.sectionTitle}>
                Nedavne Utakmice
              </Typography>
              <List className={styles.matchesList}>
                {recentMatches.map((match, index) => (
                  <ListItem key={index} className={styles.matchItem}>
                    <Box className={styles.matchInfo}>
                      <Typography variant="body2" className={styles.matchDate}>
                        {new Date(match.date).toLocaleDateString("bs-BA")}
                      </Typography>
                      <Typography variant="body1" className={styles.matchResult}>
                        {match.home ? "vs" : "@"} {match.opponent} {match.result}
                      </Typography>
                      <Chip label={match.competition} size="small" />
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
