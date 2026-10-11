import { apiFetch } from './api';

/** Maps legacy public upload URLs to the API-served upload path. */
export const getMediaUrl = (url?: string): string | undefined =>
  url?.startsWith('/uploads/') ? `/api${url}` : url;

/**
 * Uploads a file to the server and returns the URL.
 * @param file The file to upload
 */
export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error during file upload:', error);
    return null;
  }
};

/**
 * Converts a base64 string to a File object.
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
