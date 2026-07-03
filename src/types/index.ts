export interface Holiday {
  holiday_id: number;
  holiday_name: string;
  holiday_date: string;
  create_by: string;
  create_date: string;
  update_by: string;
  update_date: string;
  active_status: number;
}

export interface HolidayInput {
  holiday_name: string;
  holiday_date: string;
  create_by?: string;
  active_status?: number;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  upcoming: number;
  activityLog: ActivityLogEntry[];
}

export interface ActivityLogEntry {
  holiday_name: string;
  action: "Created" | "Updated" | "Deactivated";
  action_date: string;
  by_user: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}
