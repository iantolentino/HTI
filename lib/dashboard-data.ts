import { Category, TaskType } from '@prisma/client';
import { expToNextLevel, isoDay, levelTitle, progressiveExp, progressiveTarget, streakFromDates } from '@/lib/game';
import { prisma } from '@/lib/prisma';

export type DashboardTask = { id:string; icon:string; name:string; category:Category; type:TaskType; exp:number; target:string | null; done:boolean };

function labelTarget(value:number, unit:string | null) {
  const labels:Record<string,string>={ REPS:'reps', MINUTES:'minutes', KM:'km', PAGES:'pages', CUSTOM:'count' };
  return `${value} ${labels[unit ?? 'CUSTOM']}`;
}

export async function dashboardData(userId:string) {
  const user=await prisma.user.findUniqueOrThrow({where:{id:userId}});
  const today=isoDay(new Date(),user.timezone);
  const active=await prisma.userTask.findMany({where:{userId,isPaused:false},include:{task:true}});
  const logs=await prisma.dailyLog.findMany({where:{userId,date:{gte:new Date(`${today}T00:00:00.000Z`)}},select:{taskId:true}});
  const done=new Set(logs.map(log=>log.taskId));
  const tasks:DashboardTask[]=active.map(({id,task,personalTargetOverride,unitOverride})=>{
    const target=task.type==='PROGRESSIVE'?progressiveTarget(task.baseTarget??1,user.level,task.scalingFactor??0,personalTargetOverride):null;
    return {id,icon:task.icon,name:task.name,category:task.category,type:task.type,exp:task.type==='PROGRESSIVE'?progressiveExp(task.baseExp,target??0):task.baseExp,target:target===null?null:labelTarget(target,unitOverride??task.unit),done:done.has(task.id)};
  });
  const sevenDaysAgo=new Date(); sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate()-7);
  const recent=await prisma.dailyLog.findMany({where:{userId,date:{gte:sevenDaysAgo}},select:{date:true,expEarned:true}});
  const daily=new Map<string,number>(); for(const log of recent){const key=isoDay(log.date,user.timezone);daily.set(key,(daily.get(key)??0)+log.expEarned)}
  const values=[...daily.values()]; const average=values.length?Math.round(values.reduce((a,b)=>a+b,0)/7):0;
  const todayExp=daily.get(today)??0;
  const growth=average?Math.max(-100,Math.min(300,Math.round((todayExp-average)/average*100))):null;
  const allDays=await prisma.dailyLog.findMany({where:{userId},select:{date:true}});
  const streak=streakFromDates([...new Set(allDays.map(log=>isoDay(log.date,user.timezone)))],today,user.createdAt.getTime()>Date.now()-7*86400000);
  return {user:{displayName:user.displayName,level:user.level,title:levelTitle(user.level),totalExp:user.totalExp,nextExp:expToNextLevel(user.level),darkMode:user.darkMode},tasks,done:tasks.filter(t=>t.done).length,growth,streak};
}
