from datetime import date, datetime, timedelta
from calendar import monthrange


def to_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())

    text = str(value).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def build_month_starts(now):
    # Build the last 12 completed months, ending with the previous month.
    month_starts = []
    cursor = datetime(now.year, now.month, 1)
    for _ in range(12):
        if cursor.month == 1:
            cursor = datetime(cursor.year - 1, 12, 1)
        else:
            cursor = datetime(cursor.year, cursor.month - 1, 1)
        month_starts.append(cursor)
    month_starts.reverse()
    return month_starts


def calculate_income_12mo(service_rows, cancel_dates, now, price_field):
    # Stop calculations at the exact start of the current month so output
    # always reflects complete months only.
    billing_cutoff_exclusive = datetime(now.year, now.month, 1)
    month_starts = build_month_starts(now)

    income_by_month = {(d.year, d.month): 0.0 for d in month_starts}
    loss_by_month = {(d.year, d.month): 0.0 for d in month_starts}

    for row in service_rows:
        service_id, activation_raw, status, cost_price, selling_price = row
        activation_dt = to_datetime(activation_raw)
        if activation_dt is None:
            continue

        price = selling_price if price_field == "selling_price" else cost_price
        try:
            price = float(price or 0.0)
        except (TypeError, ValueError):
            price = 0.0

        cancel_dt = cancel_dates.get(service_id)

        if status not in ("Active", "Cancelling") and cancel_dt is None:
            continue

        for idx, start in enumerate(month_starts):
            natural_end_exclusive = (
                month_starts[idx + 1]
                if idx < len(month_starts) - 1
                else billing_cutoff_exclusive
            )

            end_exclusive = min(natural_end_exclusive, billing_cutoff_exclusive)
            if start >= end_exclusive:
                continue

            if cancel_dt is not None and cancel_dt <= start:
                continue

            potential_start = max(start, activation_dt)
            potential_end_exclusive = end_exclusive
            if potential_start >= potential_end_exclusive:
                continue

            active_start = potential_start
            active_end_exclusive = potential_end_exclusive
            if cancel_dt is not None:
                active_end_exclusive = min(active_end_exclusive, cancel_dt)

            if active_start >= active_end_exclusive:
                continue

            days_in_month = monthrange(start.year, start.month)[1]
            potential_days = (potential_end_exclusive - potential_start).days
            active_days = (active_end_exclusive - active_start).days

            income_amount = price * (active_days / days_in_month)
            loss_amount = price * ((potential_days - active_days) / days_in_month)

            income_by_month[(start.year, start.month)] += income_amount
            loss_by_month[(start.year, start.month)] += loss_amount

    return [
        {
            "year": d.year,
            "month": d.month,
            "income": round(income_by_month[(d.year, d.month)], 2),
            "loss": round(loss_by_month[(d.year, d.month)], 2),
            "net": round(
                income_by_month[(d.year, d.month)] - loss_by_month[(d.year, d.month)], 2
            ),
            "total": round(income_by_month[(d.year, d.month)], 2),
        }
        for d in month_starts
    ]
