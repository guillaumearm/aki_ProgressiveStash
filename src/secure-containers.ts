import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import type {
  IHideoutProduction,
  Requirement as RequirementProduction,
} from "@spt-aki/models/eft/hideout/IHideoutProduction";

import { Config, SecureContainers } from "./config";
import { SECURE_CONTAINERS, WORKBENCH_AREA } from "./constants";

const createCraft = (
  itemId: string,
  requirements: RequirementProduction[]
): IHideoutProduction => {
  return {
    _id: `${itemId}_craft`,
    areaType: WORKBENCH_AREA,
    requirements,
    productionTime: 0,
    boosters: null,
    endProduct: itemId,
    continuous: false,
    count: 1,
    productionLimitCount: 1,
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
        const requirements = this.secureContainers[containerName].requirements;
        const productionItem = createCraft(secureContainerId, requirements);

        tables.hideout.production.push(productionItem);
        counter = counter + 1;
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
