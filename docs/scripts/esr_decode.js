function decodeESR() {
  const input = document.getElementById('esrInput').value;
  const resultEl = document.getElementById('result');
  
  try {
    // Remove '0x' prefix if present and parse
    const cleanInput = input.replace(/^0x/i, '');
    const esr = parseInt(cleanInput, 16);
    
    if (isNaN(esr)) {
      resultEl.innerHTML = "Error: Invalid hexadecimal input. Please enter a valid hex value (e.g., 78000045 or 0x78000045)";
      return;
    }
    
    // Extract Exception Class (EC) - bits 26-31
    const ec = (esr >> 26) & 0x3F;
    
    // Extract Instruction Specific Syndrome (ISS) - bits 0-25
    const iss = esr & 0x3FFFFFF;
    
    let output = `<h3>ESR: 0x${esr.toString(16).toUpperCase()}</h3>`;
    output += `<p><strong>Binary:</strong> ${esr.toString(2).padStart(32, '0')}</p>`;
    
    // Create single comprehensive bit field table
    output += createComprehensiveBitFieldTable(esr);
    
    // Exception Class Analysis
    output += `<h4>Exception Class Analysis:</h4>`;
    if (ec === 0x1E) {
      output += `<p><strong>Type:</strong> Granule Protection Check (RME)</p>`;
      output += `<p><strong>Description:</strong> Realm Management Extension protection violation</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>GPF (Granule Protection Fault):</strong> ${(iss >> 24) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `<li><strong>Realm:</strong> ${(iss >> 16) & 0xFF}</li>`;
      output += `<li><strong>Access Type:</strong> ${getAccessType(iss)}</li>`;
      output += `</ul>`;
    } else if (ec === 0x1F) {
      output += `<p><strong>Type:</strong> SVE, FP, or BTI abort</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>Abort Type:</strong> ${getAbortType(iss)}</li>`;
      output += `<li><strong>Syndrome:</strong> 0x${(iss & 0xFFFF).toString(16).toUpperCase()}</li>`;
      output += `</ul>`;
    } else if (ec === 0x20) {
      output += `<p><strong>Type:</strong> Instruction Abort from a lower Exception Level</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>FSC (Fault Status Code):</strong> 0x${(iss >> 0) & 0x3F}</li>`;
      output += `<li><strong>EA (External Abort):</strong> ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `<li><strong>S1PTW:</strong> ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `</ul>`;
    } else if (ec === 0x24) {
      output += `<p><strong>Type:</strong> Data Abort from a lower Exception Level</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>FSC (Fault Status Code):</strong> 0x${(iss >> 0) & 0x3F}</li>`;
      output += `<li><strong>EA (External Abort):</strong> ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `<li><strong>S1PTW:</strong> ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `</ul>`;
    } else if (ec === 0x25) {
      output += `<p><strong>Type:</strong> Data Abort from the current Exception Level</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>FSC (Fault Status Code):</strong> 0x${(iss >> 0) & 0x3F}</li>`;
      output += `<li><strong>EA (External Abort):</strong> ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `<li><strong>S1PTW:</strong> ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `</ul>`;
    } else if (ec === 0x26) {
      output += `<p><strong>Type:</strong> Data Abort from a lower Exception Level (same EL)</p>`;
      output += `<h5>ISS Details:</h5>`;
      output += `<ul>`;
      output += `<li><strong>FSC (Fault Status Code):</strong> 0x${(iss >> 0) & 0x3F}</li>`;
      output += `<li><strong>EA (External Abort):</strong> ${(iss >> 9) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `<li><strong>S1PTW:</strong> ${(iss >> 7) & 0x1 ? 'Yes' : 'No'}</li>`;
      output += `</ul>`;
    } else {
      output += `<p><strong>Type:</strong> Unknown/Uncategorized</p>`;
      output += `<p><strong>ISS:</strong> 0x${iss.toString(16).toUpperCase()}</p>`;
    }
    
    resultEl.innerHTML = output;
    
  } catch (err) {
    resultEl.innerHTML = `Error: ${err.message}`;
  }
}

function createComprehensiveBitFieldTable(esr) {
  let table = `<h4>Bit Field Breakdown:</h4>`;
  table += `<table class="bit-table">`;
  
  // Header row with bit positions
  table += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    table += `<th>${i}</th>`;
  }
  table += `</tr>`;
  
  // Row with bit values
  table += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    const bit = (esr >> i) & 1;
    table += `<td class="bit-value">${bit}</td>`;
  }
  table += `</tr>`;
  
  // Row with field names (spans multiple columns)
  table += `<tr>`;
  table += `<td colspan="6" class="field-name">EC</td>`;
  table += `<td colspan="26" class="field-name">ISS</td>`;
  table += `</tr>`;
  
  // Row with field descriptions
  table += `<tr>`;
  table += `<td colspan="6" class="field-desc">Exception Class (bits 26-31)</td>`;
  table += `<td colspan="26" class="field-desc">Instruction Specific Syndrome (bits 0-25)</td>`;
  table += `</tr>`;
  
  // Row with bit meanings (what each set bit represents)
  table += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    const bit = (esr >> i) & 1;
    if (bit === 1) {
      table += `<td class="bit-meaning">${getBitMeaning(i)}</td>`;
    } else {
      table += `<td class="bit-meaning">-</td>`;
    }
  }
  table += `</tr>`;
  
  // Row with detailed field information
  table += `<tr>`;
  table += `<td colspan="6" class="field-info">EC=${(esr >> 26) & 0x3F} (0x${((esr >> 26) & 0x3F).toString(16).toUpperCase()})</td>`;
  table += `<td colspan="26" class="field-info">ISS=${esr & 0x3FFFFFF} (0x${(esr & 0x3FFFFFF).toString(16).toUpperCase()})</td>`;
  table += `</tr>`;
  
  table += `</table>`;
  
  return table;
}

// Function to get the meaning of each bit when set to 1
function getBitMeaning(bitPosition) {
  if (bitPosition >= 26) {
    // EC bits (26-31)
    return `EC bit ${bitPosition - 26}`;
  } else {
    // ISS bits (0-25)
    switch(bitPosition) {
      case 0: return 'FSC bit 0';
      case 1: return 'FSC bit 1';
      case 2: return 'FSC bit 2';
      case 3: return 'FSC bit 3';
      case 4: return 'FSC bit 4';
      case 5: return 'FSC bit 5';
      case 6: return 'Reserved';
      case 7: return 'S1PTW';
      case 8: return 'Access bit 0';
      case 9: return 'Access bit 1';
      case 10: return 'Reserved';
      case 11: return 'Reserved';
      case 12: return 'Reserved';
      case 13: return 'Reserved';
      case 14: return 'Reserved';
      case 15: return 'Reserved';
      case 16: return 'Realm bit 0';
      case 17: return 'Realm bit 1';
      case 18: return 'Realm bit 2';
      case 19: return 'Realm bit 3';
      case 20: return 'Realm bit 4';
      case 21: return 'Realm bit 5';
      case 22: return 'Realm bit 6';
      case 23: return 'Realm bit 7';
      case 24: return 'GPF';
      case 25: return 'Reserved';
      default: return 'Unknown';
    }
  }
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