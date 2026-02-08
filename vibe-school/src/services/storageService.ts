import { supabase } from '@/lib/supabase';

// File type validation
const ALLOWED_FILE_TYPES = [
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate file before upload
const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  return { isValid: true };
};

// Upload file to Supabase Storage
export const uploadFile = async (
  bucketName: string,
  filePath: string,
  file: File
): Promise<UploadResult> => {
  try {
    console.log('uploadFile: Uploading file to bucket:', bucketName, 'path:', filePath);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('uploadFile: Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const result: UploadResult = {
      url: urlData.publicUrl,
      path: filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };

    console.log('uploadFile: Successfully uploaded file:', result.url);
    return result;
  } catch (error) {
    console.error('uploadFile: Unexpected error:', error);
    throw error;
  }
};

// Download file from Supabase Storage
export const downloadFile = async (
  bucketName: string,
  filePath: string
): Promise<Blob> => {
  try {
    console.log('downloadFile: Downloading file from bucket:', bucketName, 'path:', filePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('downloadFile: Error downloading file:', error);
      throw error;
    }

    console.log('downloadFile: Successfully downloaded file');
    return data;
  } catch (error) {
    console.error('downloadFile: Unexpected error:', error);
    throw error;
  }
};

// Get file URL (public or signed)
export const getFileUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn?: number
): Promise<string> => {
  try {
    console.log('getFileUrl: Getting URL for file:', filePath, 'expiresIn:', expiresIn);

    if (expiresIn) {
      // Get signed URL for private files
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('getFileUrl: Error creating signed URL:', error);
        throw error;
      }

      console.log('getFileUrl: Returning signed URL');
      return data.signedUrl;
    } else {
      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('getFileUrl: Returning public URL');
      return data.publicUrl;
    }
  } catch (error) {
    console.error('getFileUrl: Unexpected error:', error);
    throw error;
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (
  bucketName: string,
  filePath: string
): Promise<void> => {
  try {
    console.log('deleteFile: Deleting file from bucket:', bucketName, 'path:', filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('deleteFile: Error deleting file:', error);
      throw error;
    }

    console.log('deleteFile: Successfully deleted file');
  } catch (error) {
    console.error('deleteFile: Unexpected error:', error);
    throw error;
  }
};

// List files in a directory
export const listFiles = async (
  bucketName: string,
  prefix?: string
): Promise<any[]> => {
  try {
    console.log('listFiles: Listing files in bucket:', bucketName, 'prefix:', prefix);

    let query = supabase.storage
      .from(bucketName)
      .list(prefix);

    const { data, error } = await query;

    if (error) {
      console.error('listFiles: Error listing files:', error);
      throw error;
    }

    console.log('listFiles: Found', data?.length || 0, 'files');
    return data || [];
  } catch (error) {
    console.error('listFiles: Unexpected error:', error);
    throw error;
  }
};

// Move file within storage
export const moveFile = async (
  bucketName: string,
  fromPath: string,
  toPath: string
): Promise<void> => {
  try {
    console.log('moveFile: Moving file from', fromPath, 'to', toPath);

    // Copy file to new location
    const { data: copyData, error: copyError } = await supabase.storage
      .from(bucketName)
      .copy(fromPath, toPath);

    if (copyError) {
      console.error('moveFile: Error copying file:', copyError);
      throw copyError;
    }

    // Delete original file
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fromPath]);

    if (deleteError) {
      console.error('moveFile: Error deleting original file:', deleteError);
      // Don't throw here - the copy succeeded, just log the deletion error
      console.warn('moveFile: Original file deletion failed, but copy succeeded');
    }

    console.log('moveFile: Successfully moved file');
  } catch (error) {
    console.error('moveFile: Unexpected error:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (
  bucketName: string,
  filePath: string
): Promise<any> => {
  try {
    console.log('getFileMetadata: Getting metadata for file:', filePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(undefined, {
        search: filePath.split('/').pop() // Get filename from path
      });

    if (error) {
      console.error('getFileMetadata: Error getting metadata:', error);
      throw error;
    }

    const fileMetadata = data?.find((file: any) => 
      file.name === filePath.split('/').pop()
    );

    console.log('getFileMetadata: Returning metadata');
    return fileMetadata;
  } catch (error) {
    console.error('getFileMetadata: Unexpected error:', error);
    throw error;
  }
};

// Create presigned URL for upload (useful for direct client uploads)
export const createPresignedUploadUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    console.log('createPresignedUploadUrl: Creating presigned URL for:', filePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn, {
        transform: {
          resize: { width: 800, height: 600, fit: 'cover' } // Optional transformation
        }
      });

    if (error) {
      console.error('createPresignedUploadUrl: Error creating signed URL:', error);
      throw error;
    }

    console.log('createPresignedUploadUrl: Returning signed URL');
    return data.signedUrl;
  } catch (error) {
    console.error('createPresignedUploadUrl: Unexpected error:', error);
    throw error;
  }
};

// Batch upload files
export const uploadFiles = async (
  bucketName: string,
  files: { path: string; file: File }[]
): Promise<UploadResult[]> => {
  try {
    console.log('uploadFiles: Uploading', files.length, 'files to bucket:', bucketName);

    const results: UploadResult[] = [];

    for (const { path, file } of files) {
      try {
        const result = await uploadFile(bucketName, path, file);
        results.push(result);
      } catch (error) {
        console.error('uploadFiles: Error uploading file', path, ':', error);
        // Continue with other files even if one fails
      }
    }

    console.log('uploadFiles: Successfully uploaded', results.length, 'files');
    return results;
  } catch (error) {
    console.error('uploadFiles: Unexpected error:', error);
    throw error;
  }
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on MIME type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('text/')) return '📄';
  if (mimeType.includes('javascript') || mimeType.includes('json')) return '📝';
  if (mimeType.includes('zip')) return '📦';
  return '📁';
};