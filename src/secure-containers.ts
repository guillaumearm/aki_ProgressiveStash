import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import type {
  IHideoutProduction,
  Requirement as RequirementProduction,
} from "@spt-aki/models/eft/hideout/IHideoutProduction";

import type { Config, SecureContainers } from "./config";
import { SECURE_CONTAINERS, WORKBENCH_AREA } from "./constants";

const createCraft = (
  itemId: string,
  requirements: RequirementProduction[]
): IHideoutProduction => {
  return {
    _id: `${itemId}_craft`,
    areaType: WORKBENCH_AREA,
    requirements: requirements.map((r) =>
      r.type === "Item" ? { ...r, isFunctional: false } : r
    ),
    productionTime: 0,
    endProduct: itemId,
    continuous: false,
    count: 1,
    productionLimitCount: 1,
    isEncoded: false,
    locked: false,
    needFuelForAllProductionTime: false,
  };
};

export class SecureContainersController {
  private secureContainers: SecureContainers;

  constructor(config: Config) {
    this.secureContainers = config.secure_containers;
  }

  injectCraftsToDb(db: DatabaseServer): number {
    let counter = 0;
    const tables = db.getTables();

    Object.keys(this.secureContainers).forEach(
      (containerName: keyof SecureContainers) => {
        const secureContainerId = SECURE_CONTAINERS[containerName];
        const secureContainer = this.secureContainers[containerName];
        const isCraftable = !secureContainer.not_craftable;

        if (isCraftable) {
          const requirements = secureContainer.requirements;
          const productionItem = createCraft(secureContainerId, requirements);

          tables.hideout.production.push(productionItem);
          counter = counter + 1;
        }
      }
    );

    return counter;
  }

  tweakContainerDimensions(db: DatabaseServer): number {
    let counter = 0;
    const tables = db.getTables();

    Object.keys(this.secureContainers).forEach(
      (containerName: keyof SecureContainers) => {
        const secureContainerId = SECURE_CONTAINERS[containerName];
        const [horizontalSize, verticalSize] =
          this.secureContainers[containerName].dimensions;

        const item = tables.templates.items[secureContainerId];

        if (item) {
          const props = item._props.Grids[0]._props;
          props.cellsH = horizontalSize;
          props.cellsV = verticalSize;

          counter = counter + 1;
        }
      }
    );

    return counter;
  }
}
