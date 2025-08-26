// index.js

export default {
  async fetch(request, env, ctx) {
    // --- Log Request Details ---
    console.log('--- New Webhook Request ---');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Method: ${request.method}`);
    console.log(`URL: ${request.url}`);

    // Log headers by converting them to an object
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }
    console.log('Headers:');
    console.log(JSON.stringify(headers, null, 2));

    // --- Inspect the Client Certificate (mTLS) ---
    // Cloudflare provides mTLS details in the `request.cf.tlsClientAuth` object
    const clientCert = request.cf.tlsClientAuth;

    if (clientCert && clientCert.certVerified) {
      console.log('Client Certificate Info:');
      console.log(`- Status: ${clientCert.certVerified}`);
      console.log(`- Issuer DN: ${clientCert.certIssuerDNLegacy}`);
      console.log(`- Subject DN: ${clientCert.certSubjectDNLegacy}`);
      console.log(`- Fingerprint: ${clientCert.certFingerprintSHA256}`);
    } else {
      console.log('Client Certificate: [None Provided or Invalid]');
    }

    // --- Log the Body ---
    // Check if the request has a body before trying to read it
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      try {
        const body = await request.json(); // Assumes JSON body
        console.log('Body:');
        console.log(JSON.stringify(body, null, 2));
      } catch (e) {
        console.log('Body: [Could not parse as JSON]');
      }
    } else {
      console.log('Body: [Empty]');
    }

    console.log('---------------------------\n');

    // --- Respond to the Sender ---
    return new Response(
      JSON.stringify({ status: 'success', message: 'Webhook received!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};