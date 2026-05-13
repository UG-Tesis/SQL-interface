export type SectionId = 'curso' | 'actividad' | 'evaluacion';


export const SECTION_IDS: readonly SectionId[] = ['curso', 'actividad', 'evaluacion'];

export function isSectionId(value: string | undefined): value is SectionId {
  return value !== undefined && (SECTION_IDS as readonly string[]).includes(value);
}

export interface Section {
  id: SectionId;
  title: string;
  description: string;
  icon: string;
}
