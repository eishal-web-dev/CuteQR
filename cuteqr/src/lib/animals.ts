export type AnimalId = "cat" | "puppy" | "panda" | "bunny" | "fox";

export interface AnimalConfig {
  id: AnimalId;
  label: string;
  emoji: string;
  dotColor: string;
  bgColor: string;
  cornerColor: string;
  earColor: string;
  accentSoft: string;
}

export const ANIMALS: AnimalConfig[] = [
  {
    id: "cat",
    label: "Cat",
    emoji: "🐱",
    dotColor: "#3D3226",
    bgColor: "#FDF0F3",
    cornerColor: "#EE93A8",
    earColor: "#F6B8C6",
    accentSoft: "#F6B8C6",
  },
  {
    id: "puppy",
    label: "Puppy",
    emoji: "🐶",
    dotColor: "#5B4130",
    bgColor: "#FBF1E6",
    cornerColor: "#D9A05B",
    earColor: "#C98A4B",
    accentSoft: "#F7D06B",
  },
  {
    id: "panda",
    label: "Panda",
    emoji: "🐼",
    dotColor: "#232323",
    bgColor: "#F5F5F3",
    cornerColor: "#232323",
    earColor: "#232323",
    accentSoft: "#D9D9D3",
  },
  {
    id: "bunny",
    label: "Bunny",
    emoji: "🐰",
    dotColor: "#5B4B4E",
    bgColor: "#FDF4F6",
    cornerColor: "#EE93A8",
    earColor: "#FBDCE2",
    accentSoft: "#F6B8C6",
  },
  {
    id: "fox",
    label: "Fox",
    emoji: "🦊",
    dotColor: "#5A2E1B",
    bgColor: "#FDF1E9",
    cornerColor: "#E3743F",
    earColor: "#F0956B",
    accentSoft: "#F0956B",
  },
];

export function getAnimal(id: AnimalId): AnimalConfig {
  return ANIMALS.find((a) => a.id === id) ?? ANIMALS[0];
}
