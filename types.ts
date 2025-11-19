
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  AUDITOR = 'AUDITOR'
}

export enum EventType {
  ENTRY = 'ENTRY',
  HEARTBEAT = 'HEARTBEAT',
  EXIT = 'EXIT'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  tenantId: string;
  tenantName: string;
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  ssids: string[];
  bssids: string[];
  rssiThreshold: number;
  geofence: {
    lat: number;
    lng: number;
    radius: number; // in meters
  };
  floorPlanAspectRatio?: number; // width / height
  floorPlanUrl?: string; // Data URL or remote URL
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedStoreIds: string[];
  avatarUrl: string;
}

export interface PresenceEvent {
  id: string;
  employeeId: string;
  storeId: string;
  eventType: EventType;
  timestamp: string;
  ssid: string;
  bssid: string;
  rssi: number;
  location?: {
    x: number; // 0-100 percentage relative to floor plan width
    y: number; // 0-100 percentage relative to floor plan height
  };
}

export interface Session {
  id: string;
  employeeId: string;
  storeId: string;
  entryTime: string;
  exitTime?: string;
  dwellMinutes: number;
  lastKnownLocation?: {
    x: number;
    y: number;
  };
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}