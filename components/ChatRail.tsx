import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ChatMessage } from '../types';
import { ChatUserContextMenu } from './ChatUserContextMenu';
import { FaceSmileIcon, PlayCircleIcon, SearchIcon, StarIcon } from './icons';
import { calculateLevelInfo, getRankForLevel } from '../lib/leveling';

interface ChatRailProps {
  session: Session | null;
  onClose?: () => void;
  onTipUser: (recipient: { id: string; username: string }) => void;
  onViewProfile: (userId: string) => void;
}

const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'],
  'People': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛'],
  'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳'],
  'Objects': ['❤️', '💔', '🔥', '✨', '⭐', '💫', '💯', '💰', '💎', '👑', '💣', '💥', '🎉', '🎁', '🚀', '🛸', '💻', '📱', '💡', '💀', '🔑', '🔒', '🎲', '🎯', '🎮', '🎰'],
};

const GIF_LIST: { url: string; alt: string }[] = [
  // Custom Stickers
  { url: 'https://i.ibb.co/snStV3s/gambagif.gif', alt: 'gamba pepe twitch emote animated' },
  { url: 'https://media.tenor.com/2y6s2a3soiQAAAAC/pepe-pepe-the-frog.gif', alt: 'pepe money cash rain' },
  
  // Reactions
  { url: 'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif', alt: 'ok okay done deal sure' },
  { url: 'https://media.giphy.com/media/3o6wNTC6U7sffE2i3K/giphy.gif', alt: 'thanks thank you grateful' },
  { url: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', alt: 'what confusion huh' },
  { url: 'https://media.giphy.com/media/26BRDHKiGS4pS5c6Q/giphy.gif', alt: 'please pretty please begging' },
  { url: 'https://media.giphy.com/media/3o6ZtpxSZbQRR7bA4M/giphy.gif', alt: 'hi hello hey greeting' },
  { url: 'https://media.giphy.com/media/3o6ZtaAci85SelTuW4/giphy.gif', alt: 'wow amazing surprised impressed' },
  { url: 'https://media.giphy.com/media/3o7TKS6AWINqbg3x6M/giphy.gif', alt: 'no nope never' },
  { url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', alt: 'omg oh my god shocking gasp' },
  { url: 'https://media.giphy.com/media/3oKIPEh5P3S42qNnkI/giphy.gif', alt: 'yes absolutely agree thumbs up' },
  { url: 'https://media.giphy.com/media/l0HlHFRbBJ3v1g70k/giphy.gif', alt: 'congrats congratulations celebration' },
  { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', alt: 'good luck wishing luck fingers crossed' },
  { url: 'https://media.giphy.com/media/3o72FfM5HJydzafgUE/giphy.gif', alt: 'lol what confused blinking' },

  // Memes & Pop Culture
  { url: 'https://media.giphy.com/media/gVoBC0SuaHStq/giphy.gif', alt: 'dancing baby groot guardians of the galaxy' },
  { url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', alt: 'spongebob squarepants imagination rainbow' },
  { url: 'https://media.giphy.com/media/10UHeACse9w3Is/giphy.gif', alt: 'homer simpson disappears into hedge bush hiding' },
  { url: 'https://media.giphy.com/media/vKHKDIdvxvN7vTAEOM/giphy.gif', alt: 'wandavision agatha harkness wink winking' },
  { url: 'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif', alt: 'salt bae chef cooking sprinkling salt' },
  { url: 'https://media.giphy.com/media/fAnzw6YK33jMw/giphy.gif', alt: 'this is fine dog fire burning everything okay' },
  { url: 'https://media.giphy.com/media/xUPGcJ9uOAL2h5wA5a/giphy.gif', alt: 'drake hotline bling dance dancing approve disapprove' },
  { url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', alt: 'roll safe think about it smart thinking guy' },
  { url: 'https://media.giphy.com/media/d2Z4i1TGqC5_Ab8k/giphy.gif', alt: 'confused nick young what question mark' },
  { url: 'https://media.giphy.com/media/xTiTnHXbRoaZ1B1Mo8/giphy.gif', alt: 'michael jackson thriller popcorn eating watching drama' },
  { url: 'https://media.giphy.com/media/94EQmVHkveNck/giphy.gif', alt: 'minions laughing despicable me funny' },
  { url: 'https://media.giphy.com/media/l4Ep6uxU6aedrYUik/giphy.gif', alt: 'crying michael jordan sad basketball' },
  { url: 'https://media.giphy.com/media/3o7aD1zsNcOG26N9fy/giphy.gif', alt: 'blinking guy drew scanlon white guy blinking shocked' },
  { url: 'https://media.giphy.com/media/l41YqKTI3pFKuI9CE/giphy.gif', alt: 'shia labeouf just do it motivational yelling' },
  { url: 'https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif', alt: 'what the office michael scott confused' },
  { url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', alt: 'mind blown explosion head explode whoa' },
  { url: 'https://media.giphy.com/media/6eLVF7k6vQe4g/giphy.gif', alt: 'facepalm picard star trek disappointment' },
  { url: 'https://media.giphy.com/media/1jnyRP4DorCh2/giphy.gif', alt: 'deal with it sunglasses cool' },
  { url: 'https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif', alt: 'this is fine animated fire dog cartoon' },
  { url: 'https://media.giphy.com/media/26AHLBZUC1n53ozi8/giphy.gif', alt: 'slow clap orson welles citizen kane clapping' },
  { url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif', alt: 'surprised pikachu pokemon shocked gasp' },
  { url: 'https://media.giphy.com/media/yYSSBtDgbbRzq/giphy.gif', alt: 'is this a pigeon butterfly meme anime' },
  { url: 'https://media.giphy.com/media/UTY42CoHu6enDosDZ3/giphy.gif', alt: 'kombucha girl meme trying food no ew' },
  { url: 'https://media.giphy.com/media/kd5S8yE99Cim1QZ3dJ/giphy.gif', alt: 'leonardo dicaprio pointing django unchained wolf of wall street' },
  { url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', alt: 'nodding guy robert redford jeremiah johnson yes agree' },
  { url: 'https://media.giphy.com/media/qA9BnxUPmgWgU/giphy.gif', alt: 'awkward seal uncomfortable shifting eyes' },
  { url: 'https://media.giphy.com/media/oFRI4g517yWaI/giphy.gif', alt: 'dramatic chipmunk prairie dog shocking' },
  { url: 'https://media.giphy.com/media/ue1GO5902g2rK/giphy.gif', alt: 'grumpy cat no disapproving' },
  { url: 'https://media.giphy.com/media/l0MYIwrG3D92fLOYw/giphy.gif', alt: 'spitting cereal surprised spit take' },
  { url: 'https://media.giphy.com/media/26BRq3yxyHFAt9AYw/giphy.gif', alt: 'the rock dwayne johnson eyebrow raise suspicious' },
  { url: 'https://media.giphy.com/media/o75ajIFH0QnI4/giphy.gif', alt: 'shaq shaquille oneal shimmy cat wiggle dance' },
  { url: 'https://media.giphy.com/media/3o7aTskHEUdgCQAXde/giphy.gif', alt: 'confused john travolta pulp fiction lost where am i' },
  { url: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif', alt: 'elmo rise fire hell flames sesame street' },
  { url: 'https://media.giphy.com/media/51Uiuy5QBZNkoF3b2Z/giphy.gif', alt: 'hide the pain harold awkward smile trying' },
  { url: 'https://media.giphy.com/media/26gsiCIKW7ANNGEF2/giphy.gif', alt: 'oprah winfrey you get a car everyone wins' },
  { url: 'https://media.giphy.com/media/aLdiZJmmx4OVW/giphy.gif', alt: 'keanu reeves whoa matrix bill and ted' },
  { url: 'https://media.giphy.com/media/ISOckXUybVfQ4/giphy.gif', alt: 'sad pablo escobar narcos waiting lonely' },
  { url: 'https://media.giphy.com/media/rl0FOxdz7CcxO/giphy.gif', alt: 'its happening ron paul excited omg' },
  { url: 'https://media.giphy.com/media/Y2ZUWLrTy6rS0/giphy.gif', alt: 'money printer go brrr brrr printing money inflation' },
  { url: 'https://media.giphy.com/media/YnkAsbHr2IeT2a2s2T/giphy.gif', alt: 'stonks stocks meme man finance up arrow' },
  { url: 'https://media.giphy.com/media/iYfxT7U2QKR4A/giphy.gif', alt: 'doge wow such amazing shiba inu' },
  { url: 'https://media.giphy.com/media/13d2jHlSlxklVe/giphy.gif', alt: 'cat typing on laptop keyboard working' },
  { url: 'https://media.giphy.com/media/S4mv3vJ4iFjvq/giphy.gif', alt: 'waiting skeleton still waiting forever dead' },
  { url: 'https://media.giphy.com/media/9GimADqtnpAPe/giphy.gif', alt: 'nope octopus running away hiding' },
  { url: 'https://media.giphy.com/media/s239QJIh56sRW/giphy.gif', 'alt': 'spongebob thumbs up okay happy' },
  { url: 'https://media.giphy.com/media/IorAqDrjKiDcc/giphy.gif', alt: 'running away scooby doo shaggy' },
  { url: 'https://media.giphy.com/media/5wWf7H0qoWaNnkZBuc/giphy.gif', alt: 'the mandalorian this is the way star wars' },
  { url: 'https://media.giphy.com/media/l3fZFvp94RX5o7sCA/giphy.gif', alt: 'gordon ramsay idiot sandwich hells kitchen' },
  { url: 'https://media.giphy.com/media/11ISwbgCxCIoMM/giphy.gif', alt: 'disgusted penguin ew gross reaction' },
  { url: 'https://media.giphy.com/media/l2JHRhAtnJjwhBEpa/giphy.gif', alt: 'evil kermit the frog dark side meme' },
  { url: 'https://media.giphy.com/media/l1AsUURPFRq6Dbm36/giphy.gif', alt: 'arthurs fist angry clenched hand meme' },
  { url: 'https://media.giphy.com/media/13f5iwTRuiEjjW/giphy.gif', alt: 'penguin slapping another penguin slap fight' },
  { url: 'https://media.giphy.com/media/xUOxeSmFd00V7y9v56/giphy.gif', alt: 'shooting stars meme space flying' },
  { url: 'https://media.giphy.com/media/3o84U6421OOWegpQhq/giphy.gif', alt: 'sad will smith fresh prince of bel air' },
  
  // User Requested GIFs Batch 1
  { url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTF0cm9ycHhnYzNkbTJldGxvemdqNm1ra3M3dWRrZzl4eGhtNjIzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9DtQeSm8oTPos0/giphy.gif', alt: 'gordon ramsay finally good food delicious chef' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHc2b250bDVqcGFvdWdkbmNrcnp2anh6MzA3dWI0MnBkeTVoZ2M2ZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT9DPi61MmrDLzVFzq/giphy.gif', alt: 'salt bae chef cooking sprinkling salt' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHc2b250bDVqcGFvdWdkbmNrcnp2anh6MzA3dWI0MnBkeTVoZ2M2ZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26uf2YTgF5upXUTm0/giphy.gif', alt: 'homer simpson thinking smart idea the simpsons' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHc2b250bDVqcGFvdWdkbmNrcnp2anh6MzA3dWI0MnBkeTVoZ2M2ZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5JLGh44QWB4mzj8M6l/giphy.gif', alt: 'elmo shrug sesame street dont know whatever' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHc2b250bDVqcGFvdWdkbmNrcnp2anh6MzA3dWI0MnBkeTVoZ2M2ZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WOqPbwiIT5xM5CrH2a/giphy.gif', alt: 'joey friends how you doin flirting sitcom' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTZnZTh0M2F3NGhqb2dnMnEwbnd2cDlzdGt3eHA1NHhmaG5qZWx3NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/x8qsnlIveP4gcysDr2/giphy.gif', alt: 'spider-man pointing meme same identical' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZGwzMXZzYmkyYjF4ajRrZHgzN3NlZ3hudms1bnl3cTEzczdtd2k3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/p4r7XnbaZWvT4FUukB/giphy.gif', alt: 'disgusted kermit the frog ew reaction' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3a2xxNTMwemdyZmZwa2Z3d25xOXBnM3hqaHhjM2ttMzRyMXJjOHBvZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/082tETwG3TctPoP6c5/giphy.gif', alt: 'baby yoda grogu sipping tea the mandalorian watching' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzV2MThjN3QyOWE5MXdva3Zta3pvczJrNmU0aWRzaG5weXpmYnNieSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lxxOGaDRk4f7R5TkBd/giphy.gif', alt: 'gavin meme kid nervous side eye uncomfortable' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzV2MThjN3QyOWE5MXdva3Zta3pvczJrNmU0aWRzaG5weXpmYnNieSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/IfPE0x5gfa5ctKpph6/giphy.gif', alt: 'chloe meme side eye unimpressed girl' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzV2MThjN3QyOWE5MXdva3Zta3pvczJrNmU0aWRzaG5weXpmYnNieSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LR5GeZFCwDRcpG20PR/giphy.gif', alt: 'mr bean cheating looking over shoulder test' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OXpoNGR0YmYxYTZ2ZDRlZHVmd2lpMWl6amRscTV6cDV3dHAzNXRkbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TKa7fQzChHylCQ89to/giphy.gif', alt: 'crying kim kardashian sad ugly cry' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZGwzMXZzYmkyYjF4ajRrZHgzN3NlZ3hudms1bnl3cTEzczdtd2k3biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PWONG2ujs4pGNUHCxn/giphy.gif', alt: 'virgil abloh shocked oh my god wow' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXM0NzI4cXR6OHNxaGRoa2c5dWhhbzR3d25xOWNjcGNjeWRibHdicyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/s5wFafpHxqKbIEERl9/giphy.gif', alt: 'what is love jim carrey night at the roxbury dancing car head bob' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OXl3MTh1YnQ4bmtjY3V6ZXJodHQydzdpM3dtMXY0NGxiM3o5bjlrbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/s8Sh7b9lB2TOocCFqu/giphy.gif', alt: 'why salt bae crying sad' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWEzcmhzdHFwcDFlMzQxb2dmcWV0NHk3dmdmdWs0MTZ0N3J0NWhodCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GEM635swwybPa/giphy.gif', alt: 'homer simpson thinking smart idea the simpsons' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHo3ZG5vMmZkZWdyMmRtcTV0Mm55dmN5Zmc4eDMybG1ibWkxd3lvNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ffTEJW8xipu8Lao3Nz/giphy.gif', alt: 'excited toddler running happy yay' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHo3ZG5vMmZkZWdyMmRtcTV0Mm55dmN5Zmc4eDMybG1ibWkxd3lvNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/98MaHVwJOmWMz4cz1K/giphy.gif', alt: 'dog yes good boy happy nodding' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHo3ZG5vMmZkZWdyMmRtcTV0Mm55dmN5Zmc4eDMybG1ibWkxd3lvNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GRk3GLfzduq1NtfGt5/giphy.gif', alt: 'spongebob shocked screaming scared' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHo3ZG5vMmZkZWdyMmRtcTV0Mm55dmN5Zmc4eDMybG1ibWkxd3lvNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/laa75ehg46kBMGvIqe/giphy.gif', alt: 'the office dwight schrute yes finally pump fist' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dTJ6b3d2c2M1d2dsNHFybjRwOTc2a2dreXJ1c29wamV4ZmRmbnI2cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t5qY8FyyM85a0/giphy.gif', alt: 'bugs bunny no nope cartoon looney tunes' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aWNhYnQ5NDA0ZHVsemN5OTU1djQyNHVmN3dsdjkwYTJoYWFvOWp1NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/nI5KVjlMB0BXOsi4aI/giphy.gif', alt: 'head shake no disappointed will smith' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3c200Zmp0Nm5ta3VuM29xOXBha2Z2b3c5d29reW52d2JldHQzbjNieiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aCZDlmQZLe4Q4V2/giphy.gif', alt: 'dancing hot dog snapchat meme' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZjU4OTFrbHF5enU0a2wyMWU2dmRxa2FtMjR0bzFxMDBkMmV0aWpucSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/WRuBiZKB6xgsS9DrFA/giphy.gif', alt: 'kevin hart seriously stare no' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHo3ZG5vMmZkZWdyMmRtcTV0Mm55dmN5Zmc4eDMybG1ibWkxd3lvNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M6bJf9VBmrN1qTtPyL/giphy.gif', alt: 'clapping applause well done john cena wwe' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWhheXZwZWN2dTh4c2ZmdWE1bzViaWpsMGd4ODM5ZG5lbzA2bWlndyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Y1ofdaEmF78SIKcILt/giphy.gif', alt: 'cat jam vibing head bobbing music' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWhheXZwZWN2dTh4c2ZmdWE1bzViaWpsMGd4ODM5ZG5lbzA2bWlndyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sjhJsXvgiD8P9KJZIL/giphy.gif', alt: 'pop cat meme open mouth popping' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3B3cnBxbGl6NnVzbno3aGExc2JrYTZraTQ1dTRrMTVrN3V2azMxYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/nCJ1YzZr6I9RG0lflt/giphy.gif', alt: 'pepe the frog happy dance smiling' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjUweHhsaTdqdmkzbG96N2JvYXgxNmc5NnQ3N291bTd2NWo1N2t0NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Ko261YbCdpOSVgOsaq/giphy.gif', alt: 'among us twerk dance meme game' },

  // User Requested GIFs Batch 2
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3lxNm1qc2IzY21wdXllYTY4enR0NDlsYnBqYXNoa3N6bHFyb2QwMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0ErJaDQ2Q3onCenS/giphy.gif', alt: 'homer simpson thinking smart idea' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3lxNm1qc2IzY21wdXllYTY4enR0NDlsYnBqYXNoa3N6bHFyb2QwMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0OWiTdUNM8lUyzUk/giphy.gif', alt: 'homer simpson drooling donut' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3M2t5c2x1MWVwOWhzNmhrd3A0cWV0ZHRjMnhsb3RkMDJ5NjQ5bjBlZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7xsGLaV0pFiyMo9Sur/giphy.gif', alt: 'pepe the frog smug feels good man' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGN0NjU2ZTdlcGExbWcybnR0Z3J1aW1yajlpems0NHNzNDdzOTllbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sXv0vaA4331Ti/giphy.gif', alt: 'cat typing fast on laptop working' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjF0a2gwaHoyN3IzcXptN293ODd2amdicmpyMWNscmZieHhwZWR1NCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Rk8CZk8M7UHzG/giphy.gif', alt: 'spongebob screaming running panic' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODM0NjkwYWlsYW4zaDM3ank5c3ZiZmY5cnhtZ25uZmN5N3kyaXg2aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26hitR98FMcJdz3MY/giphy.gif', alt: 'confused john travolta pulp fiction where am i' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODM0NjkwYWlsYW4zaDM3ank5c3ZiZmY5cnhtZ25uZmN5N3kyaXg2aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o8dp6sLazhSsbQwNi/giphy.gif', alt: 'kermit the frog sipping tea none of my business' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODM0NjkwYWlsYW4zaDM3ank5c3ZiZmY5cnhtZ25uZmN5N3kyaXg2aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZNnnp4wa17dZrDQKKI/giphy.gif', alt: 'kevin hart laughing lol funny' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3a3ZvbGpjbWRtMmdzcXBsNTBiZ3E4ZHBoOXplMXc5Z3plenVhcnFkNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LdOyjZ7io5Msw/giphy.gif', alt: 'cat no disgusted shaking head' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3c2h3bmg4anY4d210dTF3ajRoZjN6bmE3Z3BleXpqcGYwdHprcmQ2ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MFsqcBSoOKPbjtmvWz/giphy.gif', alt: 'squidward dancing happy spongebob' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d2s2a2lhMjBpemI1MjQwNG15Mjhxc2p0MTFma2IyeG5kN2Fna29sayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/kj41Ti8GLVs1STX0bH/giphy.gif', alt: 'sad cat thumbs up okay' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2FrM2NteWY2cnVybDY3OHYzczVwYzhmZ2VtdXo5c296dmhuYXZpaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vlOyaRZMZnlSmCzIk8/giphy.gif', alt: 'cat vibing listening to music headphones' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2FrM2NteWY2cnVybDY3OHYzczVwYzhmZ2VtdXo5c296dmhuYXZpaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/XYTKKgSOmRe5POkeYO/giphy.gif', alt: 'crying cat meme sad' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2FrM2NteWY2cnVybDY3OHYzczVwYzhmZ2VtdXo5c296dmhuYXZpaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1HsHmLma6dWTD2ILJY/giphy.gif', alt: 'cat politely standing meme' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2FrM2NteWY2cnVybDY3OHYzczVwYzhmZ2VtdXo5c296dmhuYXZpaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/p8hVhPEnylRCXGjtNJ/giphy.gif', alt: 'angry cat yelling meme' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2FrM2NteWY2cnVybDY3OHYzczVwYzhmZ2VtdXo5c296dmhuYXZpaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/j0vs5H7Kcz3Pm9LRDa/giphy.gif', alt: 'cat thumbs up okay good job' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3oxa3MzbXJvaTF6ZnZxbG93YmhoMTBhN2hhcTd2aHIyN2NqaHFkdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GXTBxGSJ4r1569moBW/giphy.gif', alt: 'patrick star evil laugh spongebob' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZDF3OGdkeDVuMjFhd2hhOW5sY2t1d3BteHllZ2JlOWVtcXo2amV3ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lEIIXxrbNlsiuCSaZa/giphy.gif', alt: 'excited spongebob screaming happy' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZDF3OGdkeDVuMjFhd2hhOW5sY2t1d3BteHllZ2JlOWVtcXo2amV3ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3nKiYj7baVMPrfERv/giphy.gif', alt: 'spongebob what confused thinking' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTF0bGp6N2k4N3R2YXhqMzN6NjZnb3l1cTlpdmh5aDV6YXJwYmZwYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/zn0Ph1TLD9S5ALLHgC/giphy.gif', alt: 'spongebob tired exhausted done' },

  // User Requested GIFs Batch 3
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTVwM2hnMTE0eHMxejJhZjZrdXU3OTVtNXV1eHE1a3RqNzRiNWZsdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/RM5m5NoNRtuYCj1szf/giphy.gif', alt: 'homer simpson hmm thinking' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVkcjR4OXIydGo3eDhjMHVsbjhuNWg1YmYxcnpnb3U3Y3gwd21qbSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5yYoECDolGySFHKZYl/giphy.gif', alt: 'the rock dwayne johnson clapping applause good job' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWR2dzJqcDVhOWx2ZXd4Z2p2c2xra3hwNHA4aDFhdnpzZmVhb3ZzNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fRP81yxtnaGIoTAIDK/giphy.gif', alt: 'baby yoda grogu hello there wave' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWR2dzJqcDVhOWx2ZXd4Z2p2c2xra3hwNHA4aDFhdnpzZmVhb3ZzNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/T4IiGQVWCJcKf4vi8M/giphy.gif', alt: 'man blinking confused really' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWR2dzJqcDVhOWx2ZXd4Z2p2c2xra3hwNHA4aDFhdnpzZmVhb3ZzNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/9Gwpg9GpQg3HyqAIvh/giphy.gif', alt: 'man nodding yes agree' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGUwdnNneDl6NW10cmZhNzRrbDhkMGQ5NTA1M2RvamxieWVlc2xuZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/HEx5JTH3D6H1OgnBnd/giphy.gif', alt: 'crying man sad emotion' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmF5OXh5eWY1emJxNXFzMmh0bHF4ODZraXZucWdiZngwajRrNnV1eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/R312C3MEVg4SCYAber/giphy.gif', alt: 'man typing on computer work coding' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmF5OXh5eWY1emJxNXFzMmh0bHF4ODZraXZucWdiZngwajRrNnV1eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GusNfQJKBKfqpoI1QP/giphy.gif', alt: 'man pointing laughing haha funny' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2luOTZlOGJ3dmNoMWowczJ5NWIxMmU1MzYyaWRva2ltYmZjYzZvciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/obBRY85qHrHIOX7TsF/giphy.gif', alt: 'kid sunglasses dancing cool groovy' },
];

const MediaPicker: React.FC<{
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (gifUrl: string) => void;
}> = ({ onEmojiSelect, onGifSelect }) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'gifs' | 'favorites'>('emojis');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [gifSearch, setGifSearch] = useState('');
  const [favoriteGifs, setFavoriteGifs] = useState<{ url: string; alt: string }[]>([]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteGifs');
      if (savedFavorites) {
        setFavoriteGifs(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Could not load favorite GIFs from localStorage", error);
    }
  }, []);

  const toggleFavorite = (gif: { url: string; alt: string }) => {
    setFavoriteGifs(prev => {
      const isFav = prev.some(f => f.url === gif.url);
      const newFavs = isFav ? prev.filter(f => f.url !== gif.url) : [...prev, gif];
      try {
        localStorage.setItem('favoriteGifs', JSON.stringify(newFavs));
      } catch (e) {
        console.error('Failed to save favorite GIFs', e);
      }
      return newFavs;
    });
  };

  const isFavorite = (gifUrl: string) => favoriteGifs.some(fav => fav.url === gifUrl);

  const filteredGifs = gifSearch
    ? GIF_LIST.filter(gif => gif.alt.toLowerCase().includes(gifSearch.toLowerCase()))
    : GIF_LIST;
  
  const GifItem: React.FC<{gif: {url: string; alt: string}}> = ({ gif }) => (
    <div className="group relative aspect-square">
        <button 
            onClick={() => onGifSelect(gif.url)} 
            className="w-full h-full rounded-md overflow-hidden hover:ring-2 ring-primary ring-offset-2 ring-offset-card"
        >
            <img src={gif.url} alt={gif.alt} className="w-full h-full object-cover" loading="lazy"/>
        </button>
        <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(gif); }}
            className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:text-yellow-400"
            aria-label={isFavorite(gif.url) ? 'Remove from favorites' : 'Add to favorites'}
        >
            <StarIcon className="w-4 h-4" filled={isFavorite(gif.url)} />
        </button>
    </div>
  );

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-card border border-outline rounded-lg shadow-lg z-20 w-80 h-96 flex flex-col">
      <div className="flex-shrink-0 flex border-b border-outline">
        <button 
          onClick={() => setActiveTab('emojis')} 
          className={`flex-1 p-2 flex justify-center items-center transition-colors ${activeTab === 'emojis' ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5'}`}
          aria-label="Show emojis"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('gifs')} 
          className={`flex-1 p-2 flex justify-center items-center transition-colors ${activeTab === 'gifs' ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5'}`}
          aria-label="Show GIFs"
        >
          <PlayCircleIcon className="w-6 h-6" />
        </button>
         <button 
          onClick={() => setActiveTab('favorites')} 
          className={`flex-1 p-2 flex justify-center items-center transition-colors ${activeTab === 'favorites' ? 'bg-white/10 text-yellow-400' : 'text-text-muted hover:bg-white/5'}`}
          aria-label="Show Favorite GIFs"
        >
          <StarIcon className="w-6 h-6" filled={activeTab === 'favorites'}/>
        </button>
      </div>

      {activeTab === 'emojis' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-shrink-0 flex space-x-1 p-2 overflow-x-auto no-scrollbar border-b border-outline">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button 
                key={category} 
                onClick={() => setActiveEmojiCategory(category)} 
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${activeEmojiCategory === category ? 'bg-primary text-background' : 'text-text-muted hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeEmojiCategory].map(emoji => (
                <button key={emoji} onClick={() => onEmojiSelect(emoji)} className="text-2xl rounded-md hover:bg-white/10 transition-colors p-1" aria-label={`Select emoji ${emoji}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'gifs' && (
        <div className="flex-1 overflow-y-auto p-2 flex flex-col min-h-0">
            <div className="relative mb-2 flex-shrink-0">
                <SearchIcon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search GIFs..."
                    value={gifSearch}
                    onChange={(e) => setGifSearch(e.target.value)}
                    className="w-full bg-background border border-border-color rounded-md py-2 pl-9 pr-4 text-sm placeholder-text-muted focus:ring-1 focus:ring-primary focus:outline-none"
                />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredGifs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {filteredGifs.map(gif => <GifItem key={gif.url} gif={gif} />)}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-muted text-sm">
                        No GIFs found.
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'favorites' && (
         <div className="flex-1 overflow-y-auto p-2 flex flex-col min-h-0">
             <div className="flex-1 overflow-y-auto no-scrollbar">
                {favoriteGifs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                         {favoriteGifs.map(gif => <GifItem key={gif.url} gif={gif} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted text-sm text-center px-4">
                        <StarIcon className="w-10 h-10 mb-2 text-yellow-400/50" />
                        <p className="font-semibold">No Favorites Yet</p>
                        <p>Click the star on a GIF to save it here.</p>
                    </div>
                )}
            </div>
         </div>
      )}
    </div>
  );
};


const RankIconDisplay: React.FC<{ wagered: number | undefined }> = ({ wagered }) => {
    if (wagered === undefined) return null;
    
    const levelInfo = calculateLevelInfo(wagered);
    const rank = getRankForLevel(levelInfo.level);

    if (!rank) return null;

    return (
        <div className="group relative flex-shrink-0" title={`Level ${levelInfo.level}`}>
            <img src={rank.image} alt={rank.name} className="w-5 h-5" />
        </div>
    );
};

const Message: React.FC<{ msg: ChatMessage, onUserClick: (event: React.MouseEvent, user: { id: string, username: string }) => void }> = React.memo(({ msg, onUserClick }) => {
    const gifRegex = /^(https?:\/\/.+\.gif)$/i;
    const isGif = gifRegex.test(msg.message);
    
    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-md">
            <button onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })} className="flex-shrink-0">
                <img src={msg.profiles.avatar_url || 'https://i.imgur.com/L4pP31z.png'} alt={msg.profiles.username} className="w-8 h-8 rounded-full mt-0.5" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                    <RankIconDisplay wagered={msg.profiles.wagered} />
                    <button
                      onClick={(e) => onUserClick(e, { id: msg.user_id, username: msg.profiles.username })}
                      className="font-bold text-sm text-primary-light hover:underline text-left truncate"
                    >
                      {msg.profiles.username}
                    </button>
                </div>
                {isGif ? (
                    <img src={msg.message} alt="GIF from user" className="mt-1 rounded-lg max-w-full h-auto" />
                ) : (
                    <p className="text-sm text-text-main/90 break-words">{msg.message}</p>
                )}
            </div>
        </div>
    );
});

export const ChatRail: React.FC<ChatRailProps> = ({ session, onClose, onTipUser, onViewProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [channelName] = useState(() => `realtime-chat-${crypto.randomUUID()}`);
    const [contextMenu, setContextMenu] = useState<{ user: { id: string; username: string }, position: { x: number, y: number } } | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const chatFormRef = useRef<HTMLDivElement>(null);

    // Anti-spam state
    const [canSendMessage, setCanSendMessage] = useState(true);
    const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [muteEndTime, setMuteEndTime] = useState(0);
    const [timeUntilUnmute, setTimeUntilUnmute] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const handleNewMessage = (payload: any) => {
            const newMsg = payload.new as Omit<ChatMessage, 'profiles'> & { id: string; user_id: string };
            
            supabase
                .from('profiles')
                .select('username, avatar_url, wagered')
                .eq('id', newMsg.user_id)
                .single()
                .then(({ data: profileData }) => {
                    if (!profileData) return;
                    const finalMessage: ChatMessage = {
                        ...newMsg,
                        profiles: profileData as any
                    };
                    
                    setMessages(currentMessages => {
                        if (currentMessages.some(msg => msg.id === finalMessage.id)) {
                            return currentMessages;
                        }
                        return [...currentMessages, finalMessage];
                    });
                });
        };

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                handleNewMessage
            )
            .subscribe(async (status, err) => {
                if (err) {
                     console.error(`Real-time chat subscription error on channel ${channelName}:`, err);
                     return;
                }
                
                if (status === 'SUBSCRIBED') {
                    const { data, error } = await supabase
                        .from('chat_messages')
                        .select(`*, profiles(username, avatar_url, wagered)`)
                        .order('created_at', { ascending: true })
                        .limit(100);
                    
                    if (error) {
                        console.error("Error fetching initial messages:", error);
                    } else if (data) {
                        setMessages(data as any);
                    }
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelName]);

    const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
        if (e) e.preventDefault();
        if (!session || !canSendMessage || isMuted || loading) return;

        const messageContent = contentOverride || newMessage.trim();
        if (messageContent === '') return;

        const now = Date.now();
        const recentTimestamps = [...messageTimestamps, now].filter(ts => now - ts < 5000);
        setMessageTimestamps(recentTimestamps);

        if (recentTimestamps.length > 4) {
            setIsMuted(true);
            setMuteEndTime(now + 10000);
            setMessageTimestamps([]);
            setNewMessage('');
            return;
        }

        setLoading(true);
        setCanSendMessage(false);

        if (!contentOverride) {
            setNewMessage('');
            setIsPickerOpen(false);
        }

        const { error } = await supabase.from('chat_messages').insert({
            user_id: session.user.id,
            message: messageContent,
        });
        
        setLoading(false);
        setTimeout(() => setCanSendMessage(true), 2000);

        if (error) {
            if (!contentOverride) {
                setNewMessage(messageContent);
            }
            console.error("Error sending message:", error);
        }
    };
    
    useEffect(() => {
        if (!isMuted) return;
        const interval = setInterval(() => {
            const timeLeft = Math.ceil((muteEndTime - Date.now()) / 1000);
            if (timeLeft <= 0) {
                setIsMuted(false);
                clearInterval(interval);
            } else {
                setTimeUntilUnmute(timeLeft);
            }
        }, 500);
        setTimeUntilUnmute(Math.ceil((muteEndTime - Date.now()) / 1000));
        return () => clearInterval(interval);
    }, [isMuted, muteEndTime]);
    
    const handleUserClick = (event: React.MouseEvent, user: { id: string; username: string }) => {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setContextMenu({
            user,
            position: { x: rect.left - 150, y: rect.top } 
        });
    };

    const handleIgnore = (userId: string) => {
        console.log(`Ignoring user ${userId}`);
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const handleGifSelect = (gifUrl: string) => {
        if (!session || !canSendMessage || isMuted || loading) return;
        handleSendMessage(undefined, gifUrl);
        setIsPickerOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatFormRef.current && !chatFormRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-sidebar h-full flex flex-col border-l border-border-color">
            {contextMenu && (
                <ChatUserContextMenu
                    user={contextMenu.user}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                    onProfile={onViewProfile}
                    onTip={onTipUser}
                    onIgnore={handleIgnore}
                />
            )}
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border-color">
                <div>
                    <h2 className="font-bold text-white">Chat</h2>
                    <div className="flex items-center space-x-1.5 text-xs text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>2,345 Online</span>
                    </div>
                </div>
                {onClose && (
                     <button onClick={onClose} className="p-2 text-text-muted hover:text-white xl:hidden" aria-label="Close chat">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                )}
            </header>
            
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2">
                {messages.map(msg => (
                    <Message key={msg.id} msg={msg} onUserClick={handleUserClick} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div ref={chatFormRef} className="p-4 flex-shrink-0">
                {session ? (
                     isMuted ? (
                        <div className="text-center text-sm text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                            You are muted for spamming.
                            <br />
                            Please wait <span className="font-bold">{timeUntilUnmute}s</span>.
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="relative">
                            {isPickerOpen && <MediaPicker onEmojiSelect={handleEmojiSelect} onGifSelect={handleGifSelect} />}
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-background border border-border-color rounded-lg py-3 pl-4 pr-24 text-sm placeholder-text-muted focus:ring-2 focus:ring-primary focus:outline-none transition"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center">
                                 <button 
                                    type="button" 
                                    onClick={() => setIsPickerOpen(o => !o)} 
                                    className="px-3 text-text-muted hover:text-white"
                                    aria-label="Open emoji and GIF picker"
                                 >
                                    <FaceSmileIcon className="w-6 h-6" />
                                 </button>
                                 <button
                                     type="submit"
                                     disabled={loading || !canSendMessage || newMessage.trim() === ''}
                                     className="px-3 text-primary disabled:text-text-muted"
                                     aria-label="Send message"
                                     title={!canSendMessage ? 'Sending too fast' : 'Send'}
                                 >
                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                 </button>
                             </div>
                        </form>
                    )
                ) : (
                    <div className="text-center text-sm text-text-muted p-4 bg-background rounded-lg">
                        Please <span className="font-bold text-primary">log in</span> to chat.
                    </div>
                )}
            </div>
        </div>
    );
};