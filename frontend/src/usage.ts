export const eventNames = ['template_selected', 'calculation_started', 'calculation_completed', 'calculation_invalid', 'calculation_reset', 'feedback_prepared', 'feedback_email_requested'] as const
export const segments = ['music', 'design', 'beauty', 'food', 'professional', 'technical', 'custom'] as const
export type EventName = typeof eventNames[number]
export type Segment = typeof segments[number]
export type UsageEvent = { schemaVersion: 1; name: EventName; segment: Segment }

// No network, persistence, IDs, timestamps, financial fields or free text.
export function createUsageRecorder() {
  let enabled = false
  let events: UsageEvent[] = []
  const started = new Set<Segment>()
  const completed = new Set<Segment>()
  return {
    setEnabled(value: boolean) {
      enabled = value
      events = []
      started.clear()
      completed.clear()
    },
    record(name: EventName, segment: Segment) {
      if (!enabled || !eventNames.includes(name) || !segments.includes(segment)) return
      if (name === 'calculation_started') {
        if (started.has(segment)) return
        started.add(segment)
      }
      if (name === 'calculation_completed') {
        if (!started.has(segment) || completed.has(segment)) return
        completed.add(segment)
      }
      if (name === 'calculation_reset') { started.delete(segment); completed.delete(segment) }
      events.push({ schemaVersion: 1, name, segment })
      events = events.slice(-200)
    },
    snapshot(): UsageEvent[] { return events.map(event => ({ ...event })) },
  }
}

