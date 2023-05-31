<template>
  <Teleport to="body" :disabled="!isTeleport">
    <!-- 将组件渲染到 body 下，若 isTeleport 为 false 则不渲染 -->
    <div v-if="modelValue" class="modal">
      <!-- 若 modelValue 为 true 则显示该 div，类名为 modal -->
      <div class="mask" :style="style" @click="maskClose&&!loading&&handleCancel()">
        <!-- 点击点击遮罩层，关闭模态框，触发 handleCancel 函数关闭模态框 -->
      </div>
      <div class="modal__main">
        <div class="modal__title line line--b">
          <span>{{ title || t('r.title') }}</span>
          <!-- 显示标题文字，如未传递 title 则显示 t('r.title') 字符串 -->
          <span v-if="close" :title="t('r.close')" class="close" @click="!loading&&handleCancel()">✕</span>
          <!-- close 为 true 时显示关闭按钮，点击触发 handleCancel 函数关闭模态框 -->
        </div>
        <div class="modal__content">
          <Content v-if="typeof content === 'function'" :render="content" />
          <!-- 若 content 是函数则渲染 Content 组件，并将 content 函数作为 render prop 传递给 Content -->
          <slot v-else>
            {{ content }}
          </slot>
          <!-- 否则直接渲染 slot 中的内容 -->
        </div>
        <div class="modal__btns line line--t">
          <button :disabled="loading" @click="handleConfirm">
            <span class="loading" v-if="loading"> ❍ </span>{{ t('r.confirm') }}
            <!-- 点击触发 handleConfirm 函数 -->
          </button>
          <button @click="!loading && handleCancel()">{{ t('r.cancel') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script lang="ts">
import {
  computed, // 计算属性函数
  defineComponent, // 定义组件函数
  getCurrentInstance, // 获取当前实例函数
  onBeforeMount, // 生命周期钩子函数：挂载前
  PropType, // prop类型函数
} from 'vue'; // 导入vue模块

import Content from './Content'; // 引入另一个组件 Content
import config from './config'; // 引入配置文件
import { IContent, IInstance } from './modal.type'; // 引入类型声明
import { t } from './locale'; // 引入国际化函数

export default defineComponent({
  name: 'RModal', // 定义组件名字
  components: {
    Content // 注册子组件 Content
  },
  props: {
    isTeleport: { type: Boolean, default: true }, // 是否使用 teleport (Vue3 特性)
    modelValue: { type: Boolean, default: false, require: true }, // 绑定模态框显示状态
    title: {
      type: String, // 标题类型为字符串
      default: ''
    },
    content: {
      type: [String, Function] as PropType<string | IContent>, // 内容可以是字符串或函数，这里使用了 "PropType" 可以指定多个类型
      default: '',
      require: true // 必须传递内容
    },
    loading: {
      type: Boolean, // 是/否 显示加载动画
      default: false
    },
    close: {
      type: Boolean,
      default: () => config.props!.close // 关闭按钮 (config 是一个配置文件)
    },
    maskClose: {
      type: Boolean,
      default: () => config.props!.maskClose // 点击遮罩层关闭模态框
    },
    opacity: {
      type: Number, // 模态框透明度
      default: () => config.style!.opacity
    }
  },
  emits: ['on-confirm', 'on-cancel', 'update:modelValue'], // 定义组件自定义事件

  setup(props, ctx) { // 组件初始化阶段
    const style = computed(() => ({ opacity: props.opacity })); // 计算属性，返回模态框样式对象
    let instance = getCurrentInstance() as IInstance; // 获取组件实例
    onBeforeMount(() => { // 生命周期钩子函数：挂载之前执行
      instance._hub = { // 将一些常用方法存储在组件实例的 _hub 属性中方便调用
        t: instance.appContext.config.globalProperties.$t, // 国际化方法
        'on-cancel': () => { }, // 取消操作
        'on-confirm': () => { } // 确认操作
      };
    });

    const handleConfirm = () => { // 点击确认按钮触发该函数
      ctx.emit('on-confirm'); // 触发自定义事件 on-confirm
      instance._hub['on-confirm'](); // 调用 _hub 中的 on-confirm 方法
    };
    const handleCancel = () => { // 点击取消按钮触发该函数
      ctx.emit('on-cancel'); // 触发自定义事件 on-cancel
      ctx.emit('update:modelValue', false); // 将 modelValue 设置为 false 关闭模态框
      instance._hub['on-cancel'](); // 调用 _hub 中的 on-cancel 方法
    };
    
    return { // 返回初始化数据
      style,
      handleConfirm,
      handleCancel,
      t // 国际化方法
    };
  }
});
</script>
<style lang="less" scoped>
.modal {

  &,
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .mask {
    background-color: #000;
    opacity: 0.7;
  }

  .line {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      height: 1px;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.05);
    }

    &--t::after {
      top: 0;
    }

    &--b::after {
      bottom: 0;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .loading {
    display: inline-block;
    margin-right: 5px;
    animation: rotate 1s infinite linear;
  }

  .close {
    cursor: pointer;
    padding: 0 10px;
    margin-right: -10px;
  }

  &__title {
    text-align: left;
    font-size: 14px;
    padding: 5px 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }

  &__main {
    background-color: #fff;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    overflow: hidden;
    min-width: 200px;
  }

  &__content {
    padding: 15px 15px;
  }

  &__btns {
    width: 100%;
    box-sizing: border-box;
    padding: 5px 5px 5px 5px;
    text-align: right;

    button {
      cursor: pointer;
      outline: none;
      border: none;
      text-align: center;
      border: 1px solid gray;
      border-radius: 4px;

      &+button {
        margin-left: 6px;
      }
    }
  }
}
</style>


