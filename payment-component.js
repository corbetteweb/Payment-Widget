import { validateField } from "./validation.js";
import { formatCardNumber, detectCardBrand, generateToken } from "./card-utils.js";
import { makePayment } from "./dummy-api.js";

class PaymentCardForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.cardBrandEl = null;
    this.currentCardBrand = { name: "", icon: "" };
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
  :host {
    font-family: var(--payment-font, system-ui, sans-serif);
    display: block;
    max-width: 360px;
  }

  form {
    background: var(--payment-background, white);
    padding: var(--payment-padding, 20px);
    border-radius: var(--payment-border-radius, 8px);
    box-shadow: var(--payment-box-shadow, 0 10px 25px rgba(0,0,0,0.1));
  }

  .field {
    margin-bottom: var(--payment-field-margin, 14px);
    position: relative;
  }

  label {
    display: block;
    font-size: var(--payment-label-font-size, 13px);
    margin-bottom: var(--payment-label-margin, 4px);
    color: var(--payment-label-color, #333);
  }

  .required {
    color: var(--payment-required-color, #d32f2f);
    margin-left: 4px;
  }

  input {
    width: 100%;
    padding: var(--payment-input-padding, 10px);
    border-radius: var(--payment-input-border-radius, 6px);
    border: 1px solid var(--payment-input-border-color, #ccc);
    font-size: var(--payment-input-font-size, 14px);
  }

  input.invalid {
    border-color: var(--payment-input-invalid-border-color, #d32f2f);
  }

  .error {
    font-size: var(--payment-error-font-size, 12px);
    color: var(--payment-error-color, #d32f2f);
    min-height: 14px;
  }

  .form-error {
    margin-bottom: 14px;
    padding: 10px;
    border-radius: 6px;
    background: var(--payment-form-error-bg, #fdecea);
    color: var(--payment-form-error-color, #b71c1c);
    font-size: var(--payment-form-error-font-size, 14px);
  }

  .card-brand {
    position: absolute;
    right: 10px;
    top: 38px;
    font-size: var(--payment-card-brand-font-size, 14px);
    color: var(--payment-card-brand-color, #555);
  }

  button {
    width: 100%;
    padding: var(--payment-button-padding, 12px);
    background: var(--payment-button-bg, #635bff);
    color: var(--payment-button-color, white);
    border: none;
    border-radius: var(--payment-button-border-radius, 6px);
    cursor: pointer;
    font-size: var(--payment-button-font-size, 14px);
  }

  button:hover {
    background: var(--payment-button-hover-bg, #4f47e0);
  }

  .card-brand {
    position:absolute;
    right:10px;
    top:38px;
    font-size:14px;
    display:flex;
    align-items:center;
    gap:4px;
}

  #exp, #cvc {
    font-family: monospace;
}
</style>


      <form novalidate aria-label="Payment form">
        <div id="form-error" class="form-error" role="alert" aria-live="assertive" hidden></div>

        <div class="field">
          <label for="card">Card Number<span class="required">*</span></label>
          <input id="card" type="tel" inputmode="numeric" autocomplete="cc-number" required aria-required="true" aria-invalid="false" aria-describedby="card-error" />
          <div class="card-brand" id="card-brand"></div>
          <div id="card-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="exp">Expiration (MM/YY)<span class="required">*</span></label>
          <input id="exp" type="text" placeholder="MM/YY" autocomplete="cc-exp" required aria-required="true" aria-invalid="false" aria-describedby="exp-error" />
          <div id="exp-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="cvc">CVC<span class="required">*</span></label>
          <input id="cvc" type="tel" inputmode="numeric" autocomplete="cc-csc" required aria-required="true" aria-invalid="false" aria-describedby="cvc-error" />
          <div id="cvc-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="postal">Postal Code<span class="required">*</span></label>
          <input id="postal" type="text" autocomplete="postal-code" required aria-required="true" aria-invalid="false" aria-describedby="postal-error" />
          <div id="postal-error" class="error" aria-live="polite"></div>
        </div>

        <button type="submit">Pay</button>
      </form>
    `;

    this.cardBrandEl = this.shadowRoot.querySelector("#card-brand");
  }

  bindEvents() {
    const form = this.shadowRoot.querySelector("form");
    const cardInput = this.shadowRoot.querySelector("#card");
    const expInput = this.shadowRoot.querySelector("#exp");
    const cvcInput = this.shadowRoot.querySelector("#cvc");

    // Card formatting & brand detection
    cardInput.addEventListener("input", e => {
      const formatted = formatCardNumber(e.target.value);
      e.target.value = formatted;
      const brand = detectCardBrand(formatted);
      this.currentCardBrand = brand;
      this.cardBrandEl.textContent = "";
      const icon = document.createElement("span");
      icon.textContent = brand.icon;
      this.cardBrandEl.appendChild(icon);
      const name = document.createElement("span");
      name.textContent = brand.name;
      this.cardBrandEl.appendChild(name);
    });

    // Expiration auto-formatting MM/YY
    expInput.addEventListener("input", e => {
      let value = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0,2) + "/" + value.slice(2);
      e.target.value = value;
    });

    // CVC auto-formatting & length
    cvcInput.addEventListener("input", e => {
      let maxLength = this.currentCardBrand.name === "Amex" ? 4 : 3;
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLength);
    });

    // Blur validation
    const inputs = this.shadowRoot.querySelectorAll("input");
    inputs.forEach(input => {
      input.addEventListener("blur", () => this.handleFieldValidation(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });

    form.addEventListener("submit", e => this.handleSubmit(e));
  }

  handleFieldValidation(input) {
    const error = validateField(input.id, input.value);
    if (error) this.showError(input, error);
    else this.clearFieldError(input);
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.clearFormError();

    const inputs = Array.from(this.shadowRoot.querySelectorAll("input"));
    let firstInvalid = null;

    inputs.forEach(input => {
      const error = validateField(input.id, input.value);
      if (error) {
        this.showError(input, error);
        if (!firstInvalid) firstInvalid = input;
      } else this.clearFieldError(input);
    });

    if (firstInvalid) {
      this.showFormError("Please complete all required fields correctly.");
      firstInvalid.focus();
      return;
    }

    // Generate dummy secure token
    const token = generateToken({
      cardNumber: this.value("#card"),
      exp: this.value("#exp"),
      cvc: this.value("#cvc"),
      postal: this.value("#postal")
    });

    // Call dummy payment API
    try {
      const response = await makePayment(token);
      if (response.status === "success") {
        alert(response.message);
        this.dispatchEvent(
          new CustomEvent("payment-success", { detail: { token }, bubbles: true })
        );
      } else {
        this.showFormError(response.message);
        this.dispatchEvent(
          new CustomEvent("payment-failure", { detail: { message: response.message }, bubbles: true })
        );
      }
    } catch (err) {
      this.showFormError("Network error. Please try again.");
    }
  }

  showError(input, message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    input.nextElementSibling.textContent = message;
  }

  clearFieldError(input) {
    input.classList.remove("invalid");
    input.setAttribute("aria-invalid", "false");
    input.nextElementSibling.textContent = "";
  }

  showFormError(message) {
    const el = this.shadowRoot.querySelector("#form-error");
    el.textContent = message;
    el.hidden = false;
  }

  clearFormError() {
    const el = this.shadowRoot.querySelector("#form-error");
    el.textContent = "";
    el.hidden = true;
  }

  value(selector) {
    return this.shadowRoot.querySelector(selector).value.trim();
  }
}

customElements.define("payment-card-form", PaymentCardForm);