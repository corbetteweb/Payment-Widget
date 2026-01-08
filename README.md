# Payment-Widget
Production-Grade Reusable Payment Component

Objective
•	Design and build a secure, reusable UI component for collecting payment card information.
•	Functionality similar to modern payment form elements.
•	Single, versatile component for embedding in various web applications (Angular, React, Vue, standalone HTML).

Core Requirements
•	Unified Input
•	Streamlined UI for:
•	Card Number
•	Expiration Date
•	CVC (Card Verification Code)
•	Postal Code

Real-time Validation
•   Client-side validation for all fields.
•   Immediate visual feedback for errors or invalid data.

Secure Data Handling
•   Sensitive payment info (card number, CVC) never reaches host server.
•   Generates a secure, single-use token representing payment info.

Dummy API Integration
•   Integrates with a dummy "make payment" API.
•   Sends secure token, receives simulated success/failure response.

* Demonstrates full payment flow in testing environment.

Key Technical & Design Criteria
•	Framework Agnostic Architecture
•	Usable as a standalone component.
•	Easy integration into any modern web framework or HTML page.

Customization & Theming
•   Appearance (colors, fonts, borders) easily customizable.
•   Matches host application look and feel.

* Accessibility (a11y)

payment-component/
│
├─ index.html            # Demo page
├─ payment-component.js  # Main component
├─ validation.js         # Field validation logic
├─ card-utils.js         # Card formatting, brand detection, token generation
└─ dummy-api.js          # Dummy backend API