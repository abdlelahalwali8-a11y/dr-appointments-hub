import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  const { profile, isAdmin, isDoctor, isReceptionist } = useAuth();
  const [dbPermissions, setDbPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions (name)
          `)
          .eq('role', profile.role);

        if (error) throw error;

        const permissionNames = new Set(
          data?.map((rp: any) => rp.permissions?.name).filter(Boolean) || []
        );
        
        setDbPermissions(permissionNames);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [profile?.role]);

  // Helper function to check permission
  const hasPermission = (permissionName: string) => {
    if (isAdmin) return true; // Admins have all permissions
    return dbPermissions.has(permissionName);
  };

  const permissions = {
    // Dashboard
    canViewDashboard: !!profile && hasPermission('view_dashboard'),

    // Appointments
    canViewAppointments: !!profile && hasPermission('view_appointments'),
    canCreateAppointments: hasPermission('create_appointments'),
    canEditAppointments: hasPermission('edit_appointments'),
    canDeleteAppointments: hasPermission('delete_appointments'),

    // Patients
    canViewPatients: hasPermission('view_patients'),
    canCreatePatients: hasPermission('create_patients'),
    canEditPatients: hasPermission('edit_patients'),
    canDeletePatients: hasPermission('delete_patients'),

    // Doctors
    canViewDoctors: !!profile && hasPermission('view_doctors'),
    canManageDoctors: hasPermission('manage_doctors'),
    canEditDoctors: hasPermission('manage_doctors'),
    canDeleteDoctors: hasPermission('manage_doctors'),

    // Medical Records
    canViewMedicalRecords: hasPermission('view_medical_records'),
    canCreateMedicalRecords: hasPermission('create_medical_records'),
    canEditMedicalRecords: hasPermission('edit_medical_records'),
    canDeleteMedicalRecords: hasPermission('delete_medical_records'),

    // Reports
    canViewReports: hasPermission('view_reports'),
    canExportReports: hasPermission('export_reports'),

    // Users
    canManageUsers: hasPermission('manage_users'),
    canViewUsers: hasPermission('manage_users'),

    // Permissions
    canManagePermissions: hasPermission('manage_permissions'),

    // Settings
    canManageSettings: hasPermission('manage_settings'),
    canViewSettings: !!profile,

    // Notifications
    canViewNotifications: !!profile && hasPermission('view_notifications'),
    canSendNotifications: hasPermission('send_notifications'),

    // Waiting List
    canManageWaitingList: hasPermission('manage_waiting_list'),

    // Additional permissions
    canUpdatePatients: hasPermission('edit_patients'),
    canAddRecords: hasPermission('create_medical_records'),
    canEditRecords: hasPermission('edit_medical_records'),
  };

  return { ...permissions, loading };
};
