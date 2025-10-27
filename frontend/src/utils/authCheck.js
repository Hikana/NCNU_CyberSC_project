/**
 * 認證狀態檢查工具
 */

import { getAuth } from 'firebase/auth';

export function checkAuthStatus() {
  console.log('🔍 檢查認證狀態...');
  
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    console.log('✅ 用戶已登入:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    // 檢查 token
    user.getIdToken().then(token => {
      console.log('🔑 Token 存在:', token ? '是' : '否');
      if (token) {
        console.log('Token 前 50 字元:', token.substring(0, 50) + '...');
      }
    }).catch(error => {
      console.error('❌ 取得 Token 失敗:', error);
    });
    
    return true;
  } else {
    console.log('❌ 用戶未登入');
    return false;
  }
}

export default checkAuthStatus;


