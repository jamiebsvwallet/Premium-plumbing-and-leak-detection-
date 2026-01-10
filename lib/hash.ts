import crypto from 'crypto';

export function hashEvent(eventData: any): string {
  const eventString = JSON.stringify(eventData, Object.keys(eventData).sort());
  return crypto.createHash('sha256').update(eventString).digest('hex');
}

export function hashReport(reportData: any): string {
  const reportString = JSON.stringify(reportData, Object.keys(reportData).sort());
  return crypto.createHash('sha256').update(reportString).digest('hex');
}
