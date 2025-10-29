/**
 * 連線視窗測試檔案
 * 用於測試連線提示視窗的功能
 */

import { useBuildingStore } from '@/stores/buildings';

// 測試連線視窗功能
export function testConnectionModal() {
  console.log('🧪 開始測試連線視窗功能...');
  
  const buildingStore = useBuildingStore();
  
  // 測試1: 顯示連線成功視窗
  console.log('✅ 測試連線成功視窗');
  buildingStore.showConnectionSuccess(
    { name: '貓屋', type: 'host' },
    { name: '郵筒', type: 'switch' }
  );
  
  // 測試2: 顯示連線錯誤視窗
  setTimeout(() => {
    console.log('✅ 測試連線錯誤視窗');
    buildingStore.showConnectionError('貓屋只能連一個設備（一張網卡）');
  }, 2000);
  
  // 測試3: 顯示一般資訊視窗
  setTimeout(() => {
    console.log('✅ 測試一般資訊視窗');
    buildingStore.showConnectionModal(
      'info',
      '連線提示',
      '請選擇兩個建築物來建立連線',
      false
    );
  }, 4000);
  
  // 測試4: 關閉視窗
  setTimeout(() => {
    console.log('✅ 測試關閉視窗');
    buildingStore.hideConnectionModal();
  }, 6000);
  
  console.log('🎉 連線視窗測試完成！');
  
  return {
    buildingStore,
    showSuccess: () => buildingStore.showConnectionSuccess(
      { name: '貓屋', type: 'host' },
      { name: '郵筒', type: 'switch' }
    ),
    showError: () => buildingStore.showConnectionError('測試錯誤訊息'),
    showInfo: () => buildingStore.showConnectionModal('info', '測試', '測試訊息'),
    hide: () => buildingStore.hideConnectionModal()
  };
}

// 匯出測試函數供其他檔案使用
export default testConnectionModal;
