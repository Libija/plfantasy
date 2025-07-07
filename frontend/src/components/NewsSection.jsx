import Link from "next/link"
import styles from "../styles/NewsSection.module.css"

export default function NewsSection() {
  // Simulirani podaci za vijesti
  const news = [
    {
      id: 1,
      title: "Sarajevo pobjedilo Zrinjski u derbiju kola",
      excerpt: "FK Sarajevo je na Koševu savladalo HŠK Zrinjski rezultatom 2:1 u derbiju 15. kola Premijer lige BiH.",
      image: "/images/news1.jpg",
      date: "22.05.2025.",
      category: "Utakmice",
    },
    {
      id: 2,
      title: "Tuzla City doveo novo pojačanje iz Hrvatske",
      excerpt: "Tuzla City je predstavio novo pojačanje, veznjaka Marka Markovića koji dolazi iz HNL-a.",
      image: "/images/news2.jpg",
      date: "21.05.2025.",
      category: "Transferi",
    },
    {
      id: 3,
      title: "Borac se priprema za evropske izazove",
      excerpt: "FK Borac iz Banja Luke počeo je pripreme za kvalifikacije za Ligu Konferencija.",
      image: "/images/news3.jpg",
      date: "20.05.2025.",
      category: "Klubovi",
    },
  ]

  return (
    <section className={styles.newsSection}>
      <div className={styles.sectionHeader}>
        <h2>Najnovije vijesti</h2>
        <Link href="/vijesti" className={styles.viewAll}>
          Pogledaj sve
        </Link>
      </div>

      <div className={styles.newsGrid}>
        {news.map((item) => (
          <article key={item.id} className={styles.newsCard}>
            <div className={styles.imageContainer}>
              <div className={styles.imagePlaceholder}>
                {/* Placeholder za sliku */}
                <div className={styles.placeholderText}>{item.category}</div>
              </div>
            </div>
            <div className={styles.newsContent}>
              <span className={styles.newsDate}>{item.date}</span>
              <h3 className={styles.newsTitle}>
                <Link href={`/vijesti/${item.id}`}>{item.title}</Link>
              </h3>
              <p className={styles.newsExcerpt}>{item.excerpt}</p>
              <Link href={`/vijesti/${item.id}`} className={styles.readMore}>
                Pročitaj više
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
