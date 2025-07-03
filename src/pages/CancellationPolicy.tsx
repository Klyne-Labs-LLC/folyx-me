
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Cancellation Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Service Cancellation</h2>
              <p>
                You may cancel your Folyx service at any time. Since our service primarily 
                involves one-time portfolio generation, there are no recurring subscriptions 
                to cancel for most users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How to Cancel</h2>
              <p>
                To cancel any ongoing services or delete your account:
              </p>
              <ol className="list-decimal pl-6 mt-2">
                <li>Log into your Folyx account</li>
                <li>Go to Account Settings</li>
                <li>Select "Cancel Service" or "Delete Account"</li>
                <li>Confirm your cancellation request</li>
                <li>You will receive an email confirmation</li>
              </ol>
              <p className="mt-4">
                Alternatively, you can email us at support@folyx.com with your cancellation request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Effect of Cancellation</h2>
              <p>
                Upon cancellation:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Your generated portfolio will remain active for 30 days</li>
                <li>You can download your portfolio files during this period</li>
                <li>Account access will be terminated after 30 days</li>
                <li>All personal data will be deleted per our Privacy Policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Premium Features Cancellation</h2>
              <p>
                If you have premium features or custom domain services:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Cancel at least 24 hours before any renewal date</li>
                <li>Premium features remain active until the current billing period ends</li>
                <li>Custom domains will be disconnected after 7 days notice</li>
                <li>No partial refunds for unused premium time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Export</h2>
              <p>
                Before cancelling, you can:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Download your complete portfolio as HTML/CSS files</li>
                <li>Export your portfolio content in various formats</li>
                <li>Save your portfolio images and assets</li>
                <li>Request a copy of your account data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Reactivation</h2>
              <p>
                You can reactivate your account within 30 days of cancellation by:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Logging back into your account</li>
                <li>Contacting support@folyx.com</li>
                <li>Your portfolio and data will be restored</li>
                <li>After 30 days, you'll need to start fresh with a new account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact for Cancellation</h2>
              <p>
                Need help with cancellation? Contact us:
                <br />
                Email: support@folyx.com
                <br />
                Subject: "Account Cancellation Request"
                <br />
                Response time: Within 24 hours
                <br />
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
