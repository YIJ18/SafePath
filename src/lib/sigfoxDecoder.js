
export function decodeOysterGPS(payloadHex) {
  if (typeof payloadHex !== 'string' || payloadHex.length !== 22) {
    console.error("Invalid payload format for Oyster GPS. Expected 22 hex characters.");
    return { 
      latitude: null, 
      longitude: null, 
      accuracy_m: null, 
      battery_percent: null,
      error: "Invalid payload format"
    };
  }
  try {
    const bytes = [];
    for (let i = 0; i < payloadHex.length; i += 2) {
      bytes.push(parseInt(payloadHex.substring(i, i + 2), 16));
    }

    if (bytes.length !== 11) {
       console.error("Payload should be 11 bytes long after hex conversion.");
       return { 
        latitude: null, 
        longitude: null, 
        accuracy_m: null, 
        battery_percent: null,
        error: "Incorrect byte length"
      };
    }
    
    const dataView = new DataView(new Uint8Array(bytes).buffer);

    const latRaw = dataView.getInt32(1, false); 
    const lonRaw = dataView.getInt32(5, false); 
    
    return {
      latitude: latRaw / 1e7,
      longitude: lonRaw / 1e7,
      accuracy_m: bytes[9],
      battery_percent: bytes[10]
    };
  } catch (error) {
    console.error("Error decoding Oyster GPS payload:", error);
    return { 
      latitude: null, 
      longitude: null, 
      accuracy_m: null, 
      battery_percent: null,
      error: error.message
    };
  }
}
  