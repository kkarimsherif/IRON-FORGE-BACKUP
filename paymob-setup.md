# Setting Up Paymob Payment Gateway

This guide will help you set up Paymob as a payment gateway for your Iron Forge application.

## Prerequisites
1. A Paymob account - Sign up at [https://paymob.com](https://paymob.com)
2. Your application should be running on a server accessible from the internet (for webhook callbacks)

## Step 1: Register on Paymob
1. Go to [https://paymob.com](https://paymob.com) and create a merchant account.
2. Complete the KYC (Know Your Customer) process and submit the required documentation.

## Step 2: Get API Credentials
1. After your account is approved, log in to the Paymob dashboard.
2. Go to "Developers" > "API Keys".
3. Copy your "API Key" - this is what you'll use as `PAYMOB_API_KEY`.

## Step 3: Create a Payment Integration
1. In the Paymob dashboard, go to "Integrations".
2. Create a new integration for the payment method you want to use (Card payments, mobile wallets, etc.).
3. After creating an integration, you'll get an "Integration ID" - save this as `PAYMOB_INTEGRATION_ID`.

## Step 4: Create a Payment iFrame
1. In the Paymob dashboard, go to "Developers" > "iFrames".
2. Create a new iFrame.
3. You'll get an "iFrame ID" - save this as `PAYMOB_IFRAME_ID`.

## Step 5: Configure Your Application
1. Open the `.env` file in your project root directory.
2. Add these environment variables with your actual credentials:
   ```
   PAYMOB_API_KEY=your_api_key_here
   PAYMOB_INTEGRATION_ID=your_integration_id_here
   PAYMOB_IFRAME_ID=your_iframe_id_here
   ```

## Step 6: Set Up Webhooks (Optional but Recommended)
1. In the Paymob dashboard, go to "Developers" > "Webhooks".
2. Add a new webhook with the following details:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Method: POST
   - Active: Yes
   - Events: Select the events you want to be notified about (generally "Successful Transaction" and "Failed Transaction")

## Testing Your Integration
1. Paymob provides test card details in their dashboard.
2. Use these test cards to simulate successful and failed payments.
3. Common test card details:
   - Card Number: 5123456789012346
   - Expiry Date: Any future date (MM/YY)
   - CVV: Any 3 digits

## Going to Production
1. When you're ready to accept real payments, you'll need to provide additional business information to Paymob.
2. Make sure your server is secured with HTTPS.
3. Remove any test accounts or test mode configurations.

## Troubleshooting
If you encounter issues with the Paymob integration:

1. Check that your API credentials are correct.
2. Ensure your webhook URL is accessible from the internet.
3. Look at the logs in both your application and the Paymob dashboard.
4. Contact Paymob support if you continue to have issues.

## Security Notes
1. Never expose your API key in client-side code.
2. Always validate payment confirmations server-side.
3. Implement CSRF protection on your payment forms.
4. Always verify transaction amounts and order details when receiving webhooks.

For more information, refer to the [Paymob API documentation](https://docs.paymob.com). 