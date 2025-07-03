
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Refund & Dispute Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
              <p>
                We offer refunds under the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Technical issues preventing portfolio generation within 48 hours of payment</li>
                <li>Service failure to deliver promised features within 7 days</li>
                <li>Duplicate charges or billing errors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Refund Process</h2>
              <p>
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 mt-2">
                <li>Contact our support team at support@folyx.com within 30 days of purchase</li>
                <li>Provide your order number and reason for the refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>Approved refunds will be processed within 5-7 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Non-Refundable Services</h2>
              <p>
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Successfully generated portfolios that you no longer want</li>
                <li>Services used for more than 30 days</li>
                <li>Custom domain setup fees (third-party costs)</li>
                <li>Requests made after the 30-day window</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Dispute Resolution</h2>
              <p>
                If you have a dispute regarding our service:
              </p>
              <ol className="list-decimal pl-6 mt-2">
                <li>Contact us directly at support@folyx.com first</li>
                <li>We will work to resolve the issue within 5 business days</li>
                <li>If unresolved, you may dispute the charge with your credit card company</li>
                <li>For payment disputes, contact Stripe support as our payment processor</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Chargeback Policy</h2>
              <p>
                Before initiating a chargeback, please contact us directly. Chargebacks may 
                result in immediate account suspension and additional fees. We prefer to 
                resolve issues directly and promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
              <p>
                For refund requests or disputes, contact us at:
                <br />
                Email: support@folyx.com
                <br />
                Response time: Within 24 hours during business days
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

export default RefundPolicy;
