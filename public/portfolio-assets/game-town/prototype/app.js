const app = document.querySelector("#app");

const state = {
  page: "login",
  modal: null,
  toast: "",
  createStep: 0,
  offlineSeen: false,
  friendship: 32,
  acceptedNpcTask: "",
  selectedBuild: "住宅",
  selectedBuildNpc: "随机NPC",
  selectedSoil: "平原土地",
  buildingQueue: [],
  resources: {
    金币: 1000000,
    木材: 50,
    平原土地: 15,
    森林土地: 5,
    岩石土地: 2,
    火山土地: 0,
    冰原土地: 0,
    矿石: 3,
    魔法晶尘: 8,
    农产: 12,
    鱼: 4,
  },
  storage: {
    木材: 78,
    平原土地: 24,
    森林土地: 6,
    农产: 36,
    鱼: 9,
    旧皮甲: 2,
  },
  tradeCart: [],
  marketMode: "买入",
  commerceOrders: [],
  creativeVotes: 0,
  submittedBuilding: false,
  harmonyLikes: 0,
  stationedNpc: "未派驻",
  eventHandled: false,
  pvpAttempts: 1,
  adBoosted: false,
  passClaimed: false,
  magicTaskAccepted: false,
  selectedTraitSlot: "主特性",
  selectedTraits: {
    主特性: "勤奋工匠",
    副特性1: "飞毛腿",
    副特性2: "早起鸟",
  },
  selectedTownTarget: "",
  selectedObjectIds: [],
  selectionExpanded: false,
  activityExpanded: false,
  selectionMode: "",
  activeItemTab: "材料",
  selectedItem: "木材",
  activeRoleTab: "属性",
  selectedRelation: "艾琳",
  relationPositions: {},
  battleHp: 100,
  battleMode: "回合制",
  battleResolved: false,
  battleDrops: [],
  battleLog: ["平原小怪闯入队伍视野，回合制战斗开始。"],
  selectedBattleMember: 0,
  selectedEquip: "武器",
  recruitStarted: false,
  selectedTeamMembers: ["玩家分身", "艾琳", "洛克"],
  currentRegion: "出生地",
  boat: { left: "50%", top: "88%" },
  scrollPositions: {},
  demoUnlock: false,
  energyLevels: { dream: 3, challenge: 1 },
  log: "点击地块、建筑、NPC、海域或出行小舟查看交互；打开框选后可拖出矩形选择对象。",
};

const items = {
  木材: { tab: "材料", rarity: 1, count: 50, desc: "开局建造住宅、桥和招募栏的基础材料。世界观原生道具，背包堆叠上限 50。" },
  平原土地: { tab: "材料", rarity: 1, count: 15, desc: "冒险地平原区域挖取的土地块，可扩充小镇格子，也可作为部分建筑的放置条件。" },
  森林土地: { tab: "材料", rarity: 2, count: 5, desc: "冒险地森林区域挖取的土地块，适合树木、书店、自然类建筑。" },
  魔法晶尘: { tab: "材料", rarity: 3, count: 8, desc: "魔法地任务、魔法商店和传送阵打造材料。" },
  传送阵: { tab: "道具", rarity: 3, count: 1, desc: "使用后可在任意地图放置传送点，点击传送阵会打开五大区域与小镇传送侧边栏。" },
  宠物笼: { tab: "道具", rarity: 2, count: 2, desc: "魔法塔寻找宠物任务中用于拾取眩晕宠物，可选择带回小镇或提交任务。" },
  独特短剑: { tab: "装备", rarity: 5, count: 1, desc: "独特技能：飞毛腿。移动距离超过 10 格后速度大幅提升，适合主控分身通勤。" },
  旧皮甲: { tab: "装备", rarity: 1, count: 1, desc: "白色基础装备。挑战能量 1 级后可从冒险地怪物身上掉落。" },
};

const worldRegions = [
  { name: "冒险地", page: "adventure", energy: "challenge", level: 1, left: "48%", top: "72%" },
  { name: "世界商业地", page: "business", energy: "dream", level: 2, left: "33%", top: "58%" },
  { name: "创意地", page: "creative", energy: "dream", level: 3, left: "60%", top: "43%" },
  { name: "魔法地", page: "magic", energy: "challenge", level: 5, left: "38%", top: "29%" },
  { name: "和谐地", page: "harmony", energy: "dream", level: 5, left: "62%", top: "16%" },
];

const buildOptions = [
  { name: "住宅", terrain: "平原土地", cost: { 木材: 20, 平原土地: 1 }, effect: "人口容量 +2，离线事件概率提升", unlock: "开局默认", worker: "建设型" },
  { name: "田地", terrain: "平原土地", cost: { 木材: 8, 平原土地: 1 }, effect: "持续产出农产，可由 NPC 自动收获", unlock: "开局默认", worker: "勤奋型" },
  { name: "树", terrain: "森林土地", cost: { 森林土地: 1 }, effect: "木材/苹果产出，摸鱼型 NPC 会在树下休息", unlock: "开局默认", worker: "自然型" },
  { name: "书店", terrain: "平原土地", cost: { 木材: 30 }, effect: "解锁故事事件、任务线索和角色日记", unlock: "开局默认", worker: "社交型" },
  { name: "铁匠铺", terrain: "岩石土地", cost: { 木材: 35, 矿石: 5 }, effect: "装备升级、锻造、镶嵌入口", unlock: "挑战 Lv.1", worker: "战斗型" },
  { name: "桥", terrain: "土地边缘", cost: { 木材: 18 }, effect: "延伸到海面，NPC 随机钓鱼并产出鱼", unlock: "开局默认", worker: "任意NPC" },
  { name: "仓库", terrain: "平原土地", cost: { 木材: 28, 平原土地: 1 }, effect: "超出背包堆叠上限的材料进入仓库", unlock: "梦想 Lv.1", worker: "勤奋型" },
  { name: "招募栏", terrain: "平原土地", cost: { 木材: 24, 平原土地: 1 }, effect: "解锁 5 个招募栏位，12 小时自动接待", unlock: "梦想 Lv.1", worker: "社交型" },
];

const soilOptions = [
  { name: "平原土地", stock: "平原土地", desc: "基础小镇扩地，适合住宅、田地、书店、仓库、招募栏。", amount: 5 },
  { name: "森林土地", stock: "森林土地", desc: "冒险地森林挖取，适合树木、自然类建筑。", amount: 5 },
  { name: "岩石土地", stock: "岩石土地", desc: "岩石洞穴挖取，适合铁匠铺、矿物建筑。", amount: 5 },
  { name: "火山土地", stock: "火山土地", desc: "火山区域挖取，后续用于高温锻造和 Boss 奖励建筑。", amount: 5 },
  { name: "冰原土地", stock: "冰原土地", desc: "冰原区域挖取，后续用于冷藏、冰系魔法建筑。", amount: 5 },
];

const workerOptions = ["随机NPC", "玩家分身", "艾琳", "洛克", "米娅"];

const marketGoods = [
  { name: "木材", kind: "材料", price: 20, mode: "卖出", desc: "从冒险地或小镇树木获得，可卖给行商换金币。" },
  { name: "农产", kind: "材料", price: 35, mode: "卖出", desc: "田地产出，商业地常见交易品。" },
  { name: "鱼", kind: "材料", price: 45, mode: "卖出", desc: "桥边钓鱼获得，可触发行商收购事件。" },
  { name: "魔法晶尘", kind: "魔法材料", price: 120, mode: "买入", desc: "魔法塔任务、传送阵打造材料。" },
  { name: "宠物笼", kind: "道具", price: 240, mode: "买入", desc: "寻找魔法宠物任务中用于拾取眩晕宠物。" },
  { name: "旧皮甲", kind: "装备", price: 180, mode: "买入", desc: "挑战 Lv.1 后可交易的白色基础装备。" },
  { name: "平原土地", kind: "土地", price: 150, mode: "买入", desc: "商业地偶尔出售的基础扩地材料。" },
];

const adventureZones = [
  { cls: "plain", title: "平原", desc: "初始探索区。小怪：史莱姆/野鼠；精英：平原狂犬；Boss：草原巨兽；产出平原土地、木材、白色装备。" },
  { cls: "forest", title: "森林", desc: "砍树、自然事件和原生村落集中区。小怪：藤蔓怪；精英：树精守卫；Boss：古树之心；产出森林土地、木材、草药。" },
  { cls: "cave", title: "岩石洞穴", desc: "矿石与装备材料区。小怪：石壳虫；精英：洞穴巨蜥；Boss：岩晶魔像；产出岩石土地、矿石、护甲胚。" },
  { cls: "volcano", title: "火山", desc: "上方左侧高危区。小怪：火蜥蜴；精英：熔岩犬；Boss：火山领主；产出火山土地、熔岩矿、高级武器材料。" },
  { cls: "ice", title: "冰原", desc: "上方右侧特殊区。小怪：雪团兽；精英：冰爪狼；Boss：冰晶女王；产出冰原土地、冰晶、控制类装备材料。" },
];

const npcCast = [
  { name: "星辰", role: "冒险家", trait: "探险家", ability: "冒险、战斗、寻宝" },
  { name: "月光", role: "魔法师", trait: "钢铁意志", ability: "魔法研究、防御" },
  { name: "烈火", role: "战士", trait: "战斗狂人", ability: "战斗、训练、领导" },
  { name: "阳光", role: "治疗师", trait: "热心肠", ability: "治疗、护理、社区建设" },
  { name: "暗影", role: "商人", trait: "商业天才", ability: "商业、交易、投资" },
];

const townObjects = [
  { id: "npc-aileen", name: "NPC 艾琳", type: "npc", selectType: "npc", cls: "stick", hint: "对话、查看角色信息、提升好感后收服。" },
  { id: "warehouse", name: "仓库", type: "building", selectType: "building", cls: "warehouse", hint: "储存超过背包上限的材料。" },
  { id: "empty-land", name: "空地", type: "land", selectType: "land", cls: "empty", hint: "可选择建筑类型并派遣 NPC 建造。" },
  { id: "field", name: "田地", type: "building", selectType: "building", cls: "field-building", hint: "持续产出农产材料。" },
  { id: "player-avatar", name: "玩家分身", type: "npc", selectType: "npc", cls: "runner", hint: "当前操控分身，可执行默认交互。" },
  { id: "notice-board", name: "公告建筑", type: "building", selectType: "building", cls: "sign", hint: "触发小镇事件、排名、通知。" },
  { id: "house", name: "住宅", type: "building", selectType: "building", cls: "house", hint: "提高人口容量与离线事件概率。" },
  { id: "recruit", name: "招募栏", type: "recruit", selectType: "building", cls: "recruit-building", hint: "从地块实体交互打开角色招募界面。" },
  { id: "smithy", name: "铁匠铺", type: "building", selectType: "building", cls: "smithy", hint: "装备升级、锻造、镶嵌入口。" },
];

const standaloneTownObjects = [
  { id: "bridge", name: "桥", type: "building", selectType: "building", cls: "bridge-edge", hint: "从土地边缘延伸到海面，NPC 会随机钓鱼。" },
  { id: "travel-boat", name: "出行小舟", type: "building", selectType: "building", cls: "map-boat-entity", hint: "真实地图实体。点击后先选团队，再进入世界传送地图。" },
];

const relations = [
  { id: "rel-aileen", name: "艾琳", kind: "朋友", color: "#1677ff", x: 48, y: 176 },
  { id: "rel-locke", name: "洛克", kind: "竞争", color: "#2ca24d", x: 140, y: 140 },
  { id: "rel-mia", name: "米娅", kind: "好友", color: "#1677ff", x: 248, y: 138 },
  { id: "rel-merchant", name: "暗影", kind: "合作", color: "#7b61ff", x: 304, y: 226 },
  { id: "rel-mage", name: "月光", kind: "单相思", color: "#e03131", x: 88, y: 432 },
  { id: "rel-traveler", name: "旅人", kind: "陌生", color: "#00a58c", x: 226, y: 440 },
];

const equipDetails = {
  武器: "装备名称：独特短剑\n装备属性：攻击 +12\n装备技能：飞毛腿\n本回合可选择普攻或独特技能。",
  头盔: "装备名称：旧头盔\n装备属性：防御 +3\n装备技能：无\n无技能部位不高亮独特技能。",
  衣服: "装备名称：旧皮甲\n装备属性：生命 +40\n装备技能：无",
  护手: "装备名称：粗布护手\n装备属性：命中 +2\n装备技能：无",
  裤子: "装备名称：旅行短裤\n装备属性：速度 +4\n装备技能：无",
  靴子: "装备名称：轻跑靴\n装备属性：移动 +1\n装备技能：小跑加速",
};

function regionPage(regionName) {
  const region = worldRegions.find((item) => item.name === regionName);
  return region?.page || "town";
}

function selectableObjects() {
  return [...townObjects, ...standaloneTownObjects];
}

function getSelectedObjects() {
  return selectableObjects().filter((item) => state.selectedObjectIds.includes(item.id));
}

function hasResources(cost = {}) {
  return Object.entries(cost).every(([name, amount]) => (state.resources[name] || 0) >= amount);
}

function spendResources(cost = {}) {
  Object.entries(cost).forEach(([name, amount]) => {
    state.resources[name] = Math.max(0, (state.resources[name] || 0) - amount);
  });
}

function costText(cost = {}) {
  return Object.entries(cost).map(([name, amount]) => `${name}x${amount}`).join(" ");
}

function stockText(names) {
  return names.map((name) => `${name} ${state.resources[name] ?? state.storage[name] ?? 0}`).join(" / ");
}

function currentEnergyLevels() {
  return state.demoUnlock ? { dream: 5, challenge: 5 } : state.energyLevels;
}

function isRegionUnlocked(region) {
  const levels = currentEnergyLevels();
  return (levels[region.energy] || 0) >= region.level;
}

function energyHeight(level) {
  return `${Math.min(92, Math.max(14, level * 16))}%`;
}

function resolveBattleDamage(amount, line) {
  if (state.battleResolved) {
    toast("怪物已倒下，请先拾取掉落或重开演示。");
    return;
  }
  state.battleHp = Math.max(0, state.battleHp - amount);
  state.battleLog.unshift(line);
  if (state.battleHp <= 0) {
    state.battleResolved = true;
    state.battleDrops = ["木材", "旧皮甲", "平原土地"];
    state.battleLog.unshift("怪物死亡：白色装备与材料闪光掉落，等待拾取。");
    toast("怪物已击败，掉落出现");
  } else {
    state.battleLog.unshift("怪物反击，前排角色血条轻微下降。");
    toast(line);
  }
  render();
}

function modeToSelectType(mode = state.selectionMode) {
  if (mode === "角色框选") return "npc";
  if (mode === "建筑框选") return "building";
  return "";
}

function setPage(page) {
  state.page = page;
  if (page === "town" && !state.offlineSeen) {
    state.offlineSeen = true;
    state.modal = { type: "offlineReport" };
  } else {
    state.modal = null;
  }
  state.selectionExpanded = false;
  state.activityExpanded = false;
  render();
}

function openModal(type, data = {}) {
  state.modal = { type, ...data };
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

function toast(text) {
  state.toast = text;
  render();
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    state.toast = "";
    render();
  }, 1600);
}

const renderers = {
  login: renderLogin,
  create: renderCreate,
  tutorial: renderTutorial,
  town: renderTown,
  world: renderWorld,
  townMap: renderTownMap,
  adventure: renderAdventure,
  business: renderBusiness,
  creative: renderCreative,
  harmony: renderHarmony,
  inventory: renderInventory,
  role: renderRole,
  battle: renderBattle,
  magic: renderMagic,
};

function render() {
  app.innerHTML = `${renderers[state.page]()}${renderModal()}${state.toast ? `<div class="toast">${state.toast}</div>` : ""}`;
  bind();
  restoreExploreScroll();
}

function bind() {
  app.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => setPage(el.dataset.page));
  });
  app.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => act(el.dataset.action, el));
  });
  bindTownSelection();
  bindRelationDrag();
  bindExploreScroll();
}

function bindExploreScroll() {
  app.querySelectorAll(".explore-frame").forEach((el) => {
    const key = el.dataset.scrollKey || state.page;
    el.addEventListener("scroll", () => {
      state.scrollPositions[key] = el.scrollTop;
    });
  });
}

function restoreExploreScroll() {
  app.querySelectorAll(".explore-frame").forEach((el) => {
    const key = el.dataset.scrollKey || state.page;
    const saved = state.scrollPositions[key];
    requestAnimationFrame(() => {
      if (typeof saved === "number") {
        el.scrollTop = saved;
      } else if (el.dataset.start === "bottom") {
        el.scrollTop = el.scrollHeight;
      }
    });
  });
}

function act(action, el) {
  const handlers = {
    wechat: () => openModal("wechat"),
    loginOk: () => setPage("create"),
    createStep: () => {
      state.createStep = Number(el.dataset.step);
      render();
    },
    nextCreate: () => {
      state.createStep = Math.min(2, state.createStep + 1);
      render();
    },
    finishCreate: () => setPage("tutorial"),
    traitSlot: () => {
      state.selectedTraitSlot = el.dataset.slot;
      render();
    },
    trait: () => {
      state.selectedTraits[state.selectedTraitSlot] = el.dataset.value;
      toast(`已为${state.selectedTraitSlot}选择：${el.dataset.value}`);
    },
    townTarget: () => handleTownTarget(el),
    sideTool: () => {
      const tool = el.dataset.tool;
      if (tool === "设置") openModal("settings");
      if (tool === "好友") openModal("friend");
      if (tool === "工会") openModal("guild");
      if (tool === "背包") setPage("inventory");
      if (tool === "地图") setPage("townMap");
    },
    commandTool: () => {
      const tool = el.dataset.tool;
      if (tool === "创建分身") setPage("create");
      if (tool === "框选") {
        state.selectionExpanded = !state.selectionExpanded;
        state.activityExpanded = false;
        render();
      }
      if (tool === "角色框选" || tool === "建筑框选") {
        state.selectionMode = tool;
        state.selectionExpanded = false;
        state.selectedObjectIds = [];
        toast(`${tool}已开启：在地图上拖出矩形框选对象。`);
      }
      if (tool === "活动入口") {
        state.activityExpanded = !state.activityExpanded;
        state.selectionExpanded = false;
        render();
      }
      if (tool === "活动") {
        state.activityExpanded = false;
        openModal("event");
      }
      if (tool === "通行证") {
        state.activityExpanded = false;
        openModal("pass");
      }
    },
    collect: () => toast("金币从建筑飞向资源栏，收益暴击 +8600。"),
    close: closeModal,
    claimOffline: () => {
      state.log = "镇长已汇报离线收益：新增建筑、升级、扩地、招募与材料收入已入账。";
      closeModal();
      toast("离线收益已领取");
    },
    startRecruit: () => {
      state.recruitStarted = true;
      render();
    },
    tabItem: () => {
      state.activeItemTab = el.dataset.tab;
      state.selectedItem = sortedItems().find((name) => items[name].tab === state.activeItemTab);
      render();
    },
    item: () => {
      state.selectedItem = el.dataset.item;
      render();
    },
    useItem: () => {
      if (state.selectedItem === "传送阵") openModal("teleport");
      else toast(`${state.selectedItem}已选中，当前原型仅展示使用反馈。`);
    },
    roleTab: () => {
      state.activeRoleTab = el.dataset.tab;
      render();
    },
    relationFocus: () => {
      state.selectedRelation = el.dataset.name;
      render();
    },
    travel: () => travelToRegion(el),
    demoUnlock: () => {
      state.demoUnlock = !state.demoUnlock;
      state.log = state.demoUnlock
        ? "演示用解锁已开启：世界地图临时显示梦想/挑战能量 Lv.5，方便点击魔法地与和谐地。"
        : "演示用解锁已关闭：世界地图恢复当前正式能量等级。";
      toast(state.demoUnlock ? "演示用解锁已开启" : "演示用解锁已关闭");
    },
    regionInteract: () => openModal("regionEntity", {
      title: el.dataset.title,
      desc: el.dataset.desc,
    }),
    npcDialog: () => openModal("dialogue", { name: state.modal?.name || "艾琳" }),
    npcGift: () => {
      state.friendship = Math.min(100, state.friendship + 8);
      openModal("giftResult", { name: state.modal?.name || "艾琳" });
    },
    npcTask: () => {
      state.acceptedNpcTask = "帮艾琳从森林带回 5 个木材";
      openModal("npcTask", { name: state.modal?.name || "艾琳" });
    },
    acceptNpcTask: () => {
      state.log = `已接受任务：${state.acceptedNpcTask || "帮助 NPC 完成小镇请求"}`;
      closeModal();
      toast("NPC 任务已加入待办");
    },
    buildType: () => {
      state.selectedBuild = el.dataset.build;
      render();
    },
    buildNpc: () => {
      state.selectedBuildNpc = el.dataset.npc;
      render();
    },
    confirmBuild: () => {
      const build = buildOptions.find((item) => item.name === state.selectedBuild);
      const enough = build ? hasResources(build.cost) : false;
      if (!enough) {
        toast(`${state.selectedBuild}材料不足，无法建造`);
        return;
      }
      spendResources(build.cost);
      state.buildingQueue.unshift({
        name: state.selectedBuild,
        npc: state.selectedBuildNpc,
        time: "00:45",
        status: "施工中",
      });
      state.log = `已安排建造：${state.selectedBuild}。${state.selectedBuildNpc}会跑到空地旁施工；建造栏可看到材料已扣除。`;
      closeModal();
      toast(`${state.selectedBuild}建造队列已创建`);
    },
    buildingUpgrade: () => {
      state.log = `${state.modal?.name || "建筑"}升级任务已派发，NPC 会到建筑旁执行。`;
      closeModal();
      toast("升级操作已确认");
    },
    buildingMove: () => {
      state.log = `${state.modal?.name || "建筑"}进入移动模式，选择新地块后 NPC 会搬迁建筑。`;
      closeModal();
      toast("移动模式已开启");
    },
    buildingDestroy: () => {
      state.log = `${state.modal?.name || "建筑"}销毁确认已记录，返还部分材料。`;
      closeModal();
      toast("销毁操作已确认");
    },
    shopBuy: () => {
      const item = el.dataset.item;
      const goods = marketGoods.find((entry) => entry.name === item);
      if (!goods) return;
      const isSell = goods.mode === "卖出";
      if (isSell) {
        const stock = state.resources[item] || state.storage[item] || 0;
        if (stock <= 0) {
          toast(`${item}库存不足，无法卖出`);
          return;
        }
        if (state.resources[item]) state.resources[item] -= 1;
        else state.storage[item] -= 1;
        state.resources.金币 += goods.price;
        state.tradeCart.push(`卖出${item}+${goods.price}`);
        toast(`已卖出 ${item}`);
      } else {
        if (state.resources.金币 < goods.price) {
          toast("金币不足");
          return;
        }
        state.resources.金币 -= goods.price;
        state.storage[item] = (state.storage[item] || 0) + 1;
        state.tradeCart.push(`买入${item}-${goods.price}`);
        toast(`已购买 ${item}`);
      }
      render();
    },
    marketTab: () => {
      state.marketMode = el.dataset.mode;
      render();
    },
    acceptMagicTask: () => {
      state.magicTaskAccepted = true;
      openModal("magicTask");
    },
    pickupPet: () => {
      state.log = "魔法宠物已被打晕并拾取进背包，可选择带回小镇或提交任务。";
      closeModal();
      toast("宠物已拾取");
    },
    startDig: () => {
      state.log = "铲子模式已开启：点击对应区域土地，角色会挖取土地块 x5。";
      closeModal();
      toast("铲子模式已开启");
    },
    collectLoot: () => {
      state.storage.木材 = (state.storage.木材 || 0) + 3;
      state.storage.旧皮甲 = (state.storage.旧皮甲 || 0) + 1;
      toast("掉落光已自动拾取：白色装备 +1，木材 +3");
    },
    openShop: () => openModal("shop"),
    acceptCommerceOrder: () => {
      state.commerceOrders.unshift("商会委托：卖出木材x10，奖励金币x260，梦想能量+15");
      closeModal();
      toast("商会委托已加入商业记录");
    },
    creativeVote: () => {
      state.creativeVotes += 1;
      closeModal();
      toast(`已投票，本期投票数 ${state.creativeVotes}`);
    },
    submitBuilding: () => {
      state.submittedBuilding = true;
      closeModal();
      toast("建筑作品已提交到本期创意竞赛");
    },
    friendVisit: () => {
      closeModal();
      toast("正在前往好友小镇参观，本地原型展示为模拟跳转");
    },
    likeTown: () => {
      state.harmonyLikes += 1;
      closeModal();
      toast(`已点赞，今日点赞数 ${state.harmonyLikes}`);
    },
    stationNpc: () => {
      state.stationedNpc = "阳光";
      closeModal();
      toast("已派驻 NPC 阳光到好友小镇交流");
    },
    guildBuild: () => {
      state.log = "工会建设区已提交一次协作建造：公共广场 +1%。";
      closeModal();
      toast("工会建设贡献已记录");
    },
    handleTownEvent: () => {
      state.eventHandled = true;
      state.log = "已处理小镇突发事件：洛克和米娅吵架被劝和，双方好感 +5。";
      closeModal();
      toast("小镇事件已处理");
    },
    pvpRaid: () => {
      if (state.pvpAttempts <= 0) {
        toast("今日攻略次数已用完");
        return;
      }
      state.pvpAttempts -= 1;
      state.log = "已发起一次本地模拟攻略：获得木材x12，小镇排名 +3。";
      closeModal();
      toast("攻略模拟完成");
    },
    adBoost: () => {
      state.adBoosted = true;
      state.resources.金币 += 8600;
      closeModal();
      toast("广告强化模拟：金币 +8600");
    },
    claimPass: () => {
      state.passClaimed = true;
      state.resources.魔法晶尘 += 1;
      closeModal();
      toast("通行证奖励已领取");
    },
    magicPanel: () => openModal("teleport"),
    battleMember: () => {
      state.selectedBattleMember = Number(el.dataset.index);
      state.selectedEquip = "武器";
      render();
    },
    equip: () => {
      state.selectedEquip = el.dataset.equip;
      render();
    },
    attack: () => {
      resolveBattleDamage(22, `角色${state.selectedBattleMember + 1}使用普攻，怪物血量下降 22。`);
    },
    skill: () => {
      const canUse = state.selectedEquip === "武器" || state.selectedEquip === "靴子";
      resolveBattleDamage(canUse ? 38 : 12, canUse ? `${state.selectedEquip}独特技能释放，造成 38 伤害。` : `${state.selectedEquip}无独特技能，本次按普通动作结算 12 伤害。`);
    },
    autoBattle: () => {
      state.battleMode = "即时托管";
      resolveBattleDamage(100, "AI 托管自动释放普攻和技能，直接结算战斗。");
    },
    pickupBattleDrop: () => {
      if (!state.battleDrops.length) {
        toast("当前没有可拾取掉落");
        return;
      }
      state.battleDrops.forEach((name) => {
        state.storage[name] = (state.storage[name] || 0) + 1;
      });
      state.battleLog.unshift(`已拾取：${state.battleDrops.join("、")}，进入背包/仓库。`);
      state.battleDrops = [];
      toast("掉落已拾取");
      render();
    },
    resetBattle: () => {
      state.battleHp = 100;
      state.battleResolved = false;
      state.battleDrops = [];
      state.battleMode = "回合制";
      state.battleLog = ["平原小怪闯入队伍视野，回合制战斗开始。"];
      render();
    },
    teamMember: () => {
      const name = el.dataset.name;
      if (name === "空位") return;
      const exists = state.selectedTeamMembers.includes(name);
      if (exists && state.selectedTeamMembers.length > 1) {
        state.selectedTeamMembers = state.selectedTeamMembers.filter((item) => item !== name);
      } else if (!exists && state.selectedTeamMembers.length < 6) {
        state.selectedTeamMembers.push(name);
      }
      render();
    },
    confirmTeam: () => setPage("world"),
    useSoil: () => {
      const option = soilOptions.find((item) => item.name === state.selectedSoil) || soilOptions[0];
      if ((state.resources[option.stock] || 0) < option.amount) {
        toast(`${option.name}库存不足，需要 ${option.amount}`);
        return;
      }
      state.resources[option.stock] -= option.amount;
      state.log = `NPC 托着${option.name}跑向空白海域，放置土地块 x${option.amount}。`;
      closeModal();
      toast(`${option.name} -${option.amount}，小镇经验 +12。`);
    },
    soilType: () => {
      state.selectedSoil = el.dataset.soil;
      render();
    },
    batchUpgrade: () => {
      const names = getSelectedObjects().map((item) => item.name).join("、");
      state.log = `已安排批量升级：${names || "未选择建筑"}`;
      closeModal();
      toast("建筑批量操作已记录。");
    },
  };
  handlers[action]?.();
}

function handleTownTarget(el, fromSelectionTap = false) {
  const type = el.dataset.type;
  const name = el.dataset.name;
  const id = el.dataset.selectableId;
  const selectType = el.dataset.selectableType;

  if (fromSelectionTap) {
    const wantedType = modeToSelectType();
    if (id && selectType === wantedType) {
      state.selectedObjectIds = [id];
      state.selectedTownTarget = name;
      state.log = `${state.selectionMode}单选：${name} 已高亮。`;
      toast(`已选中 ${name}`);
      return;
    }

    if (state.selectedObjectIds.length) {
      const selectedNames = getSelectedObjects().map((item) => item.name).join("、");
      if (state.selectionMode === "角色框选") {
        state.log = `已派遣 ${selectedNames} 前往「${name}」执行交互。`;
        toast(`已派遣 ${state.selectedObjectIds.length} 个角色`);
        return;
      }
      if (state.selectionMode === "建筑框选") {
        openModal("batchBuilding", { target: name });
        return;
      }
    }
  }

  state.selectedTownTarget = name;
  if (id && (selectType === "npc" || selectType === "building")) {
    state.selectedObjectIds = [id];
  }

  if (type === "recruit") {
    openModal("recruit");
    return;
  }
  if (type === "building" && name === "出行小舟") {
    openModal("teamSelect");
    return;
  }
  if (type === "building" && name === "仓库") {
    openModal("warehouse");
    return;
  }
  if (type === "building") {
    openModal("building", { name });
    return;
  }
  if (type === "npc") {
    openModal("npc", { name });
    return;
  }
  if (type === "land") {
    openModal("land");
    return;
  }
  if (type === "sea") {
    openModal("sea");
  }
}

function travelToRegion(el) {
  const region = el.dataset.region;
  if (el.dataset.locked === "true") {
    toast("能量尚未完全漫过该地域，暂未解锁。");
    return;
  }
  state.currentRegion = region;
  state.boat = { left: el.dataset.left, top: el.dataset.top };
  render();
  setTimeout(() => setPage(regionPage(region)), 480);
}

function bindTownSelection() {
  const town = app.querySelector(".town-page");
  if (!town || !state.selectionMode) return;

  town.addEventListener("pointerdown", (event) => {
    if (event.button && event.button !== 0) return;
    if (event.target.closest(".top-command, .expand-bar, .right-ui, .left-ui, .gear, .dock-harvest, .coin-box, .town-log")) return;

    event.preventDefault();
    event.stopPropagation();

    const startTarget = event.target.closest("[data-action='townTarget']");
    const bounds = town.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY };
    const rectEl = document.createElement("div");
    rectEl.className = "selection-rect";
    town.appendChild(rectEl);
    let moved = false;
    let lastRect = null;

    function makeRect(clientX, clientY) {
      const left = Math.min(start.x, clientX);
      const top = Math.min(start.y, clientY);
      const width = Math.abs(clientX - start.x);
      const height = Math.abs(clientY - start.y);
      return { left, top, right: left + width, bottom: top + height, width, height };
    }

    function draw(clientX, clientY) {
      const rect = makeRect(clientX, clientY);
      moved = moved || rect.width > 8 || rect.height > 8;
      lastRect = rect;
      rectEl.style.left = `${rect.left - bounds.left}px`;
      rectEl.style.top = `${rect.top - bounds.top}px`;
      rectEl.style.width = `${rect.width}px`;
      rectEl.style.height = `${rect.height}px`;
    }

    function onMove(moveEvent) {
      draw(moveEvent.clientX, moveEvent.clientY);
    }

    function onUp(upEvent) {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      draw(upEvent.clientX, upEvent.clientY);
      rectEl.remove();

      if (!moved) {
        if (startTarget) handleTownTarget(startTarget, true);
        else render();
        return;
      }

      const wantedType = modeToSelectType();
      const selected = [];
      app.querySelectorAll("[data-selectable-id]").forEach((node) => {
        if (node.dataset.selectableType !== wantedType) return;
        const itemRect = node.getBoundingClientRect();
        const intersects = itemRect.left < lastRect.right && itemRect.right > lastRect.left && itemRect.top < lastRect.bottom && itemRect.bottom > lastRect.top;
        if (intersects) selected.push(node.dataset.selectableId);
      });

      state.selectedObjectIds = selected;
      state.selectedTownTarget = "";
      state.log = selected.length
        ? `${state.selectionMode}选中 ${selected.length} 个对象：${getSelectedObjects().map((item) => item.name).join("、")}`
        : `${state.selectionMode}没有框到对应对象，请重新拖拽。`;
      toast(selected.length ? `已框选 ${selected.length} 个对象` : "未选中对象");
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    draw(event.clientX, event.clientY);
  });
}

function bindRelationDrag() {
  const panel = app.querySelector(".relation-panel");
  if (!panel) return;
  panel.querySelectorAll("[data-rel-id]").forEach((node) => {
    node.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const panelRect = panel.getBoundingClientRect();
      const id = node.dataset.relId;
      const start = { x: event.clientX, y: event.clientY };
      const current = relationPosition(id);
      let moved = false;

      function onMove(moveEvent) {
        const dx = moveEvent.clientX - start.x;
        const dy = moveEvent.clientY - start.y;
        moved = moved || Math.abs(dx) > 4 || Math.abs(dy) > 4;
        const x = Math.max(8, Math.min(panelRect.width - 66, current.x + dx));
        const y = Math.max(66, Math.min(panelRect.height - 70, current.y + dy));
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        state.relationPositions[id] = { x, y };
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (moved) {
          state.selectedRelation = node.dataset.name;
          toast(`${node.dataset.name}关系节点已拖动`);
        } else {
          state.selectedRelation = node.dataset.name;
          render();
        }
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  });
}

function relationPosition(id) {
  const relation = relations.find((item) => item.id === id);
  return state.relationPositions[id] || { x: relation.x, y: relation.y };
}

function sortedItems() {
  return Object.keys(items).sort((a, b) => items[b].rarity - items[a].rarity || a.localeCompare(b, "zh-Hans-CN"));
}

function renderLogin() {
  return `
    <section class="page login-wire">
      <div class="mock-status">12:00</div>
      <div class="login-logo">LOGO</div>
      <div class="login-town-silhouette"></div>
      <div class="login-sea-strip">
        <span>海域</span><span>小镇地块</span><span>出行小舟</span>
      </div>
      <div class="login-runners">
        <span></span><span></span><span></span>
      </div>
      <div class="login-monsters">
        <span>怪</span><span>怪</span><span>怪</span>
      </div>
      <div class="login-preview-chain">
        <i>登录</i><i>创建分身</i><i>新手教学</i><i>进入小镇</i>
      </div>
      <button class="login-btn" data-action="wechat">登录按钮</button>
    </section>
  `;
}

function renderCreate() {
  const labels = ["外貌", "智能体", "特性"];
  return `
    <section class="page panel-page">
      ${header("创建玩家分身", "外貌 → 性格/MBTI → 主特性与副特性", "login")}
      <div class="content creator-content">
        <div class="tabs">${labels.map((x, i) => `<button class="tab-btn ${state.createStep === i ? "active" : ""}" data-action="createStep" data-step="${i}">${x}</button>`).join("")}</div>
        ${state.createStep === 0 ? createAppearance() : ""}
        ${state.createStep === 1 ? createPersona() : ""}
        ${state.createStep === 2 ? createTraits() : ""}
      </div>
      <div class="creator-footer">
        <button class="primary-btn" data-action="${state.createStep < 2 ? "nextCreate" : "finishCreate"}">${state.createStep < 2 ? "下一步" : "确认创建"}</button>
      </div>
    </section>
  `;
}

function createAppearance() {
  return `
    <div class="creator-layout card">
      <div class="pixel-preview">分身<br>动态预览</div>
      <div class="creator-options">
        <button class="option-row active">身体：肤色</button>
        <button class="option-row">头发：潮流短发</button>
        <button class="option-row">服装：帽衫蓝</button>
        <button class="option-row">配饰：棒球帽</button>
        <button class="secondary-btn">一键随机</button>
      </div>
    </div>
    <div class="creator-extended card">
      <strong>外貌资产槽位</strong>
      <div class="creator-part-grid">
        ${["头部", "发型", "上衣", "下装", "鞋子", "手持物", "表情", "待机动作"].map((x, i) => `<button class="${i < 4 ? "active" : ""}">${x}<small>${i < 4 ? "已选" : "待选"}</small></button>`).join("")}
      </div>
      <div class="creator-preview-notes">
        <span>小镇缩略态</span><span>战斗站位态</span><span>地图奔跑态</span>
      </div>
    </div>
  `;
}

function createPersona() {
  return `
    <div class="creator-layout card">
      <div class="pixel-preview">角色<br>预览</div>
      <div class="creator-options">
        <button class="option-row">快捷计划：16 种人格选项</button>
        <button class="option-row active">升级计划：人格 + 选择题</button>
        <button class="option-row">定制计划：开放式问答</button>
        <p class="fine-print">人格会影响 AI 自动建设、摸鱼、社交、战斗倾向。</p>
      </div>
    </div>
    <div class="creator-extended card">
      <strong>智能体行为预览</strong>
      <div class="persona-grid">
        ${[
          ["建设偏好", "优先补建筑队列"],
          ["冒险偏好", "低血量自动回撤"],
          ["社交偏好", "主动对话/送礼"],
          ["摸鱼概率", "桥边钓鱼或树下休息"],
          ["战斗托管", "优先释放独特技能"],
          ["离线汇报", "向镇长同步收益"],
        ].map(([title, desc]) => `<button><strong>${title}</strong><small>${desc}</small></button>`).join("")}
      </div>
    </div>
  `;
}

function createTraits() {
  const traits = ["梦想共鸣", "奇迹工匠", "勤奋工匠", "飞毛腿", "好运爆金币", "社交达人", "夜猫子", "早起鸟", "懒散"];
  const slots = [
    ["主特性", state.selectedTraits.主特性],
    ["副特性1", state.selectedTraits.副特性1],
    ["副特性2", state.selectedTraits.副特性2],
  ];
  return `
    <div class="trait-select card">
      <div class="trait-slots">
        ${slots.map(([slot, value]) => `<button class="slot-box ${state.selectedTraitSlot === slot ? "active" : ""}" data-action="traitSlot" data-slot="${slot}">${slot}<br>${value}</button>`).join("")}
      </div>
      <div class="trait-grid">
        ${traits.map((trait) => `<button class="trait ${state.selectedTraits[state.selectedTraitSlot] === trait ? "active" : ""}" data-action="trait" data-value="${trait}">${trait}</button>`).join("")}
      </div>
    </div>
    <div class="trait-impact card">
      <strong>特性影响预览</strong>
      <div class="trait-impact-grid">
        <span>小镇建设：${state.selectedTraits.主特性 === "勤奋工匠" ? "加速" : "普通"}</span>
        <span>地图移动：${Object.values(state.selectedTraits).includes("飞毛腿") ? "长距离加速" : "普通"}</span>
        <span>离线事件：${Object.values(state.selectedTraits).includes("早起鸟") ? "晨间触发率提升" : "普通"}</span>
        <span>战斗演出：独特技能由装备与特性共同决定</span>
      </div>
    </div>
  `;
}

function renderTutorial() {
  const steps = [
    ["分身砍树并拾取木头", "框选角色 → 点击树木 → 木材飞入背包"],
    ["解锁建筑，建造第一栋建筑", "点击空地 → 选择住宅 → 派遣 NPC"],
    ["小怪闯入，完成战斗教学", "进入战斗 → 普攻/技能 → 拾取掉落"],
    ["发现冒险地，乘小船前往", "点击小舟 → 选择团队 → 世界地图"],
    ["挖土回镇，扩充地块", "铲子模式 → 获取土地 → 海域放置"],
  ];
  return `
    <section class="page panel-page">
      ${header("新手教程流程", "按策划案核心教学链路展示", "create")}
      <div class="content tutorial-list">
        <div class="tutorial-map">
          <div class="tutorial-path-line"></div>
          ${steps.map(([title, desc], i) => `
            <button class="tutorial-stage stage-${i} card">
              <span class="tutorial-index">${i + 1}</span>
              <strong>${title}</strong>
              <small>${desc}</small>
            </button>
          `).join("")}
        </div>
        <div class="tutorial-side-grid">
          <div class="card">
            <strong>教学地图点位</strong>
            <span>小镇树木、空地、小怪、出行小舟、冒险地土地都以真实地图实体呈现。</span>
          </div>
          <div class="card">
            <strong>教学后保留</strong>
            <span>完成后这些入口仍在小镇和地域地图里，不变成独立菜单。</span>
          </div>
        </div>
      </div>
      <div class="tutorial-footer">
        <button class="primary-btn" data-page="town">进入小镇主界面</button>
      </div>
    </section>
  `;
}

function renderTown() {
  const selected = getSelectedObjects();
  return `
    <section class="page town-page">
      <button class="sea-tile sea-a" data-action="townTarget" data-type="sea" data-name="西侧海域">海域</button>
      <button class="sea-tile sea-b" data-action="townTarget" data-type="sea" data-name="东侧海域">海域</button>
      <button class="sea-tile sea-c" data-action="townTarget" data-type="sea" data-name="南侧海域">海域</button>
      <div class="coin-box">金币 ${state.resources.金币}</div>
      <button class="gear" data-action="sideTool" data-tool="设置">⚙</button>
      <div class="left-ui">
        <button data-action="sideTool" data-tool="好友">好友</button>
        <button data-action="sideTool" data-tool="工会">工会</button>
      </div>
      <div class="top-command command-a">
        <button data-action="commandTool" data-tool="创建分身">创建分身</button>
        <button class="${state.selectionMode ? "active" : ""}" data-action="commandTool" data-tool="框选">框选</button>
      </div>
      ${state.selectionExpanded ? `<div class="expand-bar selection-bar">
        <button class="${state.selectionMode === "角色框选" ? "active" : ""}" data-action="commandTool" data-tool="角色框选">角色框选</button>
        <button class="${state.selectionMode === "建筑框选" ? "active" : ""}" data-action="commandTool" data-tool="建筑框选">建筑框选</button>
      </div>` : ""}
      <div class="top-command command-b">
        <button data-action="commandTool" data-tool="活动入口">活动功能</button>
      </div>
      ${state.activityExpanded ? `<div class="expand-bar activity-bar">
        <button data-action="commandTool" data-tool="通行证">通行证</button>
        <button data-action="commandTool" data-tool="活动">活动</button>
      </div>` : ""}
      <div class="right-ui">
        <button data-action="sideTool" data-tool="地图">地图</button>
        <button data-action="sideTool" data-tool="背包">背包</button>
      </div>
      ${state.selectionMode ? `<div class="selection-hint">${state.selectionMode}：拖动矩形；已选 ${selected.length}</div>` : ""}
      <div class="town-grid">
        ${townCells()}
      </div>
      ${standaloneTownObjects.map((item) => townEntityButton(item)).join("")}
      <div class="queue-strip">
        ${state.buildingQueue.length ? state.buildingQueue.slice(0, 2).map((job) => `<span>${job.name}｜${job.npc}｜${job.status} ${job.time}</span>`).join("") : "<span>建造队列：空</span>"}
      </div>
      <div class="town-log">${state.log}</div>
      <button class="dock-harvest" data-action="collect">收获</button>
    </section>
  `;
}

function townCells() {
  return townObjects.map((cell) => townEntityButton(cell, "town-cell")).join("");
}

function townEntityButton(item, baseClass = "") {
  const selected = state.selectedTownTarget === item.name || state.selectedObjectIds.includes(item.id);
  return `
    <button class="${baseClass} ${item.cls} ${selected ? "selected box-selected" : ""}"
      data-action="townTarget"
      data-type="${item.type}"
      data-name="${item.name}"
      data-selectable-id="${item.id}"
      data-selectable-type="${item.selectType}"
      title="${item.hint}">
      <span>${item.name}</span>
    </button>
  `;
}

function renderWorld() {
  const levels = currentEnergyLevels();
  const dreamHeight = energyHeight(levels.dream);
  const challengeHeight = energyHeight(levels.challenge);
  return `
    <section class="page world-page">
      ${header("世界传送地图", "出行小舟选队后进入；左梦想能量、右挑战能量，地域按等级由下到上解锁", "town")}
      <div class="map-guide">世界地图也按等级向上延展：出生地在最下方，能量越高越往上解锁。未解锁地域保持灰色。</div>
      <div class="explore-frame world-frame" data-scroll-key="world" data-start="bottom">
        <div class="world-map long-map" style="--dream-fill:${dreamHeight}; --challenge-fill:${challengeHeight};">
          <div class="energy-bg dream-bg"></div>
          <div class="energy-bg challenge-bg"></div>
          <div class="energy-overlap"></div>
          <div class="energy-column dream"><span>梦想 Lv.${levels.dream}${state.demoUnlock ? " 演示" : ""}</span><i></i></div>
          <div class="energy-column challenge"><span>挑战 Lv.${levels.challenge}${state.demoUnlock ? " 演示" : ""}</span><i></i></div>
          <button class="demo-unlock-btn ${state.demoUnlock ? "active" : ""}" data-action="demoUnlock">
            ${state.demoUnlock ? "关闭演示解锁" : "演示用：临时解锁高等级地域"}
          </button>
          <button class="home-region" data-page="town">出生地<br><small>小船初始位置</small></button>
          <div class="route-line"></div>
          ${worldRegions.map((region) => {
            const unlocked = isRegionUnlocked(region);
            return `
            <button class="map-region ${unlocked ? "unlocked" : "locked"} ${state.currentRegion === region.name ? "selected" : ""}" style="left:${region.left}; top:${region.top}" data-action="travel" data-region="${region.name}" data-left="${region.left}" data-top="${region.top}" data-locked="${unlocked ? "false" : "true"}">
              ${region.name}<small>${region.energy === "dream" ? "梦想" : "挑战"} Lv.${region.level}</small>
            </button>`;
          }).join("")}
          <div class="map-boat" style="left:${state.boat.left}; top:${state.boat.top}">小船</div>
        </div>
      </div>
    </section>
  `;
}

function renderTownMap() {
  return `
    <section class="page town-map-page">
      ${header("小镇地图总览", "只显示当前小镇土地、建筑、NPC 和交通点位，不前往五大地域", "town")}
      <div class="map-guide">小镇总览也按更大海域呈现：当前只开发中部九宫格，周围海域可扩地，桥和小舟在海面边缘。</div>
      <div class="explore-frame town-overview-frame" data-scroll-key="townMap" data-start="bottom">
        <div class="town-overview long-town-overview">
          <div class="overview-sea">海域</div>
          <div class="overview-land">
            ${["NPC", "仓库", "空地", "田地", "分身", "公告", "住宅", "招募", "铁匠"].map((x) => `<span>${x}</span>`).join("")}
          </div>
          <span class="overview-expansion expansion-a">可扩海域</span>
          <span class="overview-expansion expansion-b">未来住宅区</span>
          <span class="overview-expansion expansion-c">未来商业角</span>
          <span class="overview-bridge">桥 → 海面</span>
          <span class="overview-boat">出行小舟</span>
          <span class="overview-map-note">右侧地图 UI 只查看小镇；世界地图必须从小舟进入</span>
        </div>
      </div>
    </section>
  `;
}

function renderAdventure() {
  return `
    <section class="page adventure-page">
      ${header("冒险地地图", "从底部入口向上探索：平原 → 森林 → 岩石洞穴 → 火山 / 冰原", "world")}
      <div class="map-guide">当前视窗只显示地图的一段，向上滚动探索高等级区域。底部为入口，小队从下往上推进。</div>
      <div class="explore-frame adventure-frame" data-scroll-key="adventure" data-start="bottom">
        <div class="adventure-map-canvas long-map">
          <div class="vertical-path adventure-path"></div>
          <div class="map-depth-label depth-start">入口 / 小舟登陆点</div>
          <div class="map-depth-label depth-mid">中层探索</div>
          <div class="map-depth-label depth-top">高危区域</div>

          <button class="adventure-zone plain" data-action="regionInteract" data-title="平原入口" data-desc="入口教学带、草地巡逻带、村落前哨和草原 Boss 空地。">平原入口<small>小怪巡逻 / 白装 / 平原土地</small></button>
          <button class="adventure-zone forest" data-action="regionInteract" data-title="森林区" data-desc="外围树丛、蜂巢岔路、原生村落和古树深处。">森林区<small>砍树 / 村落事件 / 绿装</small></button>
          <button class="adventure-zone cave" data-action="regionInteract" data-title="岩石洞穴" data-desc="洞穴入口、矿脉采集层、失踪矿工支线和 Boss 房。">岩石洞穴<small>矿石 / 装备胚料 / 蓝装</small></button>
          <button class="adventure-zone volcano" data-action="regionInteract" data-title="火山区" data-desc="火山坡、熔岩桥、熔炉遗迹和龙巢，挑战等级不足时不可深入。">火山区<small>熔岩矿 / 火系精英 / 高阶 Boss</small></button>
          <button class="adventure-zone ice" data-action="regionInteract" data-title="冰原区" data-desc="雪坡入口、冻土巡逻带、极光夜事件点和冰原 Boss 场。">冰原区<small>冰晶 / 控制怪 / 高阶 Boss</small></button>

          <button class="adventure-entity adv-party" data-action="regionInteract" data-title="当前小队" data-desc="小队从底部入口出发，点击上方区域会沿主路移动。">小队</button>
          <button class="adventure-entity adv-slime" data-action="regionInteract" data-title="平原小怪巡逻" data-desc="平原史莱姆、刺球鼠、草药蛙，掉落基础材料、白色装备和平原土地。">小怪巡逻</button>
          <button class="adventure-entity adv-goblin" data-action="regionInteract" data-title="村落前哨精英" data-desc="平原狂犬、流浪甲虫王等精英，首次击败推进村落任务。">精英前哨</button>
          <button class="adventure-entity adv-boss-plain" data-action="regionInteract" data-title="草原 Boss 空地" data-desc="挑战 Lv.2 后开放草原巨兽，挑战 Lv.3 后开放荒地守望者。">草原 Boss</button>
          <button class="adventure-entity tree-entity" data-action="regionInteract" data-title="森林树丛" data-desc="框选角色后点击树木，队伍会自动聚集并开始砍树。">树木</button>
          <button class="adventure-entity adv-hive" data-action="regionInteract" data-title="蜂巢岔路" data-desc="花粉蜂群刷新点，清理后可获得蜂蜜、草药和森林土地。">蜂巢岔路</button>
          <button class="adventure-entity village-entity" data-action="regionInteract" data-title="原生村落" data-desc="村落 NPC 可对话、接事件，提升好感后可收服来小镇工作。">原生村落</button>
          <button class="adventure-entity native-building" data-action="regionInteract" data-title="村落建筑" data-desc="旅店恢复、工坊兑换、公告板领取村落事件。">村落建筑</button>
          <button class="adventure-entity adv-pet" data-action="regionInteract" data-title="走失魔宠范围" data-desc="魔法塔任务会在森林产生搜索范围，找到后进入战斗并拾取眩晕宠物。">宠物范围</button>
          <button class="adventure-entity adv-mine" data-action="regionInteract" data-title="矿脉采集层" data-desc="点击矿点派遣角色采矿，产出矿石、岩石土地和铁匠铺材料。">矿脉</button>
          <button class="adventure-entity adv-miner" data-action="regionInteract" data-title="失踪矿工支线" data-desc="触发矿镐亡灵任务，完成后解锁矿工 NPC 和矿场收益。">失踪矿工</button>
          <button class="adventure-entity adv-cave-boss" data-action="regionInteract" data-title="洞穴 Boss 房" data-desc="岩晶魔像、黑曜石傀儡、地脉吞噬者，掉落洞穴核心材料。">洞穴 Boss</button>
          <button class="adventure-entity adv-volcano-elite" data-action="regionInteract" data-title="熔岩桥精英" data-desc="熔岩犬、爆裂岩核驻守，挑战失败会把小队弹回火山坡。">熔岩桥</button>
          <button class="adventure-entity adv-volcano-boss" data-action="regionInteract" data-title="龙巢 Boss" data-desc="挑战 Lv.6 或火山熔炉试炼后开放赤焰巨龙幼体。">龙巢 Boss</button>
          <button class="adventure-entity adv-ice-elite" data-action="regionInteract" data-title="冻土巡逻带" data-desc="冰爪狼、霜甲巨人等控制型精英，产出冰晶和防具材料。">冻土精英</button>
          <button class="adventure-entity adv-ice-boss" data-action="regionInteract" data-title="极光 Boss 场" data-desc="极光夜事件后开放极光女巫，掉落金色装备材料。">极光 Boss</button>
          <button class="adventure-entity loot-entity" data-action="regionInteract" data-title="掉落光" data-desc="按稀有度闪对应颜色光，自动进入背包；紫色和金色进入待确认。">掉落光</button>
          <button class="shovel-ui sticky-map-tool" data-action="regionInteract" data-title="铲子挖土" data-desc="点击铲子后再点土地，角色去挖对应区域土地块 x5。">铲子</button>
          <button class="battle-shortcut sticky-map-tool" data-page="battle">进入战斗</button>
        </div>
      </div>
    </section>
  `;
}

function renderBusiness() {
  return `
    <section class="page region-map-page business-page">
      ${header("世界商业地地图", "从底部市集入口向上走：摊位街 → 行商会 → 拍卖区 → 商业竞争", "world")}
      <div class="map-guide">商业地不是交易菜单，是一条可向上逛的市集长街。沿主路点击摊位、NPC、公告和拍卖建筑。</div>
      <div class="explore-frame region-frame" data-scroll-key="business" data-start="bottom">
        <div class="region-map-canvas market-canvas long-map">
          <div class="main-road vertical-road"></div>
          <div class="district-label market-entry">市集入口 / 教程交易</div>
          <div class="district-label market-mid">行商会订单街</div>
          <div class="district-label market-top">拍卖与商业竞争区</div>
          <button class="market-shop shop-0" data-action="regionInteract" data-title="材料摊" data-desc="基础材料买卖，卖出冒险素材后梦想能量升至 Lv.2。">材料摊</button>
          <button class="market-shop shop-1" data-action="regionInteract" data-title="农产摊" data-desc="田地农产、苹果、鱼类等小镇产物在这里自动或手动出售。">农产摊</button>
          <button class="market-shop shop-2" data-action="regionInteract" data-title="装备铺" data-desc="出售白/绿/蓝色装备；紫色以上交易必须二次确认。">装备铺</button>
          <button class="market-shop shop-3" data-action="regionInteract" data-title="魔法材料铺" data-desc="购买魔法晶尘、宠物笼、符文石等魔法地材料。">魔法材料</button>
          <button class="market-shop shop-4" data-action="regionInteract" data-title="仓储码头" data-desc="批量交易和仓库溢出物资中转，靠海连接小镇物流。">仓储码头</button>
          <button class="market-shop shop-5" data-action="regionInteract" data-title="黑市岔路" data-desc="高风险订单和黑市凭证，收益高但可能触发黑市打手。">黑市岔路</button>
          <button class="trade-center" data-action="regionInteract" data-title="交易入口" data-desc="玩家可买卖商品；NPC 商业行为会增长梦想能量。">交易入口</button>
          <button class="wandering-merchant" data-action="regionInteract" data-title="行商 NPC" data-desc="行商可被对话攻略，收服后来小镇仍保留交易功能。">行商 NPC</button>
          <button class="market-shop shop-6" data-action="regionInteract" data-title="行商会" data-desc="接商会委托、低买高卖、商路护送和订单结算。">行商会</button>
          <button class="market-shop shop-7" data-action="regionInteract" data-title="拍卖栏" data-desc="竞拍稀有材料、蓝紫装备和特殊建筑材料。">拍卖栏</button>
          <button class="commerce-war" data-action="regionInteract" data-title="商业竞争公告" data-desc="商业战争入口：低价收购、竞价排行、商路争夺。">商业竞争</button>
          <div class="market-status">教程线：卖出冒险素材后梦想能量升至 Lv.2｜向上滚动进入高级交易区</div>
        </div>
      </div>
    </section>
  `;
}

function renderCreative() {
  return `
    <section class="page region-map-page creative-page">
      ${header("创意地地图", "从报名入口向上探索：提交作品 → 投票广场 → 展示区 → 冠军台", "world")}
      <div class="map-guide">创意地是一条展览动线，底部提交作品，上方逐层展示第三名、第二名、第一名和评审区。</div>
      <div class="explore-frame region-frame" data-scroll-key="creative" data-start="bottom">
        <div class="region-map-canvas creative-canvas long-map">
          <div class="creative-walk"></div>
          <div class="district-label creative-entry">报名入口 / 建筑快照</div>
          <div class="district-label creative-mid">投票与评审</div>
          <div class="district-label creative-top">冠军展示台</div>
          <button class="submit-booth" data-action="regionInteract" data-title="提交建筑" data-desc="提交自己的建筑或建筑组合参与竞赛，系统保存快照。">提交建筑</button>
          <button class="vote-booth" data-action="regionInteract" data-title="投票入口" data-desc="对展示建筑投票，推动创意竞赛排名。">投票入口</button>
          <button class="gallery-block rank-three" data-action="regionInteract" data-title="第三名建筑展示" data-desc="展示玩家投票后的第三名作品，可查看作者小镇。">建筑 3</button>
          <button class="gallery-block rank-two" data-action="regionInteract" data-title="第二名建筑展示" data-desc="玩家可查看、点赞、借鉴布局。">建筑 2</button>
          <button class="gallery-block rank-one" data-action="regionInteract" data-title="第一名建筑展示" data-desc="本期竞赛冠军作品占据最大展示地块。">建筑 1</button>
          <button class="gallery-block judge-booth" data-action="regionInteract" data-title="评审席" data-desc="NPC 评委按主题契合、布局完整度和建筑等级给分。">评审席</button>
          <button class="gallery-block material-exchange" data-action="regionInteract" data-title="装饰材料兑换点" data-desc="用创意积分兑换装饰材料和建筑皮肤券。">兑换点</button>
          <button class="gallery-block season-board" data-action="regionInteract" data-title="赛季榜单" data-desc="查看本期主题、投票排行和赛季奖励。">赛季榜</button>
          <div class="creative-status">已投票 ${state.creativeVotes} 次｜${state.submittedBuilding ? "已提交本期作品" : "未提交作品"}｜向上滚动看冠军展示</div>
        </div>
      </div>
    </section>
  `;
}

function renderHarmony() {
  return `
    <section class="page region-map-page harmony-page">
      ${header("和谐地地图", "从好友入口向上探索：点赞 → 驻外 NPC → 工会公共建设", "world")}
      <div class="map-guide">和谐地按社交深度往上展开：底部好友参观，中段驻外交流，顶部工会大型建设。</div>
      <div class="explore-frame region-frame" data-scroll-key="harmony" data-start="bottom">
        <div class="region-map-canvas harmony-canvas long-map">
          <div class="harmony-river"></div>
          <div class="district-label harmony-entry">好友参观入口</div>
          <div class="district-label harmony-mid">驻外与关系网</div>
          <div class="district-label harmony-top">工会公共工程</div>
          <button class="friend-gate" data-action="regionInteract" data-title="好友小镇入口" data-desc="从这里前往好友小镇参观。">好友小镇入口</button>
          <button class="like-plaza" data-action="regionInteract" data-title="点赞广场" data-desc="给其他小镇点赞，提升社区互动。">点赞广场</button>
          <button class="npc-post" data-action="regionInteract" data-title="驻外 NPC 区" data-desc="把 NPC 派驻到其他小镇交流。">驻外 NPC 区</button>
          <button class="friend-gate return-mail" data-action="regionInteract" data-title="好友回访信箱" data-desc="领取好友回访、驻外反馈和点赞奖励。">回访信箱</button>
          <button class="npc-post relation-park" data-action="regionInteract" data-title="关系调解公园" data-desc="处理 NPC 争吵、聚餐、关系网修复等事件。">关系公园</button>
          <button class="guild-ground" data-action="regionInteract" data-title="工会建设区" data-desc="工会成员参与建设的大型聚集地。">工会建设区</button>
          <button class="guild-ground public-workshop" data-action="regionInteract" data-title="公共工坊" data-desc="提交材料、金币和 NPC 工时推进公共建筑。">公共工坊</button>
          <div class="harmony-status">今日点赞 ${state.harmonyLikes}｜驻外 NPC：${state.stationedNpc}｜向上滚动进入工会区</div>
        </div>
      </div>
    </section>
  `;
}

function renderInventory() {
  const item = items[state.selectedItem];
  const visible = sortedItems().filter((key) => items[key].tab === state.activeItemTab);
  const storageRows = Object.entries(state.storage).slice(0, 8);
  return `
    <section class="page inventory-page">
      <button class="close-x" data-page="town">×</button>
      <div class="inventory-scroll">
        <div class="inv-tabs">
          ${["材料", "道具", "装备"].map((tab) => `<button class="${state.activeItemTab === tab ? "active" : ""}" data-action="tabItem" data-tab="${tab}">${tab}</button>`).join("")}
        </div>
        <div class="inventory-workbench">
          <div class="inv-detail">
            <div><strong>名称</strong>${state.selectedItem}</div>
            <div><strong>描述</strong>${item.desc}</div>
            <div><strong>堆叠</strong>${item.count}/50，超出进入仓库</div>
            <button class="secondary-btn" data-action="useItem">使用/查看</button>
          </div>
          <div class="inv-grid">
            ${visible.map((name) => `<button class="${state.selectedItem === name ? "active" : ""}" data-action="item" data-item="${name}">${name}<br>${items[name].count}</button>`).join("")}
          </div>
        </div>
        <div class="inventory-extended">
          <div class="inventory-card">
            <strong>仓库溢出</strong>
            <div class="mini-storage-grid">
              ${storageRows.map(([name, amount]) => `<span>${name}<b>${amount}</b></span>`).join("")}
            </div>
          </div>
          <div class="inventory-card">
            <strong>快速处理</strong>
            <button data-action="useItem">使用选中物品</button>
            <button data-action="openShop">拿去商业地交易</button>
            <button data-page="town">返回小镇找仓库</button>
          </div>
          <div class="inventory-card wide">
            <strong>装备与材料去向</strong>
            <div class="inventory-route">
              <span>冒险地掉落</span><i></i><span>背包 50 上限</span><i></i><span>仓库溢出</span><i></i><span>交易/建造/强化</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderRole() {
  const roleName = state.selectedTownTarget.includes("NPC") ? state.selectedTownTarget.replace("NPC ", "") : "玩家分身";
  return `
    <section class="page panel-page">
      ${header(`角色面板：${roleName}`, "属性 / 装备 / 关系网均可切换，关系节点可拖动", "town")}
      <div class="content">
        <div class="tabs">${["属性", "装备", "关系网"].map((tab) => `<button class="tab-btn ${state.activeRoleTab === tab ? "active" : ""}" data-action="roleTab" data-tab="${tab}">${tab}</button>`).join("")}</div>
        ${state.activeRoleTab === "属性" ? roleStats(roleName) : ""}
        ${state.activeRoleTab === "装备" ? roleEquip(roleName) : ""}
        ${state.activeRoleTab === "关系网" ? roleRelation() : ""}
      </div>
    </section>
  `;
}

function roleStats(roleName) {
  return `
    <div class="role-stats-layout">
      <div class="role-model">${roleName}<br>动态建模</div>
      <div class="role-attrs">性格：ENFJ<br><br>等级：1<br><br>建设 86<br>战斗 62<br>社交 74</div>
      <div class="trait-row"><span>${state.selectedTraits.主特性}</span><span>${state.selectedTraits.副特性1}</span><span>${state.selectedTraits.副特性2}</span></div>
      <div class="role-ai-state">
        <strong>AI 当前计划</strong>
        <span>08:00 检查建造队列</span>
        <span>10:00 桥边钓鱼或去森林砍树</span>
        <span>14:00 处理小镇事件 / 好友回访</span>
        <span>20:00 跟随玩家团队外出冒险</span>
      </div>
      <div class="role-task-board">
        <strong>可派遣动作</strong>
        <button data-page="town">回小镇工作</button>
        <button data-page="adventure">去冒险地</button>
        <button data-action="npcTask">查看任务</button>
      </div>
      <div class="role-diary">角色日记：<br><br>2026.9.1 12:00：发现玩家上线，主动汇报离线收益。<br><br>2026.9.1 12:20：在桥边钓鱼摸鱼，被其他 NPC 吐槽。</div>
    </div>
  `;
}

function roleEquip(roleName) {
  return `
    <div class="role-equip-layout">
      <div class="equip-list">
        ${Object.keys(equipDetails).map((x) => `<button class="${state.selectedEquip === x ? "active" : ""}" data-action="equip" data-equip="${x}">${x}</button>`).join("")}
      </div>
      <div class="role-model">${roleName}<br>装备预览</div>
      <div class="equip-detail">${equipDetails[state.selectedEquip].replaceAll("\n", "<br>")}</div>
      <div class="equip-build-panel">
        <strong>装备成长链</strong>
        <span>白装掉落 → 铁匠铺强化 → 镶嵌材料 → 独特技能觉醒</span>
        <span>当前选中部位：${state.selectedEquip}</span>
        <button data-page="battle">进入战斗测试技能</button>
      </div>
      <div class="equip-source-panel">
        <strong>来源提示</strong>
        <span>旧皮甲：平原小怪 / 商业地装备铺</span>
        <span>独特短剑：新手独特装备 / 招募 IP 角色概率携带</span>
      </div>
    </div>
  `;
}

function roleRelation() {
  const events = [
    "艾琳想去森林砍树，完成后好感 +5。",
    "洛克和米娅在桥边争吵，可通过活动事件调解。",
    "暗影提出商业地订单，卖出木材可提升梦想能量。",
  ];
  return `
    <div class="relation-panel">
      <div class="relation-legend">红色单箭头：单相思<br>绿色双箭头：竞争/仇人<br>蓝色双箭头：朋友<br>拖动节点可调整关系图布局</div>
      <div class="relation-line friend-line"></div>
      <div class="relation-line rival-line"></div>
      <button class="relation-core">玩家分身</button>
      ${relations.map((item) => {
        const pos = relationPosition(item.id);
        return `<button class="relation-dot ${state.selectedRelation === item.name ? "active" : ""}" style="left:${pos.x}px; top:${pos.y}px; --rel:${item.color}" data-action="relationFocus" data-rel-id="${item.id}" data-name="${item.name}">${item.name}<small>${item.kind}</small></button>`;
      }).join("")}
      <div class="relation-detail">当前选中：${state.selectedRelation}<br>关系变化会影响对话、任务、合作和随机事件。</div>
    </div>
    <div class="relation-event-list">
      ${events.map((x) => `<button data-action="regionInteract" data-title="关系事件" data-desc="${x}">${x}</button>`).join("")}
    </div>
  `;
}

function renderBattle() {
  const canSkill = state.selectedEquip === "武器" || state.selectedEquip === "靴子";
  return `
    <section class="page battle-page">
      ${header("战斗界面", "支持回合制手操与 AI 即时托管；死亡后出现掉落并拾取进背包/仓库", "adventure")}
      <div class="battle-scroll">
        <div class="battle-mode-row">
          <span>模式：${state.battleMode}</span>
          <span>选中：角色${state.selectedBattleMember + 1} / ${state.selectedEquip}</span>
        </div>
        <div class="battle-field">
          <div class="battle-lane-label lane-top">怪物区</div>
          <div class="battle-lane-label lane-bottom">我方六人站位</div>
          <div class="enemy">
            <div class="enemy-hp" style="width:${state.battleHp}%"></div>
            <div class="monster-body">${state.battleResolved ? "眩晕/死亡" : "平原小怪"}<small>${state.battleHp}%</small></div>
          </div>
          ${state.battleDrops.length ? `<button class="battle-drop-glow" data-action="pickupBattleDrop">掉落光<br>${state.battleDrops.join("、")}</button>` : ""}
          <div class="party">
            ${Array.from({ length: 6 }, (_, i) => `<button class="party-member ${state.selectedBattleMember === i ? "selected" : ""}" data-action="battleMember" data-index="${i}">角色${i + 1}<span style="width:${Math.max(30, 100 - i * 7)}%"></span></button>`).join("")}
          </div>
        </div>
        <div class="battle-equips">
          ${Object.keys(equipDetails).map((x) => `<button class="${state.selectedEquip === x ? "selected" : ""}" data-action="equip" data-equip="${x}">${x}</button>`).join("")}
        </div>
        <div class="battle-skill-desc">${equipDetails[state.selectedEquip].replaceAll("\n", " ｜ ")}</div>
        <div class="battle-actions">
          <button data-action="attack">普攻</button>
          <button class="${canSkill ? "skill-ready" : ""}" data-action="skill">独特技能</button>
          <button data-action="autoBattle">即时托管</button>
        </div>
        <div class="battle-extra-actions">
          <button data-action="pickupBattleDrop">拾取掉落</button>
          <button data-action="resetBattle">重开演示</button>
        </div>
        <div class="battle-tactics-grid">
          <div class="battle-card">
            <strong>回合顺序</strong>
            <span>角色1 → 平原小怪 → 角色2 → 角色3 → 后排辅助</span>
            <span>速度由鞋子、裤子和飞毛腿特性影响。</span>
          </div>
          <div class="battle-card">
            <strong>怪物意图</strong>
            <span>${state.battleResolved ? "已失去行动能力" : "下一回合：随机扑击前排角色"}</span>
            <span>精英和 Boss 会额外显示蓄力条、范围提示。</span>
          </div>
          <div class="battle-card">
            <strong>背包快捷栏</strong>
            <button data-action="useItem">使用选中背包物品</button>
            <button data-page="inventory">打开背包</button>
          </div>
          <div class="battle-card">
            <strong>结算规则</strong>
            <span>白/绿掉落自动拾取；紫/金掉落弹确认。</span>
            <span>背包满 50 后进入仓库建筑。</span>
          </div>
        </div>
        <div class="battle-log">
          <strong>战斗日志</strong>
          ${state.battleLog.slice(0, 8).map((line) => `<span>${line}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderMagic() {
  return `
    <section class="page magic-page">
      ${header("魔法地地图", "从底部传送阵向上探索：魔法塔 → 集市 → 住宅区 → 竞赛传送阵", "world")}
      <div class="map-guide">魔法地是沿主路上行的长地图。传送阵在底部，越往上越接近高阶魔法竞赛和镜像试炼。</div>
      <div class="explore-frame magic-frame" data-scroll-key="magic" data-start="bottom">
        <div class="magic-map-canvas long-map">
          <button class="teleport-pad" data-action="magicPanel">传送阵<br><small>入口</small></button>
          <div class="magic-road"></div>
          <div class="district-label magic-entry">传送阵入口</div>
          <div class="district-label magic-mid">魔法塔 / 集市 / 住宅</div>
          <div class="district-label magic-top">竞赛与镜像试炼</div>
          <button class="magic-zone tower-a" data-action="regionInteract" data-title="魔法塔区域" data-desc="玩家走到的地方两侧魔法塔浮现；每日随机两个任务气泡。">魔法塔 A<br>任务气泡</button>
          <button class="magic-zone tower-b" data-action="regionInteract" data-title="魔法塔区域" data-desc="提交道具任务、寻找宠物任务和魔法研究都从这里接取。">魔法塔 B<br>研究任务</button>
          <button class="magic-zone shops" data-action="regionInteract" data-title="魔法集市" data-desc="道路两侧店铺可购买魔法道具、魔法材料、魔宠。">魔法集市<br>店铺交易</button>
          <button class="magic-zone pet-yard" data-action="regionInteract" data-title="魔宠寄养处" data-desc="走失魔宠任务完成后，可选择自养或归还 NPC。">魔宠寄养</button>
          <button class="magic-zone homes" data-action="regionInteract" data-title="住宅区" data-desc="区域内所有 NPC 可对话，可提升好感并触发任务。">住宅区<br>NPC 对话</button>
          <button class="magic-zone rune-lab" data-action="regionInteract" data-title="符文研究室" data-desc="制作传送阵、符文石和魔法装备材料。">符文研究</button>
          <button class="magic-zone contest" data-action="regionInteract" data-title="魔法竞赛传送阵" data-desc="右上守候两名 NPC，对话后选择竞赛类型并传送到竞赛场地。">魔法竞赛<br>传送阵</button>
          <button class="magic-zone mirror-trial" data-action="regionInteract" data-title="镜像试炼" data-desc="挑战镜像法师，掉落镜像法袍和高阶魔法材料。">镜像试炼</button>
          <div class="magic-status">底部入口默认可见；向上滚动查看高阶魔法塔与竞赛传送阵。</div>
        </div>
      </div>
    </section>
  `;
}

function header(title, subtitle, back) {
  return `
    <header class="page-header">
      <button class="back-btn" data-page="${back}">‹</button>
      <div>
        <h2 class="page-title">${title}</h2>
        <div class="page-subtitle">${subtitle}</div>
      </div>
    </header>
  `;
}

function renderModal() {
  if (!state.modal) return "";
  const regionActions = state.modal.type === "regionEntity" ? regionModalActions(state.modal.title) : "";
  const templates = {
    wechat: ["微信登录", "按钮点按高亮，松开后恢复，并弹出微信登录。登录成功进入创建分身。", `<button class="primary-btn" data-action="loginOk">确认授权</button><button class="secondary-btn" data-action="close">取消</button>`],
    offlineReport: ["镇长离线汇报", offlineReportPanel(), ""],
    recruit: ["招募栏", recruitPanel(), ""],
    building: [`${state.modal.name} 操作`, buildingModalText(state.modal.name), `<button class="primary-btn" data-action="buildingUpgrade">升级</button><button class="secondary-btn" data-action="buildingMove">移动</button><button class="secondary-btn" data-action="buildingDestroy">销毁</button>`],
    batchBuilding: ["批量建筑操作", `当前已选中：${getSelectedObjects().map((item) => item.name).join("、") || "无"}。目标：${state.modal.target}。可批量升级、移动或销毁。`, `<button class="primary-btn" data-action="batchUpgrade">批量升级</button><button class="secondary-btn" data-action="close">取消</button>`],
    npc: [`${state.modal.name}`, npcPanel(state.modal.name), ""],
    dialogue: [`与${state.modal.name}对话`, dialoguePanel(state.modal.name), ""],
    giftResult: ["送礼结果", `${state.modal.name}收下礼物，好感度提升到 ${state.friendship}。当亲密度和好感度达标后，可收服 NPC 来小镇工作。`, `<button class="primary-btn" data-action="close">继续观察</button>`],
    npcTask: [`${state.modal.name}的任务`, "任务：帮艾琳从森林带回 5 个木材。完成后获得金币、好感度和小镇经验。", `<button class="primary-btn" data-action="acceptNpcTask">接受任务</button><button class="secondary-btn" data-action="close">稍后</button>`],
    land: ["空地：选择建筑类型", buildPanel(), ""],
    sea: ["海域：放置土地类型", soilPanel(), ""],
    warehouse: ["仓库", warehousePanel(), ""],
    teamSelect: ["出行小舟：选择团队成员", teamPanel(), ""],
    teleport: ["传送阵侧边栏", teleportPanel(), ""],
    settings: ["设置", "设置按钮位于右上角，点击弹出设置页面。", `<button class="primary-btn" data-action="close">关闭</button>`],
    friend: ["好友", friendPanel(), ""],
    guild: ["工会", guildPanel(), ""],
    event: ["活动", eventPanel(), ""],
    pass: ["通行证", passPanel(), ""],
    shop: ["交易商店", shopPanel(), ""],
    magicTask: ["魔法塔任务", magicTaskPanel(), ""],
    regionEntity: [state.modal.title, state.modal.desc, regionActions],
  };
  const t = templates[state.modal.type];
  if (!t) return "";
  const isCustom = ["offlineReport", "recruit", "teamSelect", "npc", "dialogue", "land", "sea", "warehouse", "shop", "magicTask", "friend", "guild", "event", "pass"].includes(state.modal.type);
  return `
    <div class="modal-layer">
      <div class="modal">
        <h3>${t[0]}</h3>
        ${isCustom ? t[1] : `<p>${t[1]}</p><div class="modal-actions">${t[2]}</div>`}
      </div>
    </div>
  `;
}

function buildingModalText(name) {
  if (name === "桥") return "桥从土地边缘延伸到海面，是小镇地图实体。NPC 会随机到桥上钓鱼；可升级、移动或销毁。";
  if (name === "铁匠铺") return "铁匠铺用于装备升级、锻造、镶嵌。挑战能量达到对应等级后逐步解锁。";
  return "点击或框选建筑物，弹出升级、销毁、移动操作栏。NPC 跑到建筑旁后执行。";
}

function regionModalActions(title) {
  if (["怪物", "小怪", "精英", "Boss"].includes(title)) return `<button class="primary-btn" data-page="battle">进入战斗</button><button class="secondary-btn" data-action="close">取消</button>`;
  if (title === "铲子挖土") return `<button class="primary-btn" data-action="startDig">开始挖土</button><button class="secondary-btn" data-action="close">取消</button>`;
  if (title === "掉落光") return `<button class="primary-btn" data-action="collectLoot">拾取掉落</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "商业竞争公告") return `<button class="primary-btn" data-action="acceptCommerceOrder">接取商会委托</button><button class="secondary-btn" data-action="openShop">查看交易</button>`;
  if (title.includes("商") || title.includes("摊") || title.includes("铺") || title === "交易入口") return `<button class="primary-btn" data-action="openShop">查看交易</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "魔法塔区域") return `<button class="primary-btn" data-action="acceptMagicTask">查看今日任务</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "魔法集市") return `<button class="primary-btn" data-action="openShop">打开商店</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "投票入口" || title.includes("建筑展示")) return `<button class="primary-btn" data-action="creativeVote">投票</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "提交建筑") return `<button class="primary-btn" data-action="submitBuilding">提交作品</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "好友小镇入口") return `<button class="primary-btn" data-action="friendVisit">参观好友小镇</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "点赞广场") return `<button class="primary-btn" data-action="likeTown">点赞</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "驻外 NPC 区") return `<button class="primary-btn" data-action="stationNpc">派驻阳光</button><button class="secondary-btn" data-action="close">关闭</button>`;
  if (title === "工会建设区") return `<button class="primary-btn" data-action="guildBuild">参与建设</button><button class="secondary-btn" data-action="close">关闭</button>`;
  return `<button class="primary-btn" data-action="close">确认交互</button><button class="secondary-btn" data-action="close">关闭</button>`;
}

function offlineReportPanel() {
  const rows = [
    ["新增建筑", "住宅地基 x1，树木 x2"],
    ["建筑升级", "田地 Lv.1 → Lv.2"],
    ["扩充土地", "平原土地块 +5"],
    ["新招募 NPC", "旅行者米娅，来源：小镇路过事件"],
    ["材料装备", "木材 +38，金币 +8600，旧皮甲 +1"],
    ["攻略结果", "NPC 自主攻略其他小镇 1 次，排名 +3"],
  ];
  return `
    <div class="offline-panel">
      <div class="mayor-card">镇长艾琳：你不在的时候大家没闲着，我来汇报今天的小镇进度。</div>
      <div class="offline-list">
        ${rows.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join("")}
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="claimOffline">领取并进入小镇</button></div>
    </div>
  `;
}

function npcPanel(name = "艾琳") {
  const npc = npcCast.find((item) => name.includes(item.name)) || npcCast[0];
  return `
    <div class="npc-panel">
      <div class="npc-summary">
        <strong>${name}</strong>
        <span>身份：${npc.role} / 小镇居民</span>
        <span>特性：${npc.trait}｜能力：${npc.ability}</span>
        <span>好感度：${state.friendship}/100</span>
        <span>当前状态：想去森林砍树，但也可能跑去桥边钓鱼。好感/亲密达标后可收服，并保留原本功能。</span>
      </div>
      <div class="modal-actions">
        <button class="primary-btn" data-page="role">查看角色信息</button>
        <button class="secondary-btn" data-action="npcDialog">对话</button>
        <button class="secondary-btn" data-action="npcGift">送礼</button>
        <button class="secondary-btn" data-action="npcTask">接任务</button>
      </div>
    </div>
  `;
}

function dialoguePanel(name) {
  return `
    <div class="dialogue-panel">
      <div class="chat-line npc">“今天桥边风不错，但如果你框选我去砍树，我也不是不行。”</div>
      <div class="chat-line player">“先帮小镇把木材补满，晚点让你钓鱼。”</div>
      <div class="chat-options">
        <button data-action="npcGift">送喜欢的礼物</button>
        <button data-action="npcTask">询问任务</button>
        <button data-action="close">结束对话</button>
      </div>
    </div>
  `;
}

function buildPanel() {
  const active = buildOptions.find((item) => item.name === state.selectedBuild) || buildOptions[0];
  const enough = hasResources(active.cost);
  return `
    <div class="build-panel">
      <div class="build-grid">
        ${buildOptions.map((item) => {
          const canBuild = hasResources(item.cost);
          return `<button class="${state.selectedBuild === item.name ? "active" : ""} ${canBuild ? "can-build" : "cant-build"}" data-action="buildType" data-build="${item.name}">
            <strong>${item.name}</strong><span>${canBuild ? "材料足够" : "材料不足"}</span>
          </button>`;
        }).join("")}
      </div>
      <div class="build-detail">
        <strong>${active.name}</strong>
        <span>放置条件：${active.terrain}</span>
        <span>需求：${costText(active.cost)}</span>
        <span>效果：${active.effect}</span>
        <span>解锁：${active.unlock}</span>
        <span>当前储量：${stockText(["木材", "平原土地", "森林土地", "岩石土地", "矿石"])}</span>
        <span class="${enough ? "ok-text" : "bad-text"}">${enough ? "材料满足，可派遣 NPC 建造" : "材料不足，按钮点击会提示缺少材料"}</span>
      </div>
      <div class="worker-row">
        ${workerOptions.map((name) => `<button class="${state.selectedBuildNpc === name ? "active" : ""}" data-action="buildNpc" data-npc="${name}">${name}</button>`).join("")}
      </div>
      <div class="queue-preview">
        <strong>建造队列</strong>
        ${state.buildingQueue.length ? state.buildingQueue.slice(0, 3).map((job) => `<span>${job.name} - ${job.npc} - ${job.time}</span>`).join("") : "<span>暂无建造任务</span>"}
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="confirmBuild">派遣 NPC 建造</button><button class="secondary-btn" data-action="close">取消</button></div>
    </div>
  `;
}

function soilPanel() {
  const active = soilOptions.find((item) => item.name === state.selectedSoil) || soilOptions[0];
  const stock = state.resources[active.stock] || 0;
  return `
    <div class="soil-panel">
      <div class="soil-grid">
        ${soilOptions.map((item) => `<button class="${state.selectedSoil === item.name ? "active" : ""} ${(state.resources[item.stock] || 0) >= item.amount ? "can-build" : "cant-build"}" data-action="soilType" data-soil="${item.name}">
          ${item.name}<br><small>库存 ${state.resources[item.stock] || 0}</small>
        </button>`).join("")}
      </div>
      <div class="build-detail">
        <strong>${active.name}</strong>
        <span>${active.desc}</span>
        <span>本次放置消耗：${active.stock} x${active.amount}</span>
        <span class="${stock >= active.amount ? "ok-text" : "bad-text"}">${stock >= active.amount ? "库存足够，NPC 会托着土地跑到海域放置" : "库存不足，请先去冒险地挖土或交易购买"}</span>
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="useSoil">确认放置土地</button><button class="secondary-btn" data-action="close">取消</button></div>
    </div>
  `;
}

function warehousePanel() {
  const entries = Object.entries(state.storage);
  return `
    <div class="warehouse-panel">
      <div class="warehouse-summary">
        <strong>仓库是地图建筑，不是固定 UI</strong>
        <span>背包世界观原生道具堆叠上限 50，超过部分进入仓库；交易、冒险掉落和挂机收益都会写入这里。</span>
      </div>
      <div class="warehouse-grid">
        ${entries.map(([name, amount]) => `<span><strong>${name}</strong>${amount}</span>`).join("")}
      </div>
      <div class="modal-actions"><button class="primary-btn" data-page="inventory">打开背包</button><button class="secondary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function friendPanel() {
  return `
    <div class="friend-panel">
      <div class="warehouse-summary">
        <strong>好友功能入口</strong>
        <span>梦想 Lv.2 后解锁；和谐地解锁后不再只是列表，而是通过好友小镇入口进入参观地图。</span>
      </div>
      <div class="friend-list">
        ${["晨曦的小镇｜可参观｜今日未点赞", "暗影商会镇｜可交易｜驻外NPC空位", "推荐小镇｜本周排名 86"].map((row) => `<button data-action="friendVisit">${row}</button>`).join("")}
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="friendVisit">前往好友小镇</button><button class="secondary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function guildPanel() {
  return `
    <div class="guild-panel">
      <div class="warehouse-summary">
        <strong>工会聚集地</strong>
        <span>和谐地解锁后，工会功能从单一 UI 扩展为一大片可建设区域，成员可提交材料、金币和 NPC 工时。</span>
      </div>
      <div class="guild-progress"><span style="width:36%"></span></div>
      <div class="queue-preview">
        <strong>当前工会工程：公共广场 Lv.1</strong>
        <span>进度 36%｜需求 木材x500 / 金币x50000 / NPC工时x20</span>
        <span>今日可贡献 1 次；贡献会触发驻外 NPC 交流事件。</span>
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="guildBuild">贡献建设</button><button class="secondary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function eventPanel() {
  return `
    <div class="event-panel">
      <div class="event-card">
        <strong>今日小镇突发事件</strong>
        <span>${state.eventHandled ? "已处理：洛克和米娅被劝和，关系网蓝色连线增强。" : "洛克和米娅因为桥边摸鱼吵起来了，需要玩家决策。"}</span>
      </div>
      <div class="event-card">
        <strong>小镇攻略时间</strong>
        <span>每日 14:00 / 20:00 可攻略或被攻略；当前剩余次数 ${state.pvpAttempts}。</span>
      </div>
      <div class="event-card">
        <strong>广告强化模拟</strong>
        <span>${state.adBoosted ? "今日已触发双倍收益演示。" : "观看广告可模拟收益翻倍、秒建造或稀有角色演出。"}</span>
      </div>
      <div class="modal-actions">
        <button class="primary-btn" data-action="handleTownEvent">处理事件</button>
        <button class="secondary-btn" data-action="pvpRaid">攻略其他小镇</button>
        <button class="secondary-btn" data-action="adBoost">广告强化</button>
        <button class="secondary-btn" data-action="close">关闭</button>
      </div>
    </div>
  `;
}

function passPanel() {
  return `
    <div class="pass-panel">
      <div class="event-card">
        <strong>月卡 / 通行证</strong>
        <span>提升离线收益上限、每日额外奖励和专属角色；当前原型只演示领取反馈。</span>
      </div>
      <div class="pass-track">
        ${["金币x8600", "魔法晶尘x1", "招募加速x1", "建筑皮肤券"].map((x, i) => `<span class="${i === 1 && state.passClaimed ? "claimed" : ""}">${x}</span>`).join("")}
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="claimPass">${state.passClaimed ? "今日已领取" : "领取今日奖励"}</button><button class="secondary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function shopPanel() {
  const goods = marketGoods.filter((item) => item.mode === state.marketMode);
  return `
    <div class="shop-panel">
      <div class="market-tabs">
        ${["买入", "卖出"].map((mode) => `<button class="${state.marketMode === mode ? "active" : ""}" data-action="marketTab" data-mode="${mode}">${mode}</button>`).join("")}
      </div>
      <div class="shop-goods">
        ${goods.map((item) => `<button data-action="shopBuy" data-item="${item.name}">
          <strong>${item.name}</strong><span>${item.kind} / ${item.price} 金币</span><small>${item.desc}</small>
        </button>`).join("")}
      </div>
      <div class="shop-cart">交易记录：${state.tradeCart.slice(-5).join("、") || "无"}<br>金币：${state.resources.金币}</div>
      <div class="shop-cart">商会委托：${state.commerceOrders[0] || "暂无，点击商业竞争公告接取。"}</div>
      <div class="modal-actions"><button class="primary-btn" data-action="close">完成交易</button></div>
    </div>
  `;
}

function magicTaskPanel() {
  return `
    <div class="magic-task-panel">
      <div class="task-card">
        <strong>任务一：提交道具</strong>
        <span>提交 3 个魔法晶尘，获得金币与法师好感。</span>
      </div>
      <div class="task-card">
        <strong>任务二：寻找宠物</strong>
        <span>魔法宠物跑丢到冒险地森林。地图产生范围标记，找到后战斗，清空血条使其眩晕。</span>
      </div>
      <div class="task-card">
        <strong>任务链演示</strong>
        <span>${state.magicTaskAccepted ? "已接取：冒险地森林将出现宠物范围标记，战斗后可拾取宠物笼。" : "点击查看今日任务后会标记为已接取。"}</span>
      </div>
      <div class="modal-actions"><button class="primary-btn" data-action="pickupPet">拾取眩晕宠物</button><button class="secondary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function teleportPanel() {
  const entries = [
    ["冒险地", "adventure", "显示当前团队所有成员"],
    ["世界商业地", "business", "前往市集与交易入口"],
    ["创意地", "creative", "查看竞赛建筑展示"],
    ["魔法地", "magic", "传送到魔法地入口传送阵"],
    ["和谐地", "harmony", "前往好友/工会聚集地"],
    ["小镇", "town", "返回当前小镇传送阵"],
  ];
  return `
    <div class="teleport-panel">
      ${entries.map(([name, page, desc]) => `<button data-page="${page}"><strong>${name}</strong><span>${desc}</span></button>`).join("")}
      <p class="fine-print">点击后出现传送特效，并让当前玩家分身出现在对应传送阵上。</p>
    </div>
  `;
}

function recruitPanel() {
  const slots = [
    { label: state.recruitStarted ? "剩余 12:00" : "空栏", unlocked: true, req: "小镇 Lv.1" },
    { label: "空栏", unlocked: true, req: "小镇 Lv.1" },
    { label: "锁定", unlocked: false, req: "小镇 Lv.3" },
    { label: "锁定", unlocked: false, req: "小镇 Lv.5" },
    { label: "锁定", unlocked: false, req: "小镇 Lv.8" },
  ];
  return `
    <div class="recruit-panel">
      <button class="recruit-main" data-action="startRecruit">${state.recruitStarted ? "招募中" : "招募"}</button>
      <div class="recruit-slots">
        ${slots.map((slot) => `<button class="lock-slot ${slot.unlocked ? "" : "locked"}">${slot.label}<small>${slot.req}</small></button>`).join("")}
      </div>
      <p class="fine-print">五个栏位随小镇等级解锁；12 小时完成一次。小镇 NPC 会自主接待，不需要玩家手动领取；所有招募都有小概率出现 IP 角色，IP 角色必带金色特性。</p>
      <div class="modal-actions"><button class="primary-btn" data-action="close">关闭</button></div>
    </div>
  `;
}

function teamPanel() {
  const members = ["玩家分身", "艾琳", "洛克", "米娅", "星辰", "月光", "空位", "空位"];
  return `
    <div class="team-panel">
      <div class="team-summary">挑战能量 Lv.1 后可组队外出，最大 6 人；只有从小镇边缘的出行小舟确认团队后才进入世界传送地图。</div>
      <div class="team-grid">
        ${members.map((x) => `<button class="${state.selectedTeamMembers.includes(x) ? "selected" : ""}" data-action="teamMember" data-name="${x}">${x}</button>`).join("")}
      </div>
      <p>当前团队：${state.selectedTeamMembers.join("、")}</p>
      <div class="modal-actions"><button class="primary-btn" data-action="confirmTeam">确认团队并出发</button><button class="secondary-btn" data-action="close">取消</button></div>
    </div>
  `;
}

render();
