import { Button } from "../ui";

interface QRCodeDisplayProps {
  userData: {
    name: string;
    id: string;
    department?: string;
    title?: string;
    year?: string;
    qrCode?: string;
    barcode?: string;
  };
  userType: 'student' | 'lecturer' | 'admin';
}

export default function QRCodeDisplay({ userData, userType }: QRCodeDisplayProps) {
  const getIdLabel = () => {
    switch (userType) {
      case 'student':
        return 'Student ID';
      case 'lecturer':
        return 'Faculty ID';
      case 'admin':
        return 'Employee ID';
      default:
        return 'ID';
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'student':
        return 'My Student ID';
      case 'lecturer':
        return 'My Faculty ID';
      case 'admin':
        return 'My Employee ID';
      default:
        return 'My Digital ID';
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{getTitle()}</h2>
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm mx-auto mb-6">
        <img 
          src={userData.qrCode || userData.barcode} 
          alt={`${userType} QR Code`} 
          className="w-full h-auto" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
        <div>
          <p className="text-slate-400 text-sm">Name</p>
          <p className="text-white font-medium text-sm sm:text-base truncate">{userData.name}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">{getIdLabel()}</p>
          <p className="text-white font-mono text-sm sm:text-base">{userData.id}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Department</p>
          <p className="text-white text-sm sm:text-base truncate">{userData.department}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">
            {userType === 'student' ? 'Year' : 'Title'}
          </p>
          <p className="text-white text-sm sm:text-base">
            {userData.year || userData.title}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Button variant="primary">
          Download QR
        </Button>
        <Button variant="secondary">
          Share
        </Button>
      </div>
    </div>
  );
}