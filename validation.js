/**
 * Luhn algorithm to validate card numbers
 * @param {string} num - card number digits only
 * @returns {boolean}
 */
function luhnCheck(num) {
  let sum = 0;
  let shouldDouble = false;
  // iterate from right to left
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Validate a single field
 * @param {string} field - id of input
 * @param {string} value - current input value
 * @returns {string|null} error message or null if valid
 */
export function validateField(field, value) {
  const trimmed = value.trim();

  switch (field) {
    case "card":
      const digits = trimmed.replace(/\s+/g, ""); // remove spaces
      if (!digits) return "Card number is required.";
      if (!/^\d{13,19}$/.test(digits)) return "Card number must be 13–19 digits.";
      if (!luhnCheck(digits)) return "Invalid card number.";
      return null;

    case "exp":
      if (!trimmed) return "Expiration date is required.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) return "Expiration must be MM/YY.";
      const [month, year] = trimmed.split("/").map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return "Card has expired.";
      }
      return null;

    case "cvc":
      if (!trimmed) return "CVC is required.";
      if (!/^\d{3,4}$/.test(trimmed)) return "CVC must be 3 or 4 digits.";
      return null;

    case "postal":
      if (!trimmed) return "Postal code is required.";
      return null;

    default:
      return null;
  }
}