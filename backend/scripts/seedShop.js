const shopData = require('../models/shopData');

async function main() {
  const defaultItems = [
    { id: 1, name: 'Host 貓屋', techCost: 50, type: 'host' },
    { id: 2, name: 'Host 貓屋', techCost: 60, type: 'host' },
    { id: 3, name: 'Host 貓屋', techCost: 70, type: 'host' },
    { id: 5, name: 'Host 貓屋', techCost: 90, type: 'host' },
    { id: 6, name: 'Host 貓屋', techCost: 90, type: 'host' },
    { id: 7, name: 'Host 貓屋', techCost: 90, type: 'host' },
    { id: 11, name: 'Host 貓屋', techCost: 120, type: 'host' },
    { id: 12, name: 'Host 貓屋', techCost: 120, type: 'host' },
    { id: 13, name: 'Host 貓屋', techCost: 140, type: 'host' },
    { id: 14, name: 'Host 貓屋', techCost: 150, type: 'host' },
    { id: 15, name: 'Host 貓屋', techCost: 160, type: 'host' },
    { id: 16, name: 'Host 貓屋', techCost: 180, type: 'host' },
    { id: 17, name: 'Host 貓屋', techCost: 200, type: 'host' },
    { id: 18, name: 'Host 貓屋', techCost: 220, type: 'host' },
    { id: 19, name: 'Host 貓屋', techCost: 230, type: 'host' },
    { id: 101, name: 'Router 郵局', techCost: 100, type: 'router' },
    { id: 102, name: 'Switch 郵筒', techCost: 80, type: 'switch' }
  ];

  await shopData.setItems(defaultItems);
  console.log('✅ 已寫入 shop 種子資料，共', defaultItems.length, '筆');
}

main().catch((e) => {
  console.error('❌ 種子資料寫入失敗:', e);
  process.exit(1);
});


