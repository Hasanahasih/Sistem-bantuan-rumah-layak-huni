export type UserRole = 'admin' | 'surveyor' | 'applicant';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface HousingConditions {
  foundation: 'good' | 'damaged' | 'none';
  walls: 'permanent' | 'semi-permanent' | 'wood' | 'bamboo';
  roof: 'tile' | 'zinc' | 'asbestos' | 'thatch';
  floor: 'ceramic' | 'cement' | 'wood' | 'soil';
}

export type ApplicationStatus = 'pending' | 'verified' | 'approved' | 'rejected';

export interface RTLHApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  nik: string;
  address: string;
  phone: string;
  housingConditions: HousingConditions;
  income: number;
  dependents: number;
  status: ApplicationStatus;
  score: number;
  aiAnalysis: string;
  surveyorId?: string;
  surveyorName?: string;
  createdat: string;
  updatedAt: string;
}
