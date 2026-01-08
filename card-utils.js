/**
 * Format card number with spaces
 * e.g., 4242424242424242 -> 4242 4242 4242 4242
 * @param {string} value
 * @returns {string}
 */
export function formatCardNumber(value) {
  return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Detect card brand based on starting digits
 * @param {string} value
 * @returns {string} - Visa, Mastercard, Amex, etc.
 */

export function detectCardBrand(value) {
  const num = value.replace(/\D/g, "");
  if (/^4/.test(num)) return { name: "Visa", icon: "💳" };
  if (/^5[1-5]/.test(num)) return { name: "Mastercard", icon: "💳" };
  if (/^3[47]/.test(num)) return { name: "Amex", icon: "🟦" };
  if (/^6(?:011|5)/.test(num)) return { name: "Discover", icon: "🟧" };
  return { name: "Unknown", icon: "❔" };
}

/**
 * Generate a dummy secure token (placeholder for real PCI tokenization)
 * @param {string} cardNumber
 * @param {string} exp
 * @param {string} cvc
 * @param {string} postal
 * @returns {string} - token
 */
export function generateToken({ cardNumber, exp, cvc, postal }) {
  // In real world, call PCI-compliant API to get token
  const payload = `${cardNumber}|${exp}|${cvc}|${postal}|${Date.now()}`;
  return btoa(payload); // base64 for demo
}
// payment-component.js
import { validateField } from "./validation.js";    