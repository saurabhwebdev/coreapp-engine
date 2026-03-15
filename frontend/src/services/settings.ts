import api from './api';

export interface EmailSettingsDto {
  smtpHost: string;
  smtpPort: number;
  smtpUserName: string;
  smtpPassword: string;
  smtpDomain: string;
  smtpEnableSsl: boolean;
  smtpUseDefaultCredentials: boolean;
  defaultFromAddress: string;
  defaultFromDisplayName: string;
}

export interface NameValue {
  name: string;
  value: string;
}

export const getEmailSettings = () =>
  api.get<EmailSettingsDto>('/api/setting-management/emailing');

export const updateEmailSettings = (data: EmailSettingsDto) =>
  api.post('/api/setting-management/emailing', data);

export const sendTestEmail = (data: { senderEmailAddress: string; targetEmailAddress: string; subject: string; body: string }) =>
  api.post('/api/setting-management/emailing/send-test-email', data);

export const getTimezoneSettings = () =>
  api.get<string>('/api/setting-management/timezone');

export const updateTimezoneSettings = (timezone: string) =>
  api.post('/api/setting-management/timezone', null, { params: { timezone } });

export const getTimezones = () =>
  api.get<NameValue[]>('/api/setting-management/timezone/timezones');
