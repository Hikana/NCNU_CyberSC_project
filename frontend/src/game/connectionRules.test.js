/**
 * 連線規則模組測試檔案
 * 用於驗證連線規則模組是否正常運作
 */

import { BUILDING_TYPES, createConnectionValidator, getConnectionColor, CONNECTION_RULES } from '@/game/connectionRules';

// 測試用的模擬地圖和連線資料
const mockMap = [
  [
    { status: 'placed', buildingId: 1 }, // Host
    { status: 'placed', buildingId: 2 }, // Switch
    { status: 'empty' }
  ],
  [
    { status: 'placed', buildingId: 3 }, // Router
    { status: 'empty' },
    { status: 'empty' }
  ],
  [
    { status: 'empty' },
    { status: 'empty' },
    { status: 'empty' }
  ]
];

const mockConnections = [];

// 測試連線規則模組
export function testConnectionRules() {
  console.log('🧪 開始測試連線規則模組...');
  
  // 測試1: 建立驗證器
  const validator = createConnectionValidator(mockMap, mockConnections);
  console.log('✅ 驗證器建立成功');
  
  // 測試2: 測試建築物類型
  const hostType = validator.getBuildingType(1);
  const switchType = validator.getBuildingType(2);
  const routerType = validator.getBuildingType(3);
  
  console.log('✅ 建築物類型測試:', {
    host: hostType?.name,
    switch: switchType?.name,
    router: routerType?.name
  });
  
  // 測試3: 測試連線顏色
  const hostToSwitchColor = getConnectionColor(hostType, switchType);
  const switchToRouterColor = getConnectionColor(switchType, routerType);
  
  console.log('✅ 連線顏色測試:', {
    hostToSwitch: hostToSwitchColor.toString(16),
    switchToRouter: switchToRouterColor.toString(16)
  });
  
  // 測試4: 測試連線驗證
  const validConnection = validator.canConnectBuildings(0, 0, 0, 1); // Host to Switch
  console.log('✅ 連線驗證測試:', validConnection);
  
  // 測試5: 測試常數
  console.log('✅ 連線規則常數:', {
    hostMaxConnections: CONNECTION_RULES.HOST_MAX_CONNECTIONS,
    switchMaxHostConnections: CONNECTION_RULES.SWITCH_MAX_HOST_CONNECTIONS
  });
  
  console.log('🎉 連線規則模組測試完成！');
  
  return {
    validator,
    hostType,
    switchType,
    routerType,
    validConnection
  };
}

// 匯出測試函數供其他檔案使用
export default testConnectionRules;
