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
    
    // Clean bit field breakdown in the style of esr.arm64.dev
    output += `Bit fields:\n`;
    output += `31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0\n`;
    output += `${getBit(esr, 31)} ${getBit(esr, 30)} ${getBit(esr, 29)} ${getBit(esr, 28)} ${getBit(esr, 27)} ${getBit(esr, 26)} ${getBit(esr, 25)} ${getBit(esr, 24)} ${getBit(esr, 23)} ${getBit(esr, 22)} ${getBit(esr, 21)} ${getBit(esr, 20)} ${getBit(esr, 19)} ${getBit(esr, 18)} ${getBit(esr, 17)} ${getBit(esr, 16)} ${getBit(esr, 15)} ${getBit(esr, 14)} ${getBit(esr, 13)} ${getBit(esr, 12)} ${getBit(esr, 11)} ${getBit(esr, 10)} ${getBit(esr, 9)} ${getBit(esr, 8)} ${getBit(esr, 7)} ${getBit(esr, 6)} ${getBit(esr, 5)} ${getBit(esr, 4)} ${getBit(esr, 3)} ${getBit(esr, 2)} ${getBit(esr, 1)} ${getBit(esr, 0)}\n\n`;
    
    // Field descriptions
    output += `EC (Exception Class): bits 26-31 = 0x${ec.toString(16).toUpperCase()} (${ec})\n`;
    output += `ISS (Instruction Specific Syndrome): bits 0-25 = 0x${iss.toString(16).toUpperCase()}\n\n`;
    
    // Exception Class Analysis
    output += `Exception Class: `;
    if (ec === 0x1E) {
      output += `Granule Protection Check (RME)\n`;
      output += `Description: Realm Management Extension protection violation\n\n`;
      output += `ISS Details:\n`;
      output += `  GPF (Granule Protection Fault): ${(iss >> 24) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `  Realm: ${(iss >> 16) & 0xFF}\n`;
      output += `  Access Type: ${getAccessType(iss)}\n`;
    } else if (ec === 0x1F) {
      output += `SVE, FP, or BTI abort\n\n`;
      output += `ISS Details:\n`;
      output += `  Abort Type: ${getAbortType(iss)}\n`;
      output += `  Syndrome: 0x${(iss & 0xFFFF).toString(16).toUpperCase()}\n`;
    } else if (ec === 0x20) {
      output += `Instruction Abort from a lower Exception Level\n\n`;
      output += `ISS Details:\n`;
      output += `  FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `  EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `  S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x24) {
      output += `Data Abort from a lower Exception Level\n\n`;
      output += `ISS Details:\n`;
      output += `  FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `  EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `  S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x25) {
      output += `Data Abort from the current Exception Level\n\n`;
      output += `ISS Details:\n`;
      output += `  FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `  EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `  S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else if (ec === 0x26) {
      output += `Data Abort from a lower Exception Level (same EL)\n\n`;
      output += `ISS Details:\n`;
      output += `  FSC (Fault Status Code): 0x${(iss >> 0) & 0x3F}\n`;
      output += `  EA (External Abort): ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}\n`;
      output += `  S1PTW: ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}\n`;
    } else {
      output += `Unknown/Uncategorized\n`;
      output += `ISS: 0x${iss.toString(16).toUpperCase()}\n`;
    }
    
    resultEl.textContent = output;
    
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
  }
}

// Helper function to get individual bits
function getBit(value, bitPosition) {
  return (value >> bitPosition) & 1;
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