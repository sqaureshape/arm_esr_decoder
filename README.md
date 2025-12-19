# ARM Register Decoders

A comprehensive web-based decoder suite for ARM AArch64 registers, matching the functionality and design of [esr.arm64.dev](https://esr.arm64.dev/).

## Features

### ESR Decoder (Exception Syndrome Register)
- Decodes ESR values into Exception Class (EC) and Instruction Specific Syndrome (ISS) fields
- **RME Support**: Full support for EC=0x1E Granule Protection Check (Realm Management Extension)
- Comprehensive Exception Class coverage including:
  - Data Aborts (EC=0x24, 0x25, 0x26)
  - Instruction Aborts (EC=0x20, 0x21)
  - System instruction traps (EC=0x18)
  - SVC/HVC/SMC calls (EC=0x11-0x17)
  - Debug exceptions (Breakpoints, Watchpoints, Software Step)
- Detailed ISS field breakdown with human-readable descriptions
- URL parameter support for sharing decoded examples

### MIDR Decoder (Main ID Register)
- Decodes processor identification information
- Comprehensive implementer lookup (Arm, Qualcomm, Apple, NVIDIA, Ampere, etc.)
- Architecture version identification (Armv4 through Armv9)
- Part number lookup for 40+ ARM Cortex-A/X/R processors and Neoverse cores
- Automatic processor name resolution (e.g., "Arm Cortex-A76 r3p1")

### SMCCC Decoder (SMC Calling Convention)
- Decodes SMC/HVC function identifiers
- Call type identification (Fast Call vs Yielding Call)
- Calling convention (SMC32/SMC64, HVC32/HVC64)
- Service owner/call ID lookup
- MBZ (Must Be Zero) bit validation
- Function number extraction

## How to Use

### Local Development
1. Clone this repo or download as ZIP
2. Open `docs/index.html` directly in your browser for the ESR decoder
3. Navigate to MIDR or SMCCC using the navigation links

### GitHub Pages Deployment
1. Go to **Settings → Pages**
2. Set **Source** to: **Deploy from a branch**
3. Select **Branch: main, Folder: /docs**
4. Click **Save**
5. Your decoders will be available at `https://<username>.github.io/<repo>/`

## Example Shareable Links

### ESR Examples
```
https://<you>.github.io/<repo>/#92000000
https://<you>.github.io/<repo>/?esr=0x96000050
https://<you>.github.io/<repo>/?esr=0x78000045  # RME Granule Protection
```

### MIDR Examples
```
https://<you>.github.io/<repo>/midr.html#410FD083
https://<you>.github.io/<repo>/midr.html?midr=0x414FD0B1  # Cortex-A76
```

### SMCCC Examples
```
https://<you>.github.io/<repo>/smccc.html#C2000000
https://<you>.github.io/<repo>/smccc.html?fid=0x84000000
```

## Technical Details

- **Pure client-side**: No server required, all processing in JavaScript
- **Responsive design**: Works on desktop and mobile
- **URL parameters**: Support for shareable links via query parameters or hash
- **Consistent UI**: Shared CSS with bit visualization tables across all decoders

## Supported Processors (MIDR)

Cortex-A series: A5, A7, A8, A9, A12, A15, A17, A32, A35, A53, A55, A57, A65, A72, A73, A75, A76, A77, A78, A510, A520, A710, A715, A720

Cortex-X series: X1, X2, X3, X4, X925

Neoverse series: N1, N2, N3, V1, V2, V3, E1

## License

MIT License

## Acknowledgments

- Design inspired by [esr.arm64.dev](https://esr.arm64.dev/)
- Reference implementation: [google/aarch64-esr-decoder](https://github.com/google/aarch64-esr-decoder)
- ARM Architecture Reference Manual for register specifications
