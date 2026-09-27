export const photos = [
  {
    id: 'career',
    title: 'A place to focus',
    category: 'Career',
    src: '/photos/career.jpg',
    width: 960,
    height: 640,
  },
  {
    id: 'home',
    title: 'Room to settle',
    category: 'Home',
    src: '/photos/home.jpg',
    width: 960,
    height: 636,
  },
  {
    id: 'people',
    title: 'Together',
    category: 'People',
    src: '/photos/people.jpg',
    width: 960,
    height: 540,
  },
  {
    id: 'garden',
    title: 'Room to grow',
    category: 'Nature',
    src: '/photos/garden.jpg',
    width: 960,
    height: 1440,
  },
  {
    id: 'travel',
    title: 'Somewhere new',
    category: 'Travel',
    src: '/photos/travel.jpg',
    width: 960,
    height: 628,
  },
  {
    id: 'mountain',
    title: 'A wider horizon',
    category: 'Nature',
    src: '/photos/mountain.jpg',
    width: 577,
    height: 1280,
  },
] as const;

export type PhotoId = (typeof photos)[number]['id'];
export function findPhoto(id: string) {
  return photos.find((photo) => photo.id === id);
}

export const templates = [
  {
    id: 'career',
    title: 'Career & purpose',
    intro: 'A picture of meaningful work and room to grow.',
    photoIds: ['career', 'garden', 'travel', 'mountain'],
  },
  {
    id: 'home',
    title: 'Home & calm',
    intro: 'A place, a pace, and the small things that make it yours.',
    photoIds: ['home', 'garden', 'mountain', 'people'],
  },
  {
    id: 'relationships',
    title: 'Relationships & connection',
    intro: 'More of the moments and people you want close.',
    photoIds: ['people', 'home', 'garden', 'travel'],
  },
] as const;

export type TemplateId = (typeof templates)[number]['id'];
