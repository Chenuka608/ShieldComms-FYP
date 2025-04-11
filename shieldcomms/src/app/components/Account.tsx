"use client"; // Enables client-side interactivity

import React, { useState, useEffect } from 'react';

export default function Account() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Fetch user account details on component mount
    const fetchAccountDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/account', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);
          setIsAuthenticated(true);
        } else {
          setMessage('Failed to fetch account details');
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
        setMessage('An error occurred');
      }
    };

    fetchAccountDetails();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      if (response.ok) {
        setMessage('Account updated successfully');
      } else {
        const errorText = await response.text();
        setMessage(`Failed to update account: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage('An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setMessage('Logged out successfully');
  };

  return (
    <div className="account-container p-4 max-w-md mx-auto bg-white shadow-md rounded-lg mt-40 mb-80">
      <h2 className="text-2xl font-bold mb-4 text-center">Account Management</h2>
      {message && <p className="mb-4 text-red-500 text-center">{message}</p>}
      {isAuthenticated ? (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleUpdate}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500"
          >
            Update Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 text-white py-2 rounded-md mt-2 hover:bg-gray-500"
          >
            Logout
          </button>
        </>
      ) : (
        <p className="text-center">Please sign in to manage your account.</p>
      )}
    </div>
  );
}
