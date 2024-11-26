import { useState, useCallback } from 'react';
import { useFileReader } from './useFileReader';

export interface FileUploadOptions {
  onSuccess?: (content: any) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { readFile } = useFileReader<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) {
      return;
    }

    const file = e?.target?.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsProcessing(true);
      const result = await readFile(file);
      options.onSuccess?.({ filename: file.name, content: result });
    } catch (err) {
      options.onError?.(err as Error);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  }, [isProcessing, readFile, options.onSuccess, options.onError]);

  return {
    handleFileUpload
  };
}