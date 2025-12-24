"""
Servis za automatsku moderaciju komentara - provjerava blacklist riječi
"""

# Blacklist riječi na bosanskom/srpskom (uvredljive riječi, psovke, itd.)
BLACKLIST_WORDS = [
    # Psovke i uvredljive riječi
    "jebem", "jebi", "jebote", "jebo", "jebati", "jebac", "jebacina",
    "kurva", "kurvin", "kurvina", "kurvinski", "kurvetina",
    "picka", "picki", "pickica", "picko",
    "majka", "mater", "materina", "materinski",
    "sise", "sisa", "sisica",
    "kurac", "kurcu", "kurca", "kurcina",
    "peder", "pederski", "pederi",
    "pederu", "pederac",
    "govno", "govna", "govnar", "govnarac",
    "retard", "retardiran", "retardirano",
    "idiot", "idijot", "idijotski",
    "debil", "debilac", "debilno",
    "kreten", "kretenu", "kretenski",
    "budala", "budalast", "budalasto",
    "glup", "glupo", "glupost", "glupan",
    "majmun", "majmunski",
    "zaboga", "zabogati",
    "sranje", "sranja",
    "seronja", "seronje",
    "smrad", "smradina",
    "gad", "gadina",
    "gadost", "gadno",
    "odvratno", "odvratan",
    "smece", "smece",
    "trash", "trashcan",
    # Dodatne uvredljive riječi
    "mrzim", "mrzis", "mrzimo",
    "mrzi", "mrzio", "mrzila",
    "ubij", "ubij se", "ubijte",
    "umri", "umri se", "umrite",
    "crkni", "crkavaj",
    "odjebi", "odjebite",
    "odjeb", "odjebi se",
    "jebiga", "jebote",
    "jebem ti", "jebem te",
    "jebem vam", "jebem vam se",
    "jebem se", "jebem se u",
    "jebem mater", "jebem majku",
    "jebem ti mater", "jebem ti majku",
    "jebem vam mater", "jebem vam majku",
    "jebem ti sve", "jebem vam sve",
    # Spam i reklame
    "click here", "click ovdje",
    "free money", "besplatan novac",
    "win prize", "osvoji nagradu",
    "buy now", "kupi sada",
    "discount", "popust",
    "promotion", "promocija",
    # Dodatne riječi
    "hack", "hacking", "hacker",
    "scam", "scammer",
    "spam", "spammer",
    "bot", "botovi",
    "fake", "fejk",
    "laz", "lazni",
    "prevara", "prevarant",
]

def check_blacklist(content: str) -> tuple[bool, list[str]]:
    """
    Provjerava da li komentar sadrži blacklist riječi.
    
    Returns:
        (has_blacklist_words: bool, found_words: list[str])
    """
    content_lower = content.lower()
    found_words = []
    
    for word in BLACKLIST_WORDS:
        if word in content_lower:
            found_words.append(word)
    
    return len(found_words) > 0, found_words

def moderate_comment(content: str) -> dict:
    """
    Provjerava komentar i vraća rezultat moderacije.
    
    Returns:
        {
            "approved": bool,
            "reason": str | None
        }
    """
    # Provjeri blacklist
    has_blacklist, found_words = check_blacklist(content)
    
    if has_blacklist:
        return {
            "approved": False,
            "reason": f"Komentar sadrži neprikladne riječi: {', '.join(found_words[:3])}"
        }
    
    # Provjeri dužinu (max 1000 karaktera)
    if len(content) > 1000:
        return {
            "approved": False,
            "reason": "Komentar je predugačak (maksimalno 1000 karaktera)"
        }
    
    # Provjeri minimalnu dužinu
    if len(content.strip()) < 3:
        return {
            "approved": False,
            "reason": "Komentar je prekratak"
        }
    
    # Sve je u redu - odobri
    return {
        "approved": True,
        "reason": None
    }

