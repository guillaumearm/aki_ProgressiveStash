import type { IStageRequirement as StageRequirement } from "@spt-aki/models/eft/hideout/IHideoutArea";
import type { Requirement as ProductionRequirement } from "@spt-aki/models/eft/hideout/IHideoutProduction";

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
  requirements: StageRequirement[];
};

export type SecureContainerConfig = {
  not_craftable?: boolean;
  dimensions: [number, number];
  requirements: ProductionRequirement[];
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
  disabled?: boolean;
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
