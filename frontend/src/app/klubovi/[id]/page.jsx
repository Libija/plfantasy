"use client"

import Head from "next/head"
import Link from "next/link"
import { useParams } from "next/navigation"
import styles from "../../../styles/KluboviDetalji.module.css"

export default function KluboviDetalji() {
  const params = useParams()
  const id = params.id

  // Simulirani podaci za klub
  const club = {
    id: id,
    name: "FK Sarajevo",
    fullName: "Fudbalski klub Sarajevo",
    founded: 1946,
    stadium: "Koševo",
    capacity: 34000,
    coach: "Husref Musemić",
    city: "Sarajevo",
    logo: "/images/clubs/sarajevo.png",
    colors: "Bordo-bijela",
    nickname: "Bordo tim",
    website: "www.fcsarajevo.ba",
    address: "Patriotske lige 2, 71000 Sarajevo",
    description: `
      FK Sarajevo je bosanskohercegovački fudbalski klub iz Sarajeva. Osnovan je 1946. godine i jedan je od najuspješnijih klubova u Bosni i Hercegovini.
      
      Klub je osvojio brojne trofeje, uključujući nekoliko titula prvaka Premijer lige BiH i Kupa BiH. FK Sarajevo je također učestvovao u evropskim takmičenjima, uključujući kvalifikacije za Ligu prvaka i Ligu Evrope.
      
      Domaće utakmice igra na stadionu Koševo, koji je jedan od najvećih stadiona u Bosni i Hercegovini. Tradicionalne boje kluba su bordo i bijela, po čemu su dobili nadimak "Bordo tim".
    `,
    trophies: [
      { name: "Premijer liga BiH", count: 5, years: "2006/07, 2014/15, 2018/19, 2019/20, 2020/21" },
      { name: "Kup BiH", count: 6, years: "1996/97, 1997/98, 2001/02, 2004/05, 2013/14, 2018/19" },
      { name: "Prvenstvo Jugoslavije", count: 2, years: "1966/67, 1984/85" },
      { name: "Kup Jugoslavije", count: 1, years: "1966/67" },
    ],
    squad: [
      { number: 1, name: "Kenan Pirić", position: "Golman", age: 28, nationality: "BiH" },
      { number: 2, name: "Siniša Stevanović", position: "Odbrana", age: 30, nationality: "BiH" },
      { number: 5, name: "Besim Šerbečić", position: "Odbrana", age: 26, nationality: "BiH" },
      { number: 6, name: "Selmir Pidro", position: "Odbrana", age: 25, nationality: "BiH" },
      { number: 3, name: "Nihad Mujakić", position: "Odbrana", age: 27, nationality: "BiH" },
      { number: 8, name: "Amar Rahmanović", position: "Veznjak", age: 26, nationality: "BiH" },
      { number: 10, name: "Krste Velkoski", position: "Veznjak", age: 29, nationality: "Sjeverna Makedonija" },
      { number: 20, name: "Ivan Jukić", position: "Veznjak", age: 24, nationality: "BiH" },
      { number: 7, name: "Benjamin Tatar", position: "Napadač", age: 28, nationality: "BiH" },
      { number: 9, name: "Mersudin Ahmetović", position: "Napadač", age: 27, nationality: "BiH" },
      { number: 11, name: "Matthias Fanimo", position: "Napadač", age: 26, nationality: "Engleska" },
      { number: 12, name: "Belmin Dizdarević", position: "Golman", age: 22, nationality: "BiH" },
      { number: 4, name: "Aleksandar Vojnović", position: "Odbrana", age: 23, nationality: "BiH" },
      { number: 15, name: "Dino Ćorić", position: "Veznjak", age: 24, nationality: "BiH" },
      { number: 17, name: "Almir Bekić", position: "Veznjak", age: 22, nationality: "BiH" },
      { number: 19, name: "Kerim Memija", position: "Odbrana", age: 27, nationality: "BiH" },
      { number: 21, name: "Andrej Đokanović", position: "Napadač", age: 21, nationality: "BiH" },
      { number: 23, name: "Amar Beganović", position: "Veznjak", age: 20, nationality: "BiH" },
    ],
    recentMatches: [
      {
        id: 1,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Zrinjski",
        homeScore: 2,
        awayScore: 1,
        date: "19.05.2025.",
      },
      {
        id: 2,
        competition: "Premijer liga BiH",
        home: "Borac",
        away: "Sarajevo",
        homeScore: 3,
        awayScore: 2,
        date: "12.05.2025.",
      },
      {
        id: 3,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Tuzla City",
        homeScore: 3,
        awayScore: 0,
        date: "05.05.2025.",
      },
      {
        id: 4,
        competition: "Kup BiH",
        home: "Sarajevo",
        away: "Željezničar",
        homeScore: 2,
        awayScore: 1,
        date: "01.05.2025.",
      },
      {
        id: 5,
        competition: "Premijer liga BiH",
        home: "Široki Brijeg",
        away: "Sarajevo",
        homeScore: 0,
        awayScore: 2,
        date: "28.04.2025.",
      },
    ],
    upcomingMatches: [
      {
        id: 6,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Željezničar",
        date: "25.05.2025.",
        time: "20:00",
      },
      {
        id: 7,
        competition: "Premijer liga BiH",
        home: "Velež",
        away: "Sarajevo",
        date: "01.06.2025.",
        time: "18:00",
      },
      {
        id: 8,
        competition: "Premijer liga BiH",
        home: "Sarajevo",
        away: "Sloboda",
        date: "08.06.2025.",
        time: "20:00",
      },
    ],
  }

  if (!id) {
    return null // Ili neki loading state
  }

  return (
    <>
      <Head>
        <title>{club.name} | PLKutak</title>
        <meta name="description" content={`Informacije o klubu ${club.name} - Premijer liga BiH`} />
      </Head>

      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Početna</Link> / <Link href="/klubovi">Klubovi</Link> / <span>{club.name}</span>
        </div>

        <div className={styles.clubHeader}>
          <div className={styles.clubLogo}>
            <div className={styles.logoPlaceholder}>{club.name.charAt(0)}</div>
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <p className={styles.clubFullName}>{club.fullName}</p>
            <div className={styles.clubBasicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Osnovan</span>
                <span className={styles.infoValue}>{club.founded}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Grad</span>
                <span className={styles.infoValue}>{club.city}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stadion</span>
                <span className={styles.infoValue}>{club.stadium}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kapacitet</span>
                <span className={styles.infoValue}>{club.capacity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tabButton} ${styles.active}`}>Pregled</button>
          <button className={styles.tabButton}>Igrači</button>
          <button className={styles.tabButton}>Utakmice</button>
          <button className={styles.tabButton}>Statistika</button>
        </div>

        <div className={styles.clubContent}>
          <div className={styles.aboutClub}>
            <div className={styles.sectionHeader}>
              <h2>O klubu</h2>
            </div>
            <div className={styles.aboutContent}>
              <div className={styles.description}>
                {club.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className={styles.clubDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Puno ime</span>
                  <span className={styles.detailValue}>{club.fullName}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Nadimak</span>
                  <span className={styles.detailValue}>{club.nickname}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Boje</span>
                  <span className={styles.detailValue}>{club.colors}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trener</span>
                  <span className={styles.detailValue}>{club.coach}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Web stranica</span>
                  <span className={styles.detailValue}>{club.website}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Adresa</span>
                  <span className={styles.detailValue}>{club.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.trophies}>
            <div className={styles.sectionHeader}>
              <h2>Trofeji</h2>
            </div>
            <div className={styles.trophiesContent}>
              {club.trophies.map((trophy, index) => (
                <div key={index} className={styles.trophyItem}>
                  <div className={styles.trophyIcon}>🏆</div>
                  <div className={styles.trophyInfo}>
                    <div className={styles.trophyName}>
                      {trophy.name} <span className={styles.trophyCount}>x{trophy.count}</span>
                    </div>
                    <div className={styles.trophyYears}>{trophy.years}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.squad}>
            <div className={styles.sectionHeader}>
              <h2>Igrači</h2>
            </div>
            <div className={styles.squadContent}>
              <div className={styles.positionGroup}>
                <h3>Golmani</h3>
                <div className={styles.playersList}>
                  {club.squad
                    .filter((player) => player.position === "Golman")
                    .map((player) => (
                      <div key={player.number} className={styles.playerCard}>
                        <div className={styles.playerNumber}>{player.number}</div>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerDetails}>
                            <span>{player.age} god.</span>
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className={styles.positionGroup}>
                <h3>Odbrana</h3>
                <div className={styles.playersList}>
                  {club.squad
                    .filter((player) => player.position === "Odbrana")
                    .map((player) => (
                      <div key={player.number} className={styles.playerCard}>
                        <div className={styles.playerNumber}>{player.number}</div>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerDetails}>
                            <span>{player.age} god.</span>
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className={styles.positionGroup}>
                <h3>Veznjaci</h3>
                <div className={styles.playersList}>
                  {club.squad
                    .filter((player) => player.position === "Veznjak")
                    .map((player) => (
                      <div key={player.number} className={styles.playerCard}>
                        <div className={styles.playerNumber}>{player.number}</div>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerDetails}>
                            <span>{player.age} god.</span>
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className={styles.positionGroup}>
                <h3>Napadači</h3>
                <div className={styles.playersList}>
                  {club.squad
                    .filter((player) => player.position === "Napadač")
                    .map((player) => (
                      <div key={player.number} className={styles.playerCard}>
                        <div className={styles.playerNumber}>{player.number}</div>
                        <div className={styles.playerInfo}>
                          <div className={styles.playerName}>{player.name}</div>
                          <div className={styles.playerDetails}>
                            <span>{player.age} god.</span>
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.matches}>
            <div className={styles.sectionHeader}>
              <h2>Utakmice</h2>
            </div>
            <div className={styles.matchesContent}>
              <div className={styles.matchesGroup}>
                <h3>Nedavne utakmice</h3>
                <div className={styles.matchesList}>
                  {club.recentMatches.map((match) => (
                    <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                      <div className={styles.matchInfo}>
                        <span className={styles.matchCompetition}>{match.competition}</span>
                        <span className={styles.matchDate}>{match.date}</span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div
                          className={`${styles.matchTeam} ${
                            match.home === club.name ? styles.homeTeam : styles.awayTeam
                          }`}
                        >
                          {match.home}
                        </div>
                        <div className={styles.matchScore}>
                          {match.homeScore} - {match.awayScore}
                        </div>
                        <div
                          className={`${styles.matchTeam} ${
                            match.away === club.name ? styles.homeTeam : styles.awayTeam
                          }`}
                        >
                          {match.away}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.matchesGroup}>
                <h3>Nadolazeće utakmice</h3>
                <div className={styles.matchesList}>
                  {club.upcomingMatches.map((match) => (
                    <Link href={`/utakmice/${match.id}`} key={match.id} className={styles.matchCard}>
                      <div className={styles.matchInfo}>
                        <span className={styles.matchCompetition}>{match.competition}</span>
                        <span className={styles.matchDate}>
                          {match.date} | {match.time}
                        </span>
                      </div>
                      <div className={styles.matchTeams}>
                        <div
                          className={`${styles.matchTeam} ${
                            match.home === club.name ? styles.homeTeam : styles.awayTeam
                          }`}
                        >
                          {match.home}
                        </div>
                        <div className={styles.matchVs}>VS</div>
                        <div
                          className={`${styles.matchTeam} ${
                            match.away === club.name ? styles.homeTeam : styles.awayTeam
                          }`}
                        >
                          {match.away}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
