"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Simple scroll reveal
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-8 navbar-blur bg-slate-900/30 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center icon-hover">
            <span className="text-white font-bold text-sm">ID</span>
          </div>
          <span className="text-xl font-bold text-white">Campus ID</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
          <a href="#about" className="text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">About</a>
          <a href="#contact" className="text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">Contact</a>
          <Link href="/news" className="text-slate-300 hover:text-white transition-all duration-300 hover:scale-105">
            News & Updates
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/news">
            <button className="btn-secondary text-white border border-slate-600 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              📰 News
            </button>
          </Link>
          <Link href="/login">
            <button className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg">
              Sign In
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 lg:px-8 pt-20">
        <div className="mx-auto max-w-7xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl scroll-reveal">
              Your Digital Campus
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"> Identity</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto scroll-reveal">
              Secure, convenient, and modern student ID system. Access buildings, pay for meals, 
              and manage your campus life with a single digital identity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 scroll-reveal">
              <Link href="/register-institution">
                <button className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                  Register Your Institution
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-secondary text-white border border-slate-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-slate-700/50 transition-colors">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="text-center scroll-reveal">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need in one place
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Streamline your campus experience with our comprehensive digital ID system
              </p>
            </div>
            
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 scroll-reveal">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 icon-hover">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Secure Access</h3>
                <p className="text-slate-300">
                  Advanced encryption and biometric authentication ensure your digital ID is secure and tamper-proof.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 scroll-reveal">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6 icon-hover">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Campus Payments</h3>
                <p className="text-slate-300">
                  Pay for meals, books, and services across campus with contactless payments and real-time balance tracking.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 scroll-reveal">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 icon-hover">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Mobile Ready</h3>
                <p className="text-slate-300">
                  Access your digital ID from any device with our responsive web app and mobile-optimized interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center scroll-reveal">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by students nationwide
              </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center scroll-reveal">
                <div className="stat-number text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500K+</div>
                <div className="mt-2 text-slate-300">Active Students</div>
              </div>
              <div className="text-center scroll-reveal">
                <div className="stat-number text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">200+</div>
                <div className="mt-2 text-slate-300">Partner Universities</div>
              </div>
              <div className="text-center scroll-reveal">
                <div className="stat-number text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">99.9%</div>
                <div className="mt-2 text-slate-300">Uptime</div>
              </div>
              <div className="text-center scroll-reveal">
                <div className="stat-number text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">24/7</div>
                <div className="mt-2 text-slate-300">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Learn More Section */}
        <section id="learn-more" className="py-24 sm:py-32 bg-slate-800/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center scroll-reveal">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Learn More About Campus ID
              </h2>
              <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                Discover how our digital campus identity system revolutionizes student life with cutting-edge technology, 
                enhanced security, and seamless integration across your entire campus ecosystem.
              </p>
            </div>

            {/* How It Works */}
            <div className="mt-20">
              <div className="text-center scroll-reveal">
                <h3 className="text-2xl font-bold text-white mb-12">How Campus ID Works</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center scroll-reveal">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 icon-hover">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Sign Up & Verify</h4>
                  <p className="text-slate-300">
                    Create your account with your student credentials and verify your identity through our secure OTP system.
                  </p>
                </div>
                <div className="text-center scroll-reveal">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 icon-hover">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Get Your Digital ID</h4>
                  <p className="text-slate-300">
                    Receive your unique QR code and barcode that serves as your digital campus identity across all services.
                  </p>
                </div>
                <div className="text-center scroll-reveal">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 icon-hover">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Access Everything</h4>
                  <p className="text-slate-300">
                    Use your digital ID for building access, payments, library services, and all campus facilities seamlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="mt-24">
              <div className="text-center scroll-reveal">
                <h3 className="text-2xl font-bold text-white mb-12">Why Choose Digital Campus ID?</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="scroll-reveal">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Enhanced Security</h4>
                        <p className="text-slate-300">Advanced encryption, biometric authentication, and real-time fraud detection protect your identity.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Contactless Convenience</h4>
                        <p className="text-slate-300">No more physical cards to lose or replace. Access everything with your smartphone.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Real-time Updates</h4>
                        <p className="text-slate-300">Instant balance updates, transaction history, and campus notifications at your fingertips.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Comprehensive Dashboard</h4>
                        <p className="text-slate-300">Track attendance, manage finances, view grades, and access all campus services from one place.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="scroll-reveal">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50">
                    <div className="text-center">
                      <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 icon-hover">
                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-4">Your Digital Campus Life</h4>
                      <p className="text-slate-300 mb-6">
                        Experience the future of campus identity with our comprehensive digital solution.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <div className="font-semibold text-blue-400">₦50,000+</div>
                          <div className="text-slate-300">Avg. Wallet Balance</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <div className="font-semibold text-green-400">98%</div>
                          <div className="text-slate-300">Attendance Rate</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <div className="font-semibold text-purple-400">15+</div>
                          <div className="text-slate-300">Campus Services</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                          <div className="font-semibold text-orange-400">24/7</div>
                          <div className="text-slate-300">Access</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="mt-24">
              <div className="text-center scroll-reveal">
                <h3 className="text-2xl font-bold text-white mb-4">Bank-Level Security</h3>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
                  Your digital identity is protected by the same security standards used by financial institutions.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 text-center scroll-reveal">
                  <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4 icon-hover">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">256-bit Encryption</h4>
                  <p className="text-slate-300 text-sm">Military-grade encryption protects all data transmission</p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 text-center scroll-reveal">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 icon-hover">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Biometric Auth</h4>
                  <p className="text-slate-300 text-sm">Fingerprint and facial recognition for secure access</p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 text-center scroll-reveal">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 icon-hover">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Fraud Detection</h4>
                  <p className="text-slate-300 text-sm">AI-powered monitoring prevents unauthorized access</p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 text-center scroll-reveal">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 icon-hover">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Compliance</h4>
                  <p className="text-slate-300 text-sm">GDPR and FERPA compliant data protection</p>
                </div>
              </div>
            </div>

            {/* Student Testimonials */}
            <div className="mt-24">
              <div className="text-center scroll-reveal">
                <h3 className="text-2xl font-bold text-white mb-12">What Students Say</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">AO</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Adebayo Olumide</div>
                      <div className="text-slate-400 text-sm">Computer Science, UI</div>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">
                    "Campus ID has made my university life so much easier. No more worrying about losing my physical ID card!"
                  </p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">FE</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Fatima Eze</div>
                      <div className="text-slate-400 text-sm">Medicine, UNILAG</div>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">
                    "The wallet feature is amazing! I can track all my campus expenses and never run out of funds unexpectedly."
                  </p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">CO</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Chidi Okafor</div>
                      <div className="text-slate-400 text-sm">Engineering, OAU</div>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">
                    "The attendance tracking and CGPA calculator have helped me stay on top of my academic performance."
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24">
              <div className="text-center scroll-reveal">
                <h3 className="text-2xl font-bold text-white mb-12">Frequently Asked Questions</h3>
              </div>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <h4 className="font-semibold text-white mb-3">Is my personal information secure?</h4>
                  <p className="text-slate-300">
                    Absolutely. We use bank-level encryption and comply with international data protection standards. 
                    Your information is never shared with third parties without your explicit consent.
                  </p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <h4 className="font-semibold text-white mb-3">What if I lose my phone?</h4>
                  <p className="text-slate-300">
                    You can immediately suspend your digital ID from any device by logging into your account. 
                    We also offer temporary access codes and can help you restore access to a new device.
                  </p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <h4 className="font-semibold text-white mb-3">How do I add money to my campus wallet?</h4>
                  <p className="text-slate-300">
                    You can fund your wallet through bank transfers, debit cards, or mobile money platforms. 
                    All transactions are instant and secure with real-time balance updates.
                  </p>
                </div>
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 scroll-reveal">
                  <h4 className="font-semibold text-white mb-3">Can I use Campus ID at multiple universities?</h4>
                  <p className="text-slate-300">
                    Yes! If you're enrolled at multiple institutions or visiting partner universities, 
                    your Campus ID works across our entire network of partner schools.
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="mt-24 text-center scroll-reveal">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-12 rounded-2xl border border-slate-600/50">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join the digital revolution and experience the future of campus life today. 
                  Setup takes less than 5 minutes and you'll have instant access to all campus services.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <button className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                      Create Your Digital ID
                    </button>
                  </Link>
                  <button className="btn-secondary text-white border border-slate-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-slate-700/50">
                    Watch Demo Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl scroll-reveal">
              Ready to modernize your campus experience?
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto scroll-reveal">
              Join thousands of students who have already made the switch to digital campus IDs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 scroll-reveal">
              <Link href="/signup">
                <button className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                  Create Account
                </button>
              </Link>
              <button className="btn-secondary text-white hover:text-blue-400 text-lg font-semibold">
                Contact Sales →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm text-white py-12 border-t border-slate-700/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Logo and Description - Full width on mobile */}
          <div className="scroll-reveal mb-8 md:mb-12">
            <div className="flex items-center space-x-2 mb-4 justify-center md:justify-start">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">ID</span>
              </div>
              <span className="text-xl font-bold">Campus ID</span>
            </div>
            <p className="text-slate-400 text-center md:text-left max-w-md mx-auto md:mx-0">
              The future of campus identity management. Secure, convenient, and modern student ID system for the digital age.
            </p>
          </div>

          {/* Footer Links - Better mobile layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="scroll-reveal text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors block">Features</a></li>
                <li><a href="#learn-more" className="hover:text-white transition-colors block">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Pricing</a></li>
                <li><a href="/news" className="hover:text-white transition-colors block">News & Updates</a></li>
              </ul>
            </div>
            <div className="scroll-reveal text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors block">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Documentation</a></li>
              </ul>
            </div>
            <div className="scroll-reveal text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors block">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Social Links - Mobile friendly */}
          <div className="scroll-reveal mb-8">
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.333 4.058.63a5.888 5.888 0 00-2.126 1.384 5.888 5.888 0 00-1.384 2.126C.333 4.73.131 5.493.072 6.71.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.059 1.217.261 1.98.558 2.652.307.788.717 1.459 1.384 2.126.667.667 1.338 1.077 2.126 1.384.672.297 1.435.499 2.652.558 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.217-.059 1.98-.261 2.652-.558a5.888 5.888 0 002.126-1.384 5.888 5.888 0 001.384-2.126c.297-.672.499-1.435.558-2.652.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.059-1.217-.261-1.98-.558-2.652a5.888 5.888 0 00-1.384-2.126A5.888 5.888 0 0016.965.63C16.293.333 15.53.131 14.313.072 13.094.013 12.627 0 12.017 0zm0 2.162c3.204 0 3.584.012 4.85.07 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.06 1.265.072 1.646.072 4.85s-.012 3.584-.072 4.85c-.053 1.17-.249 1.805-.413 2.227-.218.562-.477.96-.896 1.382-.419.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.06-1.646.072-4.85.072s-3.584-.012-4.85-.072c-1.17-.053-1.805-.249-2.227-.413a3.81 3.81 0 01-1.382-.896 3.81 3.81 0 01-.896-1.382c-.164-.422-.36-1.057-.413-2.227-.06-1.265-.072-1.646-.072-4.85s.012-3.584.072-4.85c.053-1.17.249-1.805.413-2.227.218-.562.477-.96.896-1.382.419-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.06 1.646-.072 4.85-.072z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.017 15.33a3.312 3.312 0 100-6.624 3.312 3.312 0 000 6.624zm0-8.414a5.102 5.102 0 110 10.204 5.102 5.102 0 010-10.204zm6.506-1.61a1.193 1.193 0 11-2.386 0 1.193 1.193 0 012.386 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright - Clean and centered */}
          <div className="border-t border-slate-800 pt-8 scroll-reveal">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-slate-400 text-sm text-center sm:text-left">
                &copy; 2024 Campus ID. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}