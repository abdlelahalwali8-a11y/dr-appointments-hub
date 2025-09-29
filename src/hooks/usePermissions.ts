import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { profile, isAdmin, isDoctor, isReceptionist } = useAuth();

  const permissions = {
    // Dashboard
    canViewDashboard: !!profile,

    // Appointments
    canViewAppointments: !!profile,
    canCreateAppointments: isAdmin || isReceptionist,
    canEditAppointments: isAdmin || isDoctor || isReceptionist,
    canDeleteAppointments: isAdmin || isReceptionist,

    // Patients
    canViewPatients: isAdmin || isDoctor || isReceptionist,
    canCreatePatients: isAdmin || isReceptionist,
    canEditPatients: isAdmin || isReceptionist,
    canDeletePatients: isAdmin,

    // Doctors
    canViewDoctors: !!profile,
    canManageDoctors: isAdmin,
    canEditDoctors: isAdmin,
    canDeleteDoctors: isAdmin,

    // Medical Records
    canViewMedicalRecords: isAdmin || isDoctor,
    canCreateMedicalRecords: isAdmin || isDoctor,
    canEditMedicalRecords: isAdmin || isDoctor,
    canDeleteMedicalRecords: isAdmin,

    // Reports
    canViewReports: isAdmin || isDoctor || isReceptionist,
    canExportReports: isAdmin || isDoctor,

    // Users
    canManageUsers: isAdmin,
    canViewUsers: isAdmin,

    // Permissions
    canManagePermissions: isAdmin,

    // Settings
    canManageSettings: isAdmin,
    canViewSettings: isAdmin || isDoctor || isReceptionist,

    // Notifications
    canViewNotifications: !!profile,
    canSendNotifications: isAdmin || isDoctor || isReceptionist,

    // Waiting List
    canManageWaitingList: isAdmin || isReceptionist,
  };

  return permissions;
};
