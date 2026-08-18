import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { isoDay, streakFromDates } from '@/lib/game';

export async function GET(){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});

  const logs=await prisma.dailyLog.findMany({
    where:{userId:user.id},
    select:{date:true,expEarned:true},
  });
  const currentStreak=streakFromDates(
    [...new Set(logs.map(log=>isoDay(log.date,user.timezone)))],
    isoDay(new Date(),user.timezone),
    user.createdAt.getTime()>Date.now()-7*86400000,
  );

  return NextResponse.json({
    lifetimeExp:user.lifetimeExp,
    currentRunExp:user.totalExp,
    totalCompletions:logs.length,
    currentStreak,
    longestStreak:user.longestStreak,
    prestigeCount:user.prestigeCount,
    memberSince:user.createdAt,
  });
}
