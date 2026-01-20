"use client";

import { useState } from "react";
import { Button } from "../ui";

interface ScannedStudent {
  id: number;
  name: string;
  studentId: string;
  time: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
}

interface QRScannerProps {
  courses: Course[];
  onScanComplete?: (students: ScannedStudent[]) => void;
}

export default function QRScanner({ courses, onScanComplete }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionType, setSessionType] = useState('lecture');

  const handleStartScanning = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    setIsScanning(true);
  };

  const handleSimulateScan = () => {
    const newStudent: ScannedStudent = {
      id: Date.now(),
      name: `Student ${scannedStudents.length + 1}`,
      studentId: `STU${Math.random().toString().substr(2, 6)}`,
      time: new Date().toLocaleTimeString()
    };
    setScannedStudents([...scannedStudents, newStudent]);
  };

  const handleSaveAttendance = () => {
    onScanComplete?.(scannedStudents);
    setScannedStudents([]);
    setIsScanning(false);
  };

  if (!isScanning) {
    return (
      <div className="text-center">
        <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5H8.25v1.5H13.5V13.5zM13.5 16.5H8.25V18H13.5v-1.5zM16.5 13.5h1.5V18h-1.5v-4.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Scan Student QR Codes</h3>
        <p className="text-slate-300 mb-6">Use your camera to scan student QR codes for attendance tracking</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Select Course</h4>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.code}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Session Type</h4>
            <select 
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
            >
              <option value="lecture">Lecture</option>
              <option value="lab">Lab Session</option>
              <option value="tutorial">Tutorial</option>
              <option value="exam">Exam</option>
            </select>
          </div>
        </div>
        
        <Button onClick={handleStartScanning} variant="primary">
          Start Scanning
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-32 w-32 border-4 border-blue-500 border-dashed rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
            </div>
            <p className="text-white font-medium">Camera Active - Point at QR Code</p>
            <p className="text-slate-400 text-sm">Position student QR codes within the frame</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button onClick={handleSimulateScan} variant="success">
            Simulate Scan
          </Button>
          <Button onClick={() => setIsScanning(false)} variant="danger">
            Stop Scanning
          </Button>
        </div>
      </div>
      
      {scannedStudents.length > 0 && (
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Scanned Students ({scannedStudents.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {scannedStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center bg-slate-600/50 rounded p-2">
                <div>
                  <span className="text-white font-medium">{student.name}</span>
                  <span className="text-slate-400 text-sm ml-2">({student.studentId})</span>
                </div>
                <span className="text-green-400 text-sm">{student.time}</span>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleSaveAttendance}
            variant="success"
            className="mt-4 w-full"
          >
            Save Attendance ({scannedStudents.length} students)
          </Button>
        </div>
      )}
    </div>
  );
}