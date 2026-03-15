import * as signalR from '@microsoft/signalr';
import { User } from 'oidc-client-ts';
import { env } from '../utils/env';

let connection: signalR.HubConnection | null = null;

export function getNotificationConnection(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${env.apiBaseUrl}/signalr/notifications`, {
      accessTokenFactory: () => {
        const storageKey = `oidc.user:${env.authAuthority}:${env.authClientId}`;
        const userData = localStorage.getItem(storageKey);
        if (userData) {
          const user = User.fromStorageString(userData);
          return user?.access_token || '';
        }
        return '';
      },
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}

export async function startConnection() {
  const conn = getNotificationConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }
}

export function onNotificationReceived(callback: (notification: unknown) => void) {
  const conn = getNotificationConnection();
  conn.on('ReceiveNotification', callback);
  return () => conn.off('ReceiveNotification', callback);
}
