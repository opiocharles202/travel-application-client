/**
 * Every base component accepts this instead of the app shipping two
 * parallel component sets per portal (spec 0003, AC-4). A screen author
 * states it explicitly; a component never infers it from context.
 */
export type Density = 'comfortable' | 'compact'
