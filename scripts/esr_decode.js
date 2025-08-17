function decodeESR() {
  const input = document.getElementById('esrInput').value;
  const resultEl = document.getElementById('result');
  try {
    const esr = parseInt(input, 16);
    const ec = (esr >> 26) & 0x3F;
    let output = `ESR=0x${esr.toString(16)}\nEC=${ec.toString(16)}`;

    if (ec === 0x1E) {
      output += " → Granule Protection Check (RME)";
    }

    resultEl.textContent = output;
  } catch (err) {
    resultEl.textContent = "Invalid ESR input";
  }
}