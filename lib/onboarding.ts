import { Category } from '@prisma/client';

export function onboardingCategories(priority: string): Category[] {
  switch (priority) {
    case 'Focus and calm': return [Category.MENTAL];
    case 'Self-care': return [Category.SELF_CARE];
    case 'Nutrition': return [Category.NUTRITION];
    case 'Energy and movement': return [Category.HEALTH, Category.NUTRITION];
    default: return [Category.HEALTH];
  }
}

export function wantsStretchHabit(challenge: string): boolean {
  return challenge === 'A little challenging';
}
