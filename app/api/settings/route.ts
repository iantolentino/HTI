import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
const input=z.object({displayName:z.string().min(2).max(40).optional(),timezone:z.string().min(1).optional(),darkMode:z.boolean().optional(),leaderboardOptIn:z.boolean().optional(),leaderboardNickname:z.string().min(2).max(30).optional(),publicProfile:z.boolean().optional()});
export async function PATCH(request:Request){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});try{const data=input.parse(await request.json());const updated=await prisma.user.update({where:{id:user.id},data});return NextResponse.json({user:updated});}catch{return NextResponse.json({error:'Settings could not be saved.'},{status:400});}}
