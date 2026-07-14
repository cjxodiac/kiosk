// 데이터 헬퍼 함수 모음
import { categories } from './categories';
import { menus } from './menus';

export { categories, menus };

// 카테고리 ID로 메뉴 목록 가져오기
export const getMenusByCategoryId = (categoryId) => {
  return menus.filter(m => m.categoryId === categoryId);
};

// 메뉴 ID로 메뉴 정보 가져오기
export const getMenuById = (id) => {
  return menus.find(m => m.id === id);
};

// 카테고리 ID로 카테고리 정보 가져오기
export const getCategoryById = (id) => {
  return categories.find(c => c.id === id);
};

// 가격 포맷터 (4500 → "4,500")
export const formatPrice = (price) => {
  return price.toLocaleString('ko-KR');
};