"use client"
import BaseHeader from "./BaseHeader"
import Link from "next/link"
import { FaUser, FaSignOutAlt } from "react-icons/fa"
import useAuth from "../hooks/use-auth"

export default function Header() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <BaseHeader>
      {isLoggedIn ? (
        <button onClick={logout} style={{ display: "flex",color: "white", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
          <FaSignOutAlt />
          <span>Odjavi se</span>
        </button>
      ) : (
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <FaUser />
          <span>Prijava</span>
        </Link>
      )}
    </BaseHeader>
  )
}
