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
  let table = `<h4>Bit Field Breakdown:</h4>`;
  table += `<table class="bit-table">`;
  
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
  
  // Field names row - spans multiple columns like the reference
  table += `<tr>`;
  table += `<td colspan="6" class="field-name">EC</td>`;
  table += `<td colspan="1" class="field-name">IL</td>`;
  table += `<td colspan="25" class="field-name">ISS</td>`;
  table += `</tr>`;
  
  // Field values and descriptions row
  table += `<tr>`;
  
  // EC field (bits 26-31)
  const ec = (esr >> 26) & 0x3F;
  table += `<td colspan="6" class="field-value">`;
  table += `EC: 0x${ec.toString(16).toUpperCase()} 0b${ec.toString(2).padStart(6, '0')}<br>`;
  table += `<span class="field-desc">${getECDescription(ec)}</span>`;
  table += `</td>`;
  
  // IL field (bit 25)
  const il = (esr >> 25) & 0x1;
  table += `<td colspan="1" class="field-value">`;
  table += `IL: ${il ? 'true' : 'false'}<br>`;
  table += `<span class="field-desc">${il ? '32-bit instruction trapped' : '16-bit instruction trapped'}</span>`;
  table += `</td>`;
  
  // ISS field (bits 0-24)
  const iss = esr & 0x1FFFFFF;
  table += `<td colspan="25" class="field-value">`;
  table += `ISS: 0x${iss.toString(16).toUpperCase()} 0b${iss.toString(2).padStart(25, '0')}<br>`;
  table += `<span class="field-desc">Instruction Specific Syndrome</span>`;
  table += `</td>`;
  
  table += `</tr>`;
  
  // Additional field details row for specific EC types
  if (ec === 0x1E) {
    // RME specific fields
    table += `<tr>`;
    table += `<td colspan="6" class="field-name">RME Fields</td>`;
    table += `<td colspan="1" class="field-name">-</td>`;
    table += `<td colspan="25" class="field-value">`;
    
    const gpf = (iss >> 24) & 0x1;
    const realm = (iss >> 16) & 0xFF;
    const access = (iss >> 8) & 0x3;
    
    table += `GPF: ${gpf ? 'true' : 'false'} (Granule Protection Fault)<br>`;
    table += `Realm: 0x${realm.toString(16).toUpperCase()}<br>`;
    table += `Access: ${getAccessType(iss)}`;
    
    table += `</td>`;
    table += `</tr>`;
  } else if (ec === 0x20 || ec === 0x24 || ec === 0x25 || ec === 0x26) {
    // Abort specific fields
    table += `<tr>`;
    table += `<td colspan="6" class="field-name">Abort Fields</td>`;
    table += `<td colspan="1" class="field-name">-</td>`;
    table += `<td colspan="25" class="field-value">`;
    
    const fsc = (iss >> 0) & 0x3F;
    const ea = (iss >> 9) & 0x1;
    const s1ptw = (iss >> 7) & 0x1;
    const fnv = (iss >> 10) & 0x1;
    
    table += `FSC: 0x${fsc.toString(16).toUpperCase()} 0b${fsc.toString(2).padStart(6, '0')}<br>`;
    table += `<span class="field-desc">${getFSCDescription(fsc)}</span><br>`;
    table += `EA: ${ea ? 'true' : 'false'} (External Abort)<br>`;
    table += `S1PTW: ${s1ptw ? 'true' : 'false'} (Stage 1 Page Table Walk)<br>`;
    table += `FnV: ${fnv ? 'true' : 'false'} (FAR is valid)`;
    
    table += `</td>`;
    table += `</tr>`;
  }
  
  table += `</table>`;
  
  return table;
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

// Auto-decode on page load to show the default value
window.onload = function() {
  decodeESR();
};