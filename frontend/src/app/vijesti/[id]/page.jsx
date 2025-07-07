"use client"

import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "../../../styles/VijestiDetalji.module.css"

export default function VijestiDetalji() {
  const params = useParams()
  const id = params.id

  // Simulirani podaci za vijest
  const news = {
    id: id,
    title: "Sarajevo pobjedilo Zrinjski u derbiju kola",
    content: `
      <p>FK Sarajevo je na Koševu savladalo HŠK Zrinjski rezultatom 2:1 u derbiju 15. kola Premijer lige BiH. Golove za domaće postigli su Ahmetović i Rahmanović, dok je za goste strijelac bio Bilbija.</p>
      
      <p>Utakmica je počela u visokom ritmu, a domaći su poveli već u 15. minutu kada je Ahmetović iskoristio grešku odbrane gostiju i matirao golmana Zrinjskog. Gosti su izjednačili u 35. minutu preko Bilbije, koji je sjajno reagovao nakon kornera.</p>
      
      <p>U drugom poluvremenu vidjeli smo mnogo borbe na sredini terena, a odlučujući gol postigao je Rahmanović u 78. minutu, kada je preciznim udarcem sa ivice šesnaesterca pogodio donji ugao gola Zrinjskog.</p>
      
      <p>Ovom pobjedom Sarajevo je učvrstilo prvu poziciju na tabeli sa 71 bodom, dok je Zrinjski ostao na trećem mjestu sa 62 boda.</p>
      
      <p>U narednom kolu Sarajevo gosti Željezničar u velikom gradskom derbiju, dok Zrinjski dočekuje Široki Brijeg.</p>
    `,
    image: "/images/news1.jpg",
    date: "22.05.2025.",
    category: "Utakmice",
    author: "Adnan Hadžić",
    relatedNews: [
      {
        id: 2,
        title: "Tuzla City doveo novo pojačanje iz Hrvatske",
        image: "/images/news2.jpg",
      },
      {
        id: 3,
        title: "Borac se priprema za evropske izazove",
        image: "/images/news3.jpg",
      },
    ],
  }

  if (!id) {
    return null // Ili neki loading state
  }

  return (
    <>
      <Head>
        <title>{news.title} | PLKutak</title>
        <meta name="description" content={news.title} />
      </Head>

      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/vijesti">Vijesti</Link> / <span>{news.title}</span>
        </div>

        <article className={styles.article}>
          <div className={styles.articleHeader}>
            <h1 className={styles.title}>{news.title}</h1>
            <div className={styles.meta}>
              <span className={styles.date}>{news.date}</span>
              <span className={styles.category}>{news.category}</span>
              <span className={styles.author}>Autor: {news.author}</span>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderText}>{news.category}</div>
            </div>
          </div>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: news.content }} />

          <div className={styles.share}>
            <span>Podijeli:</span>
            <div className={styles.shareButtons}>
              <button className={styles.shareButton}>Facebook</button>
              <button className={styles.shareButton}>Twitter</button>
              <button className={styles.shareButton}>WhatsApp</button>
            </div>
          </div>
        </article>

        <div className={styles.relatedNews}>
          <h2 className={styles.relatedTitle}>Povezane vijesti</h2>
          <div className={styles.relatedGrid}>
            {news.relatedNews.map((item) => (
              <Link href={`/vijesti/${item.id}`} key={item.id} className={styles.relatedCard}>
                <div className={styles.relatedImage}>
                  <div className={styles.relatedImagePlaceholder}></div>
                </div>
                <h3 className={styles.relatedCardTitle}>{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
