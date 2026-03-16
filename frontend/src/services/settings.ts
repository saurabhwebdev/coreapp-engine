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

export const getTimezones = (): Promise<{ data: NameValue[] }> => {
  // Use browser's Intl API — ABP 8.x timezone endpoint crashes on Linux
  const timezones: NameValue[] = Intl.supportedValuesOf('timeZone').map(tz => {
    try {
      const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'longOffset' });
      const offset = formatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || '';
      return { name: `(${offset}) ${tz.replace(/_/g, ' ')}`, value: tz };
    } catch {
      return { name: tz, value: tz };
    }
  });
  return Promise.resolve({ data: timezones });
};
