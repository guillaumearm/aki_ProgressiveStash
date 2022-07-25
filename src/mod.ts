import type { DependencyContainer } from "tsyringe";

import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";

import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

import { getModDisplayName, noop, readJsonFile } from "./utils";
import type { Config } from "./config";
import { CONFIG_PATH } from "./config";
import { StashBuilder } from "./stash-builder";
import { SecureContainersController } from "./secure-containers";
import {
  ALPHA_CONTAINER_ID,
  EDGE_OF_DARKNESS_STASH_ID,
  PROFILE_TEMPLATE_NAME,
  STANDARD_STASH_ID,
  STASH_AREA,
} from "./constants";

const uglyClone = (data: any): any => {
  return JSON.parse(JSON.stringify(data));
};

class ProfieTemplateBuilder {
  private setStashLevelOne(usecOrBear: any): boolean {
    const character = usecOrBear.character;
    const hideout = character.Hideout;
    const inventory = character.Inventory;

    // 1. set stash area to level 1
    hideout.Areas = hideout.Areas.map((area: any) => {
      if (area.type === STASH_AREA) {
        return { ...area, level: 1 };
      }
      return area;
    });

    // 2. set bonuses StashSize to Standard stash
    character.Bonuses = [
      {
        type: "StashSize",
        templateId: STANDARD_STASH_ID,
      },
    ];

    // 3. set encyclopedia entry
    character.Encyclopedia[STANDARD_STASH_ID] = false;

    let id = "";

    // 4. add stash instance
    inventory.items = inventory.items.map((item) => {
      if (item._tpl === EDGE_OF_DARKNESS_STASH_ID) {
        id = item._id;
        return { ...item, _tpl: STANDARD_STASH_ID };
      }
      return item;
    });

    // 5. set current stash inventory
    if (id) {
      inventory.stash = id;
      return true;
    }

    return false;
  }

  private setAlphaAsSecureContainer(usecOrBear: any): void {
    const inventory = usecOrBear.character.Inventory;

    inventory.items = inventory.items.map((item) => {
      if (item.slotId === "SecuredContainer") {
        return { ...item, _tpl: ALPHA_CONTAINER_ID };
      }

      return item;
    });
  }

  buildStashProfileTemplate(db: DatabaseServer): boolean {
    const profiles = db.getTables().templates.profiles;

    const profile = uglyClone(profiles["Edge Of Darkness"]);

    if (!profile) {
      return false;
    }

    this.setStashLevelOne(profile.usec);
    this.setStashLevelOne(profile.bear);

    this.setAlphaAsSecureContainer(profile.usec);
    this.setAlphaAsSecureContainer(profile.bear);

    profiles[PROFILE_TEMPLATE_NAME] = profile;
    return true;
  }
}

class Mod implements IPreAkiLoadMod, IPostAkiLoadMod {
  private logger: ILogger;
  private debug: (data: string) => void;
  private config: Config;

  private profileTemplateBuilder: ProfieTemplateBuilder;
  private stashBuilder: StashBuilder;
  private secureContainersController: SecureContainersController;

  public preAkiLoad(container: DependencyContainer): void {
    this.config = readJsonFile(CONFIG_PATH);

    this.profileTemplateBuilder = new ProfieTemplateBuilder();
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

  public postAkiLoad(container: DependencyContainer): void {
    const db = container.resolve<DatabaseServer>("DatabaseServer");

    const nbStagesCreated = this.stashBuilder.injectStashesToDb(db);
    if (nbStagesCreated > 0) {
      this.debug(
        `injected ${nbStagesCreated} stages into database.hideout.areas`
      );
    }

    const nbCreatedCrafts =
      this.secureContainersController.injectCraftsToDb(db);
    if (nbCreatedCrafts > 0) {
      this.debug(
        `injected ${nbCreatedCrafts} new workbench crafts into database.hideout.production`
      );
    }

    const nbContainerTweaked =
      this.secureContainersController.tweakContainerDimensions(db);
    if (nbContainerTweaked > 0) {
      this.debug(`${nbContainerTweaked} secure containers dimensions updated`);
    }

    if (this.profileTemplateBuilder.buildStashProfileTemplate(db)) {
      this.debug(`created "${PROFILE_TEMPLATE_NAME}" profile template`);
    }

    this.logger.success(`===> Successfully loaded ${getModDisplayName(true)}`);
  }
}

module.exports = { mod: new Mod() };
