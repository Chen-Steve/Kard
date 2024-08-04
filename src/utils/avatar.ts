import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';

type BackgroundType = 'gradientLinear' | 'solid';
type EarringType = 'hoop' | 'stud';
type EarsType = 'attached' | 'detached';
type EyebrowsType = 'down' | 'eyelashesDown' | 'eyelashesUp';
type EyesType = 'eyes' | 'eyesShadow' | 'round' | 'smiling' | 'smilingShadow';
type FacialHairType = 'beard' | 'scruff';
type GlassesType = 'round' | 'square';
type HairType = 'dannyPhantom' | 'dougFunny' | 'fonze';
type MouthType = 'frown' | 'laughing' | 'nervous' | 'pucker' | 'sad' | 'smile' | 'smirk' | 'surprised';
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

function getRandomValue<T>(arr: T[], seed: string): T {
  const seedrandom = require('seedrandom');
  const rng = seedrandom(seed);
  return arr[Math.floor(rng() * arr.length)];
}

export const getMicahAvatarSvg = (email: string): string => {
  const avatarOptions: MicahOptions = {
    seed: email,
    flip: getRandomValue([true, false], email),
    scale: 100,
    radius: 30,
    size: 64,
    backgroundColor: [getRandomValue(backgroundColors, email)],
    backgroundType: [getRandomValue(["gradientLinear", "solid"] as BackgroundType[], email)],
    clip: getRandomValue([true, false], email),
    randomizeIds: true,
    base: [getRandomValue(["standard"], email)],
    baseColor: [getRandomValue(["77311d", "ac6651", "f9c9b6"], email)],
    earringColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], email)],
    earrings: [getRandomValue(["hoop", "stud"] as EarringType[], email)],
    earringsProbability: getRandomValue([0, 100], email),
    ears: [getRandomValue(["attached", "detached"] as EarsType[], email)],
    eyeShadowColor: [getRandomValue(["d2eff3", "e0ddff", "ffeba4"], email)],
    eyebrows: [getRandomValue(["down", "eyelashesDown", "eyelashesUp"] as EyebrowsType[], email)],
    eyebrowsColor: [getRandomValue(["000000"], email)],
    eyes: [getRandomValue(["eyes", "eyesShadow", "round", "smiling", "smilingShadow"] as EyesType[], email)],
    eyesColor: [getRandomValue(["000000"], email)],
    facialHair: [getRandomValue(["beard", "scruff"] as FacialHairType[], email)],
    facialHairColor: [getRandomValue(["000000"], email)],
    facialHairProbability: getRandomValue([0, 100], email),
    glasses: [getRandomValue(["round", "square"] as GlassesType[], email)],
    glassesColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], email)],
    glassesProbability: getRandomValue([0, 100], email),
    hair: [getRandomValue(["dannyPhantom", "dougFunny", "fonze"] as HairType[], email)],
    hairColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], email)],
    hairProbability: getRandomValue([0, 100], email),
    mouth: [getRandomValue(["frown", "laughing", "nervous", "pucker", "sad", "smile", "smirk", "surprised"] as MouthType[], email)],
    mouthColor: [getRandomValue(["000000"], email)],
    nose: [getRandomValue(["curve", "pointed", "tound"] as NoseType[], email)],
    shirt: [getRandomValue(["collared", "crew", "open"] as ShirtType[], email)],
    shirtColor: [getRandomValue(["000000", "6bd9e9", "9287ff"], email)]
  };

  const avatar = createAvatar(micah, avatarOptions);
  return avatar.toString();
};