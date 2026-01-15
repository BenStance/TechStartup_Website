// Define user type to match database structure
export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}