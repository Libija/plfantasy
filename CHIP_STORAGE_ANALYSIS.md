# 📊 ANALIZA: KAKO ČUVATI CHIPOVE

## 🔍 DVIJE OPCIJE

### Opcija 1: Samo `chip_used` u `GameweekTeam`
```python
class GameweekTeam(SQLModel, table=True):
    chip_used: Optional[ChipType] = Field(default=None)
```

### Opcija 2: Nova tabela `FantasyChip` + `chip_used` u `GameweekTeam`
```python
# U GameweekTeam
chip_used: Optional[ChipType] = Field(default=None)

# Nova tabela
class FantasyChip(SQLModel, table=True):
    fantasy_team_id: int
    chip_type: ChipType
    gameweek_used: int
    season: str
```

---

## ✅ PREDNOSTI I NEDOSTACI

### Opcija 1: Samo `chip_used` u `GameweekTeam`

**Prednosti:**
- ✅ Jednostavnije - samo jedna kolona
- ✅ Brzo provjeravanje chip-a za određeno kolo
- ✅ Manje tabela u bazi

**Nedostaci:**
- ❌ Teže provjeriti da li je chip već korišten u sezoni
- ❌ Treba query po svim `GameweekTeam` zapisima za tim
- ❌ Nema lako dostupne historije korištenih chipova
- ❌ Kompleksnije za validaciju "1 chip po sezoni"

**Primjer provjere da li je chip korišten:**
```python
# Treba query po svim kolima
used_chips = session.exec(
    select(GameweekTeam.chip_used)
    .where(GameweekTeam.user_id == user_id)
    .where(GameweekTeam.chip_used.isnot(None))
).all()
```

---

### Opcija 2: Nova tabela `FantasyChip` + `chip_used` u `GameweekTeam` (HIBRIDNI)

**Prednosti:**
- ✅ Lako provjeriti da li je chip korišten u sezoni (jednostavan query)
- ✅ Kompletan pregled historije chipova
- ✅ Brzo provjeravanje chip-a za određeno kolo (iz `GameweekTeam`)
- ✅ Jednostavna validacija "1 chip po sezoni"
- ✅ Mogućnost dodavanja dodatnih informacija (npr. `created_at`)

**Nedostaci:**
- ❌ Više tabela (ali minimalno)
- ❌ Treba održavati sinkronizaciju (ali jednostavno)

**Primjer provjere da li je chip korišten:**
```python
# Jednostavan query
chip_used = session.exec(
    select(FantasyChip)
    .where(FantasyChip.fantasy_team_id == fantasy_team_id)
    .where(FantasyChip.chip_type == chip_type)
    .where(FantasyChip.season == season)
).first()
```

---

## 🎯 PREPORUKA: HIBRIDNI PRISTUP

### Zašto hibridni pristup?

**Koristimo OBA:**

1. **`chip_used` u `GameweekTeam`** - za brzo provjeravanje chip-a u određenom kolu
   - Kada računamo bodove, direktno provjerimo `gameweek_team.chip_used`
   - Nema potrebe za join-om

2. **`FantasyChip` tabela** - za historiju i validaciju
   - Provjera da li je chip već korišten u sezoni
   - Pregled svih korištenih chipova
   - Statistika i analitika

### Kako funkcionira:

```python
# 1. Aktivacija chip-a
def activate_chip(fantasy_team_id, chip_type, gameweek_id):
    # Provjeri da li je već korišten (iz FantasyChip)
    if is_chip_used(fantasy_team_id, chip_type):
        return {"error": "Chip već korišten"}
    
    # Spremi u FantasyChip (historija)
    fantasy_chip = FantasyChip(
        fantasy_team_id=fantasy_team_id,
        chip_type=chip_type,
        gameweek_used=gameweek.number,
        season=season
    )
    session.add(fantasy_chip)
    
    # Spremi u GameweekTeam (za brzo provjeravanje)
    gameweek_team.chip_used = chip_type
    session.add(gameweek_team)
    
    session.commit()

# 2. Provjera chip-a u određenom kolu (brzo)
def is_chip_active(gameweek_team_id, chip_type):
    gameweek_team = session.get(GameweekTeam, gameweek_team_id)
    return gameweek_team.chip_used == chip_type

# 3. Provjera da li je chip korišten (jednostavno)
def is_chip_used(fantasy_team_id, chip_type, season):
    chip = session.exec(
        select(FantasyChip)
        .where(FantasyChip.fantasy_team_id == fantasy_team_id)
        .where(FantasyChip.chip_type == chip_type)
        .where(FantasyChip.season == season)
    ).first()
    return chip is not None
```

---

## 📋 FINALNA ODLUKA

### Koristimo HIBRIDNI PRISTUP:

1. **`chip_used` u `GameweekTeam`** ✅
   - Za brzo provjeravanje chip-a u određenom kolu
   - Koristi se u `_calculate_total_points()` i sličnim funkcijama

2. **`FantasyChip` tabela** ✅
   - Za historiju korištenih chipova
   - Za validaciju "1 chip po sezoni"
   - Za statistiku i pregled

### SQL migracije:

```sql
-- 1. Dodaj chip_used u GameweekTeam
ALTER TABLE gameweekteam 
ADD COLUMN chip_used chiptype_enum;

-- 2. Kreiraj FantasyChip tabelu
CREATE TABLE fantasychip (
    id SERIAL PRIMARY KEY,
    fantasy_team_id INTEGER REFERENCES fantasyteam(id),
    chip_type chiptype_enum NOT NULL,
    gameweek_used INTEGER NOT NULL,
    season VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fantasy_team_id, chip_type, season)  -- Jedan chip po sezoni
);
```

---

## 🎯 ZAKLJUČAK

**Hibridni pristup je najbolji jer:**
- ✅ Kombinuje prednosti obje opcije
- ✅ Brzo provjeravanje chip-a u određenom kolu
- ✅ Jednostavna validacija i historija
- ✅ Fleksibilnost za buduće proširenja

**Sinkronizacija nije problem:**
- Kada se aktivira chip, spremi se u oba mjesta
- Jednostavno i sigurno

