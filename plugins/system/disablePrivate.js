import cfg from "../../lib/config/config.js"

export class disPri extends plugin {
  constructor() {
    super({
      name: "禁止私聊",
      dsc: "对私聊禁用做处理当开启私聊禁用时只接收cookie以及抽卡链接",
      event: "message.private",
      priority: -Infinity,
    })
  }

  async accept() {
    if (!cfg.other?.disablePrivate || this.e.isMaster) return

    /** 发送日志文件，xlsx，json */
    if (this.e.file) {
      if (!/(.*)\.txt|xlsx|json/gi.test(this.e.file?.name)) {
        this.sendTips()
        return "return"
      } else {
        return false
      }
    }

    /** 绑定ck，抽卡链接 */
    let wordReg =
      /(.*)(ltoken|_MHYUUID|authkey=)(.*)|导出记录(json)*|(记录|安卓|苹果|ck|cookie|体力)帮助|^帮助$|^#*(删除|我的)ck$|^#(我的)?(uid|UID)[0-9]{0,2}$/g
    /** 自定义通行字符 */
    let disableAdopt = cfg.other?.disableAdopt
    if (!Array.isArray(disableAdopt)) {
      disableAdopt = []
    }
    disableAdopt = disableAdopt.filter(str => str != null && str !== "")
    let disableReg = `(.*)(${disableAdopt.join("|")})(.*)`
    if (this.e.raw_message) {
      if (
        !new RegExp(wordReg).test(this.e.raw_message) &&
        (disableAdopt.length === 0 || !new RegExp(disableReg).test(this.e.raw_message))
      ) {
        this.sendTips()
        return "return"
      }
    }
  }

  async sendTips() {
    if (this.e.user_id == this.e.self_id) return

    /** cd */
    const key = `Yz:disablePrivate:${this.e.user_id}`
    if (await redis.get(key)) return

    this.e.reply(cfg.other.disableMsg)
    redis.setEx(key, 10, "1")
  }
}

export class disFriPoke extends plugin {
  constructor() {
    super({
      name: "禁止私聊",
      dsc: "对私聊禁用做处理当开启私聊禁用时只接收cookie以及抽卡链接",
      event: "notice.friend.poke",
      priority: -Infinity,
    })
  }

  async accept() {
    if (!cfg.other?.disablePrivate || this.e.isMaster) return
    this.e.reply(cfg.other.disableMsg)
    return "return"
  }
}
