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
  Button,
  IconButton,
  Chip,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material"
import { Add, Edit, Sports, EmojiEvents, Groups } from "@mui/icons-material"
import Link from "next/link"
import styles from "./page.module.css"

export default function AdminMatchesPage() {
  const [activeTab, setActiveTab] = useState(0)

  const upcomingMatches = [
    {
      id: 1,
      homeTeam: "Sarajevo",
      awayTeam: "Borac",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      date: "2024-01-20",
      time: "15:00",
      round: 19,
      venue: "Stadion Grbavica",
      status: "Najavljeno",
    },
    {
      id: 2,
      homeTeam: "Zrinjski",
      awayTeam: "Željezničar",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      date: "2024-01-21",
      time: "17:00",
      round: 19,
      venue: "Stadion pod Bijelim Brijegom",
      status: "Najavljeno",
    },
  ]

  const completedMatches = [
    {
      id: 3,
      homeTeam: "Sarajevo",
      awayTeam: "Željezničar",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      homeScore: 2,
      awayScore: 1,
      date: "2024-01-15",
      time: "15:00",
      round: 18,
      venue: "Stadion Grbavica",
      status: "Završeno",
      hasEvents: true,
    },
    {
      id: 4,
      homeTeam: "Borac",
      awayTeam: "Zrinjski",
      homeLogo: "/placeholder.svg?height=30&width=30",
      awayLogo: "/placeholder.svg?height=30&width=30",
      homeScore: 1,
      awayScore: 0,
      date: "2024-01-14",
      time: "17:00",
      round: 18,
      venue: "Gradski stadion",
      status: "Završeno",
      hasEvents: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Završeno":
        return "success"
      case "Najavljeno":
        return "primary"
      case "Uživo":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.pageTitle}>
          Upravljanje Utakmicama
        </Typography>
        <Button
          component={Link}
          href="/admin/utakmice/nova"
          variant="contained"
          startIcon={<Add />}
          className={styles.addBtn}
        >
          Nova Utakmica
        </Button>
      </Box>

      <Box className={styles.tabsContainer}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} className={styles.tabs}>
          <Tab label="Nadolazeće Utakmice" />
          <Tab label="Završene Utakmice" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Card className={styles.tableCard}>
          <CardContent>
            <Typography variant="h6" className={styles.sectionTitle}>
              Nadolazeće Utakmice
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.headerCell}>Kolo</TableCell>
                    <TableCell className={styles.headerCell}>Domaći</TableCell>
                    <TableCell className={styles.headerCell}>Gosti</TableCell>
                    <TableCell className={styles.headerCell}>Datum</TableCell>
                    <TableCell className={styles.headerCell}>Vrijeme</TableCell>
                    <TableCell className={styles.headerCell}>Stadion</TableCell>
                    <TableCell className={styles.headerCell}>Status</TableCell>
                    <TableCell className={styles.headerCell}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingMatches.map((match) => (
                    <TableRow key={match.id} className={styles.tableRow}>
                      <TableCell>
                        <Chip label={`${match.round}. kolo`} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Box className={styles.teamInfo}>
                          <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                          <Typography variant="body2">{match.homeTeam}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box className={styles.teamInfo}>
                          <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                          <Typography variant="body2">{match.awayTeam}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(match.date).toLocaleDateString("bs-BA")}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{match.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{match.venue}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={match.status} size="small" color={getStatusColor(match.status) as any} />
                      </TableCell>
                      <TableCell>
                        <Box className={styles.actions}>
                          <IconButton size="small" className={styles.editBtn}>
                            <Edit />
                          </IconButton>
                          <Button
                            component={Link}
                            href={`/admin/utakmice/${match.id}/rezultat`}
                            size="small"
                            startIcon={<Sports />}
                            className={styles.resultBtn}
                          >
                            Unesi Rezultat
                          </Button>
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
        <Card className={styles.tableCard}>
          <CardContent>
            <Typography variant="h6" className={styles.sectionTitle}>
              Završene Utakmice
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.headerCell}>Kolo</TableCell>
                    <TableCell className={styles.headerCell}>Domaći</TableCell>
                    <TableCell className={styles.headerCell}>Rezultat</TableCell>
                    <TableCell className={styles.headerCell}>Gosti</TableCell>
                    <TableCell className={styles.headerCell}>Datum</TableCell>
                    <TableCell className={styles.headerCell}>Stadion</TableCell>
                    <TableCell className={styles.headerCell}>Eventi</TableCell>
                    <TableCell className={styles.headerCell}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedMatches.map((match) => (
                    <TableRow key={match.id} className={styles.tableRow}>
                      <TableCell>
                        <Chip label={`${match.round}. kolo`} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Box className={styles.teamInfo}>
                          <Avatar src={match.homeLogo} alt={match.homeTeam} className={styles.teamLogo} />
                          <Typography variant="body2">{match.homeTeam}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" className={styles.score}>
                          {match.homeScore} - {match.awayScore}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box className={styles.teamInfo}>
                          <Avatar src={match.awayLogo} alt={match.awayTeam} className={styles.teamLogo} />
                          <Typography variant="body2">{match.awayTeam}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(match.date).toLocaleDateString("bs-BA")}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{match.venue}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={match.hasEvents ? "Kompletni" : "Nedostaju"}
                          size="small"
                          color={match.hasEvents ? "success" : "warning"}
                        />
                      </TableCell>
                      <TableCell>
                        <Box className={styles.actions}>
                          <Button
                            component={Link}
                            href={`/admin/utakmice/${match.id}/eventi`}
                            size="small"
                            startIcon={<EmojiEvents />}
                            className={styles.eventsBtn}
                          >
                            Eventi
                          </Button>
                          <IconButton size="small" className={styles.editBtn}>
                            <Edit />
                          </IconButton>
                          <Button
                            component={Link}
                            href={`/admin/utakmice/${match.id}/postave`}
                            size="small"
                            startIcon={<Groups />}
                            className={styles.lineupsBtn}
                            sx={{ marginLeft: 1 }}
                          >
                            Postave
                          </Button>
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
    </Container>
  )
}
