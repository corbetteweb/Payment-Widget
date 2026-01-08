/**
 * Simulated payment API
 * @param {string} token - secure token from payment component
 * @returns {Promise<{status: 'success'|'failure', message: string}>}
 */
export async function makePayment(token) {
  console.log("Processing payment with token:", token);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Random success/failure
  const isSuccess = Math.random() < 0.8;

  if (isSuccess) {
    return {
      status: "success",
      message: "Payment processed successfully!"
    };
  } else {
    return {
      status: "failure",
      message: "Payment failed. Please try again."
    };
  }
}
