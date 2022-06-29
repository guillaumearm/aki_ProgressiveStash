import { resolve } from "path";

/**
 * package.json
 */
export type PackageJson = {
  name: string;
  displayName: string;
  version: string;
};

/**
 * config/config.json
 */
export type Config = {
  initial_stash_size: number;
};

export const PACKAGE_JSON_PATH = resolve(__dirname, "..", "package.json");
export const CONFIG_PATH = resolve(__dirname, "..", "config/config.json");
