# Physical Inventory Auditing (Audit Tab)

The Audit tab supports room-by-room physical property reconciliation and produces official university audit logs.

## Starting a Room Inspection

Select an assigned room or laboratory from the audit panel. The session loads the expected asset list from database records.

## QR Scanner Verification

Auditors scan the QR stickers on room equipment using a webcam or mobile camera:

* **Verified Assets**: Scanned items that match the room list are marked present.
* **Misplaced Assets**: Scanning an asset assigned to a different room flags a location mismatch and prompts the auditor to start a transfer request.
* **Unscanned / Missing Items**: Items not scanned by the end of the session are flagged as missing for administrative follow-up.

## Discrepancy Logging and Audit Reports

When an audit session is closed, the system calculates verification metrics and generates a formal Room Audit Report listing verified items, location discrepancies, and missing equipment. Reports can be exported as official PDFs for submission to the university supply and audit offices.

[← Back to User Guide](README.md)
