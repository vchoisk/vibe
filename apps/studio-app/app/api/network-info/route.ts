import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const networkInterfaces = os.networkInterfaces();
    const addresses: string[] = [];
    
    // Get all IPv4 addresses that are not internal
    for (const name of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[name];
      if (interfaces) {
        for (const iface of interfaces) {
          // Skip internal (localhost) and non-IPv4 addresses
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        }
      }
    }
    
    // Prefer common local network ranges
    const preferredAddress = addresses.find(addr => 
      addr.startsWith('192.168.') || 
      addr.startsWith('10.') || 
      addr.startsWith('172.')
    ) || addresses[0];
    
    return NextResponse.json({ 
      networkIP: preferredAddress || 'localhost',
      allAddresses: addresses 
    });
  } catch (error) {
    console.error('Failed to get network info:', error);
    return NextResponse.json({ 
      networkIP: 'localhost',
      allAddresses: [] 
    });
  }
}