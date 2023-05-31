/**
 * 函数式组件
 */
import { h } from 'vue';// 导入Vue 3中的h函数，用于创建虚拟DOM。
// 定义了一个名为Content的组件，它接受一个名为render的prop，
// 该prop需要传入一个用于渲染内容的函数，并在函数内部调用该函数并将h函数作为参数传递进去。
const Content = (props: { render: (h: any) => void }) => props.render(h);
// 将Content组件的props属性设置为render。
Content.props = ['render'];

export default Content;
