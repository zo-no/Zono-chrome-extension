// 开发环境和生产环境使用同一个数据库
// 但是开发环境的表需要加上dev_前缀以示区分
const isProd = process.env.NODE_ENV === "production"
const prefix = isProd ? "" : "dev_"
// db name / storage name
export function prefixByEnv(name: string) {
  return `${prefix}${name}`
}
