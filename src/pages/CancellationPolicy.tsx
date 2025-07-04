
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cancellation Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Cancellation</h2>
              <p className="text-gray-600 mb-4">
                You can cancel your Folyx subscription at any time. Here's what you need to know about our cancellation process:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Cancellations can be processed immediately through your account dashboard</li>
                <li>You will retain access to premium features until the end of your current billing period</li>
                <li>No additional charges will occur after cancellation</li>
                <li>Your portfolio will remain active but will revert to free tier limitations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Cancel</h2>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>Log into your Folyx account</li>
                <li>Navigate to Account Settings</li>
                <li>Click on "Subscription Management"</li>
                <li>Select "Cancel Subscription"</li>
                <li>Confirm your cancellation request</li>
              </ol>
              <p className="text-gray-600 mt-4">
                Alternatively, you can contact our support team at anian@folyx.me for assistance with cancellation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Cancellation by Folyx</h2>
              <p className="text-gray-600 mb-4">
                Folyx reserves the right to cancel or suspend service in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Violation of our Terms of Service</li>
                <li>Fraudulent or unauthorized use of our service</li>
                <li>Non-payment of subscription fees</li>
                <li>Misuse of our AI technology or platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-600 mb-4">
                After cancellation:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Your portfolio data will be retained for 90 days</li>
                <li>You can reactivate your subscription within this period to restore full access</li>
                <li>After 90 days, premium features and data may be permanently removed</li>
                <li>Basic portfolio information may be retained as per our Privacy Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Support</h2>
              <p className="text-gray-600">
                If you need assistance with cancellation or have questions about this policy:
                <br />
                Email: anian@folyx.me
                <br />
                Response time: Within 24 hours during business days
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
