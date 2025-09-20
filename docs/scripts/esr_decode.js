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
    
    // Create the exact table format from the reference
    output += createReferenceStyleTable(esr);
    
    resultEl.innerHTML = output;
    
  } catch (err) {
    resultEl.innerHTML = `Error: ${err.message}`;
  }
}

function createReferenceStyleTable(esr) {
  let table = `<table class="bit-table">`;
  
  // Header row with bit positions (31 down to 0)
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
  
  // Field breakdown rows - exactly like esr.arm64.dev
  table += createFieldBreakdownRows(esr);
  
  table += `</table>`;
  return table;
}

function createFieldBreakdownRows(esr) {
  let rows = '';
  const ec = (esr >> 26) & 0x3F;
  const iss = esr & 0x1FFFFFF;
  
  // Create the exact format from the reference - each field spans its exact bit positions
  
  // EC field (bits 26-31) - 6 bits
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i >= 26 && i <= 31) {
      rows += `<td class="field-name">EC</td>`;
    } else {
      rows += `<td class="field-name">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i >= 26 && i <= 31) {
      rows += `<td class="field-value">EC: 0x${ec.toString(16).toUpperCase()}<br><span class="field-desc">${getECDescription(ec)}</span></td>`;
    } else {
      rows += `<td class="field-value">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  // IL field (bit 25) - 1 bit
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i === 25) {
      rows += `<td class="field-name">IL</td>`;
    } else {
      rows += `<td class="field-name">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  const il = (esr >> 25) & 0x1;
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i === 25) {
      rows += `<td class="field-value">IL: ${il ? 'true' : 'false'}<br><span class="field-desc">${il ? '32-bit instruction trapped' : '16-bit instruction trapped'}</span></td>`;
    } else {
      rows += `<td class="field-value">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  // ISS field (bits 0-24) - 25 bits
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i >= 0 && i <= 24) {
      rows += `<td class="field-name">ISS</td>`;
    } else {
      rows += `<td class="field-name">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  rows += `<tr>`;
  for (let i = 31; i >= 0; i--) {
    if (i >= 0 && i <= 24) {
      rows += `<td class="field-value">ISS: 0x${iss.toString(16).toUpperCase()}<br><span class="field-desc">Instruction Specific Syndrome</span></td>`;
    } else {
      rows += `<td class="field-value">RES0</td>`;
    }
  }
  rows += `</tr>`;
  
  // Add detailed ISS bit breakdown - exactly like reference
  rows += addDetailedISSBreakdown(iss, ec);
  
  return rows;
}

function addDetailedISSBreakdown(iss, ec) {
  let rows = '';
  
  if (ec === 0x1E) {
    // RME specific fields - ISS bits 0-24 of the ESR
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-name">RES0</td>`;
      } else if (i === 24) {
        rows += `<td class="field-name">GPF</td>`;
      } else if (i >= 16 && i <= 23) {
        rows += `<td class="field-name">Realm</td>`;
      } else if (i >= 8 && i <= 15) {
        rows += `<td class="field-name">Access</td>`;
      } else if (i >= 0 && i <= 7) {
        rows += `<td class="field-name">Reserved</td>`;
      }
    }
    rows += `</tr>`;
    
    const gpf = (iss >> 24) & 0x1;
    const realm = (iss >> 16) & 0xFF;
    const access = (iss >> 8) & 0x3;
    
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-value">RES0</td>`;
      } else if (i === 24) {
        rows += `<td class="field-value">GPF: ${gpf ? 'true' : 'false'}<br><span class="field-desc">Granule Protection Fault</span></td>`;
      } else if (i >= 16 && i <= 23) {
        rows += `<td class="field-value">Realm: 0x${realm.toString(16).toUpperCase()}</td>`;
      } else if (i >= 8 && i <= 15) {
        rows += `<td class="field-value">Access: ${getAccessType(iss)}</td>`;
      } else if (i >= 0 && i <= 7) {
        rows += `<td class="field-value">Reserved: 0x${(iss & 0xFF).toString(16).toUpperCase()}</td>`;
      }
    }
    rows += `</tr>`;
    
  } else if (ec === 0x20 || ec === 0x24 || ec === 0x25 || ec === 0x26) {
    // Abort specific fields - ISS bits 0-24 of the ESR
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-name">RES0</td>`;
      } else if (i >= 0 && i <= 5) {
        rows += `<td class="field-name">IFSC</td>`;
      } else if (i === 6) {
        rows += `<td class="field-name">-</td>`;
      } else if (i === 7) {
        rows += `<td class="field-name">S1PTW</td>`;
      } else if (i >= 8 && i <= 9) {
        rows += `<td class="field-name">Access</td>`;
      } else if (i === 10) {
        rows += `<td class="field-name">EA</td>`;
      } else if (i === 11) {
        rows += `<td class="field-name">FnV</td>`;
      } else if (i >= 12 && i <= 24) {
        rows += `<td class="field-name">Reserved</td>`;
      }
    }
    rows += `</tr>`;
    
    const fsc = (iss >> 0) & 0x3F;
    const s1ptw = (iss >> 7) & 0x1;
    const access = (iss >> 8) & 0x3;
    const ea = (iss >> 10) & 0x1;
    const fnv = (iss >> 11) & 0x1;
    
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-value">RES0</td>`;
      } else if (i >= 0 && i <= 5) {
        rows += `<td class="field-value">IFSC: 0x${fsc.toString(16).toUpperCase()}<br><span class="field-desc">${getFSCDescription(fsc)}</span></td>`;
      } else if (i === 6) {
        rows += `<td class="field-value">-</td>`;
      } else if (i === 7) {
        rows += `<td class="field-value">S1PTW: ${s1ptw ? 'true' : 'false'}</td>`;
      } else if (i >= 8 && i <= 9) {
        rows += `<td class="field-value">Access: ${getAccessType(iss)}</td>`;
      } else if (i === 10) {
        rows += `<td class="field-value">EA: ${ea ? 'true' : 'false'}</td>`;
      } else if (i === 11) {
        rows += `<td class="field-value">FnV: ${fnv ? 'true' : 'false'}</td>`;
      } else if (i >= 12 && i <= 24) {
        rows += `<td class="field-value">Reserved: 0x${((iss >> 12) & 0x1FFF).toString(16).toUpperCase()}</td>`;
      }
    }
    rows += `</tr>`;
    
  } else if (ec === 0x1F) {
    // SVE, FP, or BTI abort - ISS bits 0-24 of the ESR
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-name">RES0</td>`;
      } else if (i >= 16 && i <= 24) {
        rows += `<td class="field-name">Abort Type</td>`;
      } else if (i >= 0 && i <= 15) {
        rows += `<td class="field-name">Syndrome</td>`;
      }
    }
    rows += `</tr>`;
    
    const abortType = (iss >> 16) & 0xFF;
    const syndrome = iss & 0xFFFF;
    
    rows += `<tr>`;
    for (let i = 31; i >= 0; i--) {
      if (i >= 25 && i <= 31) {
        rows += `<td class="field-value">RES0</td>`;
      } else if (i >= 16 && i <= 24) {
        rows += `<td class="field-value">Abort Type: 0x${abortType.toString(16).toUpperCase()}<br><span class="field-desc">${getAbortTypeDescription(abortType)}</span></td>`;
      } else if (i >= 0 && i <= 15) {
        rows += `<td class="field-value">Syndrome: 0x${syndrome.toString(16).toUpperCase()}</td>`;
      }
    }
    rows += `</tr>`;
  }
  
  return rows;
}

function getAbortTypeDescription(type) {
  switch(type) {
    case 0: return 'SVE';
    case 1: return 'FP';
    case 2: return 'BTI';
    default: return 'Unknown';
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

function getECDescription(ec) {
  switch(ec) {
    case 0x1E: return 'Granule Protection Check (RME)';
    case 0x1F: return 'SVE, FP, or BTI abort';
    case 0x20: return 'Instruction Abort from a lower Exception level';
    case 0x24: return 'Data Abort from a lower Exception level';
    case 0x25: return 'Data Abort from the current Exception level';
    case 0x26: return 'Data Abort from a lower Exception level (same EL)';
    default: return 'Unknown Exception Class';
  }
}

function getFSCDescription(fsc) {
  switch(fsc) {
    case 0x00: return 'Address size fault, level 0';
    case 0x01: return 'Address size fault, level 1';
    case 0x02: return 'Address size fault, level 2';
    case 0x03: return 'Address size fault, level 3';
    case 0x04: return 'Translation fault, level 0';
    case 0x05: return 'Translation fault, level 1';
    case 0x06: return 'Translation fault, level 2';
    case 0x07: return 'Translation fault, level 3';
    case 0x08: return 'Access flag fault, level 0';
    case 0x09: return 'Access flag fault, level 1';
    case 0x0A: return 'Access flag fault, level 2';
    case 0x0B: return 'Access flag fault, level 3';
    case 0x0C: return 'Permission fault, level 0';
    case 0x0D: return 'Permission fault, level 1';
    case 0x0E: return 'Permission fault, level 2';
    case 0x0F: return 'Permission fault, level 3';
    case 0x10: return 'Debug event, level 0';
    case 0x11: return 'Debug event, level 1';
    case 0x12: return 'Debug event, level 2';
    case 0x13: return 'Debug event, level 3';
    case 0x20: return 'Synchronous External abort';
    case 0x21: return 'Alignment fault';
    case 0x22: return 'SError interrupt';
    case 0x23: return 'Synchronous External abort on translation table walk, level 0';
    case 0x24: return 'Synchronous External abort on translation table walk, level 1';
    case 0x25: return 'Synchronous External abort on translation table walk, level 2';
    case 0x26: return 'Synchronous External abort on translation table walk, level 3';
    case 0x30: return 'TLB conflict abort';
    case 0x31: return 'Unsupported exclusive or atomic access';
    case 0x32: return 'Implementation defined';
    case 0x33: return 'Implementation defined';
    case 0x34: return 'Implementation defined';
    case 0x35: return 'Implementation defined';
    case 0x36: return 'Implementation defined';
    case 0x37: return 'Implementation defined';
    case 0x38: return 'Implementation defined';
    case 0x39: return 'Implementation defined';
    case 0x3A: return 'Implementation defined';
    case 0x3B: return 'Implementation defined';
    case 0x3C: return 'Implementation defined';
    case 0x3D: return 'Implementation defined';
    case 0x3E: return 'Implementation defined';
    case 0x3F: return 'Implementation defined';
    default: return 'Unknown Fault Status Code';
  }
}

// Auto-decode on page load to show the default value
window.onload = function() {
  decodeESR();
};