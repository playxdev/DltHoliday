# Import Holidays — File Format

## Supported File Types

- **CSV** (`.csv`)
- **Excel** (`.xls`, `.xlsx`)

## Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `holiday_name` | Yes | Name of the holiday | `New Year's Day` |
| `holiday_date` | Yes | Date in `YYYY-MM-DD` format | `2026-01-01` |
| `active_status` | No | `1` = Active (default), `0` = Inactive. Also accepts `A`/`I` strings. | `1` |

## Column Name Flexibility

The importer auto-detects column headers. Any of these variations work:

| Target | Recognized Headers |
|--------|-------------------|
| `holiday_name` | `holiday_name`, `Holiday Name`, `Name`, `holiday` |
| `holiday_date` | `holiday_date`, `Holiday Date`, `Date` |
| `active_status` | `active_status`, `Status`, `Active` |

## Date Formats Accepted

- `2026-01-01` (ISO, recommended)
- `01/01/2026` (DD/MM/YYYY)
- `01/01/26` (DD/MM/YY — years < 50 → 20xx)

## Example CSV

An example file is included at `docs/holidays-import-example.csv`:

```csv
holiday_name,holiday_date,active_status
New Year's Day,2026-01-01,1
Thaipusam,2026-01-21,1
Federal Territory Day,2026-02-01,1
Chinese New Year,2026-02-18,1
```

## Steps

1. Go to the **Holidays** page
2. Click **Import** (next to **New Holiday**)
3. Drag and drop or browse to select your CSV/Excel file
4. Click **Start Import**
5. Review the results (imported / skipped / errors)
