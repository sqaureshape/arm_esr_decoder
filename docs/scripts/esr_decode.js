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
    output += `EC: 0x${ec.toString(16).toUpperCase()} (${ec})\n`;
    output += `ISS: 0x${iss.toString(16).toUpperCase()}\n\n`;
    
    // Add specific descriptions for known EC values
    if (ec === 0x1E) {
      output += "Exception Class: Granule Protection Check (RME)\n";
      output += "Description: Realm Management Extension protection violation";
    } else if (ec === 0x1F) {
      output += "Exception Class: SVE, FP, or BTI abort\n";
    } else if (ec === 0x20) {
      output += "Exception Class: Instruction Abort from a lower Exception Level\n";
    } else if (ec === 0x24) {
      output += "Exception Class: Data Abort from a lower Exception Level\n";
    } else if (ec === 0x25) {
      output += "Exception Class: Data Abort from the current Exception Level\n";
    } else if (ec === 0x26) {
      output += "Exception Class: Data Abort from a lower Exception Level (same EL)\n";
    } else {
      output += `Exception Class: Unknown/Uncategorized (0x${ec.toString(16).toUpperCase()})`;
    }
    
    resultEl.textContent = output;
    
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
  }
}

// Auto-decode on page load to show the default value
window.onload = function() {
  decodeESR();
};