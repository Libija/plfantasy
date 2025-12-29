# 🎯 KOMPLETAN PLAN IMPLEMENTACIJE CHIPOVA

## 📋 LISTA CHIPOVA KOJE ĆEMO IMPLEMENTIRATI

1. **Wildcard** - Neograničeni transferi bez penala
2. **Triple Captain** - Kapiten dobija ×3 umjesto ×2
3. **Bench Boost** - Igrači sa klupe doprinose bodovima
4. **Free Hit** - Tim se vraća na prethodni snapshot nakon kola
5. **Goal Frenzy** - Bonus +2 poena za svaki gol
6. **Shield** - Bonus +2 poena za clean sheet
7. **Double Trouble** (opcionalno) - Dva kapetana (oba ×2)

---

## 🗄️ 1. MODEL I BAZA PODATAKA

### 1.1 Dodati Enum za ChipType

**Fajl:** `models/gameweek_team_model.py` (ili novi `models/chip_model.py`)

```python
from enum import Enum
from sqlalchemy import Column, Enum as PgEnum

class ChipType(str, Enum):
    WILDCARD = "wildcard"
    TRIPLE_CAPTAIN = "triple_captain"
    BENCH_BOOST = "bench_boost"
    FREE_HIT = "free_hit"
    GOAL_FRENZY = "goal_frenzy"
    SHIELD = "shield"
    DOUBLE_TROUBLE = "double_trouble"
```

### 1.2 Dodati polje u GameweekTeam model

**Fajl:** `models/gameweek_team_model.py`

```python
class GameweekTeam(SQLModel, table=True):
    # ... postojeća polja ...
    chip_used: Optional[ChipType] = Field(
        default=None,
        sa_column=Column(PgEnum(ChipType, name="chiptype_enum"), name="chip_used"),
        description="Chip korišten u ovom kolu"
    )
```

**SQL migracija:**
```sql
-- Kreiraj enum tip
CREATE TYPE chiptype_enum AS ENUM ('wildcard', 'triple_captain', 'bench_boost', 'free_hit', 'goal_frenzy', 'shield', 'double_trouble');

-- Dodaj kolonu
ALTER TABLE gameweekteam 
ADD COLUMN chip_used chiptype_enum;
```

### 1.3 Kreirati novu tabelu `FantasyChip` za historiju

**FINALNA ODLUKA: HIBRIDNI PRISTUP**

Koristimo **OBA** pristupa:
1. **`chip_used` u `GameweekTeam`** - za brzo provjeravanje chip-a u određenom kolu
2. **`FantasyChip` tabela** - za historiju i validaciju

**Zašto hibridni?**
- ✅ Brzo provjeravanje chip-a u određenom kolu (iz `GameweekTeam`)
- ✅ Jednostavna validacija "1 chip po sezoni" (iz `FantasyChip`)
- ✅ Kompletan pregled historije chipova
- ✅ Fleksibilnost za buduće proširenja

**Fajl:** `models/chip_model.py` (novi)

```python
class FantasyChip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fantasy_team_id: int = Field(foreign_key="fantasyteam.id")
    chip_type: ChipType
    gameweek_used: int  # Broj kola u kojem je korišten
    season: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**SQL migracija:**
```sql
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

**Kako funkcionira:**
- Kada se aktivira chip, spremi se u **OBA** mjesta:
  1. `GameweekTeam.chip_used` - za brzo provjeravanje
  2. `FantasyChip` - za historiju i validaciju

---

## 🔧 2. WILDCARD

### 2.1 Šta radi
- Neograničeni transferi bez penala u jednom kolu
- Aktivira se prije početka kola

### 2.2 Gdje mijenjati

**A) Validacija aktivacije**
- **Fajl:** `services/chip_service.py` (novi)
- Provjeri da je kolo `SCHEDULED`
- Provjeri da chip nije već korišten u sezoni (iz `FantasyChip`)
- Provjeri da nije već neki chip aktivan u ovom kolu (iz `GameweekTeam.chip_used`)

**B) Transfer logika**
- **Fajl:** `services/transfer_service.py`
- **Funkcija:** `make_transfer()` i `save_transfers_service()`
- Preskoči penalizaciju i limit transfera ako je wildcard aktivan

**C) Endpoint za aktivaciju**
- **Fajl:** `controllers/chip_controller.py` (novi)
- `POST /api/fantasy/teams/{id}/chips/activate`

---

## ⚡ 3. TRIPLE CAPTAIN

### 3.1 Šta radi
- Kapiten dobija ×3 umjesto ×2 bodova

### 3.2 Gdje mijenjati

**A) Računanje bodova**
- **Fajl:** `services/gameweek_team_service.py`
- **Funkcija:** `_calculate_total_points()`
- **Linija ~690:** Umjesto `player_points * 2`, provjeri chip i koristi `player_points * 3`

**B) Prikaz bodova**
- **Fajl:** `services/fantasy_team_service.py`
- **Funkcija:** `get_team_current_gameweek_points_service()`
- **Linija ~618:** Umjesto `total_points * 2`, provjeri chip i koristi `total_points * 3`

**C) Frontend prikaz**
- **Fajl:** `frontend/src/app/fantasy/results/page.jsx`
- Prikaži ×3 umjesto ×2 kada je chip aktivan

---

## 🪑 4. BENCH BOOST

### 4.1 Šta radi
- Igrači sa klupe doprinose bodovima tima

### 4.2 Gdje mijenjati

**A) Računanje bodova**
- **Fajl:** `services/gameweek_team_service.py`
- **Funkcija:** `_calculate_total_points()`
- **Linija ~680:** Ukloni `if player.is_bench: continue` kada je chip aktivan

**B) Prikaz bodova**
- **Fajl:** `services/fantasy_team_service.py`
- **Funkcija:** `get_team_current_gameweek_points_service()`
- **Linija ~643:** Uključi bench igrače u sumu kada je chip aktivan

**C) Frontend prikaz**
- **Fajl:** `frontend/src/app/fantasy/results/page.jsx`
- Prikaži bench igrače kao dio tima kada je chip aktivan

---

## 🔄 5. FREE HIT

### 5.1 Šta radi
- Tim se vraća na prethodni snapshot nakon završetka kola
- Transferi se ne računaju u transfer log

### 5.2 Gdje mijenjati

**A) Aktivacija**
- **Fajl:** `services/chip_service.py`
- Snimiti trenutni tim kao backup (ili koristiti postojeći snapshot)

**B) Vraćanje tima**
- **Fajl:** `services/gameweek_team_service.py`
- **Funkcija:** `create_snapshots_for_completed_gameweek()`
- Nakon kreiranja snapshot-a, provjeri Free Hit i vrati tim na prethodni snapshot

**C) Transfer logika**
- **Fajl:** `services/transfer_service.py`
- Označi transfere kao `is_free_hit=True` (dodati polje u `TransferLog`)

**D) Snapshot logika**
- **Fajl:** `services/gameweek_team_service.py`
- **Funkcija:** `restore_team_from_snapshot()` (nova funkcija)
- Vrati tim na snapshot iz prethodnog kola

---

## ⚽ 6. GOAL FRENZY

### 6.1 Šta radi
- Bonus +2 poena za svaki gol

### 6.2 Gdje mijenjati

**A) Računanje bodova za golove**
- **Fajl:** `services/fantasy_scoring_service.py`
- **Funkcija:** `calculate_player_points()`
- Provjeri chip i dodaj +2 za svaki gol

**B) Provjera chip-a**
- Dohvati `GameweekTeam` za kolo i provjeri `chip_used == ChipType.GOAL_FRENZY`

**C) Logika**
```python
# U calculate_player_points()
if event.event_type == MatchEventType.goal:
    base_points = self.points_system[event.event_type].get(position, 0)
    
    # Provjeri Goal Frenzy chip
    if self._is_chip_active(fantasy_team_id, gameweek_id, ChipType.GOAL_FRENZY):
        base_points += 2  # Bonus +2
    
    total_points += base_points
```

---

## 🛡️ 7. SHIELD

### 7.1 Šta radi
- Bonus +2 poena za clean sheet

### 7.2 Gdje mijenjati

**A) Računanje clean sheet bodova**
- **Fajl:** `services/fantasy_scoring_service.py`
- **Funkcija:** `calculate_clean_sheet_points()`
- Provjeri chip i dodaj +2 za clean sheet

**B) Logika**
```python
# U calculate_clean_sheet_points()
clean_sheet_points = self.clean_sheet_points.get(position, 0)

# Provjeri Shield chip
if self._is_chip_active(fantasy_team_id, gameweek_id, ChipType.SHIELD):
    clean_sheet_points += 2  # Bonus +2

return clean_sheet_points
```

---

## 👥 8. DOUBLE TROUBLE (opcionalno)

### 8.1 Šta radi
- Kapiten i vice-kapiten oba dobijaju ×2 bodova (bez obzira da li je kapiten igrao)
- **NAPOMENA:** Koristimo postojećeg kapetena i vice-kapitena - ne treba dodavati nova polja!

### 8.2 Gdje mijenjati

**A) Računanje bodova**
- **Fajl:** `services/gameweek_team_service.py`
- **Funkcija:** `_calculate_total_points()`
- **Linija ~696-704:** Modificirati logiku za vice-kapitena da UVIJEK dobija ×2 kada je chip aktivan

**B) Prikaz bodova**
- **Fajl:** `services/fantasy_team_service.py`
- **Funkcija:** `get_team_current_gameweek_points_service()`
- **Linija ~621-625:** Modificirati logiku za vice-kapitena da UVIJEK dobija ×2 kada je chip aktivan

**C) Logika implementacije**

```python
# U _calculate_total_points()
is_double_trouble = self._is_chip_active(team_id, gameweek_id, ChipType.DOUBLE_TROUBLE)

if captain_id and captain_id > 0 and player.player_id == captain_id:
    if captain_played:
        total_points += player_points * 2  # Kapiten ×2
    else:
        total_points += player_points  # Kapiten nije igrao → ×1
        
elif vice_captain_id and vice_captain_id > 0 and player.player_id == vice_captain_id:
    if is_double_trouble:
        # Sa Double Trouble, vice-kapiten UVIJEK dobija ×2
        total_points += player_points * 2
    elif not captain_played:
        # Normalno: vice-kapiten ×2 samo ako kapiten nije igrao
        total_points += player_points * 2
    else:
        # Normalno: vice-kapiten ×1 ako je kapiten igrao
        total_points += player_points
```

```python
# U get_team_current_gameweek_points_service()
is_double_trouble = self._is_chip_active(fantasy_team_id, current_gameweek.id, ChipType.DOUBLE_TROUBLE)

if team_player.is_captain:
    if captain_played:
        final_points = total_points * 2  # Kapiten ×2
    else:
        final_points = total_points  # Kapiten nije igrao → ×1
        
elif team_player.is_vice_captain:
    if is_double_trouble:
        # Sa Double Trouble, vice-kapiten UVIJEK dobija ×2
        final_points = total_points * 2
    elif captain_played:
        final_points = total_points  # Normalno: ×1
    else:
        final_points = total_points * 2  # Normalno: ×2 ako kapiten nije igrao
```

**D) Frontend prikaz**
- **Fajl:** `frontend/src/app/fantasy/results/page.jsx`
- Prikaži da oba (kapiten i vice-kapiten) dobijaju ×2 kada je chip aktivan

### 8.3 Prednosti ovog pristupa
- ✅ Ne treba dodavati nova polja u model
- ✅ Koristi postojeću logiku za kapiten/vice-kapiten
- ✅ Jednostavnije za implementaciju
- ✅ Manje rizično - ne mijenja strukturu baze

---

## 📝 9. NOVI FAJLOVI I FUNKCIJE

### 9.1 Novi fajlovi

1. **`models/chip_model.py`** - ChipType enum i FantasyChip model
2. **`services/chip_service.py`** - Logika za aktivaciju i validaciju chipova
3. **`controllers/chip_controller.py`** - API endpointi za chipove
4. **`schemas/chip_schema.py`** - Pydantic schemas za chipove

### 9.2 Nove funkcije

**U `services/chip_service.py`:**
```python
class ChipService:
    def activate_chip(self, fantasy_team_id: int, chip_type: ChipType, gameweek_id: int) -> Dict[str, Any]
    def is_chip_used(self, fantasy_team_id: int, chip_type: ChipType, season: str) -> bool
    def is_chip_active_in_gameweek(self, user_id: int, gameweek_id: int) -> Optional[ChipType]
    def get_available_chips(self, fantasy_team_id: int, season: str) -> List[ChipType]
    def validate_chip_activation(self, fantasy_team_id: int, chip_type: ChipType, gameweek_id: int) -> Dict[str, Any]
```

**Primjer `validate_chip_activation()` sa OBJE provjere:**
```python
def validate_chip_activation(self, fantasy_team_id: int, chip_type: ChipType, gameweek_id: int) -> Dict[str, Any]:
    """Validira aktivaciju chip-a - provjerava SVE uvjete"""
    
    # 1. Provjeri da li je kolo SCHEDULED
    gameweek = session.get(Gameweek, gameweek_id)
    if gameweek.status != GameweekStatus.SCHEDULED:
        return {"valid": False, "error": "Chip se može aktivirati samo dok je kolo zakazano"}
    
    # 2. Provjeri da li je chip IKAD korišten u sezoni (iz FantasyChip)
    chip_used = session.exec(
        select(FantasyChip)
        .where(FantasyChip.fantasy_team_id == fantasy_team_id)
        .where(FantasyChip.chip_type == chip_type)
        .where(FantasyChip.season == gameweek.season)
    ).first()
    
    if chip_used:
        return {"valid": False, "error": f"{chip_type} je već korišten u ovoj sezoni"}
    
    # 3. Provjeri da li je već neki chip aktivan u OVOM kolu (iz GameweekTeam.chip_used)
    fantasy_team = session.get(FantasyTeam, fantasy_team_id)
    gameweek_team = get_user_gameweek_team(session, fantasy_team.user_id, gameweek_id)
    
    if gameweek_team and gameweek_team.chip_used:
        return {"valid": False, "error": f"Već je aktivan chip: {gameweek_team.chip_used} u ovom kolu"}
    
    return {"valid": True}
```

**U `services/gameweek_team_service.py`:**
```python
def restore_team_from_snapshot(self, user_id: int, snapshot_gameweek_id: int) -> bool
def _is_chip_active(self, fantasy_team_id: int, gameweek_id: int, chip_type: ChipType) -> bool
```

**U `services/fantasy_scoring_service.py`:**
```python
def _is_chip_active(self, fantasy_team_id: int, gameweek_id: int, chip_type: ChipType) -> bool
```

---

## 🔄 10. REDOSLIJED IMPLEMENTACIJE

### Faza 1: Osnovna infrastruktura
1. ✅ Dodati `budget_snapshot` i `price_at_snapshot` (već urađeno)
2. Kreirati `ChipType` enum
3. Dodati `chip_used` u `GameweekTeam`
4. Kreirati `FantasyChip` tabelu
5. Kreirati `ChipService` sa osnovnim funkcijama

### Faza 2: Jednostavni chipovi
6. **Triple Captain** - Najjednostavniji, samo promjena multiplikatora
7. **Bench Boost** - Uklanjanje provjere za bench
8. **Wildcard** - Preskakanje penala u transferima

### Faza 3: Napredni chipovi
9. **Goal Frenzy** - Modifikacija bodovanja golova
10. **Shield** - Modifikacija clean sheet bodova
11. **Free Hit** - Kompleksna logika vraćanja tima

### Faza 4: Opcionalni
12. **Double Trouble** - Modifikacija logike za vice-kapitena (oba ×2)

---

## 🎨 11. FRONTEND IZMJENE

### 11.1 Novi komponenti

1. **`ChipSelector.jsx`** - Komponenta za odabir chipa
2. **`ChipBadge.jsx`** - Badge za prikaz aktivnog chipa
3. **`ChipHistory.jsx`** - Prikaz korištenih chipova

### 11.2 Izmjene u postojećim fajlovima

**`frontend/src/app/fantasy/transfers/page.jsx`:**
- Dodati UI za aktivaciju chipova
- Prikazati aktivni chip
- **Disable-ati sve chip buttone kada je jedan chip aktivan u kolu**
- Validacija pri transferima
- Prikazati dostupne chipove (koji nisu korišteni u sezoni)

**`frontend/src/app/fantasy/results/page.jsx`:**
- Prikazati korišteni chip u rezultatima
- Prikazati ×3 za Triple Captain
- Prikazati bench igrače za Bench Boost
- Prikazati da oba (kapiten i vice-kapiten) dobijaju ×2 za Double Trouble

---

## ✅ 12. VALIDACIJE I PRAVILA

### 12.1 Pravila za chipove

- **Wildcard:** 1 po sezoni (ili 2: jedan u prvom, jedan u drugom dijelu)
- **Triple Captain:** 1 po sezoni
- **Bench Boost:** 1 po sezoni
- **Free Hit:** 1 po sezoni
- **Goal Frenzy:** 1 po sezoni
- **Shield:** 1 po sezoni
- **Double Trouble:** 1 po sezoni (ako se implementira)

### 12.2 Validacije

**Pri aktivaciji chip-a, provjeriti:**

1. **Chip se može aktivirati samo dok je kolo `SCHEDULED`**
   - Provjeri status kola

2. **Provjera da li je chip IKAD korišten u sezoni** (iz `FantasyChip`)
   ```python
   chip_exists = session.exec(
       select(FantasyChip)
       .where(FantasyChip.fantasy_team_id == fantasy_team_id)
       .where(FantasyChip.chip_type == chip_type)
       .where(FantasyChip.season == season)
   ).first()
   ```

3. **Provjera da li je već neki chip aktivan u OVOM kolu** (iz `GameweekTeam.chip_used`)
   ```python
   gameweek_team = get_user_gameweek_team(session, user_id, gameweek_id)
   if gameweek_team and gameweek_team.chip_used:
       return {"error": f"Već je aktivan chip: {gameweek_team.chip_used} u ovom kolu!"}
   ```

4. **Provjera da li je kolo već počelo**
   - Kolo mora biti `SCHEDULED`, ne `IN_PROGRESS` ili `COMPLETED`

---

## 📊 13. TESTIRANJE

### 13.1 Test scenariji

1. **Wildcard:**
   - Aktiviraj wildcard
   - Napravi 10+ transfera
   - Provjeri da nema penala

2. **Triple Captain:**
   - Aktiviraj triple captain
   - Provjeri da kapiten dobija ×3

3. **Bench Boost:**
   - Aktiviraj bench boost
   - Provjeri da bench igrači doprinose bodovima

4. **Free Hit:**
   - Aktiviraj free hit
   - Napravi transfere
   - Završi kolo
   - Provjeri da se tim vratio na prethodni snapshot

5. **Goal Frenzy:**
   - Aktiviraj goal frenzy
   - Provjeri da golovi daju +2 bonus

6. **Shield:**
   - Aktiviraj shield
   - Provjeri da clean sheet daje +2 bonus

7. **Double Trouble:**
   - Aktiviraj double trouble
   - Provjeri da i kapiten i vice-kapiten dobijaju ×2
   - Provjeri da vice-kapiten dobija ×2 čak i ako je kapiten igrao

---

## 🚀 14. PRIORITETI

### Visoki prioritet (Faza 1-2):
1. Triple Captain
2. Bench Boost
3. Wildcard

### Srednji prioritet (Faza 3):
4. Goal Frenzy
5. Shield
6. Free Hit

### Nizak prioritet (Faza 4):
7. Double Trouble

---

## 📝 15. DODATNE NAPOMENE

- **Hibridni pristup:** Koristiti `GameweekTeam.chip_used` za brzo provjeravanje i `FantasyChip` za historiju
- Kada se aktivira chip, spremi se u **OBA** mjesta (sinkronizacija)
- Validirati aktivaciju prije početka kola
- Provjeriti da li je chip već korišten iz `FantasyChip` tabele
- Provjeriti da li je već neki chip aktivan u kolu iz `GameweekTeam.chip_used`
- **Frontend:** Disable-ati sve chip buttone kada je jedan chip aktivan u kolu
- **Frontend:** Disable-ati chipove koji su već korišteni u sezoni
- Prikazati chip status u UI-u
- Logirati sve aktivacije chipova za debugging

### 15.1 Frontend logika za disable

```javascript
// U ChipSelector komponenti
const [activeChip, setActiveChip] = useState(null); // Chip aktivan u ovom kolu
const [usedChips, setUsedChips] = useState([]);     // Chipovi korišteni u sezoni

const isChipDisabled = (chipType) => {
  // Disable ako je već korišten u sezoni
  if (usedChips.includes(chipType)) {
    return true;
  }
  
  // Disable ako je već neki chip aktivan u kolu
  if (activeChip && activeChip !== chipType) {
    return true;
  }
  
  return false;
};

// Pri render-u
{chips.map(chip => (
  <button
    key={chip.type}
    disabled={isChipDisabled(chip.type)}
    onClick={() => activateChip(chip.type)}
  >
    {chip.name}
    {usedChips.includes(chip.type) && <span> (Korišten)</span>}
    {activeChip === chip.type && <span> (Aktivan)</span>}
  </button>
))}
```

---

**NAPOMENA:** Ovaj plan je kompletan i detaljan. Možeš ga koristiti kao checklist za implementaciju. Preporučujem da počneš sa Faza 1 i 2 (Triple Captain, Bench Boost, Wildcard) jer su najjednostavniji.

