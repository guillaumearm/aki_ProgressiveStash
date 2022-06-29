import { DependencyContainer } from "tsyringe";

import type { IMod } from "@spt-aki/models/external/mod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { getModDisplayName, noop, readJsonFile } from "./utils";
import { Config, CONFIG_PATH } from "./config";

const DEBUG = true;

class Mod implements IMod {
  private logger: ILogger;
  private debug: (data: string) => void;
  private config: Config;

  public load(container: DependencyContainer): void {
    this.config = readJsonFile(CONFIG_PATH);

    this.logger = container.resolve<ILogger>("WinstonLogger");

    this.debug = DEBUG
      ? (data: string) =>
          this.logger.debug(`${getModDisplayName(false)}: ${data}`, true)
      : noop;

    if (DEBUG) {
      this.debug("debug mode enabled");
    }

    this.logger.info(`===> Loading ${getModDisplayName(true)}`);
  }

  public delayedLoad(container: DependencyContainer): void {
    this.logger.success(`===> Successfully loaded ${getModDisplayName(true)}`);
  }
}

module.exports = { mod: new Mod() };
