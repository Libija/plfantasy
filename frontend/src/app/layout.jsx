import "../styles/globals.css"
import Layout from "../components/Layout"

export const metadata = {
  title: "PLKutak - Premijer Liga BiH",
  description: "Sve o Premijer ligi Bosne i Hercegovine",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="bs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
