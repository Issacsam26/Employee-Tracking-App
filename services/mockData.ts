
import { Employee, EventType, PresenceEvent, Role, Session, Store, UserProfile, Shift } from "../types";

export const MOCK_ADMIN: UserProfile = {
  id: 'admin-001',
  name: 'Issac Samuel Paul',
  email: 'admin@techcorp.com',
  role: 'Super Administrator',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  tenantId: 'tenant-alpha',
  tenantName: 'Alpha Retail Corp'
};

export const MOCK_EMPLOYEE_USER: UserProfile = {
    id: 'emp-101',
    name: 'Gouthami',
    email: 'gouthami@example.com',
    role: 'Store Manager',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    tenantId: 'tenant-alpha',
    tenantName: 'Alpha Retail Corp'
}

export const MOCK_STORES: Store[] = [
  {
    id: 'store-001',
    tenantId: 'tenant-alpha',
    name: 'Downtown Flagship',
    // Added Intelense_5G first so auto-connect picks it up by default for testing
    ssids: ['Intelense_5G', 'ShopNet_Staff', 'ShopNet_Guest'],
    bssids: ['d8:b0:20:f4:14:3d', 'aa:bb:cc:dd:ee:01', 'aa:bb:cc:dd:ee:02'],
    rssiThreshold: -75,
    geofence: { lat: 40.7128, lng: -74.0060, radius: 50 },
    floorPlanAspectRatio: 1.5,
    floorPlanUrl: 'https://images.unsplash.com/photo-1555679427-1f6dfcce943b?q=80&w=1000&auto=format&fit=crop' // Placeholder floor image
  },
  {
    id: 'store-002',
    tenantId: 'tenant-alpha',
    name: 'Mall Boutique',
    ssids: ['Boutique_Secure'],
    bssids: ['11:22:33:44:55:66'],
    rssiThreshold: -80,
    geofence: { lat: 34.0522, lng: -118.2437, radius: 30 },
    floorPlanAspectRatio: 1.0
  },
  {
    id: 'store-003',
    tenantId: 'tenant-alpha',
    name: 'Airport Kiosk',
    ssids: ['Airport_Public', 'Kiosk_Mgmt'],
    bssids: ['99:88:77:66:55:44'],
    rssiThreshold: -65,
    geofence: { lat: 51.5074, lng: -0.1278, radius: 15 },
    floorPlanAspectRatio: 2.0
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    name: 'Gouthami',
    email: 'gouthami@example.com',
    role: 'Store Manager',
    assignedStoreIds: ['store-001'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'emp-102',
    name: 'Spandana',
    email: 'quack@example.com',
    role: 'Auditor',
    assignedStoreIds: ['store-001', 'store-002', 'store-003'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  },
  {
    id: 'emp-103',
    name: 'Syed',
    email: 'syed@example.com',
    role: 'Assistant Manager',
    assignedStoreIds: ['store-002'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
  }
];

// Generate some recent events
export const generateMockEvents = (): PresenceEvent[] => {
  const events: PresenceEvent[] = [];
  const now = Date.now();
  
  // Alice enters store-001 2 hours ago
  events.push({
    id: 'evt-1',
    employeeId: 'emp-101',
    storeId: 'store-001',
    eventType: EventType.ENTRY,
    timestamp: new Date(now - 7200000).toISOString(),
    ssid: 'ShopNet_Staff',
    bssid: 'aa:bb:cc:dd:ee:01',
    rssi: -55,
    location: { x: 20, y: 30 }
  });

  // Heartbeats for Alice
  for(let i=0; i<5; i++) {
     events.push({
      id: `evt-1-hb-${i}`,
      employeeId: 'emp-101',
      storeId: 'store-001',
      eventType: EventType.HEARTBEAT,
      timestamp: new Date(now - 7200000 + (i * 900000)).toISOString(),
      ssid: 'ShopNet_Staff',
      bssid: 'aa:bb:cc:dd:ee:01',
      rssi: -58 + Math.floor(Math.random() * 10),
      location: { x: 20 + (i*5), y: 30 + (i*2) } // Simulate movement
    });
  }

  // Bob enters store-002 30 mins ago
  events.push({
    id: 'evt-2',
    employeeId: 'emp-102',
    storeId: 'store-002',
    eventType: EventType.ENTRY,
    timestamp: new Date(now - 1800000).toISOString(),
    ssid: 'Boutique_Secure',
    bssid: '11:22:33:44:55:66',
    rssi: -62,
    location: { x: 80, y: 80 }
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    employeeId: 'emp-101',
    storeId: 'store-001',
    entryTime: new Date(Date.now() - 7200000).toISOString(),
    dwellMinutes: 120,
    lastKnownLocation: { x: 45, y: 40 }
  },
  {
    id: 'sess-2',
    employeeId: 'emp-102',
    storeId: 'store-002',
    entryTime: new Date(Date.now() - 1800000).toISOString(),
    dwellMinutes: 30,
    lastKnownLocation: { x: 80, y: 80 }
  }
];

export const MOCK_SHIFTS: Shift[] = [
  {
    id: 'shift-1',
    employeeId: 'emp-101',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    status: 'SCHEDULED'
  },
  {
    id: 'shift-2',
    employeeId: 'emp-101',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '10:00',
    endTime: '18:00',
    status: 'SCHEDULED'
  }
];
