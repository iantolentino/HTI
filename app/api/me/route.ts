import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
export async function GET(){const user=await currentUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({displayName:user.displayName,timezone:user.timezone,darkMode:user.darkMode,leaderboardOptIn:user.leaderboardOptIn,leaderboardNickname:user.leaderboardNickname,publicProfile:user.publicProfile,shareSlug:user.shareSlug,level:user.level,prestigeCount:user.prestigeCount});}
