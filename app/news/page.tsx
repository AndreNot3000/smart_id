"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All News', icon: '📰' },
    { id: 'university', name: 'University News', icon: '🏫' },
    { id: 'jobs', name: 'Job Opportunities', icon: '💼' },
    { id: 'internships', name: 'Internships', icon: '🎓' },
    { id: 'scholarships', name: 'Scholarships', icon: '💰' },
    { id: 'grants', name: 'Grants', icon: '🏆' },
    { id: 'education', name: 'Education Gists', icon: '📚' }
  ];

  const newsItems = [
    {
      id: 1,
      category: 'university',
      title: 'University of Lagos Announces New Engineering Program',
      excerpt: 'UNILAG introduces cutting-edge Artificial Intelligence and Robotics Engineering program for 2024 academic session.',
      content: 'The University of Lagos has announced the launch of a new undergraduate program in Artificial Intelligence and Robotics Engineering, set to commence in the 2024/2025 academic session. This program aims to address the growing demand for AI specialists in Nigeria.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop',
      date: '2024-01-10',
      readTime: '3 min read',
      tags: ['UNILAG', 'Engineering', 'AI', 'New Program']
    },
    {
      id: 2,
      category: 'jobs',
      title: 'MTN Nigeria Graduate Trainee Program 2024',
      excerpt: 'MTN Nigeria is recruiting fresh graduates for their comprehensive 12-month graduate trainee program across various departments.',
      content: 'MTN Nigeria has opened applications for their 2024 Graduate Trainee Program. The program offers opportunities in Technology, Marketing, Finance, and Operations with competitive salary packages and career development opportunities.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
      date: '2024-01-08',
      readTime: '4 min read',
      tags: ['MTN', 'Graduate Program', 'Technology', 'Fresh Graduate'],
      applicationDeadline: '2024-02-15',
      salary: '₦200,000 - ₦300,000'
    },
    {
      id: 3,
      category: 'scholarships',
      title: 'Chevron Nigeria Undergraduate Scholarship 2024',
      excerpt: 'Chevron offers full scholarships to Nigerian students studying Engineering, Geosciences, and Environmental Studies.',
      content: 'Chevron Nigeria Limited is offering undergraduate scholarships worth ₦500,000 annually to Nigerian students in their 200-400 levels studying relevant courses in accredited Nigerian universities.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
      date: '2024-01-05',
      readTime: '5 min read',
      tags: ['Chevron', 'Scholarship', 'Engineering', 'Undergraduate'],
      applicationDeadline: '2024-03-01',
      amount: '₦500,000 annually'
    },
    {
      id: 4,
      category: 'internships',
      title: 'Google Developer Student Clubs Internship Program',
      excerpt: 'Google DSC offers 6-month paid internships for Nigerian computer science students with mentorship opportunities.',
      content: 'The Google Developer Student Clubs program is offering paid internships to computer science students across Nigerian universities. Interns will work on real projects and receive mentorship from Google engineers.',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=250&fit=crop',
      date: '2024-01-03',
      readTime: '4 min read',
      tags: ['Google', 'Internship', 'Computer Science', 'Mentorship'],
      applicationDeadline: '2024-01-31',
      duration: '6 months',
      stipend: '₦150,000/month'
    },
    {
      id: 5,
      category: 'grants',
      title: 'Tony Elumelu Foundation Entrepreneurship Grant',
      excerpt: 'TEF announces ₦5 million grants for young Nigerian entrepreneurs with innovative business ideas.',
      content: 'The Tony Elumelu Foundation is accepting applications for their annual entrepreneurship program, offering ₦5 million in funding, mentorship, and business training to selected entrepreneurs.',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop',
      date: '2024-01-01',
      readTime: '6 min read',
      tags: ['TEF', 'Entrepreneurship', 'Grant', 'Business'],
      applicationDeadline: '2024-02-28',
      amount: '₦5,000,000'
    },
    {
      id: 6,
      category: 'education',
      title: 'JAMB Introduces New CBT Centers Across Nigeria',
      excerpt: 'Joint Admissions and Matriculation Board expands computer-based testing infrastructure to improve accessibility.',
      content: 'JAMB has announced the establishment of 50 new Computer-Based Testing centers across Nigeria to improve access to UTME and other examinations, particularly in underserved areas.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
      date: '2023-12-28',
      readTime: '3 min read',
      tags: ['JAMB', 'CBT', 'UTME', 'Infrastructure']
    }
  ];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredNews = newsItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ID</span>
            </div>
            <span className="text-xl font-bold text-white">Campus ID</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              ← Back to Home
            </Link>
            <Link href="/signup">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            News & <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Updates</span>
          </h1>
          <p className="text-lg leading-8 text-slate-300 max-w-2xl mx-auto mb-8">
            Stay informed with the latest university news, job opportunities, scholarships, and educational insights.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search news, jobs, scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8">🔥 Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNews.map((item) => (
              <div key={item.id} className="card-hover bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-medium">
                      {categories.find(cat => cat.id === item.category)?.name}
                    </span>
                    <span className="text-slate-400 text-xs">{item.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{item.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">{new Date(item.date).toLocaleDateString()}</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <div key={item.id} className="card-hover bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'jobs' ? 'bg-green-900/30 text-green-400' :
                      item.category === 'scholarships' ? 'bg-yellow-900/30 text-yellow-400' :
                      item.category === 'internships' ? 'bg-purple-900/30 text-purple-400' :
                      item.category === 'grants' ? 'bg-orange-900/30 text-orange-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {categories.find(cat => cat.id === item.category)?.name}
                    </span>
                    <span className="text-slate-400 text-xs">{item.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{item.excerpt}</p>
                  
                  {/* Additional Info for Jobs/Scholarships */}
                  {(item.category === 'jobs' || item.category === 'scholarships' || item.category === 'grants') && (
                    <div className="space-y-2 mb-4">
                      {item.applicationDeadline && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Deadline:</span>
                          <span className="text-red-400">{new Date(item.applicationDeadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.salary && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Salary:</span>
                          <span className="text-green-400">{item.salary}</span>
                        </div>
                      )}
                      {item.amount && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Amount:</span>
                          <span className="text-green-400">{item.amount}</span>
                        </div>
                      )}
                      {item.stipend && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Stipend:</span>
                          <span className="text-green-400">{item.stipend}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">{new Date(item.date).toLocaleDateString()}</span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-slate-300">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">📧 Stay Updated</h2>
            <p className="text-slate-300 mb-6">
              Get the latest news, job opportunities, and scholarship alerts delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm text-white py-12 border-t border-slate-700/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ID</span>
                </div>
                <span className="text-xl font-bold">Campus ID</span>
              </div>
              <p className="text-slate-400">
                Your trusted source for educational news and opportunities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveCategory('jobs')} className="hover:text-white transition-colors">Job Opportunities</button></li>
                <li><button onClick={() => setActiveCategory('scholarships')} className="hover:text-white transition-colors">Scholarships</button></li>
                <li><button onClick={() => setActiveCategory('internships')} className="hover:text-white transition-colors">Internships</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Campus ID. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}