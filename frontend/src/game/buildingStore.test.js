/**
 * 測試 buildings store 是否正常工作
 */

import { useBuildingStore } from '@/stores/buildings';

export function testBuildingStore() {
  console.log('🧪 測試 buildings store...');
  
  try {
    const buildingStore = useBuildingStore();
    console.log('✅ buildingStore 創建成功');
    
    // 測試 connectionModal 屬性
    if (buildingStore.connectionModal) {
      console.log('✅ connectionModal 屬性存在');
      console.log('connectionModal:', buildingStore.connectionModal);
    } else {
      console.error('❌ connectionModal 屬性不存在');
    }
    
    // 測試方法
    if (typeof buildingStore.showConnectionModal === 'function') {
      console.log('✅ showConnectionModal 方法存在');
    } else {
      console.error('❌ showConnectionModal 方法不存在');
    }
    
    if (typeof buildingStore.hideConnectionModal === 'function') {
      console.log('✅ hideConnectionModal 方法存在');
    } else {
      console.error('❌ hideConnectionModal 方法不存在');
    }
    
    return buildingStore;
  } catch (error) {
    console.error('❌ buildingStore 創建失敗:', error);
    return null;
  }
}

export default testBuildingStore;
