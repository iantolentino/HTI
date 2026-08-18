import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
import { dashboardData } from '@/lib/dashboard-data';

export async function GET() {
  const user=await currentUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  return NextResponse.json(await dashboardData(user.id));
}
