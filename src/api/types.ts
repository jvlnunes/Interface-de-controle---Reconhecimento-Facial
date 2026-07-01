export interface Employee {
  id: string;
  fullName: string;
  doors: string[];
  faceCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeInput {
  fullName: string;
  doors: string[];
}

export interface FaceRecord {
  id: string;
  employeeId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  qualityScore?: number;
  status: 'processing' | 'enrolled' | 'failed';
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}