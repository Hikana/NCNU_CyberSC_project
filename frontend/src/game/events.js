export const EVENTS = {
ddos: {
id: 'ddos',
name: 'DDoS 分散式阻斷服務攻擊',
shortExplain:
'大量殭屍電腦同時對你的服務發送請求，吃光頻寬與資源，導致正常用戶無法使用。',
gameDescription:
'攻擊會在倒數結束時命中。從你的防禦建材挑選一項來應對（也可略過）。',
// 遊戲敘述上的處罰（目前僅顯示，不扣資源）
failureConsequence:
'服務中斷，營收與信譽下降。（遊戲效果：下回合收入 -20%、玩家滿意度 -10）',
realCase: {
title: 'GitHub 2018 超過 1.3Tbps 的 Memcached 反射放大攻擊',
body:
'攻擊利用未保護的 Memcached 伺服器放大流量，造成大型平台短暫中斷。啟用流量清洗與 CDN 後恢復服務。',
},
// 本事件視為「正確」的對應防禦（任選其一算成功）
correctDefenses: ['cdn', 'waf', 'rate_limit'],
// 預設倒數秒數（可在啟動事件時覆寫）
timerSeconds: 30,
},
};