# npm install
# npm run server
# 掘金文章
[怎么设计一个Vue3|TS组件？ - 掘金 (juejin.cn)](https://juejin.cn/post/7237424021768208442)
# 设计流程
- 首先要设计这个组件就需要进行需求分析
  - 它是一个遮罩层
  - 标题的内容可以被定制
  - 有取消和确定的选项
  - 主题的内容就有三种：国际化语言的选择、表单提交功能和模拟异步请求的提交的加载过程实现
- 其次就是分析一下怎么实现上面的功能
  - 弹窗需要跳到页面上，为了不受父组件的束缚，那就可以用到Vue3的Teleport来绑定到body
  - 因为主题内容比较灵活，我们就可以用到slot来包裹
  - 国际化，就是通过定义t这个方法来切换语言

## 具体流程
- 设计成了全局的组件，所以会调用app.use()方法进行注册
- 调用app.use()方法的时候会自动执行install方法
- install函数有两个参数：app、options里就会做以下几件事
  - 进行样式和属性的配置合并
  - 调用app.component()方法注册全局组件：参数：name，Modal对象
  - 然后调用app.config.globalProperties.$modal()方法,可以添加到全局方法里，通过vue2这个api来进行的是函数形式配置，不必编写html标签再来绑定数据
  - 而app.config.globalProperties.$modal方法里面的show方法就是进行配置的
  - 可以配置title啊、content啊、能不能触发点击modal外面就可以取消的boolean类型的值啊，取消的那个X要不要显示啊、透明度设置成多少啊，还有就是定制的确定功能的函数、取消的函数
  - 然后用document.createElement()创建一个节点，createVNode()方法创建虚拟DOM，render()函数渲染到节点上
  - 再是把组件上的props、_hub解构出来和定义一个关闭弹窗的方法：将弹窗移除节点上
  - 我们需要在_hub上添加一些方法: t方法、on-confirm方法、取消方法
  - 因为要实现确定的加载效果，因为确认的函数会进行加载，所以先默认它是promise对象，进行判断，把props.loading设置为true那么确定按钮上就会显示圆圈，然后await 确认函数，再进行关闭弹窗
  - 再把传递的参数进行合并，合并给props
- 那我们看一看Modal.vue吧
  - defineComponent来定义，这样语义化更好
  - 自然是注册的name，实际上我还添加了一个子组件Content，这是一个函数式组件，试一下函数式组件渲染的流程，下面还有就是props的属性，modelValue是boolean类型，title、content可以是字符串或者函数、loading是否加载函数、close是否需要X按钮、maskClose点击外层是否关闭弹窗、设置透明度opacity。
  - 在setup(组件初始化阶段)方法里
    - 用computed计算样式
    - 用getCurrentInstance()方法获取组件实例
    - 在挂载之前，配置一些方法在hub里方便调用
    - 然后就是定义emits数组，方便父子组件之间进行通信
    - 在确认和取消方法被调用时，就向父组件通信，完成相应的操作




