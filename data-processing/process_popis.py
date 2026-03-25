"""
Skripta za obradu podataka Popisa stanovništva 2011. i 2021.
Čita originalne DZS Excel datoteke i generira čiste JSON datoteke.

Potrebne datoteke u raw/:
  - Grad_01_HR.xls  (Popis 2011. — kontingenti stanovništva)
  - popis_2021-stanovnistvo_po_gradovima_opcinama.xlsx  (Popis 2021.)
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

FILE_2011 = os.path.join(RAW_DIR, "Grad_01_HR.xls")
FILE_2021 = os.path.join(RAW_DIR, "popis_2021-stanovnistvo_po_gradovima_opcinama.xlsx")

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
    """Normaliziraj string za usporedbu: lowercase, bez dijakritika, bez specijalnih crtica."""
    if not isinstance(s, str):
        return ""
    s = s.strip()
    # zamijeni razne crtice (en-dash, em-dash) običnom crticom
    s = re.sub(r"[\u2013\u2014\u2012]", "-", s)
    # ukloni razmake oko crtica: "Trešnjevka – jug" -> "Trešnjevka-jug"
    s = re.sub(r"\s*-\s*", "-", s)
    # normaliziraj "zlatar bistrica" / "zlatar-bistrica" -- tretira crtice i razmake isto
    s = re.sub(r"[-\s]+", " ", s)
    s = s.lower()
    # ukloni dijakritike za fuzzy matching
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_str


def safe_int(val):
    """Pretvori vrijednost u int, vrati 0 ako ne može."""
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 0


def safe_float(val):
    """Pretvori vrijednost u float, vrati 0.0 ako ne može."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


# ---------------------------------------------------------------------------
# 1) Čitanje podataka 2011.
# ---------------------------------------------------------------------------
def read_2011():
    """
    Čita Grad_01_HR.xls — sheet 'KONTINGENTI STANOVNIŠTVA'.
    Vraća DataFrame s kolonama:
      zupanija, tip, naziv, ukupno_2011, mladi_0_14, stari_65plus, indeks_starenja
    """
    print("Čitam 2011. podatke...")
    df = pd.read_excel(FILE_2011, header=None, skiprows=3)

    # Filtriraj samo 'sv.' (ukupno oba spola)
    df = df[df[3] == "sv."].copy()

    # Filtriraj samo redove općina/gradova (col1 nije NaN)
    df = df[df[1].notna()].copy()

    result = []
    for _, row in df.iterrows():
        zup_raw = str(row[0]).strip()
        tip = str(row[1]).strip()
        naziv = str(row[2]).strip()
        ukupno = safe_int(row[4])
        mladi = safe_int(row[6])
        stari = safe_int(row[13])
        idx_star = safe_float(row[16])

        result.append({
            "zupanija_raw": zup_raw,
            "tip": tip,
            "naziv": naziv,
            "ukupno_2011": ukupno,
            "mladi_0_14_2011": mladi,
            "stari_65plus_2011": stari,
            "indeks_starenja_2011": idx_star,
        })

    df_out = pd.DataFrame(result)
    df_out["match_key"] = df_out.apply(
        lambda r: norm(r["zupanija_raw"]) + "|" + norm(r["naziv"]), axis=1
    )
    print(f"  >{len(df_out)} općina/gradova učitano iz 2011.")
    return df_out


# ---------------------------------------------------------------------------
# 2) Čitanje podataka 2021.
# ---------------------------------------------------------------------------
def read_2021():
    """
    Čita sheet '1.' iz 2021. datoteke (narodnost — ima ukupno stanovništvo).
    Vraća DataFrame s kolonama:
      zupanija, tip, naziv, ukupno_2021
    """
    print("Čitam 2021. podatke...")
    df = pd.read_excel(FILE_2021, sheet_name="1.", header=None, skiprows=8)

    # Filtriraj samo redove općina/gradova (col1 nije NaN)
    df = df[df[1].notna()].copy()

    result = []
    for _, row in df.iterrows():
        zup_raw = str(row[0]).strip()
        tip = str(row[1]).strip()
        naziv = str(row[4]).strip()
        ukupno = safe_int(row[5])

        result.append({
            "zupanija_raw": zup_raw,
            "tip": tip,
            "naziv": naziv,
            "ukupno_2021": ukupno,
        })

    df_out = pd.DataFrame(result)
    df_out["match_key"] = df_out.apply(
        lambda r: norm(r["zupanija_raw"]) + "|" + norm(r["naziv"]), axis=1
    )
    print(f"  >{len(df_out)} općina/gradova učitano iz 2021.")
    return df_out


# ---------------------------------------------------------------------------
# 3) Spajanje (merge) i računanje
# ---------------------------------------------------------------------------
def merge_and_compute(df_2011, df_2021):
    """Spoji podatke iz oba popisa po match_key-u."""
    print("Spajam podatke 2011. <-> 2021. ...")

    merged = pd.merge(
        df_2021,
        df_2011[["match_key", "ukupno_2011", "mladi_0_14_2011",
                 "stari_65plus_2011", "indeks_starenja_2011"]],
        on="match_key",
        how="left",
    )

    # Provjeri nepodudarene
    unmatched = merged[merged["ukupno_2011"].isna()]
    if len(unmatched) > 0:
        print(f"  UPOZORENJE: {len(unmatched)} općina iz 2021. nema par u 2011.:")
        for _, row in unmatched.iterrows():
            print(f"    - {row['naziv']} ({row['zupanija_raw']})")
        merged["ukupno_2011"] = merged["ukupno_2011"].fillna(0).astype(int)
        merged["mladi_0_14_2011"] = merged["mladi_0_14_2011"].fillna(0).astype(int)
        merged["stari_65plus_2011"] = merged["stari_65plus_2011"].fillna(0).astype(int)
        merged["indeks_starenja_2011"] = merged["indeks_starenja_2011"].fillna(0)

    # Izračuni
    merged["pad_apsolutni"] = merged["ukupno_2021"] - merged["ukupno_2011"]
    merged["pad_postotak"] = merged.apply(
        lambda r: round((r["pad_apsolutni"] / r["ukupno_2011"]) * 100, 2)
        if r["ukupno_2011"] > 0 else 0,
        axis=1,
    )

    # Postotci dobnih skupina (na temelju 2011. podataka jer 2021. nema dobne podatke)
    merged["mladi_0_14_postotak"] = merged.apply(
        lambda r: round((r["mladi_0_14_2011"] / r["ukupno_2011"]) * 100, 1)
        if r["ukupno_2011"] > 0 else 0,
        axis=1,
    )
    merged["stari_65plus_postotak"] = merged.apply(
        lambda r: round((r["stari_65plus_2011"] / r["ukupno_2011"]) * 100, 1)
        if r["ukupno_2011"] > 0 else 0,
        axis=1,
    )
    merged["indeks_starenja"] = merged.apply(
        lambda r: round(r["stari_65plus_2011"] / r["mladi_0_14_2011"] * 100, 1)
        if r["mladi_0_14_2011"] > 0 else 0,
        axis=1,
    )

    # Mapiranje županije na ID
    zup_id_map = {}
    for zup_name, zup_id in ZUPANIJA_ID.items():
        zup_id_map[norm(zup_name)] = zup_id

    merged["zupanija_id"] = merged["zupanija_raw"].apply(
        lambda z: zup_id_map.get(norm(z), "??")
    )

    unknown = merged[merged["zupanija_id"] == "??"]["zupanija_raw"].unique()
    if len(unknown) > 0:
        print(f"  UPOZORENJE: Neprepoznate županije: {list(unknown)}")

    print(f"  >{len(merged)} općina/gradova spojeno.")
    return merged


# ---------------------------------------------------------------------------
# 4) Agregacija na razinu županija
# ---------------------------------------------------------------------------
def aggregate_zupanije(merged):
    """Agregiraj podatke na razinu županija."""
    print("Agregiram na razinu županija...")

    zupanije = []
    for zup_raw, group in merged.groupby("zupanija_raw"):
        zup_norm = norm(zup_raw)
        zup_id = None
        zup_naziv = None
        for name, sid in ZUPANIJA_ID.items():
            if norm(name) == zup_norm:
                zup_id = sid
                zup_naziv = name
                break

        if zup_id is None:
            continue

        pop_2021 = int(group["ukupno_2021"].sum())
        pop_2011 = int(group["ukupno_2011"].sum())
        mladi_2011 = int(group["mladi_0_14_2011"].sum())
        stari_2011 = int(group["stari_65plus_2011"].sum())

        pad_aps = pop_2021 - pop_2011
        pad_pct = round((pad_aps / pop_2011) * 100, 2) if pop_2011 > 0 else 0

        mladi_pct = round((mladi_2011 / pop_2011) * 100, 1) if pop_2011 > 0 else 0
        stari_pct = round((stari_2011 / pop_2011) * 100, 1) if pop_2011 > 0 else 0
        idx_star = round((stari_2011 / mladi_2011) * 100, 1) if mladi_2011 > 0 else 0

        zupanije.append({
            "id": zup_id,
            "naziv": zup_naziv,
            "stanovnistvo_2021": pop_2021,
            "stanovnistvo_2011": pop_2011,
            "pad_apsolutni": pad_aps,
            "pad_postotak": pad_pct,
            "stari_65plus_postotak": stari_pct,
            "mladi_0_14_postotak": mladi_pct,
            "indeks_starenja": idx_star,
        })

    # Sortiraj po ID-u
    zupanije.sort(key=lambda z: z["id"])
    print(f"  >{len(zupanije)} županija.")
    return zupanije


# ---------------------------------------------------------------------------
# 5) Export JSON
# ---------------------------------------------------------------------------
def export_opcine(merged):
    """Pripremi i vrati listu općina za JSON export."""
    opcine = []
    for _, row in merged.iterrows():
        opcine.append({
            "naziv": row["naziv"],
            "zupanija_id": row["zupanija_id"],
            "tip": row["tip"],
            "stanovnistvo_2021": int(row["ukupno_2021"]),
            "stanovnistvo_2011": int(row["ukupno_2011"]),
            "pad_apsolutni": int(row["pad_apsolutni"]),
            "pad_postotak": float(row["pad_postotak"]),
            "mladi_0_14_postotak": float(row["mladi_0_14_postotak"]),
            "stari_65plus_postotak": float(row["stari_65plus_postotak"]),
            "indeks_starenja": float(row["indeks_starenja"]),
        })

    opcine.sort(key=lambda o: (o["zupanija_id"], o["naziv"]))
    return opcine


def save_json(data, filename):
    """Spremi podatke kao JSON datoteku."""
    filepath = os.path.join(OUT_DIR, filename)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  >Spremljeno: {filepath}")


# ---------------------------------------------------------------------------
# 6) Summary statistike
# ---------------------------------------------------------------------------
def print_summary(zupanije, opcine):
    """Ispiši summary statistike."""
    print("\n" + "=" * 60)
    print("SUMMARY STATISTIKE")
    print("=" * 60)

    print(f"\nBroj županija: {len(zupanije)}")
    print(f"Broj općina/gradova: {len(opcine)}")

    total_2021 = sum(z["stanovnistvo_2021"] for z in zupanije)
    total_2011 = sum(z["stanovnistvo_2011"] for z in zupanije)
    total_pad = total_2021 - total_2011
    total_pad_pct = round((total_pad / total_2011) * 100, 2) if total_2011 > 0 else 0

    print(f"\nStanovništvo 2011.: {total_2011:,}".replace(",", "."))
    print(f"Stanovništvo 2021.: {total_2021:,}".replace(",", "."))
    print(f"Promjena: {total_pad:,} ({total_pad_pct:+.2f}%)".replace(",", "."))

    # Županije
    max_pad_z = max(zupanije, key=lambda z: z["pad_postotak"])
    min_pad_z = min(zupanije, key=lambda z: z["pad_postotak"])
    print(f"\nŽupanija s najvećim rastom: {max_pad_z['naziv']} ({max_pad_z['pad_postotak']:+.2f}%)")
    print(f"Županija s najvećim padom:  {min_pad_z['naziv']} ({min_pad_z['pad_postotak']:+.2f}%)")

    # Općine
    max_pad_o = max(opcine, key=lambda o: o["pad_postotak"])
    min_pad_o = min(opcine, key=lambda o: o["pad_postotak"])
    print(f"\nOpćina s najvećim rastom: {max_pad_o['naziv']} ({max_pad_o['pad_postotak']:+.2f}%)")
    print(f"Općina s najvećim padom:  {min_pad_o['naziv']} ({min_pad_o['pad_postotak']:+.2f}%)")

    # Starenje
    max_star = max(zupanije, key=lambda z: z["indeks_starenja"])
    print(f"\nNajstarija županija: {max_star['naziv']} (indeks starenja: {max_star['indeks_starenja']})")

    print("=" * 60)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    # Provjera datoteka
    for path, label in [(FILE_2011, "2011"), (FILE_2021, "2021")]:
        if not os.path.exists(path):
            print(f"GREŠKA: Datoteka za {label}. ne postoji: {path}")
            print("Preuzmite je s https://dzs.gov.hr i stavite u data-processing/raw/")
            return

    df_2011 = read_2011()
    df_2021 = read_2021()
    merged = merge_and_compute(df_2011, df_2021)

    zupanije = aggregate_zupanije(merged)
    opcine = export_opcine(merged)

    save_json(zupanije, "zupanije.json")
    save_json(opcine, "opcine.json")

    print_summary(zupanije, opcine)


if __name__ == "__main__":
    main()
