import { useState, useCallback } from 'react';

export function useFileReader<T = unknown>() {

  const readFile = useCallback((file: File): Promise<T> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        const error = new Error('Failed to read file');
        reject(error);
      };

      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string) as T;
          resolve(json);
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Failed to parse JSON');
          reject(error);
        }
      };

      reader.readAsText(file);
    });
  }, []);

  return { readFile };
}