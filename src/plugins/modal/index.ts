import { App, createVNode, render } from 'vue'; // 导入Vue相关的模块
import Modal from './Modal.vue'; // 导入Modal组件
import { IConfig, IInstance, IModal } from './modal.type'; // 导入类型定义
import config from './config'; // 导入配置项

// 定义Modal组件的install方法
Modal.install = (app: App, options: IConfig = {}) => {
  Object.assign(config.style, options.style || {}); // 合并样式配置
  Object.assign(config.props, options.props || {}); // 合并属性配置

  app.component(Modal.name, Modal); // 注册Modal组件

  app.config.globalProperties.$modal = { // 添加到全局方法中
    show({
      title = '',
      content = '',
      close = config.props!.close,
      maskClose = config.props!.maskClose,
      opacity = config.style!.opacity,
      onConfirm,
      onCancel
    }) {
      const container = document.createElement('div'); // 创建容器
      const vnode = createVNode(Modal); // 创建VNode节点
      render(vnode, container); // 渲染VNode到页面上
      
      const instance = vnode.component as IInstance; // 获取实例

      document.body.appendChild(container); // 将容器添加到body中

      const { props, _hub } = instance; // 获取props和_hub属性

      const _closeModal = () => { // 关闭弹窗
        props.modelValue = false; // 设置modelValue为false
        container.parentNode!.removeChild(container); // 移除容器
      };

      Object.assign(_hub, { // 绑定函数到_hub对象上
        t: app.config.globalProperties.$t, // 绑定$t方法
        async 'on-confirm'() { // 绑定on-confirm函数
          // 如果存在onConfirm回调函数
          if (onConfirm) {
            // 调用onConfirm回调函数，并将返回值赋给fn变量
            const fn = onConfirm();
            // 如果fn是一个Promise对象，则继续执行下面的代码块
            if (fn && fn.then) {
              try {
                // 将props.loading设置为true，表示正在加载中
                props.loading = true;
                // 等待Promise对象fn执行完成后再向下执行
                await fn;
                // 将props.loading设置为false，表示加载完成
                props.loading = false;
                // 关闭弹窗
                _closeModal();
              } catch (err) {
                // 在控制台输出错误信息
                console.error(err);
                // 将props.loading设置为false，表示加载失败
                props.loading = false;
              }
            } else {
              // 如果fn不是一个Promise对象，则直接关闭弹窗
              _closeModal();
            }
          } else {
            // 如果不存在onConfirm回调函数，则直接关闭弹窗
            _closeModal();
          }
        },
        'on-cancel'() { // 绑定on-cancel函数
          onCancel && onCancel(); // 如果有onCancel则调用
          _closeModal(); // 关闭弹窗
        }
      });
      console.log(props,'???????');
      Object.assign(props, { // 合并属性
        isTeleport: false,
        modelValue: true,
        title,
        content,
        close,
        maskClose,
        opacity
      });
      console.log(props,'/////');
    }
  } as IModal;
};

export { IConfig }; // 导出类型定义
export default Modal; // 导出Modal组件
