import Head from "next/head"
import Link from "next/link"
import styles from "../../styles/Vijesti.module.css"

export default function Vijesti() {
  // Simulirani podaci za vijesti
  const news = [
    {
      id: 1,
      title: "Sarajevo pobjedilo Zrinjski u derbiju kola",
      excerpt:
        "FK Sarajevo je na Koševu savladalo HŠK Zrinjski rezultatom 2:1 u derbiju 15. kola Premijer lige BiH. Golove za domaće postigli su Ahmetović i Rahmanović, dok je za goste strijelac bio Bilbija.",
      image: "/images/news1.jpg",
      date: "22.05.2025.",
      category: "Utakmice",
    },
    {
      id: 2,
      title: "Tuzla City doveo novo pojačanje iz Hrvatske",
      excerpt:
        "Tuzla City je predstavio novo pojačanje, veznjaka Marka Markovića koji dolazi iz HNL-a. Marković je potpisao trogodišnji ugovor i pridružiće se ekipi na pripremama za novu sezonu.",
      image: "/images/news2.jpg",
      date: "21.05.2025.",
      category: "Transferi",
    },
    {
      id: 3,
      title: "Borac se priprema za evropske izazove",
      excerpt:
        "FK Borac iz Banja Luke počeo je pripreme za kvalifikacije za Ligu Konferencija. Trener Vinko Marinović najavio je da će ekipa biti spremna za evropske izazove koji ih očekuju ovog ljeta.",
      image: "/images/news3.jpg",
      date: "20.05.2025.",
      category: "Klubovi",
    },
    {
      id: 4,
      title: "Željezničar predstavio nove dresove za sezonu 2025/26",
      excerpt:
        "FK Željezničar je predstavio nove dresove za predstojeću sezonu. Tradicionalna plava boja ostaje dominantna, uz moderne detalje koji odaju počast bogatoj historiji kluba.",
      image: "/images/news4.jpg",
      date: "19.05.2025.",
      category: "Klubovi",
    },
    {
      id: 5,
      title: "Novi format Premijer lige od sezone 2026/27",
      excerpt:
        "Nogometni/Fudbalski savez BiH najavio je promjene u formatu Premijer lige od sezone 2026/27. Broj klubova će biti povećan na 14, a plej-of i plej-aut će biti uvedeni nakon regularnog dijela sezone.",
      image: "/images/news5.jpg",
      date: "18.05.2025.",
      category: "Liga",
    },
    {
      id: 6,
      title: "Mladi reprezentativac BiH potpisao za Velež",
      excerpt:
        "Mladi reprezentativac Bosne i Hercegovine, Amir Hadžić, potpisao je četverogodišnji ugovor sa FK Velež. Hadžić dolazi iz omladinskog pogona Sarajeva i smatra se jednim od najvećih talenata u državi.",
      image: "/images/news6.jpg",
      date: "17.05.2025.",
      category: "Transferi",
    },
    {
      id: 7,
      title: "Široki Brijeg dobija novi stadion",
      excerpt:
        "NK Široki Brijeg će dobiti novi moderni stadion kapaciteta 12.000 mjesta. Izgradnja će početi sljedeće godine, a završetak radova planiran je za 2028. godinu.",
      image: "/images/news7.jpg",
      date: "16.05.2025.",
      category: "Infrastruktura",
    },
    {
      id: 8,
      title: "Najbolji strijelac lige produžio ugovor sa Sarajevom",
      excerpt:
        "Najbolji strijelac Premijer lige BiH, Edin Džeko, produžio je ugovor sa FK Sarajevo na još dvije godine. Džeko je ove sezone postigao 18 golova i bio ključni igrač u borbi za titulu.",
      image: "/images/news8.jpg",
      date: "15.05.2025.",
      category: "Transferi",
    },
  ]

  // Kategorije za filtriranje
  const categories = ["Sve", "Utakmice", "Transferi", "Klubovi", "Liga", "Infrastruktura"]

  return (
    <>
      <Head>
        <title>Vijesti | PLKutak</title>
        <meta name="description" content="Najnovije vijesti iz Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Vijesti</h1>
        <p className={styles.subtitle}>Najnovije vijesti iz Premijer lige BiH</p>

        <div className={styles.categoriesFilter}>
          {categories.map((category) => (
            <button key={category} className={`${styles.categoryButton} ${category === "Sve" ? styles.active : ""}`}>
              {category}
            </button>
          ))}
        </div>

        <div className={styles.newsGrid}>
          {news.map((item) => (
            <article key={item.id} className={styles.newsCard}>
              <div className={styles.imageContainer}>
                <div className={styles.imagePlaceholder}>
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

        <div className={styles.pagination}>
          <button className={`${styles.pageButton} ${styles.active}`}>1</button>
          <button className={styles.pageButton}>2</button>
          <button className={styles.pageButton}>3</button>
          <span className={styles.pageDots}>...</span>
          <button className={styles.pageButton}>10</button>
          <button className={`${styles.pageButton} ${styles.nextButton}`}>Sljedeća</button>
        </div>
      </div>
    </>
  )
}
