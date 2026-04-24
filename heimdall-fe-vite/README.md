How to test correctly:

Test from the app UI:
Open site dashboard, choose Income view. Axios sends auth header automatically.
Test from terminal with token:

$token = "<paste JWT from localStorage token>"
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/dashboard/site/126%20on%20M/income?as_of=2026-04-30" `
  -Headers @{ Authorization = "Bearer $token" }

Validate behavior:
Compare as_of=2026-04-23 vs as_of=2026-04-30.
income should increase with additional active days and activations.
loss should increase when cancellations happen mid-month.

Invoke-RestMethod `
  -Uri "http://localhost:5000/api/dashboard/site/126%20on%20M/income?as_of=2026-04-30&test_cancel_service_id=135&test_cancel_date=2026-01-01" `
  -Headers @{ Authorization = "Bearer $token" }

  -----+---------+-------------+
| id  | site_id | unit_number |
+-----+---------+-------------+
| 132 |       3 | 104         |
| 134 |       3 | 106         |
| 135 |       3 | 107         |
| 136 |       3 | 201         |
| 137 |       3 | 202         |
| 138 |       3 | 203         |
| 139 |       3 | 204         |