// AArch64 MIDR_EL1 (Main ID Register) Decoder
// Decodes processor identification information

function decodeMIDR() {
    const input = document.getElementById('midrInput').value;
    const resultEl = document.getElementById('result');

    try {
        // Support both decimal and hexadecimal input
        let midr;
        const cleanInput = input.trim();
        if (cleanInput.startsWith('0x') || cleanInput.startsWith('0X')) {
            midr = parseInt(cleanInput.substring(2), 16);
        } else if (/^[0-9a-fA-F]+$/.test(cleanInput)) {
            midr = parseInt(cleanInput, 16);
        } else {
            midr = parseInt(cleanInput, 10);
        }

        if (isNaN(midr) || midr < 0) {
            resultEl.innerHTML = '<div class="error">Invalid input. Please enter a valid decimal or hexadecimal value.</div>';
            return;
        }

        // Update URL hash
        window.location.hash = midr.toString(16).toUpperCase();

        // Extract fields
        const implementer = (midr >> 24) & 0xFF;
        const variant = (midr >> 20) & 0xF;
        const architecture = (midr >> 16) & 0xF;
        const partnum = (midr >> 4) & 0xFFF;
        const revision = midr & 0xF;

        let output = `<h3>MIDR: 0x${midr.toString(16).toUpperCase().padStart(8, '0')}</h3>`;

        // Processor identification
        const implName = getImplementerName(implementer);
        const archName = getArchitectureName(architecture);
        const partName = getPartName(implementer, partnum);

        output += '<div class="processor-info">';
        output += '<h4>Processor Identification</h4>';
        if (implementer === 0x41 && partName !== 'Unknown') {
            output += `<p><strong>${implName} ${partName} r${variant}p${revision}</strong></p>`;
        } else if (partName !== 'Unknown') {
            output += `<p><strong>${implName} ${partName}</strong></p>`;
            output += `<p>Variant r${variant}, Revision p${revision}</p>`;
        } else {
            output += `<p><strong>${implName}</strong></p>`;
            output += `<p>Part: 0x${partnum.toString(16).toUpperCase()}, Variant: r${variant}, Revision: p${revision}</p>`;
        }
        output += `<p>Architecture: ${archName}</p>`;
        output += '</div>';

        // Create bit visualization table
        output += createMIDRBitTable(midr, implementer, variant, architecture, partnum, revision);

        resultEl.innerHTML = output;

    } catch (err) {
        resultEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}

function createMIDRBitTable(midr, implementer, variant, architecture, partnum, revision) {
    let table = '<table class="bit-table">';

    // Header row with bit positions (31 down to 0)
    table += '<tr>';
    for (let i = 31; i >= 0; i--) {
        table += `< th > ${i}</th > `;
    }
    table += '</tr>';

    // Row with bit values
    table += '<tr>';
    for (let i = 31; i >= 0; i--) {
        const bit = (midr >> i) & 1;
        table += `< td class="bit-value" > ${bit}</td > `;
    }
    table += '</tr>';

    // Field name row
    table += '<tr>';
    table += '<td class="field-name" colspan="8">Implementer</td>';
    table += '<td class="field-name" colspan="4">Variant</td>';
    table += '<td class="field-name" colspan="4">Architecture</td>';
    table += '<td class="field-name" colspan="12">PartNum</td>';
    table += '<td class="field-name" colspan="4">Revision</td>';
    table += '</tr>';

    // Field value row
    table += '<tr>';
    table += `< td colspan = "32" class="field-value" style = "text-align: left; padding: 10px;" > `;
    table += `< strong > Implementer:</strong > 0x${implementer.toString(16).toUpperCase().padStart(2, '0')} - ${getImplementerName(implementer)} <br>`;
    table += `<strong>Variant:</strong> r${variant}<br>`;
    table += `<strong>Architecture:</strong> 0x${architecture.toString(16).toUpperCase()} - ${getArchitectureName(architecture)}<br>`;
    table += `<strong>PartNum:</strong> 0x${partnum.toString(16).toUpperCase().padStart(3, '0')} - ${getPartName(implementer, partnum)}<br>`;
    table += `<strong>Revision:</strong> p${revision}`;
    table += '</td>';
    table += '</tr>';

    table += '</table>';
    return table;
}

// Implementer lookup table
function getImplementerName(implementer) {
    const implementers = {
        0x00: 'Reserved for software use',
        0x41: 'Arm Limited',
        0x42: 'Broadcom Corporation',
        0x43: 'Cavium Inc.',
        0x44: 'Digital Equipment Corporation',
        0x46: 'Fujitsu Ltd.',
        0x49: 'Infineon Technologies AG',
        0x4D: 'Motorola/Freescale Semiconductor Inc.',
        0x4E: 'NVIDIA Corporation',
        0x50: 'Applied Micro Circuits Corporation',
        0x51: 'Qualcomm Inc.',
        0x53: 'Samsung Electronics Co., Ltd.',
        0x56: 'Marvell International Ltd.',
        0x61: 'Apple Inc.',
        0x66: 'Faraday Technology Corporation',
        0x69: 'Intel Corporation',
        0x6D: 'Microsoft Corporation',
        0xC0: 'Ampere Computing',
        0xFE: 'Phytium Technology Co., Ltd.'
    };

    return implementers[implementer] || `Unknown (0x${implementer.toString(16).toUpperCase()})`;
}

// Architecture lookup table
function getArchitectureName(architecture) {
    const architectures = {
        0x1: 'Armv4',
        0x2: 'Armv4T',
        0x3: 'Armv5 (obsolete)',
        0x4: 'Armv5T',
        0x5: 'Armv5TE',
        0x6: 'Armv5TEJ',
        0x7: 'Armv6',
        0xF: 'Architectural features defined by CPUID scheme'
    };

    return architectures[architecture] || `Unknown (0x${architecture.toString(16).toUpperCase()})`;
}

// Part number lookup table for Arm processors
function getPartName(implementer, partnum) {
    // Only decode for Arm Limited (0x41)
    if (implementer !== 0x41) {
        return 'Unknown';
    }

    const parts = {
        // Cortex-A series
        0xC05: 'Cortex-A5',
        0xC07: 'Cortex-A7',
        0xC08: 'Cortex-A8',
        0xC09: 'Cortex-A9',
        0xC0D: 'Cortex-A12',
        0xC0F: 'Cortex-A15',
        0xC0E: 'Cortex-A17',
        0xD01: 'Cortex-A32',
        0xD03: 'Cortex-A53',
        0xD04: 'Cortex-A35',
        0xD05: 'Cortex-A55',
        0xD06: 'Cortex-A65',
        0xD07: 'Cortex-A57',
        0xD08: 'Cortex-A72',
        0xD09: 'Cortex-A73',
        0xD0A: 'Cortex-A75',
        0xD0B: 'Cortex-A76',
        0xD0C: 'Neoverse-N1',
        0xD0D: 'Cortex-A77',
        0xD0E: 'Cortex-A76AE',
        0xD13: 'Cortex-R52',
        0xD20: 'Cortex-M23',
        0xD21: 'Cortex-M33',
        0xD40: 'Neoverse-V1',
        0xD41: 'Cortex-A78',
        0xD42: 'Cortex-A78AE',
        0xD43: 'Cortex-A65AE',
        0xD44: 'Cortex-X1',
        0xD46: 'Cortex-A510',
        0xD47: 'Cortex-A710',
        0xD48: 'Cortex-X2',
        0xD49: 'Neoverse-N2',
        0xD4A: 'Neoverse-E1',
        0xD4B: 'Cortex-A78C',
        0xD4C: 'Cortex-X1C',
        0xD4D: 'Cortex-A715',
        0xD4E: 'Cortex-X3',
        0xD4F: 'Neoverse-V2',
        0xD80: 'Cortex-A520',
        0xD81: 'Cortex-A720',
        0xD82: 'Cortex-X4',
        0xD84: 'Neoverse-V3',
        0xD85: 'Cortex-X925',
        0xD87: 'Neoverse-N3'
    };

    return parts[partnum] || 'Unknown';
}
