import React from 'react';
import { FileText, FileImage, FileQuestion } from 'lucide-react';

export const WordIcon = () => (
  <FileText className="h-6 w-6 text-blue-500" />
);
export const PdfIcon = () => (
  <FileText className="h-6 w-6 text-red-500" />
);
export const TxtIcon = () => (
  <FileText className="h-6 w-6 text-gray-500" />
);
export const ImgIcon = () => (
  <FileImage className="h-6 w-6 text-purple-500" />
);
export const DefaultIcon = () => (
  <FileQuestion className="h-6 w-6 text-gray-400" />
);

export const getFileIcon = (fileName: string) => {
  const lowerCaseName = fileName.toLowerCase();
  if (lowerCaseName.endsWith('.doc') || lowerCaseName.endsWith('.docx')) {
    return <WordIcon />;
  }
  if (lowerCaseName.endsWith('.pdf')) {
    return <PdfIcon />;
  }
  if (lowerCaseName.endsWith('.txt')) {
    return <TxtIcon />;
  }
  if (
    lowerCaseName.endsWith('.png') ||
    lowerCaseName.endsWith('.jpg') ||
    lowerCaseName.endsWith('.jpeg')
  ) {
    return <ImgIcon />;
  }
  return <DefaultIcon />;
};
