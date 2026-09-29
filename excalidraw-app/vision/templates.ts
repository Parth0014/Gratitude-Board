import { VISION_LAYOUTS } from "./layouts";

import type { VisionLayout } from "./layouts";

export interface VisionTemplate {
  id: string;
  title: string;
  category: "travel" | "home" | "career" | "wellness" | "gratitude";
  description: string;
  prompt: string;
  accent: string;
  backgroundColor: string;
  heading: string;
  layout: VisionLayout;
}

const layout = (id: string) => {
  const match = VISION_LAYOUTS.find((candidate) => candidate.id === id);
  if (!match) {
    throw new Error(`Missing template layout: ${id}`);
  }
  return match;
};

export const VISION_TEMPLATES: VisionTemplate[] = [
  {
    id: "travel-story",
    title: "Places I will explore",
    category: "travel",
    description: "A playful wall of destinations and memories.",
    prompt: "Where do you want your next chapter to take you?",
    accent: "#e684a5",
    backgroundColor: "#fff6ed",
    heading: "Places I will explore",
    layout: layout("postcards"),
  },
  {
    id: "peaceful-home",
    title: "A home that restores me",
    category: "home",
    description: "A calm collection for rooms, rituals and belonging.",
    prompt: "What would make everyday life feel lighter?",
    accent: "#9a7fba",
    backgroundColor: "#f4f0f7",
    heading: "A home that restores me",
    layout: layout("editorial"),
  },
  {
    id: "career-growth",
    title: "Work with meaning",
    category: "career",
    description: "One central ambition supported by practical milestones.",
    prompt: "What contribution would make you proud?",
    accent: "#cf4977",
    backgroundColor: "#fdf1f5",
    heading: "Work with meaning",
    layout: layout("hero-four"),
  },
  {
    id: "wellness-rhythm",
    title: "My nourishing rhythm",
    category: "wellness",
    description: "Balance movement, rest, nourishment and connection.",
    prompt: "How do you want to feel in your body each day?",
    accent: "#5e9d8b",
    backgroundColor: "#eff8f4",
    heading: "My nourishing rhythm",
    layout: layout("center-focus"),
  },
  {
    id: "daily-gratitude",
    title: "What already matters",
    category: "gratitude",
    description: "Nine everyday moments worth noticing.",
    prompt: "Which ordinary moments make life feel rich?",
    accent: "#d69b4c",
    backgroundColor: "#fff8e8",
    heading: "What already matters",
    layout: layout("nine-grid"),
  },
];
