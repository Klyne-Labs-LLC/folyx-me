
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">anian@folyx.me</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Business Address</h3>
                  <p className="text-gray-600">
                    Folyx Inc.<br />
                    1234 Technology Drive<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Response Time</h3>
                  <p className="text-gray-600">We typically respond within 24 hours during business days.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Support Hours</h2>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM PST</p>
                <p className="text-gray-600"><strong>Saturday:</strong> 10:00 AM - 4:00 PM PST</p>
                <p className="text-gray-600"><strong>Sunday:</strong> Closed</p>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
                <p className="text-gray-600">
                  For common questions about our AI portfolio builder service, please check our FAQ section or contact us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
