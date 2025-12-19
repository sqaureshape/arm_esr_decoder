function decodeESR() {
  const input = document.getElementById('esrInput').value;
  const resultEl = document.getElementById('result');
  
  try {
    // Remove '0x' prefix if present and parse
    const cleanInput = input.replace(/^0x/i, '');
    const esr = parseInt(cleanInput, 16);
    
    if (isNaN(esr)) {
      resultEl.textContent = "Error: Invalid hexadecimal input. Please enter a valid hex value (e.g., 78000045 or 0x78000045)";
      return;
    }
    
    // Extract Exception Class (EC) - bits 26-31
    const ec = (esr >> 26) & 0x3F;
    
    // Extract Instruction Specific Syndrome (ISS) - bits 0-25
    const iss = esr & 0x3FFFFFF;
    
    let output = `ESR: 0x${esr.toString(16).toUpperCase()}\n`;
    output += `Binary: ${esr.toString(2).padStart(32, '0')}\n\n`;
    
    // Bit field breakdown
    output += `Bit Fields:\n`;
    output += `┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐\n`;
    output += `│ 31-28   │ 27-26   │ 25-24   │ 23-22   │ 21-20   │ 19-18   │ 17-16   │ 15-14   │\n`;
    output += `│ ${getBitRange(esr, 31, 28).toString(2).padStart(4, '0')}     │ ${getBitRange(esr, 27, 26).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 25, 24).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 23, 22).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 21, 20).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 19, 18).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 17, 16).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 15, 14).toString(2).padStart(2, '0')}      │\n`;
    output += `└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘\n`;
    output += `┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐\n`;
    output += `│ 13-12   │ 11-10   │  9-8    │  7-6    │  5-4    │  3-2    │  1-0    │         │\n`;
    output += `│ ${getBitRange(esr, 13, 12).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 11, 10).toString(2).padStart(2, '0')}      │ ${getBitRange(esr, 9, 8).toString(2).padStart(2, '0')}     │ ${getBitRange(esr, 7, 6).toString(2).padStart(2, '0')}     │ ${getBitRange(esr, 5, 4).toString(2).padStart(2, '0')}     │ ${getBitRange(esr, 3, 2).toString(2).padStart(2, '0')}     │ ${getBitRange(esr, 1, 0).toString(2).padStart(2, '0')}     │         │\n`;
    output += `└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘\n\n`;
    
    output += `Key Fields:\n`;
    output += `├─ EC (Exception Class): bits 26-31 = 0x${ec.toString(16).toUpperCase()} (${ec})\n`;
    output += `├─ ISS (Instruction Specific Syndrome): bits 0-25 = 0x${iss.toString(16).toUpperCase()}\n`;
    
    // Add specific descriptions for known EC values with detailed bit analysis
    output += `\nException Class Analysis:\n`;
    if (ec === 0x1E) {
      output += `├─ EC=0x1E (30): Granule Protection Check (RME)\n`;
      output += `├─ Description: Realm Management Extension protection violation\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ GPF (Granule Protection Fault): ${(iss >> 24) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `│  ├─ Realm: ${(iss >> 16) & 0xFF}\n`;
      output += `│  └─ Access Type: ${getAccessType(iss)}\n`;
    } else if (ec === 0x1F) {
      output += `├─ EC=0x1F (31): SVE, FP, or BTI abort\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ Abort Type: ${getAbortType(iss)}\n`;
      output += `│  └─ Syndrome: 0x${(iss & 0xFFFF).toString(16).toUpperCase()}\n`;
    } else if (ec === 0x20) {
      output += `├─ EC=0x20 (32): Instruction Abort from a lower Exception Level\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `│  ├─ EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `│  └─ S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x24) {
      output += `├─ EC=0x24 (36): Data Abort from a lower Exception Level\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `│  ├─ EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `│  └─ S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x25) {
      output += `├─ EC=0x25 (37): Data Abort from the current Exception Level\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `│  ├─ EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `│  └─ S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x26) {
      output += `├─ EC=0x26 (38): Data Abort from a lower Exception Level (same EL)\n`;
      output += `├─ ISS Details:\n`;
      output += `│  ├─ FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `│  ├─ EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `│  └─ S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else {
      output += `├─ EC=0x${ec.toString(16).toUpperCase()} (${ec}): Unknown/Uncategorized\n`;
      output += `├─ ISS: 0x${iss.toString(16).toUpperCase()}\n`;
    }
    
    resultEl.textContent = output;
    
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
  }
}

// Helper function to extract bit ranges
function getBitRange(value, highBit, lowBit) {
  const mask = ((1 << (highBit - lowBit + 1)) - 1) << lowBit;
  return (value & mask) >> lowBit;
}

// Helper function to get access type description
function getAccessType(iss) {
  const access = (iss >> 8) & 0x3;
  switch(access) {
    case 0: return 'Read';
    case 1: return 'Write';
    case 2: return 'Execute';
    default: return 'Unknown';
  }
}

// Helper function to get abort type description
function getAbortType(iss) {
  const type = (iss >> 16) & 0xFF;
  if (type === 0) return 'SVE';
  if (type === 1) return 'FP';
  if (type === 2) return 'BTI';
  return `Unknown (0x${type.toString(16).toUpperCase()})`;
}

// Auto-decode on page load to show the default value
window.onload = function() {
  decodeESR();
};