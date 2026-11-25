# Asset Management (Asset Tab)

The Asset tab is the central repository for registering, tracking, and searching all physical equipment and property owned by the department.

## Asset Registration Wizard

<!-- TODO: verify these steps match the current registration form before publishing. -->

New equipment is logged through a structured 4-step wizard:

1. **General Information**: Enter the asset name, category (for example Electronics, Furniture, Laboratory Equipment), physical room location, and assigned custodian.
2. **Acquisition Mode**: Choose how the asset was acquired. This shows the relevant compliance fields:
    * **Purchased Assets**: Requires the purchase cost (₱) and an upload of the Property Acknowledgment Receipt (PAR) or Inventory Custodian Slip (ICS).
    * **Donated Assets**: Requires the donor name or organization (for example DOST-STII) and an upload of the official Deed of Donation.
3. **Quantity and Batch Strategy**: When quantity is greater than 1, choose the tracking method:
    * **Single Bulk Record**: Creates one master entry with a quantity count and a single QR code. Recommended for high-volume, low-value items like chairs or cables.
    * **Multiple Individual Records**: Creates *N* separate entries, each with a unique asset ID (`cict-XXXX`) and its own QR code. Recommended for high-value equipment like computers or projectors.
4. **Photo Upload and Final Review**: Upload a reference image and check the registration summary before saving.

## Inventory Search and Filtering

The main table filters in real time by asset tag ID, item name, room, custodian, or acquisition type. Quick-filter badges show items by condition: Working, Damaged, Missing, For Repair, or Condemned.

## QR Code Sticker Generation

Administrators can generate scannable QR tags from the asset list. The system supports single-item QR previews and batch sticker-sheet PDF exports formatted for physical labeling.

[← Back to User Guide](README.md)
