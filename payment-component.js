import { validateField } from "./validation.js";
import { formatCardNumber, detectCardBrand, generateToken } from "./card-utils.js";

class PaymentCardForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.cardBrandEl = null;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { font-family: system-ui, sans-serif; display:block; max-width:360px; }
        form { background:white; padding:20px; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); }
        .field { margin-bottom:14px; position: relative; }
        label { display:block; font-size:13px; margin-bottom:4px; }
        .required { color:#d32f2f; margin-left:4px; }
        input { width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-size:14px; }
        input.invalid { border-color:#d32f2f; }
        .error { font-size:12px; color:#d32f2f; min-height:14px; }
        .form-error { margin-bottom:14px; padding:10px; border-radius:6px; background:#fdecea; color:#b71c1c; font-size:14px; }
        .card-brand { position:absolute; right:10px; top:38px; font-size:14px; color:#555; }
        button { width:100%; padding:12px; background:var(--primary-color,#635bff); color:white; border:none; border-radius:6px; cursor:pointer; }
      </style>

      <form novalidate aria-label="Payment form">
        <div id="form-error" class="form-error" role="alert" aria-live="assertive" hidden></div>

        <div class="field">
          <label for="card">Card Number<span class="required" aria-hidden="true">*</span></label>
          <input id="card" type="tel" inputmode="numeric" autocomplete="cc-number" required aria-required="true" aria-invalid="false" aria-describedby="card-error" />
          <div class="card-brand" id="card-brand"></div>
          <div id="card-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="exp">Expiration (MM/YY)<span class="required" aria-hidden="true">*</span></label>
          <input id="exp" type="text" placeholder="MM/YY" autocomplete="cc-exp" required aria-required="true" aria-invalid="false" aria-describedby="exp-error" />
          <div id="exp-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="cvc">CVC<span class="required" aria-hidden="true">*</span></label>
          <input id="cvc" type="tel" inputmode="numeric" autocomplete="cc-csc" required aria-required="true" aria-invalid="false" aria-describedby="cvc-error" />
          <div id="cvc-error" class="error" aria-live="polite"></div>
        </div>

        <div class="field">
          <label for="postal">Postal Code<span class="required" aria-hidden="true">*</span></label>
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
    const inputs = this.shadowRoot.querySelectorAll("input");
    const cardInput = this.shadowRoot.querySelector("#card");

    cardInput.addEventListener("input", e => {
      const formatted = formatCardNumber(e.target.value);
      e.target.value = formatted;
      this.cardBrandEl.textContent = detectCardBrand(formatted);
    });

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

  handleSubmit(e) {
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

    // Generate secure token instead of raw card data
    const token = generateToken({
      cardNumber: this.value("#card"),
      exp: this.value("#exp"),
      cvc: this.value("#cvc"),
      postal: this.value("#postal")
    });

    this.dispatchEvent(
      new CustomEvent("payment-valid", {
        detail: { token },
        bubbles: true
      })
    );
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
