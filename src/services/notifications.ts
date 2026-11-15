import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/plugin-notification';

export const notifyDownloadComplete = async (filename: string): Promise<void> => {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      granted = (await requestPermission()) === 'granted';
    }
    if (!granted) return;

    sendNotification({
      title: 'DropSave',
      body: `Đã tải xong: ${filename}`
    });
  } catch {
    // Notification failure must never fail the download flow.
  }
};
