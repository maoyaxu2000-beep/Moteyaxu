/* ===========================================================
   data.units.js —— 闯关地图数据模型
   每个 unit 对应技能树上的一个板块；categories 指向 data.core.js 中
   WORDS 的 category 字段，由 engine.js 在运行时自动切分为多个关卡(lesson)。
=========================================================== */
window.DATA = window.DATA || {};

window.DATA.units = [
  { id:'u1',  title:'岗位与航班基础',   titleEn:'Foundations',           icon:'plane',   categories:['岗位','航班','流程','指令','行业常用缩略语'] },
  { id:'u2',  title:'证件与登机核验',   titleEn:'ID & Boarding',         icon:'id',      categories:['证件','证件类型扩展','行李','登机口特殊处置'] },
  { id:'u3',  title:'客舱与安全设备',   titleEn:'Cabin & Safety Gear',   icon:'seat',    categories:['客舱','安全设备','客舱设施扩展','客舱服务礼仪'] },
  { id:'u4',  title:'安检安保流程',     titleEn:'Security Screening',    icon:'scan',    categories:['安检','安保','设备','危险品细化','货运与危险品运输'] },
  { id:'u5',  title:'旅客处置与沟通',   titleEn:'Passenger Handling',    icon:'talk',    categories:['旅客处置','沟通','处置','情绪与沟通技巧','醉酒精神异常'] },
  { id:'u6',  title:'无线电与团队协作', titleEn:'Radio & Teamwork',      icon:'radio',   categories:['无线电通话','客舱广播用语','团队协作口令','机组资源管理','结束用语'] },
  { id:'u7',  title:'特情处置',         titleEn:'Special Incidents',     icon:'alert',   categories:['反劫机处置','爆炸物威胁','涉毒特情','涉恐特情','常见突发情境'], story:'sc_hijack_01' },
  { id:'u8',  title:'涉外检查与移交',   titleEn:'Foreign-related Ops',   icon:'handoff', categories:['涉外人身检查','机场公安交接','涉外文书笔录','执法','VIP外交服务'], story:'sc_handover_01' },
  { id:'u9',  title:'应急与医疗',       titleEn:'Emergency & Medical',   icon:'medical', categories:['应急','驾驶舱门安全','医疗急救','身体部位伤情','复飞与备降','天气预警补充','客舱异物与设备故障'], story:'sc_medical_01' },
  { id:'u10', title:'服务与投诉补救',   titleEn:'Service Recovery',      icon:'heart',   categories:['投诉服务补救','特殊旅客服务','安全','执勤','天气与延误'] },
  { id:'u11', title:'出入境生活',       titleEn:'Overseas Living',       icon:'globe',   categories:['出入境海关扩展','通讯网络出境','银行金融出境','时间数字方位','数字时间补充'] },
  { id:'u12', title:'涉外驻留场景',     titleEn:'Layover Life',          icon:'hotel',   categories:['酒店住宿','餐饮美食','交通出行','购物消费','紧急求助','日常交际'] }
];

/* 每关目标词数（引擎按此切分关卡） */
window.DATA.LESSON_SIZE = 7;
