// validation.js

/**
 * Luhn algorithm to validate card numbers
 * @param {string} number
 * @returns {boolean}
 */
export function luhn(number) {
  let sum = 0;
  let alt = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let n = parseInt(number[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return number.length > 0 && sum % 10 === 0;
}

/**
 * Validate a single field by type
 * @param {string} id - input id
 * @param {string} value - input value
 * @returns {string} - error message (empty if valid)
 */
export function validateField(id, value) {
  value = value.trim();
  switch (id) {
    case "card":
      if (!luhn(value)) return "Invalid card number";
      break;
    case "exp":
      if (!/^\d{2}\/\d{2}$/.test(value)) return "Use MM/YY format";
      break;
    case "cvc":
      if (!/^\d{3,4}$/.test(value)) return "Invalid CVC";
      break;
    case "postal":
      if (value.length < 3) return "Invalid postal code";
      break;
  }
  return "";
}