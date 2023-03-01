import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import type { Stage } from "@spt-aki/models/eft/hideout/IHideoutArea";
import type { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import type { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";

import { getStashId } from "./utils";
import type { Config, StashUpgrade } from "./config";
import { STANDARD_STASH_ID, STASH_AREA } from "./constants";

const EMPTY_STAGE: Stage = {
  improvements: [],
  requirements: [],
  bonuses: [],
  slots: 0,
  constructionTime: 0,
  description: "",
  autoUpgrade: false,
  displayInterface: true,
};

const EMPTY_STASH_BONUS = {
  value: 0,
  passive: true,
  production: false,
  visible: true,
  templateId: "",
  type: "StashSize",
};

const createStashItem = (
  id: string,
  size: number,
  protoId?: string
): ITemplateItem => {
  return {
    _id: id,
    _name: `Progressive Stash 10x${size}`,
    _parent: "566abbb64bdc2d144c8b457d",
    _type: "Item",
    _props: {
      Name: `Progressive Stash 10x${size}`,
      ShortName: `Progressive Stash 10x${size}`,
      Description: `Progressive Stash 10x${size}\n`,
      Weight: 1,
      BackgroundColor: "blue",
      Width: 1,
      Height: 1,
      StackMaxSize: 1,
      ItemSound: "generic",
      Prefab: {
        path: "",
        rcid: "",
      },
      UsePrefab: {
        path: "",
        rcid: "",
      },
      StackObjectsCount: 1,
      NotShownInSlot: false,
      ExaminedByDefault: true,
      ExamineTime: 1,
      IsUndiscardable: false,
      IsUnsaleable: false,
      IsUnbuyable: false,
      IsUngivable: false,
      IsLockedafterEquip: false,
      QuestItem: false,
      LootExperience: 20,
      ExamineExperience: 10,
      HideEntrails: false,
      RepairCost: 0,
      RepairSpeed: 0,
      ExtraSizeLeft: 0,
      ExtraSizeRight: 0,
      ExtraSizeUp: 0,
      ExtraSizeDown: 0,
      ExtraSizeForceAdd: false,
      MergesWithChildren: false,
      CanSellOnRagfair: true,
      CanRequireOnRagfair: true,
      ConflictingItems: [],
      Unlootable: false,
      UnlootableFromSlot: "FirstPrimaryWeapon",
      UnlootableFromSide: [],
      AnimationVariantsNumber: 0,
      DiscardingBlock: false,
      RagFairCommissionModifier: 1,
      IsAlwaysAvailableForInsurance: false,
      DiscardLimit: -1,
      Grids: [
        {
          _name: "hideout",
          _id: `${id}_hideout_grid`,
          _parent: id,
          _props: {
            filters: [],
            cellsH: 10,
            cellsV: size,
            minCount: 0,
            maxCount: 0,
            maxWeight: 0,
            isSortingTable: false,
          },
          _proto: "55d329c24bdc2d892f8b4567",
        },
      ],
      Slots: [],
      CanPutIntoDuringTheRaid: true,
      CantRemoveFromSlotsDuringRaid: [],
    },
    _proto: protoId,
  };
};

export class StashBuilder {
  private initialStashSize: number;
  private stashUpgrades: StashUpgrade[];

  constructor(config: Config) {
    this.initialStashSize = config.initial_stash_size;
    this.stashUpgrades = config.stash_upgrades;
  }

  private generateStashStages(): Record<string, Stage> {
    const stages: Record<string, Stage> = {};
    const nbStashes = this.stashUpgrades.length + 1;
    const nbStages = nbStashes + 1;

    Array.from(Array(nbStages).keys()).forEach((index) => {
      const stageId = String(index);

      if (index === 0) {
        stages[stageId] = EMPTY_STAGE;
      } else if (index === 1) {
        const templateId = getStashId(index);

        stages[stageId] = {
          ...EMPTY_STAGE,
          bonuses: [{ ...EMPTY_STASH_BONUS, templateId }],
          requirements: [],
        };
      } else {
        const templateId = getStashId(index);
        const upgrade = this.stashUpgrades[index - 2];

        stages[stageId] = {
          ...EMPTY_STAGE,
          bonuses: [{ ...EMPTY_STASH_BONUS, templateId }],
          requirements: upgrade.requirements.map((r) =>
            r.type === "Item" ? { ...r, isFunctional: false } : r
          ),
        };
      }
    });

    return stages;
  }

  private generateTemplateItems(): ITemplateItem[] {
    const nbStashes = this.stashUpgrades.length + 1;

    const stashIds = Array.from(Array(nbStashes).keys())
      .map((index) => index + 1)
      .map(getStashId);

    let previousStashId: string | undefined;

    const items = stashIds.map((stashId, index) => {
      const protoId = previousStashId;
      previousStashId = stashId;

      if (index === 0) {
        return createStashItem(stashId, this.initialStashSize, protoId);
      } else {
        const size = this.stashUpgrades[index - 1].size;
        return createStashItem(stashId, size, protoId);
      }
    });

    return items;
  }

  private setHideoutAreas(
    tables: IDatabaseTables,
    stages: Record<string, Stage>
  ): void {
    tables.hideout.areas = tables.hideout.areas.map((area) => {
      if (area.type === STASH_AREA) {
        return { ...area, stages };
      }

      return area;
    });
  }

  private setTemplateItems(
    tables: IDatabaseTables,
    items: ITemplateItem[]
  ): number {
    let counter = 0;

    items.forEach((item) => {
      if (!tables.templates.items[item._id]) {
        tables.templates.items[item._id] = item;
        counter = counter + 1;
      } else {
        // change the shash size
        const originalItem = tables.templates.items[item._id];
        originalItem._props.Grids[0]._props.cellsV =
          item._props.Grids[0]._props.cellsV;
      }
    });

    return counter;
  }

  private setStashLocales(
    tables: IDatabaseTables,
    items: ITemplateItem[]
  ): number {
    let counter = 0;

    Object.keys(tables.locales.global).forEach((localeName) => {
      const localeBase = tables.locales.global[localeName];
      const standardTemplate = localeBase[STANDARD_STASH_ID];

      items.forEach((item, idx) => {
        const stage = idx + 1;
        const interfaceId = `hideout_area_3_stage_${stage}_description`;

        const size = item._props.Grids[0]._props.cellsV;
        localeBase[interfaceId] = `Progressive Stash (10x${size})`;

        // if locale template does not exists
        if (!localeBase[item._id]) {
          // create locale template from standard template
          localeBase[item._id] = standardTemplate;
          counter = counter + 1;
        }
      });
    });

    return counter;
  }

  injectStashesToDb(db: DatabaseServer): number {
    const tables = db.getTables();
    const stages = this.generateStashStages();
    const items = this.generateTemplateItems();

    this.setHideoutAreas(tables, stages);

    this.setTemplateItems(tables, items);
    this.setStashLocales(tables, items);

    return Object.keys(stages).length;
  }
}
