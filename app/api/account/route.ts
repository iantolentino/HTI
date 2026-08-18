import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
export async function DELETE(request:Request){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});try{const {confirmation}=z.object({confirmation:z.string()}).parse(await request.json());if(confirmation!=='DELETE')return NextResponse.json({error:'Type DELETE to confirm.'},{status:400});await prisma.user.delete({where:{id:user.id}});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Account deletion could not be completed.'},{status:400});}}
