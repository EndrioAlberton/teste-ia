/**
 * Serviço de comunicação com o backend.
 */

import axios from 'axios';
import type { ClassificationResult, HealthStatus } from '../types';

// Usar sempre /api - o Vercel Dev faz o roteamento automaticamente
const API_URL = '/api';

export const classifyEmail = async (emailText: string): Promise<ClassificationResult> => {
  try {
    const response = await axios.post<ClassificationResult>(
      `${API_URL}/classify`,
      { email_text: emailText },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Erro ao classificar email';
      throw new Error(errorMessage);
    }
    if (error.request) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    throw new Error(error.message || 'Erro desconhecido');
  }
};

export const checkHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await axios.get<HealthStatus>(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      gemini_api: 'desconhecido',
      message: 'Não foi possível conectar ao backend',
    };
  }
};
