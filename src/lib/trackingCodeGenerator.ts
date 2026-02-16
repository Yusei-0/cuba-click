// Utility function to generate unique tracking codes
// Format: 8 alphanumeric characters (uppercase letters and numbers)
// Example: A3B7K9M2

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing characters like I, O, 0, 1

export function generateTrackingCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    code += CHARS[randomIndex];
  }
  return code;
}

// Validate tracking code format
export function isValidTrackingCode(code: string): boolean {
  if (!code || code.length !== 8) return false;
  return /^[A-Z2-9]{8}$/.test(code);
}
