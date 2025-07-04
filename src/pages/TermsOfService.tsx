import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using Folyx's AI-powered portfolio building service, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-600 mb-4">
                Folyx provides an AI-powered portfolio building service that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Automatically generates professional portfolios from your social media profiles</li>
                <li>Maintains and updates your portfolio using AI technology</li>
                <li>Provides hosting and management of your portfolio website</li>
                <li>Offers customization and integration features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-600 mb-4">As a user of Folyx, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to reverse engineer or hack our AI systems</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as stated in our Refund Policy</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>Failure to pay may result in service suspension or termination</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                You retain ownership of your content and portfolio information. Folyx retains ownership of:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Our AI technology and algorithms</li>
                <li>The Folyx platform and software</li>
                <li>Our trademarks and branding</li>
                <li>Templates and design elements we provide</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                Folyx shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-600 mb-4">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Your access to premium features will cease</li>
                <li>Your data will be retained according to our Privacy Policy</li>
                <li>Outstanding fees remain payable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600">
                For questions about these Terms of Service:
                <br />
                Email: anian@folyx.me
                <br />
                Address: Folyx Inc., 1234 Technology Drive, San Francisco, CA 94105
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
