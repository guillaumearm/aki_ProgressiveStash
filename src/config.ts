import type { Requirement as RequirementArea } from "@spt-aki/models/eft/hideout/IHideoutArea";
import type { Requirement as RequirementProduction } from "@spt-aki/models/eft/hideout/IHideoutProduction";

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
  requirements: RequirementArea[];
};

export type SecureContainerConfig = {
  dimensions: [number, number];
  requirements: RequirementProduction[];
};

export type SecureContainers = {
  pouch?: SecureContainerConfig;
  alpha?: SecureContainerConfig;
  beta?: SecureContainerConfig;
  epsilon?: SecureContainerConfig;
  gamma?: SecureContainerConfig;
  kappa?: SecureContainerConfig;
};

export type Config = {
  debug?: boolean;
  initial_stash_size: number;
  stash_upgrades: StashUpgrade[];
  secure_containers: SecureContainers;
};

/**
 * Paths
 */
export const PACKAGE_JSON_PATH = resolve(__dirname, "..", "package.json");
export const CONFIG_PATH = resolve(__dirname, "..", "config/config.json");
