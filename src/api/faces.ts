// src/api/faces.ts
import { apiGet, apiSend } from './client';
import type { FaceRecord } from './types';

export function listFaces(employeeId: string) {
  return apiGet<FaceRecord[]>(`/funcionarios/${employeeId}/faces`);
}

export async function uploadFace(employeeId: string, imageBlob: Blob, filename = 'face.jpg') {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); 
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });

  // Envia como um JSON simples
  return apiSend<FaceRecord>(`/funcionarios/${employeeId}/faces`, 'POST', { foto_base64: base64 });
}

export function deleteFace(employeeId: string, faceId: string) {
  return apiSend<void>(`/funcionarios/${employeeId}/faces/${faceId}`, 'DELETE');
}