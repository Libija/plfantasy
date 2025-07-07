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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import {
  Dashboard,
  Article,
  Sports,
  Group,
  EmojiEvents,
  Assessment,
  Settings,
  TrendingUp,
  AccountCircle,
  Logout,
  Notifications,
} from "@mui/icons-material"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

export default function AdminDashboard() {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null)
  const [stats] = useState({
    totalNews: 45,
    totalClubs: 10,
    totalPlayers: 250,
    totalMatches: 90,
    pendingNews: 3,
    activeUsers: 1250,
  })

  const recentActivity = [
    {
      type: "news",
      action: "Kreirana nova vijest",
      title: "Sarajevo pobijedio Željezničar",
      time: "prije 2 sata",
      user: "Admin",
    },
    {
      type: "match",
      action: "Uneseni rezultati",
      title: "18. kolo - svi rezultati",
      time: "prije 4 sata",
      user: "Admin",
    },
    {
      type: "player",
      action: "Dodani novi igrač",
      title: "Marko Petković - Borac",
      time: "prije 1 dan",
      user: "Admin",
    },
    {
      type: "news",
      action: "Objavljena vijest",
      title: "Transfer prozor otvoren",
      time: "prije 2 dana",
      user: "Admin",
    },
  ]

  const quickActions = [
    {
      title: "Kreiraj Vijest",
      description: "Dodaj novu vijest",
      icon: <Article />,
      href: "/admin/vijesti/nova",
      color: "#1976d2",
    },
    {
      title: "Unesi Rezultate",
      description: "Dodaj rezultate utakmica",
      icon: <Sports />,
      href: "/admin/utakmice/rezultati",
      color: "#4caf50",
    },
    {
      title: "Dodaj Igrača",
      description: "Registruj novog igrača",
      icon: <Group />,
      href: "/admin/igraci/novi",
      color: "#ff9800",
    },
    {
      title: "Match Events",
      description: "Unesi golove i kartone",
      icon: <EmojiEvents />,
      href: "/admin/utakmice/eventi",
      color: "#f44336",
    },
  ]

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    // Logic for logout
    console.log("Logging out...")
    router.push("/prijava")
    handleMenuClose()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "news":
        return <Article />
      case "match":
        return <Sports />
      case "player":
        return <Group />
      default:
        return <Dashboard />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "news":
        return "#1976d2"
      case "match":
        return "#4caf50"
      case "player":
        return "#ff9800"
      default:
        return "#757575"
    }
  }

  return (
    <Box className={styles.adminLayout}>
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar>
          <Typography variant="h6" className={styles.title}>
            PLKutak Admin
          </Typography>
          <Box className={styles.headerActions}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className={styles.userMenu}>
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle className={styles.menuIcon} />
                Profil
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Settings className={styles.menuIcon} />
                Postavke
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout className={styles.menuIcon} />
                Odjavi se
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h3" className={styles.pageTitle}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" className={styles.pageSubtitle}>
            Upravljanje PLKutak platformom
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} className={styles.statsGrid}>
          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#1976d2" }}>
                  <Article />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.totalNews}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Ukupno Vijesti
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#4caf50" }}>
                  <Sports />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.totalMatches}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Ukupno Utakmica
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#ff9800" }}>
                  <Group />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.totalPlayers}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Ukupno Igrača
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#f44336" }}>
                  <EmojiEvents />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.totalClubs}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Ukupno Klubova
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#9c27b0" }}>
                  <Assessment />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.pendingNews}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Na Čekanju
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <Box className={styles.statIcon} style={{ backgroundColor: "#00bcd4" }}>
                  <TrendingUp />
                </Box>
                <Typography variant="h4" className={styles.statNumber}>
                  {stats.activeUsers}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Aktivni Korisnici
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={8}>
            <Card className={styles.actionsCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Brze Akcije
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card className={`${styles.actionCard} card-hover`} component={Link} href={action.href}>
                        <CardContent className={styles.actionContent}>
                          <Box className={styles.actionIcon} style={{ backgroundColor: action.color }}>
                            {action.icon}
                          </Box>
                          <Typography variant="h6" className={styles.actionTitle}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" className={styles.actionDescription}>
                            {action.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Management Links */}
            <Card className={styles.managementCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Upravljanje Sadržajem
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/vijesti"
                      variant="outlined"
                      fullWidth
                      startIcon={<Article />}
                      className={styles.managementBtn}
                    >
                      Upravljaj Vijestima
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/klubovi"
                      variant="outlined"
                      fullWidth
                      startIcon={<Sports />}
                      className={styles.managementBtn}
                    >
                      Upravljaj Klubovima
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/igraci"
                      variant="outlined"
                      fullWidth
                      startIcon={<Group />}
                      className={styles.managementBtn}
                    >
                      Upravljaj Igračima
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/utakmice"
                      variant="outlined"
                      fullWidth
                      startIcon={<EmojiEvents />}
                      className={styles.managementBtn}
                    >
                      Upravljaj Utakmicama
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/fantasy"
                      variant="outlined"
                      fullWidth
                      startIcon={<Assessment />}
                      className={styles.managementBtn}
                    >
                      Fantasy Sistem
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      component={Link}
                      href="/admin/postavke"
                      variant="outlined"
                      fullWidth
                      startIcon={<Settings />}
                      className={styles.managementBtn}
                    >
                      Postavke Sistema
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={4}>
            <Card className={styles.activityCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Nedavne Aktivnosti
                </Typography>
                <List className={styles.activityList}>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index} className={styles.activityItem}>
                      <ListItemIcon>
                        <Avatar
                          className={styles.activityIcon}
                          style={{ backgroundColor: getActivityColor(activity.type) }}
                        >
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" className={styles.activityAction}>
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box className={styles.activityDetails}>
                            <Typography variant="caption" className={styles.activityTitle}>
                              {activity.title}
                            </Typography>
                            <Typography variant="caption" className={styles.activityTime}>
                              {activity.time} • {activity.user}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button variant="outlined" fullWidth className={styles.viewAllBtn}>
                  Prikaži Sve Aktivnosti
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
