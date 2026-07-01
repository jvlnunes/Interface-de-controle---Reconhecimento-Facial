
import { apiGet, apiSend } from './client';
import type { Employee, EmployeeInput } from './types';

export function listEmployees(params?: { search?: string; department?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiGet<Employee[]>(`/funcionarios${qs ? `?${qs}` : ''}`);
}

export function getEmployee(id: string) {
  return apiGet<Employee>(`/funcionarios/${id}`);
}

export function createEmployee(data: EmployeeInput) {
  return apiSend<Employee>('/funcionarios', 'POST', data);
}

export function updateEmployee(id: string, data: EmployeeInput) {
  return apiSend<Employee>(`/funcionarios/${id}`, 'PUT', data);
}

export function deleteEmployee(id: string) {
  return apiSend<void>(`/funcionarios/${id}`, 'DELETE');
}