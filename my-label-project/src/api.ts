// src/api.ts
import { Label } from './types';

export interface LableApiResponse {
    labels: Label[];
}

export interface ClassifyApiResponse {
  causal:boolean,
  confidence:number
}

export async function classify(sentence:string): Promise<ClassifyApiResponse> {
  const response = await fetch('http://cira-api.diptsrv003.bth.se/api/classify', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sentence
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch labels');
  }

  return response.json() as Promise<ClassifyApiResponse>;
}

export async function fetchLabels(sentence:string): Promise<LableApiResponse> {
  const response = await fetch('http://cira-api.diptsrv003.bth.se/api/label', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sentence
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch labels');
  }

  return response.json() as Promise<LableApiResponse>;
}
