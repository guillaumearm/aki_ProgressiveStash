import { readFileSync } from "fs";
import { PackageJson, PACKAGE_JSON_PATH } from "./config";
import {
  EDGE_OF_DARKNESS_STASH_ID,
  LEFT_BEHIND_STASH_ID,
  PREPARE_FOR_ESCAPE_STASH_ID,
  PROGRESSIVE_STASH_PREFIX_ID,
  STANDARD_STASH_ID,
} from "./constants";

export const readJsonFile = <T>(path: string): T => {
  return JSON.parse(readFileSync(path, "utf-8"));
};

export const packageJson = readJsonFile<PackageJson>(PACKAGE_JSON_PATH);

export const getModDisplayName = (withVersion = false): string => {
  if (withVersion) {
    return `${packageJson.displayName} v${packageJson.version}`;
  }
  return `${packageJson.displayName}`;
};

export function noop(): void {}

export const getStashId = (index: number): string => {
  switch (index) {
    case 1:
      return STANDARD_STASH_ID;
    case 2:
      return LEFT_BEHIND_STASH_ID;
    case 3:
      return PREPARE_FOR_ESCAPE_STASH_ID;
    case 4:
      return EDGE_OF_DARKNESS_STASH_ID;
    default:
      return `${PROGRESSIVE_STASH_PREFIX_ID}_${index}`;
  }
};
