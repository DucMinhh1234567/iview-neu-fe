// lib/paths.ts
const BASE_PATH = '/iview3';

/**
 * Thêm basePath vào path nếu chưa có
 */
export function withBasePath(path: string): string {
  // Nếu path đã có basePath rồi thì không thêm nữa
  if (path.startsWith(BASE_PATH)) {
    return path;
  }
  
  // Nếu path là root
  if (path === '/') {
    return BASE_PATH;
  }
  
  // Thêm basePath vào đầu
  return `${BASE_PATH}${path}`;
}

/**
 * Lấy basePath
 */
export function getBasePath(): string {
  return BASE_PATH;
}

