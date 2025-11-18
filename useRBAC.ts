import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageAppointments: boolean;
  canManagePatients: boolean;
  canManageDoctors: boolean;
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canDeleteData: boolean;
  canViewFinancials: boolean;
  canManageWaitingList: boolean;
}

const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canManageAppointments: true,
    canManagePatients: true,
    canManageDoctors: true,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canViewReports: true,
    canManageSettings: true,
    canManageUsers: true,
    canDeleteData: true,
    canViewFinancials: true,
    canManageWaitingList: true,
  },
  doctor: {
    canViewDashboard: true,
    canManageAppointments: false,
    canManagePatients: false,
    canManageDoctors: false,
    canViewMedicalRecords: true,
    canEditMedicalRecords: true,
    canViewReports: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteData: false,
    canViewFinancials: false,
    canManageWaitingList: false,
  },
  receptionist: {
    canViewDashboard: true,
    canManageAppointments: true,
    canManagePatients: true,
    canManageDoctors: false,
    canViewMedicalRecords: false,
    canEditMedicalRecords: false,
    canViewReports: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteData: false,
    canViewFinancials: false,
    canManageWaitingList: true,
  },
  patient: {
    canViewDashboard: false,
    canManageAppointments: false,
    canManagePatients: false,
    canManageDoctors: false,
    canViewMedicalRecords: false,
    canEditMedicalRecords: false,
    canViewReports: false,
    canManageSettings: false,
    canManageUsers: false,
    canDeleteData: false,
    canViewFinancials: false,
    canManageWaitingList: false,
  },
};

export const useRBAC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setPermissions(null);
          return;
        }

        // Fetch user role from database
        const { data: userData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const userRole = userData?.role as UserRole || 'patient';
        setRole(userRole);
        setPermissions(rolePermissionsMap[userRole]);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions?.[permission] ?? false;
  };

  const hasAnyPermission = (permissionList: (keyof RolePermissions)[]): boolean => {
    return permissionList.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissionList: (keyof RolePermissions)[]): boolean => {
    return permissionList.every(p => hasPermission(p));
  };

  return {
    role,
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useRBAC;
