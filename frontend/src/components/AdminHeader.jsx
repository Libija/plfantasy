"use client"

import BaseHeader from "./BaseHeader"
import Link from "next/link"
import { FaSignOutAlt } from "react-icons/fa"
import useAuth from "../hooks/use-auth"

const adminNavLinks = [
  { href: "/admin/clubs", label: "Klubovi" },
  { href: "/admin/news", label: "Vijesti" },
  { href: "/admin/players", label: "Igrači" },
  { href: "/admin/rounds", label: "Kola" },
]

export default function AdminHeader() {
  const { logout } = useAuth()
  return (
    <BaseHeader logoHref="/admin" navLinks={adminNavLinks}>
      <button onClick={logout} style={{ display: "flex", color: "white", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        <FaSignOutAlt />
        <span>Odjavi se</span>
      </button>
    </BaseHeader>
  )
}
