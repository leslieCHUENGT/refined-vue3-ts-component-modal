// 引入 getCurrentInstance 方法从 Vue 依赖中获取当前实例
import { getCurrentInstance } from 'vue';
// 引入 IInstance 接口类型定义
import { IInstance } from '../modal.type';
// 引入默认语言包
import defaultLang from './lang/zh-CN';

// 定义 t 方法，接收任意数量的参数并返回字符串
export const t = (...args: any[]): string => {
  // 获取当前实例
  const instance = getCurrentInstance() as IInstance;
  // 从实例中获取翻译函数 _t
  const _t = instance._hub.t;
  // 如果存在 _t 函数，则调用该函数并返回结果
  if (_t) return _t(...args);

  // 否则，解析路径参数并在默认语言包中查找对应的翻译
  const [path] = args;
  const arr = path.split('.');
  let current: any = defaultLang,
    value: string = '',
    key: string;

  for (let i = 0, len = arr.length; i < len; i++) {
    key = arr[i];
    value = current[key];
    // 如果已经到达路径末端，则返回对应的翻译结果
    if (i === len - 1) return value;
    // 如果当前值不存在或不是对象，则返回空字符串
    if (!value) return '';
    current = value;
  }
  // 如果没有找到对应的翻译，则返回空字符串
  return '';
};