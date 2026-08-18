import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
export async function POST(){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});await prisma.user.update({where:{id:user.id},data:{onboardingCompletedAt:new Date()}});return NextResponse.json({ok:true});}
