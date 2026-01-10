import crypto from 'crypto'

export function generateSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function generateEventHash(event: {
  deviceId: string
  timestamp: Date | string
  metrics: any
  alertType?: string | null
  rawPayload?: any
}): string {
  const hashInput = JSON.stringify({
    deviceId: event.deviceId,
    timestamp: event.timestamp,
    metrics: event.metrics,
    alertType: event.alertType,
    rawPayload: event.rawPayload,
  })
  return generateSHA256(hashInput)
}
