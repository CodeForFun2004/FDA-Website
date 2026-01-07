// src/features/logs/types.ts
export interface SystemLog {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    source: 'System' | 'User' | 'Sensor' | 'Alert';
    action: string; // e.g., "Login", "Threshold Exceeded", "Device Offline"
    details: string;
    userOrDeviceId?: string;
}
