/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

// Dep 和 Watcher 是多对多的关系
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * 一个 dep 是一个可以有多个指令订阅它的可观察对象。
 */
export default class Dep {
  // 全局唯一的 target 对象，用于记录当前订阅的 watcher
  static target: ?Watcher;
  // Dep id
  id: number;
  // 订阅列表
  subs: Array<Watcher>;

  constructor () {
    // 生成唯一的 id
    this.id = uid++
    // 初始化订阅列表
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      // 把Dep加入到watcher里
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    // 确定订阅者列表，复制一份，保持稳定
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      // 通知触发 watcher 的更新
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
// target的堆栈
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
