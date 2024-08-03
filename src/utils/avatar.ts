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
  //rotate?: number;
  scale?: number;
  radius?: number;
  size?: number;
  backgroundColor?: string[];
  backgroundType?: BackgroundType[];
  backgroundRotation?: number[];
  //translateX?: number;
  //translateY?: number;
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
const randomOptions: Omit<MicahOptions, 'seed'> = {
  flip: getRandomValue([true, false]),
  //rotate: getRandomValue([0, 90, 180, 270]),
  scale: getRandomValue([100]),
  radius: getRandomValue([30]),
  size: getRandomValue([64]),
  backgroundColor: [getRandomValue(backgroundColors)],
  backgroundType: [getRandomValue(["gradientLinear", "solid"] as BackgroundType[])],
  //translateX: getRandomValue([-25, 0, 25]),
  //translateY: getRandomValue([-25, 0, 25]),
  clip: getRandomValue([true, false]),
  randomizeIds: true,
  base: [getRandomValue(["standard"])],
  baseColor: [getRandomValue(["77311d", "ac6651", "f9c9b6"])],
  earringColor: [getRandomValue(["000000", "6bd9e9", "9287ff"])],
  earrings: [getRandomValue(["hoop", "stud"] as EarringType[])],
  earringsProbability: getRandomValue([0, 100]),
  ears: [getRandomValue(["attached", "detached"] as EarsType[])],
  eyeShadowColor: [getRandomValue(["d2eff3", "e0ddff", "ffeba4"])],
  eyebrows: [getRandomValue(["down", "eyelashesDown", "eyelashesUp"] as EyebrowsType[])],
  eyebrowsColor: [getRandomValue(["000000"])],
  eyes: [getRandomValue(["eyes", "eyesShadow", "round", "smiling", "smilingShadow"] as EyesType[])],
  eyesColor: [getRandomValue(["000000"])],
  facialHair: [getRandomValue(["beard", "scruff"] as FacialHairType[])],
  facialHairColor: [getRandomValue(["000000"])],
  facialHairProbability: getRandomValue([0, 100]),
  glasses: [getRandomValue(["round", "square"] as GlassesType[])],
  glassesColor: [getRandomValue(["000000", "6bd9e9", "9287ff"])],
  glassesProbability: getRandomValue([0, 100]),
  hair: [getRandomValue(["dannyPhantom", "dougFunny", "fonze"] as HairType[])],
  hairColor: [getRandomValue(["000000", "6bd9e9", "9287ff"])],
  hairProbability: getRandomValue([0, 100]),
  mouth: [getRandomValue(["frown", "laughing", "nervous", "pucker", "sad", "smile", "smirk", "surprised"] as MouthType[])],
  mouthColor: [getRandomValue(["000000"])],
  nose: [getRandomValue(["curve", "pointed", "tound"] as NoseType[])],
  shirt: [getRandomValue(["collared", "crew", "open"] as ShirtType[])],
  shirtColor: [getRandomValue(["000000", "6bd9e9", "9287ff"])]
};

// Define the function to get a random value from an array
function getRandomValue<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getMicahAvatarSvg = (email: string): string => {
  const avatarOptions: MicahOptions = {
    seed: email,
    flip: false,
    scale: 100,
    radius: 30,
    size: 64,
    backgroundColor: ["b6e3f4"],
    backgroundType: ["solid"],
    base: ["standard"],
    baseColor: ["77311d"],
    earringColor: ["000000"],
    earrings: ["hoop"],
    earringsProbability: 0,
    ears: ["attached"],
    eyeShadowColor: ["d2eff3"],
    eyebrows: ["down"],
    eyebrowsColor: ["000000"],
    eyes: ["eyes"],
    eyesColor: ["000000"],
    facialHair: ["beard"],
    facialHairColor: ["000000"],
    facialHairProbability: 0,
    glasses: ["round"],
    glassesColor: ["000000"],
    glassesProbability: 0,
    hair: ["dannyPhantom"],
    hairColor: ["000000"],
    hairProbability: 0,
    mouth: ["smile"],
    mouthColor: ["000000"],
    nose: ["curve"],
    shirt: ["collared"],
    shirtColor: ["000000"],
  };

  const avatar = createAvatar(micah, avatarOptions);
  return avatar.toString();
};