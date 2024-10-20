import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import seedrandom from 'seedrandom';

type BackgroundType = 'gradientLinear' | 'solid';
type Shape = 'a' | 'd' | 'e' | 'g' | 'i' | 'n' | 'r' | 't';

interface GlassOptions {
  seed: string;
  backgroundColor?: string[];
  backgroundType?: BackgroundType[];
  backgroundRotation?: number[];
  shape1?: Shape[];
  shape2?: Shape[];
  shape1OffsetX?: number[];
  shape1OffsetY?: number[];
  shape2OffsetX?: number[];
  shape2OffsetY?: number[];
  shape1Rotation?: number[];
  shape2Rotation?: number[];
  flip?: boolean;
  rotate?: number;
  scale?: number;
  radius?: number;
  translateX?: number;
  translateY?: number;
}

const backgroundColors: string[] = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
const shapes: Shape[] = ['a', 'd', 'e', 'g', 'i', 'n', 'r', 't'];

function getRandomValue<T>(arr: T[], rng: seedrandom.PRNG): T {
  return arr[Math.floor(rng() * arr.length)];
}

function getRandomRange(min: number, max: number, rng: seedrandom.PRNG): number {
  return min + rng() * (max - min);
}

export const getGlassAvatarSvg = (email: string): string => {
  const rng = seedrandom(email);
  const avatarOptions: GlassOptions = {
    seed: email,
    backgroundColor: [getRandomValue(backgroundColors, rng)],
    backgroundType: [getRandomValue(['gradientLinear'], rng)],
    backgroundRotation: [getRandomRange(0, 360, rng)],
    shape1: [getRandomValue(shapes, rng)],
    shape1OffsetX: [getRandomRange(-80, 80, rng)],
    shape1OffsetY: [getRandomRange(-80, 80, rng)],
    shape1Rotation: [getRandomRange(-180, 180, rng)],
    flip: rng() < 0.5,
    rotate: Math.floor(getRandomRange(0, 360, rng)),
    scale: Math.floor(getRandomRange(50, 200, rng)),
    radius: Math.floor(getRandomRange(0, 50, rng)),
    translateX: Math.floor(getRandomRange(-100, 100, rng)),
    translateY: Math.floor(getRandomRange(-100, 100, rng)),
  };

  const avatar = createAvatar(glass, avatarOptions);
  return avatar.toString();
};
