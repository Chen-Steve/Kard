import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import seedrandom from 'seedrandom';

type BackgroundType = 'gradientLinear' | 'solid';
type EarringType = 'hoop' | 'stud';
type EarsType = 'attached' | 'detached';
type EyebrowsType = 'down' | 'eyelashesDown' | 'eyelashesUp';
type EyesType = 'eyes' | 'eyesShadow' | 'round' | 'smiling' | 'smilingShadow';
type FacialHairType = 'beard' | 'scruff';
type GlassesType = 'round' | 'square';
type HairType = 'dannyPhantom' | 'dougFunny' | 'fonze';
type MouthType = 'laughing' | 'nervous' | 'pucker' | 'smile' | 'smirk' | 'surprised';
type NoseType = 'curve' | 'pointed' | 'tound';
type ShirtType = 'collared' | 'crew' | 'open';

interface MicahOptions {
  seed: string;
  flip?: boolean;
  scale?: number;
  radius?: number;
  size?: number;
  backgroundColor?: string[];
  backgroundType?: BackgroundType[];
  backgroundRotation?: number[];
  clip?: boolean;
  randomizeIds?: boolean;
  base?: ('standard')[];
  baseColor?: string[];
  earringColor?: string[];
  earrings?: EarringType[];
  earringsProbability?: number;
  ears?: EarsType[];
  eyeShadowColor?: string[];
  eyebrows?: EyebrowsType[];
  eyebrowsColor?: string[];
  eyes?: EyesType[];
  eyesColor?: string[];
  facialHair?: FacialHairType[];
  facialHairColor?: string[];
  facialHairProbability?: number;
  glasses?: GlassesType[];
  glassesColor?: string[];
  glassesProbability?: number;
  hair?: HairType[];
  hairColor?: string[];
  hairProbability?: number;
  mouth?: MouthType[];
  mouthColor?: string[];
  nose?: NoseType[];
  shirt?: ShirtType[];
  shirtColor?: string[];
}

const backgroundColors: string[] = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];

function getRandomValue<T>(arr: T[], rng: seedrandom.PRNG): T {
  return arr[Math.floor(rng() * arr.length)];
}

export const getMicahAvatarSvg = (email: string): string => {
  const rng = seedrandom(email);
  const avatarOptions: MicahOptions = {
    seed: email,
    flip: getRandomValue([true, false], rng),
    scale: 100,
    radius: 30,
    size: 64,
    backgroundColor: [getRandomValue(backgroundColors, rng)],
    backgroundType: [getRandomValue(["gradientLinear", "solid"] as BackgroundType[], rng)],
    clip: getRandomValue([true, false], rng),
    randomizeIds: true,
    base: [getRandomValue(["standard"], rng)],
    baseColor: [getRandomValue(["77311d", "cf8974", "fad3c3", "edd8da", "f9c9b6"], rng)],
    earringColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], rng)],
    earrings: [getRandomValue(["hoop", "stud"] as EarringType[], rng)],
    earringsProbability: getRandomValue([0, 100], rng),
    ears: [getRandomValue(["attached", "detached"] as EarsType[], rng)],
    eyeShadowColor: [getRandomValue(["d2eff3", "e0ddff", "ffeba4"], rng)],
    eyebrows: [getRandomValue(["down", "eyelashesDown", "eyelashesUp"] as EyebrowsType[], rng)],
    eyebrowsColor: [getRandomValue(["000000"], rng)],
    eyes: [getRandomValue(["eyes", "eyesShadow", "round", "smiling", "smilingShadow"] as EyesType[], rng)],
    eyesColor: [getRandomValue(["000000"], rng)],
    facialHair: [getRandomValue(["beard", "scruff"] as FacialHairType[], rng)],
    facialHairColor: [getRandomValue(["000000"], rng)],
    facialHairProbability: getRandomValue([0, 100], rng),
    glasses: [getRandomValue(["round", "square"] as GlassesType[], rng)],
    glassesColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], rng)],
    glassesProbability: getRandomValue([0, 100], rng),
    hair: [getRandomValue(["dannyPhantom", "dougFunny", "fonze"] as HairType[], rng)],
    hairColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], rng)],
    hairProbability: getRandomValue([0, 100], rng),
    mouth: [getRandomValue(["frown", "laughing", "nervous", "pucker", "sad", "smile", "smirk", "surprised"] as MouthType[], rng)],
    mouthColor: [getRandomValue(["000000"], rng)],
    nose: [getRandomValue(["curve", "pointed", "tound"] as NoseType[], rng)],
    shirt: [getRandomValue(["collared", "crew", "open"] as ShirtType[], rng)],
    shirtColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], rng)]
  };

  const avatar = createAvatar(micah, avatarOptions);
  return avatar.toString();
};