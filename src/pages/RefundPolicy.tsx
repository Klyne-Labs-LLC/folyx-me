
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Refund Commitment</h2>
              <p className="text-gray-600 mb-4">
                At Folyx, we stand behind our AI-powered portfolio building service. We offer a satisfaction guarantee to ensure you're completely happy with your AI-generated portfolio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Eligibility</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Refunds are available within 30 days of your purchase</li>
                <li>You must have attempted to use our service and contacted support for assistance</li>
                <li>Refunds apply to subscription fees and one-time payments</li>
                <li>Free tier users are not eligible for refunds as no payment was made</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>Contact our support team at support@folyx.me</li>
                <li>Provide your account details and reason for the refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>If approved, refunds will be processed within 5-10 business days</li>
                <li>Refunds will be issued to the original payment method</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Custom development work beyond our standard service</li>
                <li>Third-party integrations or services</li>
                <li>Requests made after 30 days from purchase</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600">
                For refund requests or questions about this policy, please contact us at:
                <br />
                Email: support@folyx.me
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

export default RefundPolicy;
