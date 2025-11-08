import api from './api';

export interface VoiceTranscriptResponse {
  transcript: string;
  confidence: number;
  duration: number;
  language: string;
}

const voiceService = {
  async transcribe(file: File): Promise<VoiceTranscriptResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<VoiceTranscriptResponse>(
      '/api/v1/voice/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async getHistory(skip: number = 0, limit: number = 10) {
    const response = await api.get('/api/v1/voice/history', {
      params: { skip, limit },
    });
    return response.data;
  },
};

export default voiceService;
