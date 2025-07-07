import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "./theme"
import Navbar from "../components/layout/Navbar"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="bs">
      <body>
        
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            <main className="main-content">{children}</main>
          </ThemeProvider>
        
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
