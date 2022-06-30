import type { DependencyContainer } from "tsyringe";

import type { IMod } from "@spt-aki/models/external/mod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

import { getModDisplayName, noop, readJsonFile } from "./utils";
import { Config, CONFIG_PATH } from "./config";
import { StashBuilder } from "./stash-builder";
import { SecureContainersController } from "./secure-containers";

class Mod implements IMod {
  private logger: ILogger;
  private debug: (data: string) => void;
  private config: Config;

  private stashBuilder: StashBuilder;
  private secureContainersController: SecureContainersController;

  public load(container: DependencyContainer): void {
    this.config = readJsonFile(CONFIG_PATH);
    this.stashBuilder = new StashBuilder(this.config);
    this.secureContainersController = new SecureContainersController(
      this.config
    );

    this.logger = container.resolve<ILogger>("WinstonLogger");

    this.debug = this.config.debug
      ? (data: string) =>
          this.logger.debug(`${getModDisplayName(false)}: ${data}`, true)
      : noop;

    if (this.config.debug) {
      this.debug("debug mode enabled");
    }

    this.logger.info(`===> Loading ${getModDisplayName(true)}`);
  }

  public delayedLoad(container: DependencyContainer): void {
    const db = container.resolve<DatabaseServer>("DatabaseServer");

    const nbStashCreated = this.stashBuilder.injectStashesToDb(db);
    if (nbStashCreated > 0) {
      this.debug(
        `injected ${nbStashCreated} new progressive stashes into database`
      );
    }

    const nbCreatedCrafts =
      this.secureContainersController.injectCraftsToDb(db);
    if (nbCreatedCrafts > 0) {
      this.debug(`injected ${nbCreatedCrafts} new workbench crafts`);
    }

    const nbContainerTweaked =
      this.secureContainersController.tweakContainerDimensions(db);
    if (nbContainerTweaked > 0) {
      this.debug(`${nbContainerTweaked} secure containers dimensions updated`);
    }

    this.logger.success(`===> Successfully loaded ${getModDisplayName(true)}`);
  }
}

module.exports = { mod: new Mod() };
