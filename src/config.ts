import { Requirement } from "@spt-aki/models/eft/hideout/IHideoutArea";
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
export type StashUpgrade = {
  size: number;
  requirements: Requirement[];
};

export type SecureContainersCrafts = {
  pouch?: Requirement[];
  alpha?: Requirement[];
  beta?: Requirement[];
  epsilon?: Requirement[];
  gamma?: Requirement[];
  kappa?: Requirement[];
};

export type Config = {
  initial_stash_size: number;
  stash_upgrades: StashUpgrade[];
  secure_containers_crafts: SecureContainersCrafts;
};

/**
 * Paths
 */
export const PACKAGE_JSON_PATH = resolve(__dirname, "..", "package.json");
export const CONFIG_PATH = resolve(__dirname, "..", "config/config.json");
