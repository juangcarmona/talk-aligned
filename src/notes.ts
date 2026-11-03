import source from '../content/speaker-notes.md?raw'

// content/speaker-notes.md is the single source of the notes: one `## scene-id`
// section per scene, with `[click]` separating what is said at each step.
export const notes: Record<string, string[]> = {}

for (const section of source.split(/^## /m).slice(1)) {
  const [heading, ...body] = section.split('\n')
  notes[heading.trim()] = body.join('\n').trim().split(/\s*\[click\]\s*/)
}
