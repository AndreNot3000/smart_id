"use client";

import { useState, useEffect } from 'react';
import { qrService } from '@/lib/qrService';

interface AttendanceRecord {
  id: string;
  scannedAt: string;
  scannedBy: {
    name: string;
    userType: string;
  };
  purpose?: string;
  location?: string;
}

interface AttendanceHistoryProps {
  studentId?: string; // If provided, fetch for specific student (lecturer/admin view)
  className?: string;
}

export default function AttendanceHistory({ studentId, className = '' }: AttendanceHistoryProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentInfo, setStudentInfo] = useState<{
    studentId: string;
    name: string;
    department: string;
    year: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 20;

  // Fetch attendance history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');

        let response;
        if (studentId) {
          // Lecturer/Admin view - fetch specific student's history
          response = await qrService.getStudentAttendanceHistory(studentId, currentPage, limit);
          setStudentInfo(response.student);
        } else {
          // Student view - fetch own history
          response = await qrService.getMyAttendanceHistory(currentPage, limit);
        }

        setAttendance(response.attendance);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.totalRecords);
        setCurrentPage(response.pagination.currentPage);

      } catch (err: any) {
        setError(err.message || 'Failed to load attendance history');
        console.error('Attendance history error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentId, currentPage]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading attendance history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading History</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {studentId ? 'Student Attendance History' : 'My Attendance History'}
        </h2>
        {studentInfo && (
          <div className="mt-3 p-4 bg-slate-700/30 rounded-lg">
            <p className="text-white font-semibold">{studentInfo.name}</p>
            <p className="text-slate-400 text-sm">{studentInfo.studentId} • {studentInfo.department} • {studentInfo.year}</p>
          </div>
        )}
        <p className="text-slate-400 mt-2">
          Total Records: <span className="text-white font-semibold">{totalRecords}</span>
        </p>
      </div>

      {/* Attendance List */}
      {attendance.length > 0 ? (
        <div className="space-y-3 mb-6">
          {attendance.map((record) => (
            <div 
              key={record.id}
              className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Attendance Marked</p>
                      <p className="text-slate-400 text-sm">{formatDate(record.scannedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="ml-10 space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">Scanned by:</span>
                      <span className="text-white">{record.scannedBy.name}</span>
                      <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">
                        {record.scannedBy.userType}
                      </span>
                    </div>
                    
                    {record.purpose && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-400">Purpose:</span>
                        <span className="text-white">{record.purpose}</span>
                      </div>
                    )}
                    
                    {record.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white">{record.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-slate-400">No attendance records found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Next</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
