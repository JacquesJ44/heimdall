import os
from pathlib import Path
from datetime import datetime, date
from pprint import pprint
from calendar import monthrange
import pandas as pd

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from dotenv import load_dotenv
load_dotenv()

from db import DbUtil

import warnings
warnings.filterwarnings("ignore", message="pandas only supports SQLAlchemy")


# -----------------------------
# Setup DB
# -----------------------------
db = DbUtil({
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME')
})

# -----------------------------
# Helper functions (cron-safe)
# -----------------------------
def calculate_po(site_id):
    """Cron-safe PO calculation matching app.py logic"""
    with db.get_connection() as conn:
        query = """
        SELECT s.unit_number, s.status, s.activation_date, p.name AS package, p.cost_price
        FROM services s
        JOIN products p ON s.product_id = p.id
        WHERE s.site_id = %s
        """
        df = pd.read_sql(query, conn, params=[site_id])

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Filter only Active services with valid package
    df = df[df['status'] == 'Active']
    df = df[df['package'].notna()]

    # Skip services activated in the current month
    df['activation_date'] = pd.to_datetime(df['activation_date'], errors='coerce')
    df = df[~((df['activation_date'].dt.year == current_year) & (df['activation_date'].dt.month == current_month))]

    # Group by package
    result = []
    grouped = df.groupby(['package', 'cost_price']).size().reset_index(name='count')
    for _, row in grouped.iterrows():
        total = round(row['count'] * row['cost_price'], 2)
        result.append({
            "package": row['package'],
            "count": int(row['count']),
            "cost_price": float(row['cost_price']),
            "total": total
        })
    return result


def calculate_prorata(site_id):
    """Cron-safe Pro Rata matching app.py logic"""
    with db.get_connection() as conn:
        query = """
        SELECT s.unit_number, s.activation_date, s.status, p.name AS package, p.cost_price
        FROM services s
        JOIN products p ON s.product_id = p.id
        WHERE s.site_id = %s
        """
        df = pd.read_sql(query, conn, params=[site_id])

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Determine previous month
    if current_month == 1:
        prev_month = 12
        prev_year = current_year - 1
    else:
        prev_month = current_month - 1
        prev_year = current_year

    days_in_prev_month = monthrange(prev_year, prev_month)[1]
    start_of_prev_month = datetime(prev_year, prev_month, 1)
    end_of_prev_month = datetime(prev_year, prev_month, days_in_prev_month)

    # Filter only Active services with valid package
    df = df[df['status'] == 'Active']
    df = df[df['package'].notna()]

    # Parse activation_date safely
    df['activation_date'] = pd.to_datetime(df['activation_date'], errors='coerce')
    df = df.dropna(subset=['activation_date'])

    # Only include services activated in previous month
    df = df[(df['activation_date'].dt.year == prev_year) & (df['activation_date'].dt.month == prev_month)]

    # Build result
    result = []
    for _, row in df.iterrows():
        active_days = (end_of_prev_month - row['activation_date']).days + 1
        prorata_amount = round((active_days / days_in_prev_month) * float(row['cost_price']), 2)
        result.append({
            "unit": row['unit_number'],
            "package": row['package'],
            "activation_date": row['activation_date'].strftime("%d %b %Y"),
            "cost_price": float(row['cost_price']),
            "active_days": active_days,
            "prorata_amount": prorata_amount
        })

    return result

def export_excel(data, filepath):
    """
    Export a list of dicts to Excel.
    """
    df = pd.DataFrame(data)
    df.to_excel(str(filepath), index=False)

def export_pdf(data, filepath, title):
    """
    Export a list of dicts to PDF with a title.
    """
    doc = SimpleDocTemplate(str(filepath), pagesize=landscape(A4))
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(title, styles["Title"]))
    elements.append(Spacer(1, 20))

    if data:
        df = pd.DataFrame(data)
        table_data = [list(df.columns)] + df.values.tolist()
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)

    doc.build(elements)

# -----------------------------
# Main cron logic
# -----------------------------
BASE_DIR = Path("reports")
BASE_DIR.mkdir(parents=True, exist_ok=True)

today = datetime.now().strftime("%Y-%m-%d")
month_folder = datetime.now().strftime("%B-%Y")

def get_sites():
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name FROM sites")
            return cursor.fetchall()

if __name__ == "__main__":
    sites = get_sites()
    pprint(sites)

    for site_id, site_name in sites:
        print(f"📊 Processing site: {site_name}")

        # Create folder per site + month
        site_dir = BASE_DIR / site_name / month_folder
        site_dir.mkdir(parents=True, exist_ok=True)

        # Run calculations
        po_data = calculate_po(site_id)
        pro_rata_data = calculate_prorata(site_id)

        # Save PO
        export_excel(po_data, site_dir / f"PO-{site_name}-{today}.xlsx")
        export_pdf(po_data, str(site_dir / f"PO-{site_name}-{today}.pdf"), f"PO Report - {site_name}")

        # Save Pro Rata
        export_excel(pro_rata_data, site_dir / f"ProRata-{site_name}-{today}.xlsx")
        export_pdf(pro_rata_data, str(site_dir / f"ProRata-{site_name}-{today}.pdf"), f"Pro Rata Report - {site_name}")

        print(f"✅ Reports saved for {site_name} → {site_dir}")
