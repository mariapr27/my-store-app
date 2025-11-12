import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const generateFilePath = (folder: string, extension: string) => {
  const random = Math.random().toString(36).slice(2, 12);
  const timestamp = Date.now();
  const sanitizedExtension = extension.startsWith('.') ? extension : `.${extension}`;
  return `${folder}/${timestamp}_${random}${sanitizedExtension}`;
};

const extractExtension = (mimeType?: string, fileName?: string) => {
  if (mimeType && mimeType.includes('/')) {
    const subtype = mimeType.split('/')[1];
    if (subtype) {
      if (subtype.includes('+')) {
        return `.${subtype.split('+')[0]}`;
      }
      return `.${subtype}`;
    }
  }

  if (fileName && fileName.includes('.')) {
    return fileName.substring(fileName.lastIndexOf('.'));
  }

  return '.jpg';
};

export const uploadBlobToFirebaseStorage = async (
  blob: Blob,
  folder: string = 'products',
  fileName?: string
): Promise<string> => {
  const extension = extractExtension(blob.type, fileName);
  const storagePath = generateFilePath(folder, extension);
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob, {
    contentType: blob.type || 'application/octet-stream',
  });

  return getDownloadURL(storageRef);
};

export const uploadUriToFirebaseStorage = async (
  uri: string,
  folder: string = 'products'
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const fileName = uri.split('/').pop();
  return uploadBlobToFirebaseStorage(blob, folder, fileName);
};

export const uploadFileToFirebaseStorage = async (
  file: File | Blob,
  folder: string = 'products'
): Promise<string> => {
  const extension = extractExtension(
    (file as File).type,
    'name' in file ? (file as File).name : undefined
  );
  const storagePath = generateFilePath(folder, extension);
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: (file as File).type || 'application/octet-stream',
  });

  return getDownloadURL(storageRef);
};

