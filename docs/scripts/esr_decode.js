// AArch64 ESR (Exception Syndrome Register) Decoder
// Comprehensive decoder with support for all major Exception Classes including RME

function decodeESR() {
  const input = document.getElementById('esrInput').value;
  const resultEl = document.getElementById('result');
  
  try {
    // Support both decimal and hexadecimal input
    let esr;
    const cleanInput = input.trim();
    if (cleanInput.startsWith('0x') || cleanInput.startsWith('0X')) {
      esr = parseInt(cleanInput.substring(2), 16);
    } else if (/^[0-9a-fA-F]+$/.test(cleanInput)) {
      esr = parseInt(cleanInput, 16);
    } else {
      esr = parseInt(cleanInput, 10);
    }
    
    if (isNaN(esr) || esr < 0) {
      resultEl.innerHTML = '<div class="error">Invalid input. Please enter a valid decimal or hexadecimal value.</div>';
      return;
    }
    
    // Update URL hash
    window.location.hash = esr.toString(16).toUpperCase();
    
    let output = `<h3>ESR: 0x${esr.toString(16).toUpperCase().padStart(8, '0')}</h3>`;
    
    // Extract main fields
    const ec = (esr >> 26) & 0x3F;
    const il = (esr >> 25) & 0x1;
    const iss = esr & 0x1FFFFFF;
    const iss2 = (esr >> 32) & 0x1F;  // For 64-bit ESR (bits 36-32)
    
    // Add EC description
    const ecDesc = getECDescription(ec);
    output += `<p><strong>Exception Class:</strong> ${ecDesc}</p>`;
    
    // Create bit visualization table
    output += createBitTable(esr, ec, il, iss);
    
    resultEl.innerHTML = output;
    
  } catch (err) {
    resultEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
  }
}

function createBitTable(esr, ec, il, iss) {
  let table = '<table class="bit-table">';
  
  // Header row with bit positions (31 down to 0)
  table += '<tr>';
  for (let i = 31; i >= 0; i--) {
    table += `<th>${i}</th>`;
  }
  table += '</tr>';
  
  // Row with bit values
  table += '<tr>';
  for (let i = 31; i >= 0; i--) {
    const bit = (esr >> i) & 1;
    table += `<td class="bit-value">${bit}</td>`;
  }
  table += '</tr>';
  
  // Field name row
  table += '<tr>';
  table += '<td class="field-name" colspan="6">EC</td>';
  table += '<td class="field-name" colspan="1">IL</td>';
  table += '<td class="field-name" colspan="25">ISS</td>';
  table += '</tr>';
  
  // Field value row
  const ecBits = ec.toString(2).padStart(6, '0');
  const issBits = iss.toString(2).padStart(25, '0');
  
  table += '<tr>';
  table += `<td class="field-value" colspan="32" style="text-align: left; padding: 10px;">`;
  table += `EC: 0x${ec.toString(16).toUpperCase().padStart(2, '0')} (0b${ecBits})\t\t`;
  table += `IL: ${il ? 'true' : 'false'}\t\t`;
  table += `ISS: 0x${iss.toString(16).toUpperCase().padStart(7, '0')} (0b${issBits})`;
  table += '</td>';
  table += '</tr>';
  
  // Empty separator row
  table += '<tr><td colspan="32" style="height: 10px;"></td></tr>';
  
  // ISS field breakdown based on Exception Class
  table += createISSBreakdown(iss, ec, esr);
  
  table += '</table>';
  return table;
}

function createISSBreakdown(iss, ec, esr) {
  let rows = '';
  
  // Instruction/Data Abort (EC = 0x20, 0x21, 0x24, 0x25, 0x26)
  if (ec === 0x20 || ec === 0x21 || ec === 0x24 || ec === 0x25 || ec === 0x26) {
    rows += createAbortBreakdown(iss, ec);
  }
  // RME Granule Protection Check (EC = 0x1E)
  else if (ec === 0x1E) {
    rows += createRMEBreakdown(iss);
  }
  // SVE/FP/BTI abort (EC = 0x1F)
  else if (ec === 0x1F) {
    rows += createSVEBreakdown(iss);
  }
  // System instruction (EC = 0x18)
  else if (ec === 0x18) {
    rows += createSystemInstructionBreakdown(iss);
  }
  // SVC/HVC/SMC calls
  else if (ec === 0x11 || ec === 0x12 || ec === 0x13 || ec === 0x15 || ec === 0x16 || ec === 0x17) {
    rows += createSVCBreakdown(iss, ec);
  }
  // Breakpoint/Watchpoint/Software Step
  else if (ec >= 0x30 && ec <= 0x35) {
    rows += createDebugBreakdown(iss, ec);
  }
  // For other ECs, show basic ISS
  else {
    rows += '<tr>';
    rows += `<td colspan="32" class="field-value">ISS: 0x${iss.toString(16).toUpperCase().padStart(7, '0')}</td>`;
    rows += '</tr>';
  }
  
  return rows;
}

function createAbortBreakdown(iss, ec) {
  const dfsc = iss & 0x3F;
  const wnr = (iss >> 6) & 0x1;
  const s1ptw = (iss >> 7) & 0x1;
  const cm = (iss >> 8) & 0x1;
  const ea = (iss >> 9) & 0x1;
  const fnv = (iss >> 10) & 0x1;
  const set = (iss >> 11) & 0x3;
  const vncr = (iss >> 13) & 0x1;
  const ar = (iss >> 14) & 0x1;
  const sf = (iss >> 15) & 0x1;
  const srt = (iss >> 16) & 0x1F;
  const sse = (iss >> 21) & 0x1;
  const sas = (iss >> 22) & 0x3;
  const isv = (iss >> 24) & 0x1;
  
  let rows = '';
  
  // Field name row
  rows += '<tr>';
  rows += '<td class="field-name" colspan="7">RES0</td>';
  rows += '<td class="field-name" colspan="1">ISV</td>';
  rows += '<td class="field-name" colspan="2">SAS</td>';
  rows += '<td class="field-name" colspan="1">SSE</td>';
  rows += '<td class="field-name" colspan="5">SRT</td>';
  rows += '<td class="field-name" colspan="1">SF</td>';
  rows += '<td class="field-name" colspan="1">AR</td>';
  rows += '<td class="field-name" colspan="1">VNCR</td>';
  rows += '<td class="field-name" colspan="2">SET</td>';
  rows += '<td class="field-name" colspan="1">FnV</td>';
  rows += '<td class="field-name" colspan="1">EA</td>';
  rows += '<td class="field-name" colspan="1">CM</td>';
  rows += '<td class="field-name" colspan="1">S1PTW</td>';
  rows += '<td class="field-name" colspan="1">WnR</td>';
  rows += '<td class="field-name" colspan="6">DFSC</td>';
  rows += '</tr>';
  
  // Field value row
  rows += '<tr>';
  rows += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
  rows += `<strong>Fault Status Code:</strong> ${getFSCDescription(dfsc)}<br>`;
  rows += `<strong>WnR:</strong> ${wnr ? 'Write' : 'Read'}<br>`;
  rows += `<strong>S1PTW:</strong> ${s1ptw ? 'Stage 1 translation fault' : 'Not a stage 1 fault'}<br>`;
  rows += `<strong>FnV:</strong> ${fnv ? 'FAR not valid' : 'FAR valid'}<br>`;
  rows += `<strong>EA:</strong> ${ea ? 'External abort' : 'Not external abort'}<br>`;
  if (isv) {
    rows += `<strong>SAS:</strong> ${getSASDescription(sas)}<br>`;
    rows += `<strong>SSE:</strong> ${sse ? 'Sign extended' : 'Zero extended'}<br>`;
    rows += `<strong>SRT:</strong> x${srt}<br>`;
    rows += `<strong>SF:</strong> ${sf ? '64-bit' : '32-bit'} register<br>`;
  }
  rows += `<strong>SET:</strong> ${getSETDescription(set)}`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

function createRMEBreakdown(iss) {
  const gpf = (iss >> 24) & 0x1;
  const access = (iss >> 8) & 0x3;
  const gpcf = iss & 0xFF;
  
  let rows = '';
  rows += '<tr>';
  rows += '<td class="field-name" colspan="7">RES0</td>';
  rows += '<td class="field-name" colspan="1">GPF</td>';
  rows += '<td class="field-name" colspan="16">RES0</td>';
  rows += '<td class="field-name" colspan="8">GPCF</td>';
  rows += '</tr>';
  
  rows += '<tr>';
  rows += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
  rows += `<strong>Granule Protection Fault (GPF):</strong> ${gpf ? 'true' : 'false'}<br>`;
  rows += `<strong>Granule Protection Check Fault (GPCF):</strong> 0x${gpcf.toString(16).toUpperCase()}<br>`;
  rows += `<em>RME (Realm Management Extension) Granule Protection violation</em>`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

function createSVEBreakdown(iss) {
  const iss_value = iss & 0xFFFFFF;
  
  let rows = '';
  rows += '<tr>';
  rows += '<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">';
  rows += `<strong>ISS Value:</strong> 0x${iss_value.toString(16).toUpperCase()}<br>`;
  rows += `<em>SVE, FP, or BTI abort - specific syndrome depends on implementation</em>`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

function createSystemInstructionBreakdown(iss) {
  const direction = (iss >> 0) & 0x1;
  const crm = (iss >> 1) & 0xF;
  const rt = (iss >> 5) & 0x1F;  
  const crn = (iss >> 10) & 0xF;
  const op1 = (iss >> 14) & 0x7;
  const op2 = (iss >> 17) & 0x7;
  const op0 = (iss >> 20) & 0x3;
  
  let rows = '';
  rows += '<tr>';
  rows += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
  rows += `<strong>Direction:</strong> ${direction ? 'Read from system register' : 'Write to system register'}<br>`;
  rows += `<strong>Op0:</strong> ${op0}, <strong>Op1:</strong> ${op1}, <strong>CRn:</strong> ${crn}, <strong>CRm:</strong> ${crm}, <strong>Op2:</strong> ${op2}<br>`;
  rows += `<strong>Rt:</strong> x${rt}`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

function createSVCBreakdown(iss, ec) {
  const imm16 = iss & 0xFFFF;
  
  let callType = 'Unknown';
  if (ec === 0x11 || ec === 0x15) callType = 'SVC (Supervisor Call)';
  else if (ec === 0x12 || ec === 0x16) callType = 'HVC (Hypervisor Call)';
  else if (ec === 0x13 || ec === 0x17) callType = 'SMC (Secure Monitor Call)';
  
  let rows = '';
  rows += '<tr>';
  rows += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
  rows += `<strong>Call Type:</strong> ${callType}<br>`;
  rows += `<strong>Immediate Value:</strong> 0x${imm16.toString(16).toUpperCase().padStart(4, '0')} (${imm16})`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

function createDebugBreakdown(iss, ec) {
  let rows = '';
  rows += '<tr>';
  rows += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
  
  if (ec === 0x30 || ec === 0x31) {
    rows += `<strong>Breakpoint Exception</strong><br>`;
  } else if (ec === 0x32 || ec === 0x33) {
    rows += `<strong>Software Step Exception</strong><br>`;
  } else if (ec === 0x34 || ec === 0x35) {
    rows += `<strong>Watchpoint Exception</strong><br>`;
  }
  
  rows += `ISS: 0x${iss.toString(16).toUpperCase()}`;
  rows += '</td>';
  rows += '</tr>';
  
  return rows;
}

// Exception Class descriptions
function getECDescription(ec) {
  const descriptions = {
    0x00: 'Unknown reason',
    0x01: 'Trapped WFI or WFE instruction',
    0x03: 'Trapped MCR or MRC access (coproc=0b1111)',
    0x04: 'Trapped MCRR or MRRC access (coproc=0b1111)',
    0x05: 'Trapped MCR or MRC access (coproc=0b1110)',
    0x06: 'Trapped LDC or STC access',
    0x07: 'Trapped access to SVE, Advanced SIMD or FP',
    0x0C: 'Trapped MRRC access (coproc=0b1110)',
    0x0E: 'Illegal Execution state',
    0x11: 'SVC instruction execution in AArch32',
    0x12: 'HVC instruction execution in AArch32',
    0x13: 'SMC instruction execution in AArch32',
    0x15: 'SVC instruction execution in AArch64',
    0x16: 'HVC instruction execution in AArch64',
    0x17: 'SMC instruction execution in AArch64',
    0x18: 'Trapped MSR, MRS or System instruction',
    0x19: 'Trapped access to SVE',
    0x1E: 'Granule Protection Check (RME)',
    0x1F: 'Implementation defined exception (EL3)',
    0x20: 'Instruction Abort from a lower Exception level',
    0x21: 'Instruction Abort taken without a change in Exception level',
    0x22: 'PC alignment fault',
    0x24: 'Data Abort from a lower Exception level',
    0x25: 'Data Abort taken without a change in Exception level',
    0x26: 'SP alignment fault',
    0x28: 'Trapped floating-point exception (AArch32)',
    0x2C: 'Trapped floating-point exception (AArch64)',
    0x2F: 'SError interrupt',
    0x30: 'Breakpoint exception from a lower Exception level',
    0x31: 'Breakpoint exception taken without a change in Exception level',
    0x32: 'Software Step exception from a lower Exception level',
    0x33: 'Software Step exception taken without a change in Exception level',
    0x34: 'Watchpoint exception from a lower Exception level',
    0x35: 'Watchpoint exception taken without a change in Exception level',
    0x38: 'BKPT instruction execution (AArch32)',
    0x3A: 'Vector Catch exception (AArch32)',
    0x3C: 'BRK instruction execution (AArch64)'
  };
  
  const desc = descriptions[ec];
  return desc ? `0x${ec.toString(16).toUpperCase().padStart(2, '0')} - ${desc}` : `0x${ec.toString(16).toUpperCase().padStart(2, '0')} - Reserved or Unknown`;
}

// Fault Status Code descriptions
function getFSCDescription(fsc) {
  const descriptions = {
    0x00: 'Address size fault, level 0',
    0x01: 'Address size fault, level 1',
    0x02: 'Address size fault, level 2',
    0x03: 'Address size fault, level 3',
    0x04: 'Translation fault, level 0',
    0x05: 'Translation fault, level 1',
    0x06: 'Translation fault, level 2',
    0x07: 'Translation fault, level 3',
    0x08: 'Access flag fault, level 0',
    0x09: 'Access flag fault, level 1',
    0x0A: 'Access flag fault, level 2',
    0x0B: 'Access flag fault, level 3',
    0x0C: 'Permission fault, level 0',
    0x0D: 'Permission fault, level 1',
    0x0E: 'Permission fault, level 2',
    0x0F: 'Permission fault, level 3',
    0x10: 'Synchronous External abort, not on translation table walk',
    0x11: 'Synchronous Tag Check Fault',
    0x13: 'Synchronous External abort on translation table walk, level -1',
    0x14: 'Synchronous External abort on translation table walk, level 0',
    0x15: 'Synchronous External abort on translation table walk, level 1',
    0x16: 'Synchronous External abort on translation table walk, level 2',
    0x17: 'Synchronous External abort on translation table walk, level 3',
    0x18: 'Synchronous parity or ECC error on memory access, not on translation table walk',
    0x1C: 'Synchronous parity or ECC error on memory access on translation table walk, level 0',
    0x1D: 'Synchronous parity or ECC error on memory access on translation table walk, level 1',
    0x1E: 'Synchronous parity or ECC error on memory access on translation table walk, level 2',
    0x1F: 'Synchronous parity or ECC error on memory access on translation table walk, level 3',
    0x21: 'Alignment fault',
    0x30: 'TLB conflict abort',
    0x31: 'Unsupported atomic hardware update fault',
    0x33: 'IMPLEMENTATION DEFINED fault (Lockdown)',
    0x34: 'IMPLEMENTATION DEFINED fault (Unsupported Exclusive or Atomic access)',
    0x35: 'IMPLEMENTATION DEFINED fault',
    0x36: 'IMPLEMENTATION DEFINED fault',
    0x37: 'IMPLEMENTATION DEFINED fault',
    0x38: 'IMPLEMENTATION DEFINED fault',
    0x39: 'IMPLEMENTATION DEFINED fault',
    0x3A: 'IMPLEMENTATION DEFINED fault',
    0x3B: 'IMPLEMENTATION DEFINED fault',
    0x3C: 'IMPLEMENTATION DEFINED fault',
    0x3D: 'IMPLEMENTATION DEFINED fault',
    0x3E: 'IMPLEMENTATION DEFINED fault',
    0x3F: 'IMPLEMENTATION DEFINED fault'
  };
  
  return descriptions[fsc] || 'Unknown Fault Status Code';
}

// SAS (Syndrome Access Size) descriptions
function getSASDescription(sas) {
  const sizes = { 0: 'Byte', 1: 'Halfword', 2: 'Word', 3: 'Doubleword' };
  return sizes[sas] || 'Unknown';
}

// SET (Synchronous Error Type) descriptions  
function getSETDescription(set) {
  const types = {
    0: 'Recoverable state (UER)',
    1: 'Uncontainable (UC)',
    2: 'Restartable state (UEO)',
    3: 'Unrecoverable state (UEU)'
  };
  return types[set] || 'Unknown';
}