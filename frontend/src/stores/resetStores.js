import { usePlayerStore } from './player';
import { useBuildingStore } from './buildings';
import { useAchievementStore } from './achievement';
import { useHistoryStore } from './historyStore';
import { useInventoryStore } from './inventory';
import { useGameStore } from './game';
import { useWallStore } from './wall';
import { useUiStore } from './ui';
import { useEventLogStore } from './eventLogStore';
import { useEventStore } from './eventStore';

export function resetAllStores() {
  try {
    const playerStore = usePlayerStore();
    playerStore.resetStore?.();
  } catch (error) {
    console.warn('重置 playerStore 失敗', error);
  }

  try {
    const gameStore = useGameStore();
    gameStore.resetStore?.();
  } catch (error) {
    console.warn('重置 gameStore 失敗', error);
  }

  try {
    const uiStore = useUiStore();
    uiStore.resetStore?.();
  } catch (error) {
    console.warn('重置 uiStore 失敗', error);
  }

  try {
    const inventoryStore = useInventoryStore();
    inventoryStore.resetStore?.();
  } catch (error) {
    console.warn('重置 inventoryStore 失敗', error);
  }

  try {
    const eventStore = useEventStore();
    eventStore.resetStore?.();
  } catch (error) {
    console.warn('重置 eventStore 失敗', error);
  }

  try {
    const buildingStore = useBuildingStore();
    if (buildingStore.resetStore) {
      buildingStore.resetStore();
    } else {
      buildingStore.$reset?.();
    }
  } catch (error) {
    console.warn('重置 buildingStore 失敗', error);
  }

  try {
    const achievementStore = useAchievementStore();
    achievementStore.$reset?.();
  } catch (error) {
    console.warn('重置 achievementStore 失敗', error);
  }

  try {
    const historyStore = useHistoryStore();
    if (historyStore.clearOnLogout) {
      historyStore.clearOnLogout();
    } else {
      historyStore.$reset?.();
    }
  } catch (error) {
    console.warn('重置 historyStore 失敗', error);
  }

  try {
    const eventLogStore = useEventLogStore();
    eventLogStore.clearEvents?.();
    eventLogStore.$reset?.();
  } catch (error) {
    console.warn('重置 eventLogStore 失敗', error);
  }

  try {
    const wallStore = useWallStore();
    wallStore.$reset?.();
  } catch (error) {
    console.warn('重置 wallStore 失敗', error);
  }
}

