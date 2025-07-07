"use client"
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Avatar,
  Button,
} from "@mui/material"
import Link from "next/link"
import styles from "./LeagueTable.module.css"

const LeagueTable = () => {
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
      points: 45,
      logo: "/placeholder.svg?height=30&width=30",
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
      points: 41,
      logo: "/placeholder.svg?height=30&width=30",
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
      points: 37,
      logo: "/placeholder.svg?height=30&width=30",
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
      points: 32,
      logo: "/placeholder.svg?height=30&width=30",
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
      points: 27,
      logo: "/placeholder.svg?height=30&width=30",
    },
  ]

  const getPositionColor = (position) => {
    if (position <= 2) return styles.champions
    if (position <= 4) return styles.europa
    if (position >= 9) return styles.relegation
    return ""
  }

  return (
    <Card className={styles.tableCard}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" className={styles.cardTitle}>
          Tabela Premier Lige BiH
        </Typography>

        <TableContainer className={styles.tableContainer}>
          <Table size="small">
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
                  GR
                </TableCell>
                <TableCell align="center" className={styles.headerCell}>
                  B
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
                  <TableCell align="center" className={styles.statCell}>
                    {team.played}
                  </TableCell>
                  <TableCell align="center" className={styles.statCell}>
                    {team.won}
                  </TableCell>
                  <TableCell align="center" className={styles.statCell}>
                    {team.drawn}
                  </TableCell>
                  <TableCell align="center" className={styles.statCell}>
                    {team.lost}
                  </TableCell>
                  <TableCell align="center" className={styles.statCell}>
                    {team.gf}:{team.ga}
                  </TableCell>
                  <TableCell align="center" className={styles.pointsCell}>
                    <strong>{team.points}</strong>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className={styles.cardFooter}>
          <Button component={Link} href="/tabela" size="small" className={styles.viewMoreBtn}>
            Kompletna tabela
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default LeagueTable
