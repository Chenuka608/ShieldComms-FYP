"use client"; // Ensure this is a client-side component

import React from "react";

const Application = () => {
  return (
    <section className="min-h-screen bg-gray-100 p-6">
      {/* Alerts Section (Fixed on top-right, moved away from the corner) */}
      <div className="fixed top-0 right-4 z-50 space-y-4 w-full max-w-xl sm:w-auto">
        <div className="bg-red-200 text-red-800 p-4 rounded-lg flex justify-between shadow-md">
          <span>Danger Alert</span>
          <button className="text-red-800">&times;</button>
        </div>
        <div className="bg-blue-200 text-blue-800 p-4 rounded-lg flex justify-between shadow-md">
          <span>Info Alert</span>
          <button className="text-blue-800">&times;</button>
        </div>
      </div>

      {/* Messages Display Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4 max-h-64 overflow-y-auto">
          <div className="flex justify-between border-b pb-3">
            <p className="text-gray-700">Message 1 - Safe</p>
            <span className="text-green-600">Non - Phishing ( Safe )</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <p className="text-gray-700">Message 2 - Danger</p>
            <span className="text-red-600">Phishing ( Danger )</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <p className="text-gray-700">Message 3 - Warning</p>
            <span className="text-yellow-600">Warning</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload File</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input type="file" className="border p-2 rounded-lg w-full sm:w-auto" />
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full sm:w-auto">
            Browse
          </button>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 mb-8">
        <button className="bg-red-200 text-red-800 px-4 py-2 rounded-lg w-full sm:w-auto mb-4 sm:mb-0">
          Danger Alert
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto">
          Take Action
        </button>
      </div>

      {/* Report Generation Section */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Report Generation</h2>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 w-full sm:w-auto">
          Generate
        </button>
        <div className="border mt-4 p-4 text-center text-gray-500">
          <p>Report Generated</p>
        </div>
      </div>
    </section>
  );
};

export default Application;
