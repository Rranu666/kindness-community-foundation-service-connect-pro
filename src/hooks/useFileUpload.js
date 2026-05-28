/**
 * Reusable file upload hook
 * Eliminates duplicate upload logic across forms
 */

import { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { toast } from 'sonner';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);

  const uploadFile = async (file, options = {}) => {
    const {
      onSuccess = () => {},
      onError = () => {},
      successMessage = 'File uploaded successfully',
      errorMessage = 'Upload failed',
    } = options;

    if (!file) return null;

    setUploading(true);
    setUploadingFile(file.name);

    try {
      const { file_url } = await uploadFile({ file });
      toast.success(successMessage);
      onSuccess(file_url);
      return file_url;
    } catch (error) {
      const msg = error?.message || errorMessage;
      toast.error(msg);
      onError(error);
      return null;
    } finally {
      setUploading(false);
      setUploadingFile(null);
    }
  };

  const uploadMultiple = async (files, options = {}) => {
    const urls = [];
    for (const file of files) {
      const url = await uploadFile(file, options);
      if (url) urls.push(url);
    }
    return urls;
  };

  return {
    uploading,
    uploadingFile,
    uploadFile,
    uploadMultiple,
  };
}