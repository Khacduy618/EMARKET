'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api'; // Assuming api utility is in this path

const LoginPage: React.FC = () => {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if authToken exists in localStorage
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // If token exists, redirect to homepage
      router.push('/');
    }
  }, [router]); // Dependency array includes router to ensure effect runs if router changes

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Assuming the login API endpoint is '/api/login' and accepts email and password
      const response = await api.post('/login', { Email, Password });
      console.log('data: ', response);
      if (response.Token && response.User) {
        // Assuming the API returns a token upon successful login
        // Store the token (e.g., in localStorage or a state management solution)
        localStorage.setItem('authToken', response.Token);
        localStorage.setItem('user', JSON.stringify(response.User));
        // Redirect to a protected page (e.g., homepage or dashboard)
        router.push('/'); // Redirect to homepage after login
      } else {
        // Handle cases where login is unsuccessful but no error is thrown
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      console.error("Login error:", err); // Log the full error object
      // Handle API errors
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        // Handle generic Error objects (e.g., network errors)
        setError(`Đã xảy ra lỗi trong quá trình đăng nhập: ${err.message}`);
      } else {
        setError('Đã xảy ra lỗi không xác định trong quá trình đăng nhập.');
      }
    }
  };

  return (
    <div className="flex h-screen font-sans text-black container mx-auto mt-4 mb-4 rounded-lg shadow-md">
      <div className="w-1/2 p-10 flex flex-col justify-center items-start bg-white rounded-s-lg ">
        <h1 className="text-3xl font-bold text-gray-500 hover:text-gray-700">Holla, Welcome Back</h1>
        <p className="text-gray-500 hover:text-gray-700">Hey, welcome back to your special place</p>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="w-full">
          <div className="mb-5">
            <label htmlFor="Email" className="block mb-1 text-gray-500 hover:text-gray-700">Email:</label>
            <input
              id="Email"
              type="Email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="Password" className="block mb-1 text-gray-500 hover:text-gray-700">Mật khẩu:</label>
            <input
              id="Password"
              type="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between items-center mb-5">
            <label className="flex items-center">
              <input type="checkbox" id="rememberMe" className="mr-2 " />
              <span className="text-gray-500 hover:text-gray-700"> Remember me</span>
            </label>
            <a href="#" className="text-gray-500 hover:text-gray-700">Forgot Password?</a>
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full">Sign In</button>
        </form>
        <p className="mt-5 text-gray-500 hover:text-gray-700">Don't have an account? <a href="#" className="text-blue-500 hover:text-blue-700">Sign Up</a></p>
      </div>
      <div className="w-1/2 bg-purple-200 flex justify-center items-center rounded-e-lg">
        {/*  Illustration */}
        <div className="text-center p-10">
          <img src="/images/illustration.png" alt="Illustration" className="max-w-full h-auto" />
          <p className="mt-5 text-gray-500 hover:text-gray-700" >Please tap your finger to your phone</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
