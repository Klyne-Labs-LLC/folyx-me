
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                connect your social media profiles, or contact us for support. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Name, email address, and contact information</li>
                <li>Professional information from connected social media accounts</li>
                <li>Portfolio content and customization preferences</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide and improve our AI-powered portfolio generation service</li>
                <li>Create and maintain your professional portfolio</li>
                <li>Process payments and communicate about your account</li>
                <li>Send important service updates and notifications</li>
                <li>Respond to your requests and provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who assist in operating our platform</li>
                <li>To protect our rights and the security of our users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or 
                destruction. However, no internet transmission is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our services 
                and comply with legal obligations. You may request deletion of your account 
                and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of non-essential communications</li>
                <li>Export your portfolio data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, contact us at:
                <br />
                Email: privacy@folyx.com
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

export default PrivacyPolicy;
