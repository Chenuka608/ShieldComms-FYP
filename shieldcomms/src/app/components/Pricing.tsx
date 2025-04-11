import React from "react";

const Pricing = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h2 className="text-4xl font-bold mb-6">Our Pricing Plans</h2>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
        Choose the best plan that fits your needs. All plans come with essential security features to protect your communications.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-white shadow-lg rounded-2xl p-8 w-80 md:w-96 text-center">
          <h3 className="text-2xl font-semibold mb-4">Free Plan</h3>
          <p className="text-gray-600 mb-6">Ideal for individuals who need basic protection.</p>
          <p className="text-3xl font-bold text-gray-800 mb-4">Free</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>✔ Basic Email Scanning</li>
            <li>✔ Limited Threat Detection</li>
            <li>✔ Weekly Security Reports</li>
            <li>❌ No Priority Support</li>
          </ul>
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition">Get Started</button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white shadow-lg rounded-2xl p-8 w-80 md:w-96 text-center border-2 border-blue-500">
          <h3 className="text-2xl font-semibold mb-4">Pro Plan</h3>
          <p className="text-gray-600 mb-6">Best for professionals & small teams.</p>
          <p className="text-3xl font-bold text-gray-800 mb-4">$9.99/mo</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>✔ Advanced Email Scanning</li>
            <li>✔ AI-Powered Threat Detection</li>
            <li>✔ Daily Security Reports</li>
            <li>✔ Priority Support</li>
          </ul>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">Choose Plan</button>
        </div>

        {/* Business Plan */}
        <div className="bg-white shadow-lg rounded-2xl p-8 w-80 md:w-96 text-center">
          <h3 className="text-2xl font-semibold mb-4">Business Plan</h3>
          <p className="text-gray-600 mb-6">For businesses & enterprises with high-security needs.</p>
          <p className="text-3xl font-bold text-gray-800 mb-4">$29.99/mo</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>✔ AI & Machine Learning Detection</li>
            <li>✔ Real-Time Monitoring</li>
            <li>✔ Custom Security Reports</li>
            <li>✔ 24/7 Dedicated Support</li>
          </ul>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">Choose Plan</button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
