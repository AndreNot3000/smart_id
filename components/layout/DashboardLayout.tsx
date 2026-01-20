"use client";

import { useState, ReactNode } from "react";
import { Sidebar, DashboardHeader } from "../ui";

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

interface UserData {
  name: string;
  avatar: string;
  role?: string;
  title?: string;
  department?: string;
  permissions?: string;
}

interface HeaderStats {
  label: string;
  value: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  userData: UserData;
  userType: 'student' | 'lecturer' | 'admin';
  headerStats?: HeaderStats[];
  headerAction?: {
    label: string;
    icon: string;
    onClick: () => void;
  };
}

export default function DashboardLayout({
  children,
  menuItems,
  activeSection,
  onSectionChange,
  userData,
  userType,
  headerStats = [],
  headerAction
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        userData={userData}
        userType={userType}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader
          title={activeSection.replace('-', ' ')}
          onMenuClick={() => setSidebarOpen(true)}
          onActionClick={headerAction?.onClick}
          actionLabel={headerAction?.label}
          actionIcon={headerAction?.icon}
          stats={headerStats}
          userData={userData}
          userType={userType}
        />

        {/* Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}