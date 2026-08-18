import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';

export async function GET(){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const badges=await prisma.userBadge.findMany({
    where:{userId:user.id},
    include:{badge:true},
    orderBy:{earnedAt:'asc'},
  });
  return NextResponse.json({
    displayName:user.displayName,timezone:user.timezone,darkMode:user.darkMode,
    leaderboardOptIn:user.leaderboardOptIn,leaderboardNickname:user.leaderboardNickname,
    publicProfile:user.publicProfile,shareSlug:user.shareSlug,level:user.level,
    prestigeCount:user.prestigeCount,
    badges:badges.map(({badge,earnedAt})=>({id:badge.id,key:badge.key,name:badge.name,description:badge.description,icon:badge.icon,earnedAt})),
  });
}
