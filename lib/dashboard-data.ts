import { Category, TaskType } from '@prisma/client';
import { expToNextLevel, isoDay, levelTitle, progressiveExp, progressiveTarget, regressTarget, streakFromDates, todayDate } from '@/lib/game';
import { prisma } from '@/lib/prisma';

export type RegressionEntry = { date:string; oldTarget:number; newTarget:number };
export type DashboardTask = { id:string; icon:string; name:string; category:Category; type:TaskType; exp:number; target:string | null; done:boolean; regressions:RegressionEntry[] };

function labelTarget(value:number, unit:string | null) {
  const labels:Record<string,string>={ REPS:'reps', MINUTES:'minutes', KM:'km', PAGES:'pages', CUSTOM:'count' };
  return `${value} ${labels[unit ?? 'CUSTOM']}`;
}

export async function dashboardData(userId:string) {
  const user=await prisma.user.findUniqueOrThrow({where:{id:userId}});
  await evaluateMisses(user.id, user.timezone, user.createdAt, user.level);
  const today=isoDay(new Date(),user.timezone);
  const active=await prisma.userTask.findMany({where:{userId,isPaused:false},include:{task:true}});
  const logs=await prisma.dailyLog.findMany({where:{userId,date:todayDate(user.timezone)},select:{taskId:true}});
  const done=new Set(logs.map(log=>log.taskId));
  const tasks:DashboardTask[]=active.map(({id,task,iconOverride,personalTargetOverride,unitOverride,currentTarget,targetRegressionLog})=>{
    const target=task.type==='PROGRESSIVE'?(currentTarget ?? progressiveTarget(task.baseTarget??1,user.level,task.scalingFactor??0,personalTargetOverride)):null;
    const regressions=Array.isArray(targetRegressionLog)?targetRegressionLog.filter((entry):entry is RegressionEntry=>{if(!entry||typeof entry!=='object')return false;const candidate=entry as Record<string,unknown>;return typeof candidate.date==='string'&&typeof candidate.oldTarget==='number'&&typeof candidate.newTarget==='number'}):[];
    return {id,icon:iconOverride??task.icon,name:task.name,category:task.category,type:task.type,exp:task.type==='PROGRESSIVE'?progressiveExp(task.baseExp,target??0):task.baseExp,target:target===null?null:labelTarget(target,unitOverride??task.unit),done:done.has(task.id),regressions};
  });
  const sevenDaysAgo=new Date(); sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate()-7);
  const recent=await prisma.dailyLog.findMany({where:{userId,date:{gte:sevenDaysAgo}},select:{date:true,expEarned:true}});
  const daily=new Map<string,number>(); for(const log of recent){const key=isoDay(log.date,user.timezone);daily.set(key,(daily.get(key)??0)+log.expEarned)}
  const values=[...daily.values()]; const average=values.length?Math.round(values.reduce((a,b)=>a+b,0)/7):0;
  const todayExp=daily.get(today)??0;
  const growth=average?Math.max(-100,Math.min(300,Math.round((todayExp-average)/average*100))):null;
  const allDays=await prisma.dailyLog.findMany({where:{userId},select:{date:true}});
  const streak=streakFromDates([...new Set(allDays.map(log=>isoDay(log.date,user.timezone)))],today,user.createdAt.getTime()>Date.now()-7*86400000);
  const currentDate = todayDate(user.timezone)
  const monthKey = isoDay(currentDate,user.timezone).slice(0,7)
  const challenge = await prisma.monthlyChallenge.upsert({where:{userId_monthKey:{userId,monthKey}},update:{},create:{userId,monthKey,title:'Monthly Momentum',description:'Complete one health win and one focus win on the same day — then take a moment to notice the difference.',exp:120}})
  const daysAway = Math.floor((currentDate.getTime() - todayDateFrom(user.lastSeenAt, user.timezone).getTime()) / 86400000)
  const welcomeBack = daysAway >= 2 ? { daysMissed:daysAway - 1, message:'Good to see you — pick up where you left off.' } : null
  const weekStart = new Date(currentDate); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7))
  const weeklyKey = isoDay(weekStart, user.timezone)
  let weeklyRecap: {key:string;bestDay:string|null;consistentCategory:string;weakestCategory:string}|null = null
  if (user.lastWeeklyRecapKey !== weeklyKey) {
    const weeklyLogs = await prisma.dailyLog.findMany({where:{userId,date:{gte:weekStart,lt:currentDate}},include:{task:true}})
    const dailyExp = new Map<string,number>(); const categoryCount:Record<string,number>={HEALTH:0,MENTAL:0,SELF_CARE:0,NUTRITION:0}
    for (const log of weeklyLogs) { const key=isoDay(log.date,user.timezone); dailyExp.set(key,(dailyExp.get(key)??0)+log.expEarned); categoryCount[log.task.category]++ }
    const ordered=Object.entries(categoryCount).sort((a,b)=>b[1]-a[1])
    weeklyRecap={key:weeklyKey,bestDay:[...dailyExp.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]??null,consistentCategory:ordered[0]?.[0]??'HEALTH',weakestCategory:ordered.at(-1)?.[0]??'NUTRITION'}
  }
  await prisma.user.update({where:{id:userId},data:{lastSeenAt:new Date()}})
  return {user:{displayName:user.displayName,level:user.level,title:levelTitle(user.level),totalExp:user.totalExp,nextExp:expToNextLevel(user.level),darkMode:user.darkMode},tasks,done:tasks.filter(t=>t.done).length,growth,streak,welcomeBack,weeklyRecap,challenge,discoverUnlocked:user.hasCompletedFirstDay||daysAway>=1};
}

function todayDateFrom(date:Date,timeZone:string){return new Date(`${isoDay(date,timeZone)}T00:00:00.000Z`)}

async function evaluateMisses(userId:string, timezone:string, createdAt:Date, level:number) {
  const yesterday = todayDate(timezone); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (yesterday.getTime() < new Date(`${isoDay(createdAt, timezone)}T00:00:00.000Z`).getTime()) return;
  const habits = await prisma.userTask.findMany({ where:{ userId, isPaused:false, task:{ type:'PROGRESSIVE' } }, include:{ task:true } });
  for (const habit of habits) {
    if (habit.lastMissEvaluatedDate?.getTime() === yesterday.getTime()) continue;
    const completed = await prisma.dailyLog.findUnique({ where:{ userId_taskId_date:{ userId, taskId:habit.taskId, date:yesterday } }, select:{ targetAtCompletion:true } });
    if (completed && (completed.targetAtCompletion ?? 0) >= (habit.personalTargetOverride ?? progressiveTarget(habit.task.baseTarget ?? 1, level, habit.task.scalingFactor ?? 0))) {
      await prisma.userTask.update({ where:{ id:habit.id }, data:{ consecutiveMisses:0, lastMissEvaluatedDate:yesterday } });
      continue;
    }
    const misses = habit.consecutiveMisses + 1;
    const base = habit.task.baseTarget ?? 1;
    const current = habit.currentTarget ?? progressiveTarget(base, level, habit.task.scalingFactor ?? 0, habit.personalTargetOverride);
    const shouldRegress = misses >= 3 && !habit.personalTargetOverride;
    const nextTarget = shouldRegress ? regressTarget(current, base) : current;
    const log = Array.isArray(habit.targetRegressionLog) ? habit.targetRegressionLog : [];
    const regressionLog = shouldRegress && nextTarget < current ? [...log, { date:isoDay(yesterday, timezone), oldTarget:current, newTarget:nextTarget }] : log;
    await prisma.userTask.update({ where:{ id:habit.id }, data:{ consecutiveMisses:shouldRegress ? 0 : misses, currentTarget:nextTarget, targetRegressionLog:regressionLog, lastMissEvaluatedDate:yesterday } });
  }
}
