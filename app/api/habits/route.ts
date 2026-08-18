import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';

const addInput=z.object({taskId:z.string().min(1),iconOverride:z.string().max(12).optional(),personalTargetOverride:z.number().int().positive().optional(),unitOverride:z.enum(['REPS','MINUTES','KM','PAGES','CUSTOM']).optional()});
export async function GET(){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const [tasks,owned,stacks]=await Promise.all([prisma.task.findMany({orderBy:[{category:'asc'},{name:'asc'}]}),prisma.userTask.findMany({where:{userId:user.id},select:{taskId:true,isPaused:true}}),prisma.habitStack.findMany({include:{tasks:{include:{task:true}}}})]);return NextResponse.json({tasks,owned,stacks});}
export async function POST(request:Request){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});try{const data=addInput.parse(await request.json());await prisma.userTask.upsert({where:{userId_taskId:{userId:user.id,taskId:data.taskId}},update:{isPaused:false,iconOverride:data.iconOverride,personalTargetOverride:data.personalTargetOverride,unitOverride:data.unitOverride},create:{userId:user.id,...data}});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Please choose a valid habit and target.'},{status:400});}}
