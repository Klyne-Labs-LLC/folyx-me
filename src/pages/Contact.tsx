
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Customer Service & Contact</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p>
                We're here to help you create the perfect professional portfolio. 
                Our support team is ready to assist with any questions about our AI-powered 
                portfolio generation service.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8 not-prose">
              <div className="glass-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                    <p className="text-gray-600 mb-3">
                      Send us an email for detailed assistance with your portfolio or account questions.
                    </p>
                    <a 
                      href="mailto:support@folyx.com" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      support@folyx.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                    <p className="text-gray-600 mb-3">
                      Get instant help during business hours through our website chat.
                    </p>
                    <span className="text-green-600 font-medium">
                      Available on website
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <section className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Support Hours</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
                    <li>Saturday: 10:00 AM - 4:00 PM EST</li>
                    <li>Sunday: Closed</li>
                    <li>Email support: 24/7 (responses within 24 hours)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Common Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How long does portfolio generation take?</h3>
                  <p className="text-gray-600">
                    Most portfolios are generated within 24-48 hours after connecting your social media accounts.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I customize my generated portfolio?</h3>
                  <p className="text-gray-600">
                    Yes! Our AI creates a base portfolio that you can then customize with your preferred styling and content adjustments.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What social media platforms do you support?</h3>
                  <p className="text-gray-600">
                    We currently support LinkedIn, Twitter, and GitHub, with more platforms being added regularly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <p><strong>Business Name:</strong> Folyx</p>
                <p><strong>Service:</strong> AI-Powered Professional Portfolio Generation</p>
                <p><strong>Contact Email:</strong> support@folyx.com</p>
                <p><strong>Business Email:</strong> hello@folyx.com</p>
                <p><strong>Legal Inquiries:</strong> legal@folyx.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
