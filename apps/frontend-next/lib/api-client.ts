import { OpprsClient } from '@opprs/rest-api-client';

export const apiClient = new OpprsClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '/api/v1',
  useCookies: true,
});
