const fs = require('fs'); 
// Import module 'fs' để thao tác với file hệ thống (read/write file)

// Đường dẫn tới file cần đọc và chỉnh sửa
const filePath = './src/utils/index.ts'; 

// Đọc toàn bộ nội dung file dưới dạng UTF-8
let content = fs.readFileSync(filePath, 'utf8'); 

// Hàm gốc camelizeConvert cần bị thay thế
const originalFunction = `export const camelizeConvert = (obj: any) => {
  return _.transform(obj, (acc: any, value, key: any, target) => {
    const camelKey = _.isArray(target) ? key : _.camelCase(key);
    acc[camelKey] = _.isObject(value) ? camelizeConvert(value) : value;
  });
};`;

// Hàm mới camelizeConvert đã được cải tiến
const fixedFunction = `export const camelizeConvert = (obj: any) => {
  // Trường hợp cơ bản: nếu không phải object thì trả về nguyên giá trị
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  return _.transform(obj, (acc: any, value, key: any, target) => {
    // Nếu là array thì giữ nguyên key, nếu là object thì chuyển sang camelCase
    const camelKey = _.isArray(target) ? key : _.camelCase(key);
    
    // Nếu value là array thì đệ quy từng phần tử trong array
    if (_.isArray(value)) {
      acc[camelKey] = value.map(item => _.isObject(item) ? camelizeConvert(item) : item);
    } 
    // Nếu value là object (và không phải function/null) thì đệ quy tiếp
    else if (_.isObject(value) && !_.isFunction(value) && value !== null) {
      acc[camelKey] = camelizeConvert(value);
    } 
    // Nếu là primitive (string, number, boolean...) thì gán trực tiếp
    else {
      acc[camelKey] = value;
    }
  });
};`;

// Thay thế đoạn mã gốc bằng đoạn mã mới trong nội dung file
content = content.replace(originalFunction, fixedFunction); 

// Ghi đè nội dung mới trở lại file
fs.writeFileSync(filePath, content, 'utf8'); 
// Hoàn tất việc cập nhật hàm trong file
