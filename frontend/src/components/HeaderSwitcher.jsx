"use client"
import Header from "./Header"
import AdminHeader from "./AdminHeader"
import useAuth from "../hooks/use-auth"

export default function HeaderSwitcher() {
  const { isLoggedIn, role } = useAuth()

  if (isLoggedIn && role === "admin") return <AdminHeader />
  return <Header />
} 