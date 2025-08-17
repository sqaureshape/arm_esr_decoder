# ESR-RME Decoder Starter

This is a starter repo for an Arm ESR (Exception Syndrome Register) decoder with **RME (Realm Management Extension)** support.

## Features
- Decodes ESR values into Exception Class (EC) and Instruction Specific Syndrome (ISS) fields.
- Adds support for **EC=0x1E Granule Protection Check (RME)**.
- Provides routing hints based on `HCR_EL2.GPF` and `SCR_EL3.GPF`.
- URL parameter support for sharing decoded examples.
- Test vectors for common cases.

## How to Use
1. Clone this repo or download it as a ZIP.
2. Enable GitHub Pages in **Settings → Pages → Branch: main, Folder: /docs**.
3. Your live decoder will be available at `https://<you>.github.io/<repo>/`.

## Example Shareable Link
```
https://<you>.github.io/<repo>/?esr=0x78000123&el=EL2&rme=1&hcr_gpf=1
```

## License
MIT License
