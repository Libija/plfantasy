import Head from "next/head"
import Link from "next/link"
import styles from "../../styles/Klubovi.module.css"

export default function Klubovi() {
  // Simulirani podaci za klubove
  const clubs = [
    {
      id: 1,
      name: "FK Sarajevo",
      founded: 1946,
      stadium: "Koševo",
      capacity: 34000,
      coach: "Husref Musemić",
      city: "Sarajevo",
      logo: "/images/clubs/sarajevo.png",
    },
    {
      id: 2,
      name: "FK Borac",
      founded: 1926,
      stadium: "Gradski stadion",
      capacity: 9730,
      coach: "Vinko Marinović",
      city: "Banja Luka",
      logo: "/images/clubs/borac.png",
    },
    {
      id: 3,
      name: "HŠK Zrinjski",
      founded: 1905,
      stadium: "Pod Bijelim Brijegom",
      capacity: 9000,
      coach: "Sergej Jakirović",
      city: "Mostar",
      logo: "/images/clubs/zrinjski.png",
    },
    {
      id: 4,
      name: "FK Željezničar",
      founded: 1921,
      stadium: "Grbavica",
      capacity: 13452,
      coach: "Edis Mulalić",
      city: "Sarajevo",
      logo: "/images/clubs/zeljeznicar.png",
    },
    {
      id: 5,
      name: "FK Tuzla City",
      founded: 2014,
      stadium: "Tušanj",
      capacity: 7000,
      coach: "Adnan Osmanhodžić",
      city: "Tuzla",
      logo: "/images/clubs/tuzla-city.png",
    },
    {
      id: 6,
      name: "NK Široki Brijeg",
      founded: 1948,
      stadium: "Pecara",
      capacity: 6000,
      coach: "Goran Sablić",
      city: "Široki Brijeg",
      logo: "/images/clubs/siroki-brijeg.png",
    },
    {
      id: 7,
      name: "FK Velež",
      founded: 1922,
      stadium: "Rođeni",
      capacity: 7000,
      coach: "Feđa Dudić",
      city: "Mostar",
      logo: "/images/clubs/velez.png",
    },
    {
      id: 8,
      name: "FK Sloboda",
      founded: 1919,
      stadium: "Tušanj",
      capacity: 7000,
      coach: "Mirza Varešanović",
      city: "Tuzla",
      logo: "/images/clubs/sloboda.png",
    },
    {
      id: 9,
      name: "HNK Posušje",
      founded: 1950,
      stadium: "Mokri Dolac",
      capacity: 3000,
      coach: "Ivan Pudar",
      city: "Posušje",
      logo: "/images/clubs/posusje.png",
    },
    {
      id: 10,
      name: "FK Igman",
      founded: 1920,
      stadium: "Luke",
      capacity: 3000,
      coach: "Elvedin Beganović",
      city: "Konjic",
      logo: "/images/clubs/igman.png",
    },
    {
      id: 11,
      name: "FK Radnik",
      founded: 1945,
      stadium: "Gradski stadion",
      capacity: 5000,
      coach: "Mladen Žižović",
      city: "Bijeljina",
      logo: "/images/clubs/radnik.png",
    },
    {
      id: 12,
      name: "FK Zvijezda",
      founded: 1952,
      stadium: "Gradski stadion",
      capacity: 3000,
      coach: "Darko Vojvodić",
      city: "Gradačac",
      logo: "/images/clubs/zvijezda.png",
    },
  ]

  return (
    <>
      <Head>
        <title>Klubovi | PLKutak</title>
        <meta name="description" content="Klubovi Premijer lige BiH" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Klubovi</h1>
        <p className={styles.subtitle}>Premijer liga BiH 2024/25</p>

        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <Link href={`/klubovi/${club.id}`} key={club.id} className={styles.clubCard}>
              <div className={styles.clubLogo}>
                <div className={styles.logoPlaceholder}>{club.name.charAt(0)}</div>
              </div>
              <div className={styles.clubInfo}>
                <h3 className={styles.clubName}>{club.name}</h3>
                <p className={styles.clubCity}>{club.city}</p>
                <div className={styles.clubDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Osnovan:</span>
                    <span className={styles.detailValue}>{club.founded}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Stadion:</span>
                    <span className={styles.detailValue}>{club.stadium}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Kapacitet:</span>
                    <span className={styles.detailValue}>{club.capacity.toLocaleString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trener:</span>
                    <span className={styles.detailValue}>{club.coach}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
