import { getAdaptiveOffset } from './behaviorEngine';

// Score a task based on urgency, estimated time, and adaptive behavior
function scoreTask(task, adaptiveOffset) {
  const hoursLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
  const adjustedHoursLeft = hoursLeft - adaptiveOffset;

  let score = 0;

  // Urgency score — closer deadline = higher score
  if (adjustedHoursLeft < 2) score += 100;
  else if (adjustedHoursLeft < 6) score += 80;
  else if (adjustedHoursLeft < 12) score += 60;
  else if (adjustedHoursLeft < 24) score += 40;
  else if (adjustedHoursLeft < 48) score += 20;
  else score += 5;

  // Progress penalty — tasks already far along are less urgent
  score -= (task.progress || 0) * 0.3;

  // Estimated time bonus — shorter tasks get a small boost
  // (easier wins help momentum)
  if (task.estimatedMinutes <= 30) score += 10;
  else if (task.estimatedMinutes <= 60) score += 5;

  return score;
}

// Find gaps in today's class schedule where the user is free
function getFreeGaps(todaysClasses, minimumMinutes = 30) {
  if (!todaysClasses || todaysClasses.length === 0) return [];

  // Convert "h:mm AM/PM" to minutes since midnight
  function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const sorted = [...todaysClasses]
    .map((c) => ({
      start: timeToMinutes(c.startTime),
      end: timeToMinutes(c.endTime),
      name: c.name,
    }))
    .filter((c) => c.start !== null && c.end !== null)
    .sort((a, b) => a.start - b.start);

  const gaps = [];
  const dayStart = 7 * 60;  // 7:00 AM
  const dayEnd = 22 * 60;   // 10:00 PM

  // Gap before first class
  if (sorted.length > 0 && sorted[0].start - dayStart >= minimumMinutes) {
    gaps.push({
      startMinutes: dayStart,
      endMinutes: sorted[0].start,
      durationMinutes: sorted[0].start - dayStart,
      label: `Before ${sorted[0].name}`,
    });
  }

  // Gaps between classes
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapDuration = sorted[i + 1].start - sorted[i].end;
    if (gapDuration >= minimumMinutes) {
      gaps.push({
        startMinutes: sorted[i].end,
        endMinutes: sorted[i + 1].start,
        durationMinutes: gapDuration,
        label: `Between ${sorted[i].name} and ${sorted[i + 1].name}`,
      });
    }
  }

  // Gap after last class
  if (sorted.length > 0) {
    const lastEnd = sorted[sorted.length - 1].end;
    if (dayEnd - lastEnd >= minimumMinutes) {
      gaps.push({
        startMinutes: lastEnd,
        endMinutes: dayEnd,
        durationMinutes: dayEnd - lastEnd,
        label: `After ${sorted[sorted.length - 1].name}`,
      });
    }
  }

  return gaps;
}

// Format minutes since midnight to "h:mm AM/PM"
function minutesToTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// Main function — returns the best suggestion for right now
export async function getBestSuggestion(tasks, todaysClasses) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  if (incompleteTasks.length === 0) return null;

  const adaptiveOffset = await getAdaptiveOffset();
  const gaps = getFreeGaps(todaysClasses);

  // Score all incomplete tasks
  const scored = incompleteTasks
    .map((task) => ({ task, score: scoreTask(task, adaptiveOffset) }))
    .sort((a, b) => b.score - a.score);

  const bestTask = scored[0].task;

  // Find a gap that fits the task's estimated time
  const fittingGap = gaps.find(
    (gap) => gap.durationMinutes >= (bestTask.estimatedMinutes || 30)
  );

  return {
    task: bestTask,
    score: scored[0].score,
    suggestedGap: fittingGap || null,
    allSuggestions: scored.slice(0, 3).map((s) => s.task),
    adaptiveOffset,
  };
}

// Returns a human-readable suggestion message
export async function getSuggestionMessage(tasks, todaysClasses) {
  const suggestion = await getBestSuggestion(tasks, todaysClasses);
  if (!suggestion) return null;

  const { task, suggestedGap, adaptiveOffset } = suggestion;
  const hoursLeft = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);

  let timeContext = '';
  if (suggestedGap) {
    timeContext = `Work on it during: ${suggestion.suggestedGap.label} (${suggestion.suggestedGap.durationMinutes} min free)`;
  }

  let urgencyNote = '';
  if (adaptiveOffset > 0) {
    urgencyNote = ` · Reminder adjusted +${adaptiveOffset}h based on your habits`;
  }

  return {
    title: task.title,
    courseCode: task.courseCode,
    estimatedMinutes: task.estimatedMinutes,
    hoursLeft: Math.round(hoursLeft * 10) / 10,
    timeContext,
    urgencyNote,
    task,
  };
}