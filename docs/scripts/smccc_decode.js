// ARM SMCCC (SMC Calling Convention) Function ID Decoder
// Decodes SMC/HVC function identifiers

function decodeSMCCC() {
    const input = document.getElementById('funcInput').value;
    const resultEl = document.getElementById('result');

    try {
        // Support both decimal and hexadecimal input
        let fid;
        const cleanInput = input.trim();
        if (cleanInput.startsWith('0x') || cleanInput.startsWith('0X')) {
            fid = parseInt(cleanInput.substring(2), 16);
        } else if (/^[0-9a-fA-F]+$/.test(cleanInput)) {
            fid = parseInt(cleanInput, 16);
        } else {
            fid = parseInt(cleanInput, 10);
        }

        if (isNaN(fid) || fid < 0) {
            resultEl.innerHTML = '<div class="error">Invalid input. Please enter a valid decimal or hexadecimal value.</div>';
            return;
        }

        // Update URL hash
        window.location.hash = fid.toString(16).toUpperCase();

        // Extract fields
        const callType = (fid >> 31) & 0x1;
        const callConv = (fid >> 30) & 0x1;
        const serviceCall = (fid >> 24) & 0x3F;
        const mbz = (fid >> 23) & 0x1;  // Must Be Zero
        const sveLiveState = (fid >> 16) & 0x1;
        const funcNum = fid & 0xFFFF;

        let output = `<h3>Function ID: 0x${fid.toString(16).toUpperCase().padStart(8, '0')}</h3>`;

        // Call information
        output += '<div class="processor-info">';
        output += '<h4>Call Information</h4>';
        output += `<p><strong>Call Type:</strong> ${getCallTypeName(callType)}</p>`;
        output += `<p><strong>Calling Convention:</strong> ${getCallConvName(callConv)}</p>`;
        output += `<p><strong>Service Owner:</strong> ${getServiceOwnerName(serviceCall)}</p>`;
        output += `<p><strong>Function Number:</strong> 0x${funcNum.toString(16).toUpperCase().padStart(4, '0')} (${funcNum})</p>`;
        if (mbz !== 0) {
            output += '<p class="warning"><strong>Warning:</strong> Bit 23 (MBZ) is set but must be zero!</p>';
        }
        output += '</div>';

        // Create bit visualization table
        output += createSMCCCBitTable(fid, callType, callConv, serviceCall, mbz, sveLiveState, funcNum);

        resultEl.innerHTML = output;

    } catch (err) {
        resultEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}

function createSMCCCBitTable(fid, callType, callConv, serviceCall, mbz, sveLiveState, funcNum) {
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
        const bit = (fid >> i) & 1;
        table += `<td class="bit-value">${bit}</td>`;
    }
    table += '</tr>';

    // Field name row
    table += '<tr>';
    table += '<td class="field-name" colspan="1">Call Type</td>';
    table += '<td class="field-name" colspan="1">Call Convention</td>';
    table += '<td class="field-name" colspan="6">Service Call</td>';
    table += '<td class="field-name" colspan="1">MBZ</td>';
    table += '<td class="field-name" colspan="7">RES0</td>';
    table += '<td class="field-name" colspan="16">Function Number</td>';
    table += '</tr>';

    // Field value row
    table += '<tr>';
    table += `<td colspan="32" class="field-value" style="text-align: left; padding: 10px;">`;
    table += `<strong>Call Type:</strong> ${getCallTypeName(callType)} (bit 31 = ${callType})<br>`;
    table += `<em>${getCallTypeDescription(callType)}</em><br><br>`;
    table += `<strong>Calling Convention:</strong> ${getCallConvName(callConv)} (bit 30 = ${callConv})<br>`;
    table += `<em>${getCallConvDescription(callConv)}</em><br><br>`;
    table += `<strong>Service Call:</strong> 0x${serviceCall.toString(16).toUpperCase().padStart(2, '0')} - ${getServiceOwnerName(serviceCall)}<br><br>`;
    table += `<strong>MBZ (Must Be Zero):</strong> ${mbz}`;
    if (mbz !== 0) {
        table += ' ⚠️ <em>Warning: This bit must be zero!</em>';
    }
    table += '<br><br>';
    table += `<strong>Function Number:</strong> 0x${funcNum.toString(16).toUpperCase().padStart(4, '0')} (decimal: ${funcNum})`;
    table += '</td>';
    table += '</tr>';

    table += '</table>';
    return table;
}

// Call Type lookup
function getCallTypeName(callType) {
    return callType === 1 ? 'Fast Call' : 'Yielding Call';
}

function getCallTypeDescription(callType) {
    if (callType === 1) {
        return 'Fast Call - returns quickly without context switch';
    } else {
        return 'Yielding Call - may perform context switch';
    }
}

// Calling Convention lookup
function getCallConvName(callConv) {
    return callConv === 1 ? 'SMC64/HVC64 (64-bit)' : 'SMC32/HVC32 (32-bit)';
}

function getCallConvDescription(callConv) {
    if (callConv === 1) {
        return '64-bit calling convention - uses 64-bit registers';
    } else {
        return '32-bit calling convention - uses 32-bit registers';
    }
}

// Service Owner/Call ID lookup
function getServiceOwnerName(serviceCall) {
    const owners = {
        0x00: 'ARM Architecture Calls',
        0x01: 'CPU Service Calls',
        0x02: 'SiP (Silicon Partner) Service Calls',
        0x03: 'OEM Service Calls',
        0x04: 'Standard Service Calls',
        0x05: 'Standard Hypervisor Service Calls',
        0x06: 'Vendor Specific Hypervisor Service Calls',
        0x07: 'Vendor Specific EL3 Monitor Calls',
        0x08: 'Vendor Specific Secure Platform Service Calls'
    };

    // Check for Trusted Application/OS ranges
    if (serviceCall >= 0x30 && serviceCall <= 0x31) {
        return 'Trusted Application Calls';
    }
    if (serviceCall >= 0x32 && serviceCall <= 0x3F) {
        return 'Trusted OS Calls';
    }

    return owners[serviceCall] || `Unknown Service (0x${serviceCall.toString(16).toUpperCase()})`;
}

// Get full function ID interpretation
function getFunctionIDInterpretation(fid) {
    const callType = (fid >> 31) & 0x1;
    const callConv = (fid >> 30) & 0x1;
    const serviceCall = (fid >> 24) & 0x3F;
    const funcNum = fid & 0xFFFF;

    let interpretation = '';
    interpretation += getCallTypeName(callType) + ', ';
    interpretation += getCallConvName(callConv) + '\n';
    interpretation += getServiceOwnerName(serviceCall) + '\n';
    interpretation += `Function: 0x${funcNum.toString(16).toUpperCase()}`;

    return interpretation;
}
