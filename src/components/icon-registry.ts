// Single seam for swapping icon sources later: every icon the app uses is
// registered here by name. AppIcon.vue never imports an icon library directly.
//
// UI icons come from Material Symbols (per-icon SVG, not the full font — keeps
// the bundle small since only icons actually used get imported).
// Brand icons come from simple-icons. Some brands (e.g. LinkedIn) have been
// removed from simple-icons at the trademark holder's request; add a custom
// SVG under src/assets/icons/ and import it here if you need one that's missing.

import home from "@material-symbols/svg-400/outlined/home.svg?raw";
import work from "@material-symbols/svg-400/outlined/work.svg?raw";
import school from "@material-symbols/svg-400/outlined/school.svg?raw";
import militaryTech from "@material-symbols/svg-400/outlined/military_tech.svg?raw";
import volunteerActivism from "@material-symbols/svg-400/outlined/volunteer_activism.svg?raw";
import language from "@material-symbols/svg-400/outlined/language.svg?raw";
import deployedCode from "@material-symbols/svg-400/outlined/deployed_code.svg?raw";
import playCircle from "@material-symbols/svg-400/outlined/play_circle.svg?raw";
import link from "@material-symbols/svg-400/outlined/link.svg?raw";
import publicIcon from "@material-symbols/svg-400/outlined/public.svg?raw";
import interests from "@material-symbols/svg-400/outlined/interests.svg?raw";
import rocketLaunch from "@material-symbols/svg-400/outlined/rocket_launch.svg?raw";
import visibility from "@material-symbols/svg-400/outlined/visibility.svg?raw";
import visibilityOff from "@material-symbols/svg-400/outlined/visibility_off.svg?raw";
import openInNew from "@material-symbols/svg-400/outlined/open_in_new.svg?raw";
import arrowBack from "@material-symbols/svg-400/outlined/arrow_back.svg?raw";
import mail from "@material-symbols/svg-400/outlined/mail.svg?raw";
import call from "@material-symbols/svg-400/outlined/call.svg?raw";
import locationOn from "@material-symbols/svg-400/outlined/location_on.svg?raw";
import download from "@material-symbols/svg-400/outlined/download.svg?raw";
import person from "@material-symbols/svg-400/outlined/person.svg?raw";

import github from "simple-icons/icons/github.svg?raw";
import youtube from "simple-icons/icons/youtube.svg?raw";
import x from "simple-icons/icons/x.svg?raw";
import instagram from "simple-icons/icons/instagram.svg?raw";
import mastodon from "simple-icons/icons/mastodon.svg?raw";
import bluesky from "simple-icons/icons/bluesky.svg?raw";
import discord from "simple-icons/icons/discord.svg?raw";
import buymeacoffee from "simple-icons/icons/buymeacoffee.svg?raw";
import patreon from "simple-icons/icons/patreon.svg?raw";
import kofi from "simple-icons/icons/kofi.svg?raw";
import githubsponsors from "simple-icons/icons/githubsponsors.svg?raw";

export const iconRegistry = {
  home,
  work,
  school,
  "military-tech": militaryTech,
  "volunteer-activism": volunteerActivism,
  language,
  "deployed-code": deployedCode,
  "play-circle": playCircle,
  link,
  public: publicIcon,
  interests,
  "rocket-launch": rocketLaunch,
  visibility,
  "visibility-off": visibilityOff,
  "open-in-new": openInNew,
  "arrow-back": arrowBack,
  mail,
  call,
  "location-on": locationOn,
  download,
  person,

  github,
  youtube,
  x,
  instagram,
  mastodon,
  bluesky,
  discord,
  buymeacoffee,
  patreon,
  kofi,
  githubsponsors,
} as const;

export type IconName = keyof typeof iconRegistry;
