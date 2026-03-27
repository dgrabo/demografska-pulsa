"""
Skripta za obradu podataka o naseljima iz Popisa stanovništva 2011. i 2021.
Čita originalne DZS Excel datoteke i generira naselja.json.

Potrebne datoteke u raw/:
  - Nas_01_HR.xls  (Popis 2011. — stanovništvo prema starosti i spolu po naseljima)
  - popis_2021-stanovnistvo_po_naseljima.xlsx  (Popis 2021. — isto)
"""

import json
import os
import re
import unicodedata

import pandas as pd

# ---------------------------------------------------------------------------
# Konfiguracija putanja
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, "raw")
OUT_DIR = os.path.join(SCRIPT_DIR, "..", "public", "data")

FILE_2011 = os.path.join(RAW_DIR, "Nas_01_HR.xls")
FILE_2021 = os.path.join(RAW_DIR, "popis_2021-stanovnistvo_po_naseljima.xlsx")

# ---------------------------------------------------------------------------
# Mapiranje naziva županija -> kratki ID (2 ili 3 slova)
# ---------------------------------------------------------------------------
ZUPANIJA_ID = {
    "Zagrebačka":                "ZK",
    "Krapinsko-zagorska":        "KR",
    "Sisačko-moslavačka":        "SM",
    "Karlovačka":                "KA",
    "Varaždinska":               "VZ",
    "Koprivničko-križevačka":    "KZ",
    "Bjelovarsko-bilogorska":    "BB",
    "Primorsko-goranska":        "PG",
    "Ličko-senjska":             "LS",
    "Virovitičko-podravska":     "VP",
    "Požeško-slavonska":         "PS",
    "Brodsko-posavska":          "BPZ",
    "Zadarska":                  "ZD",
    "Osječko-baranjska":         "OB",
    "Šibensko-kninska":          "SK",
    "Vukovarsko-srijemska":      "VK",
    "Splitsko-dalmatinska":      "SD",
    "Istarska":                  "IS",
    "Dubrovačko-neretvanska":    "DN",
    "Međimurska":                "ME",
    "Grad Zagreb":               "ZG",
}


def norm(s):
    """Normaliziraj string za usporedbu: lowercase, bez dijakritika."""
    if not isinstance(s, str):
        return ""
    s = s.strip()
    s = re.sub(r"[\u2013\u2014\u2012]", "-", s)
    s = re.sub(r"\s*-\s*", "-", s)
    s = re.sub(r"[-\s]+", " ", s)
    s = s.lower()
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_str


def safe_int(val):
    """Pretvori vrijednost u int, vrati 0 ako ne može. '-' znači 0."""
    if isinstance(val, str) and val.strip() == "-":
        return 0
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 0


def slugify(s):
    """Pretvori string u URL-friendly slug."""
    s = norm(s)
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s


def classify_status(pop_2021, promjena_pct):
    """Klasificiraj status naselja prema pravilima."""
    if pop_2021 < 10:
        return "napusteno"
    if promjena_pct <= -30:
        return "kriticno"
    if promjena_pct <= -2:
        return "pada"
    if promjena_pct <= 2:
        return "stagnira"
    return "raste"


# ---------------------------------------------------------------------------
# Čitanje 2021. podataka o naseljima
# ---------------------------------------------------------------------------
def read_2021_naselja():
    """
    Čita sheet '1.' iz popis_2021-stanovnistvo_po_naseljima.xlsx.

    Raspored stupaca (nakon skiprows=8):
      0  = Županija (ffill)
      1  = Tip (Grad/Općina) — sparse
      4  = Grad/općina naziv (ffill)
      5  = Naselje
      6  = Spol ('sv.' = ukupno)
      8  = Ukupno (total)
      9  = 0–4,  10 = 5–9,  11 = 10–14    → mladi
      22 = 65–69, 23 = 70–74, 24 = 75–79,
      25 = 80–84, 26 = 85–89, 27 = 90–94,
      28 = 95+                              → stari
    """
    print("Čitam 2021. podatke o naseljima...")
    df = pd.read_excel(FILE_2021, sheet_name="1.", header=None, skiprows=8)

    # Forward-fill county; municipality gets ffill only within the same county
    df[0] = df[0].ffill()
    # When county changes, NaN in col 4 means the county IS the municipality
    # (e.g. "Grad Zagreb"). Reset ffill at county boundaries.
    county_changed = df[0] != df[0].shift(1)
    df.loc[county_changed & df[4].isna(), 4] = df.loc[county_changed & df[4].isna(), 0]
    df[4] = df[4].ffill()

    # Filter: settlement name present (col 5) AND sex = 'sv.' (col 6)
    df = df[df[5].notna()].copy()
    df = df[df[6].astype(str).str.strip() == "sv."].copy()

    result = []
    for _, row in df.iterrows():
        zup_raw = str(row[0]).strip()
        opcina = str(row[4]).strip()
        naselje = str(row[5]).strip()

        if not naselje or naselje.lower() in ("nan", "ukupno"):
            continue

        ukupno = safe_int(row[8])
        mladi = safe_int(row[9]) + safe_int(row[10]) + safe_int(row[11])
        stari = sum(safe_int(row[c]) for c in range(22, 29))

        result.append({
            "zupanija_raw": zup_raw,
            "opcina_raw": opcina,
            "naziv": naselje,
            "ukupno_2021": ukupno,
            "mladi_2021": mladi,
            "stari_2021": stari,
        })

    print(f"  > {len(result)} naselja učitano iz 2021.")
    return pd.DataFrame(result)


# ---------------------------------------------------------------------------
# Čitanje 2011. podataka o naseljima
# ---------------------------------------------------------------------------
def read_2011_naselja():
    """
    Čita sheet 'ST. PREMA STAROSTI I SPOLU' iz Nas_01_HR.xls.

    Raspored stupaca (nakon skiprows=3):
      0  = Ime županije (ffill)
      1  = Tip (Grad/Općina) — sparse
      2  = Ime grada/općine (ffill)
      3  = Ime naselja ('UKUPNO' = ukupno za općinu — preskočiti)
      4  = Spol ('sv.' = ukupno)
      5  = Ukupno (total)
      6  = 0–4,  7 = 5–9,  8 = 10–14      → mladi
      19 = 65–69, 20 = 70–74, 21 = 75–79,
      22 = 80–84, 23 = 85–89, 24 = 90–94,
      25 = 95+                              → stari
    """
    print("Čitam 2011. podatke o naseljima...")
    df = pd.read_excel(
        FILE_2011,
        sheet_name="ST. PREMA STAROSTI I SPOLU",
        header=None,
        skiprows=3,
    )

    # Forward-fill county; municipality gets ffill within same county
    df[0] = df[0].ffill()
    county_changed = df[0] != df[0].shift(1)
    df.loc[county_changed & df[2].isna(), 2] = df.loc[county_changed & df[2].isna(), 0]
    df[2] = df[2].ffill()

    # Filter: sex = 'sv.' AND settlement name is not 'UKUPNO'
    df = df[df[4].astype(str).str.strip() == "sv."].copy()
    df = df[df[3].astype(str).str.strip() != "UKUPNO"].copy()
    df = df[df[3].notna()].copy()

    result = []
    for _, row in df.iterrows():
        zup_raw = str(row[0]).strip()
        opcina = str(row[2]).strip()
        naselje = str(row[3]).strip()

        if not naselje or naselje.lower() in ("nan", "ukupno"):
            continue

        ukupno = safe_int(row[5])
        mladi = safe_int(row[6]) + safe_int(row[7]) + safe_int(row[8])
        stari = sum(safe_int(row[c]) for c in range(19, 26))

        result.append({
            "zupanija_raw": zup_raw,
            "opcina_raw": opcina,
            "naziv": naselje,
            "ukupno_2011": ukupno,
            "mladi_2011": mladi,
            "stari_2011": stari,
        })

    print(f"  > {len(result)} naselja učitano iz 2011.")
    return pd.DataFrame(result)


# ---------------------------------------------------------------------------
# Spajanje i računanje
# ---------------------------------------------------------------------------
def merge_naselja(df_2021, df_2011):
    """Spoji podatke po ključu županija|općina|naselje."""
    print("Spajam podatke o naseljima 2011. <-> 2021. ...")

    # Three-part match key for precise matching
    df_2021["match_key"] = df_2021.apply(
        lambda r: norm(r["zupanija_raw"]) + "|" + norm(r["opcina_raw"]) + "|" + norm(r["naziv"]),
        axis=1,
    )
    df_2011["match_key"] = df_2011.apply(
        lambda r: norm(r["zupanija_raw"]) + "|" + norm(r["opcina_raw"]) + "|" + norm(r["naziv"]),
        axis=1,
    )

    merged = pd.merge(
        df_2021,
        df_2011[["match_key", "ukupno_2011", "mladi_2011", "stari_2011"]],
        on="match_key",
        how="left",
    )

    # Report unmatched
    unmatched = merged[merged["ukupno_2011"].isna()]
    if len(unmatched) > 0:
        print(f"  UPOZORENJE: {len(unmatched)} naselja iz 2021. nema par u 2011.")
        if len(unmatched) <= 20:
            for _, row in unmatched.iterrows():
                print(f"    - {row['naziv']} ({row['opcina_raw']}, {row['zupanija_raw']})")

    # Fill missing 2011 data with 0
    for col in ["ukupno_2011", "mladi_2011", "stari_2011"]:
        merged[col] = merged[col].fillna(0).astype(int)

    # Calculate change
    merged["promjena_abs"] = merged["ukupno_2021"] - merged["ukupno_2011"]
    merged["promjena_pct"] = merged.apply(
        lambda r: round((r["promjena_abs"] / r["ukupno_2011"]) * 100, 1)
        if r["ukupno_2011"] > 0 else 0.0,
        axis=1,
    )

    # Age percentages from 2021 data
    merged["mladi_pct"] = merged.apply(
        lambda r: round((r["mladi_2021"] / r["ukupno_2021"]) * 100, 1)
        if r["ukupno_2021"] > 0 else 0.0,
        axis=1,
    )
    merged["stari_pct"] = merged.apply(
        lambda r: round((r["stari_2021"] / r["ukupno_2021"]) * 100, 1)
        if r["ukupno_2021"] > 0 else 0.0,
        axis=1,
    )
    merged["radni_pct"] = merged.apply(
        lambda r: round(100 - r["mladi_pct"] - r["stari_pct"], 1), axis=1
    )

    # County ID mapping
    zup_id_map = {norm(name): zid for name, zid in ZUPANIJA_ID.items()}
    zup_name_map = {norm(name): name for name in ZUPANIJA_ID}
    merged["zupanija_id"] = merged["zupanija_raw"].apply(
        lambda z: zup_id_map.get(norm(z), "??")
    )
    merged["zupanija_naziv"] = merged["zupanija_raw"].apply(
        lambda z: zup_name_map.get(norm(z), z)
    )

    unknown = merged[merged["zupanija_id"] == "??"]["zupanija_raw"].unique()
    if len(unknown) > 0:
        print(f"  UPOZORENJE: Neprepoznate županije: {list(unknown)}")

    # Status classification
    merged["status"] = merged.apply(
        lambda r: classify_status(r["ukupno_2021"], r["promjena_pct"]), axis=1
    )

    # Settlement ID (slug): county-municipality-settlement
    merged["id"] = merged.apply(
        lambda r: f"{r['zupanija_id'].lower()}-{slugify(r['opcina_raw'])}-{slugify(r['naziv'])}",
        axis=1,
    )

    # Handle duplicate IDs by appending a counter
    seen = {}
    ids = []
    for _, row in merged.iterrows():
        sid = row["id"]
        if sid in seen:
            seen[sid] += 1
            sid = f"{sid}-{seen[sid]}"
        else:
            seen[sid] = 0
        ids.append(sid)
    merged["id"] = ids

    # Percentile rank by promjena_pct (0=worst decline, 100=best growth)
    merged["percentil"] = merged["promjena_pct"].rank(pct=True).apply(
        lambda x: round(x * 100)
    )

    print(f"  > {len(merged)} naselja spojeno.")
    return merged


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------
def export_naselja(merged):
    """Pripremi listu naselja za JSON export."""
    naselja = []
    for _, row in merged.iterrows():
        naselja.append({
            "id": row["id"],
            "naziv": row["naziv"],
            "zupanija_id": row["zupanija_id"],
            "zupanija_naziv": row["zupanija_naziv"],
            "opcina_naziv": row["opcina_raw"],
            "pop_2021": int(row["ukupno_2021"]),
            "pop_2011": int(row["ukupno_2011"]),
            "promjena_abs": int(row["promjena_abs"]),
            "promjena_pct": float(row["promjena_pct"]),
            "status": row["status"],
            "mladi_pct": float(row["mladi_pct"]),
            "radni_pct": float(row["radni_pct"]),
            "stari_pct": float(row["stari_pct"]),
            "percentil": int(row["percentil"]),
        })

    naselja.sort(key=lambda n: (n["zupanija_id"], n["opcina_naziv"], n["naziv"]))
    return naselja


def save_json(data, filename):
    """Spremi podatke kao JSON datoteku."""
    filepath = os.path.join(OUT_DIR, filename)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  > Spremljeno: {filepath} ({size_kb:.0f} KB)")


def print_summary(naselja):
    """Ispiši summary statistike."""
    print("\n" + "=" * 60)
    print("NASELJA — SUMMARY STATISTIKE")
    print("=" * 60)

    print(f"\nBroj naselja: {len(naselja)}")

    status_counts = {}
    for n in naselja:
        status_counts[n["status"]] = status_counts.get(n["status"], 0) + 1
    print("\nStatus distribucija:")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    napustena = [n for n in naselja if n["status"] == "napusteno"]
    print(f"\nNapuštena naselja (< 10 stanovnika): {len(napustena)}")

    if naselja:
        max_rast = max(naselja, key=lambda n: n["promjena_pct"])
        max_pad = min(naselja, key=lambda n: n["promjena_pct"])
        print(f"\nNajveći rast: {max_rast['naziv']} ({max_rast['promjena_pct']:+.1f}%)")
        print(f"Najveći pad:  {max_pad['naziv']} ({max_pad['promjena_pct']:+.1f}%)")

        total_2021 = sum(n["pop_2021"] for n in naselja)
        total_2011 = sum(n["pop_2011"] for n in naselja)
        print(f"\nUkupno 2021: {total_2021:,}".replace(",", "."))
        print(f"Ukupno 2011: {total_2011:,}".replace(",", "."))
        pad = total_2021 - total_2011
        pad_pct = round((pad / total_2011) * 100, 2) if total_2011 > 0 else 0
        print(f"Promjena: {pad:,} ({pad_pct:+.2f}%)".replace(",", "."))

    print("=" * 60)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    for path, label in [(FILE_2011, "2011 (Nas_01_HR.xls)"),
                        (FILE_2021, "2021 (popis_2021-stanovnistvo_po_naseljima.xlsx)")]:
        if not os.path.exists(path):
            print(f"GREŠKA: Datoteka za {label} ne postoji: {path}")
            print("Preuzmite je s https://dzs.gov.hr i stavite u data-processing/raw/")
            return

    df_2021 = read_2021_naselja()
    df_2011 = read_2011_naselja()
    merged = merge_naselja(df_2021, df_2011)
    naselja = export_naselja(merged)

    save_json(naselja, "naselja.json")
    print_summary(naselja)


if __name__ == "__main__":
    main()
