
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
              <p>
                Folyx provides an AI-powered portfolio generation service that automatically creates 
                professional portfolios by analyzing and organizing content from your social media 
                profiles, particularly LinkedIn and other professional platforms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p>
                To use our service, you must create an account and provide accurate information. 
                You are responsible for maintaining the security of your account credentials and 
                for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Service Usage</h2>
              <p>
                You may use Folyx to create professional portfolios for legitimate business purposes. 
                You agree not to use the service for any unlawful activities or in violation of 
                these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data and Privacy</h2>
              <p>
                We collect and process your professional information from connected social media 
                accounts to generate your portfolio. By using our service, you consent to this 
                data processing as outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p>
                You retain ownership of your content. Folyx retains rights to our platform, 
                technology, and AI systems. The generated portfolios belong to you, but you 
                grant us a license to host and display them as part of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Payment and Billing</h2>
              <p>
                Payments are processed securely through Stripe. All fees are non-refundable 
                unless otherwise specified in our refund policy. You agree to pay all charges 
                incurred under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p>
                We strive to maintain high service availability but cannot guarantee uninterrupted 
                service. We may temporarily suspend service for maintenance or updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                Folyx is provided "as is" without warranties. We are not liable for any indirect, 
                incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p>
                Either party may terminate this agreement at any time. Upon termination, your 
                access to the service will cease, but these terms will survive as applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p>
                For questions about these Terms of Service, contact us at:
                <br />
                Email: legal@folyx.com
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

export default TermsOfService;
