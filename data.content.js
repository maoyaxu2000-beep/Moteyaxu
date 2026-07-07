/* ===========================================================
   data.content.js —— 口语短句 / 情景对话 / 空保英语专题（QA与剧本卡片）
=========================================================== */
window.DATA = window.DATA || {};

/* ---------------- 口语短句 ---------------- */
window.DATA.speaking = [
  { category:'登机检查', list:[
    { id:'s_001', title:'请出示登机牌和证件', en:'Please show your boarding pass and ID.', cn:'请出示登机牌和证件。' },
    { id:'s_002', title:'请稍等核实身份', en:'Hold on, we need to verify your identity.', cn:'请稍等，我们需要核实您的身份。' },
    { id:'s_003', title:'请配合安全检查', en:'Please cooperate with the security check.', cn:'请配合安全检查。' },
    { id:'s_004', title:'证件需要进一步检查', en:'Your document needs further inspection.', cn:'您的证件需要进一步检查。' },
    { id:'s_005', title:'请摘下口罩以便识别', en:'Please remove your mask for identification.', cn:'请摘下口罩以便识别。' },
    { id:'s_006', title:'请排队并保持距离', en:'Stay in line and keep your distance.', cn:'请排队并保持距离。' },
    { id:'s_007', title:'请不要向前拥挤', en:'Do not rush forward.', cn:'请不要向前拥挤。' },
    { id:'s_008', title:'检查后方可登机', en:'You will board after inspection.', cn:'检查后方可登机。' },
    { id:'s_009', title:'请到一旁进行进一步检查', en:'Step aside for additional screening.', cn:'请到一旁进行进一步检查。' },
    { id:'s_010', title:'请回答几个问题', en:'Please answer a few questions.', cn:'请回答几个问题。' },
    { id:'s_011', title:'您今天去哪里', en:'Where are you traveling to today?', cn:'您今天去哪里？' },
    { id:'s_012', title:'您的行李是谁打包的', en:'Who packed your luggage?', cn:'您的行李是谁打包的？' },
    { id:'s_013', title:'您的行李是否离开过您的视线', en:'Has your baggage been out of your sight?', cn:'您的行李是否离开过您的视线？' },
    { id:'s_014', title:'您是否携带违禁品', en:'Do you carry any prohibited items?', cn:'您是否携带违禁品？' },
    { id:'s_015', title:'请严格按照指示操作', en:'Please follow the instructions strictly.', cn:'请严格按照指示操作。' },
    { id:'s_016', title:'该物品不能带上飞机', en:'This item is not allowed onboard.', cn:'该物品不能带上飞机。' },
    { id:'s_017', title:'您需要进行二次检查', en:'You need to go through secondary screening.', cn:'您需要进行二次检查。' },
    { id:'s_018', title:'请在此等待检查完成', en:'Please wait here until cleared.', cn:'请在此等待检查完成。' },
    { id:'s_019', title:'请不要争辩配合检查', en:'Do not argue, just cooperate.', cn:'请不要争辩，配合检查。' },
    { id:'s_020', title:'所有旅客必须接受安检', en:'Security check is mandatory for all passengers.', cn:'所有旅客必须接受安检。' }
  ]},
  { category:'客舱巡查', list:[
    { id:'s_101', title:'请立即系好安全带', en:'Please fasten your seat belt immediately.', cn:'请立即系好安全带。' },
    { id:'s_102', title:'请立即回到座位', en:'Return to your seat now.', cn:'请立即回到座位。' },
    { id:'s_103', title:'遇到气流请不要站立', en:'Do not stand up during turbulence.', cn:'遇到气流请不要站立。' },
    { id:'s_104', title:'请将双手保持可见', en:'Keep your hands visible.', cn:'请将双手保持可见。' },
    { id:'s_105', title:'请停止该行为', en:'Please stop that behavior.', cn:'请停止该行为。' },
    { id:'s_106', title:'这是安全警告', en:'This is a safety warning.', cn:'这是安全警告。' },
    { id:'s_107', title:'请不要触碰客舱设备', en:'Do not touch the cabin equipment.', cn:'请不要触碰客舱设备。' },
    { id:'s_108', title:'请始终保持过道畅通', en:'Keep the aisle clear at all times.', cn:'请始终保持过道畅通。' },
    { id:'s_109', title:'请降低音量', en:'Please lower your voice.', cn:'请降低音量。' },
    { id:'s_110', title:'请不要打扰他人', en:'Do not disturb other passengers.', cn:'请不要打扰他人。' },
    { id:'s_111', title:'请立即听从机组指示', en:'Follow crew instructions immediately.', cn:'请立即听从机组指示。' },
    { id:'s_112', title:'您必须遵守安全规定', en:'You must comply with safety rules.', cn:'您必须遵守安全规定。' },
    { id:'s_113', title:'请勿靠近限制区域', en:'Do not approach restricted areas.', cn:'请勿靠近限制区域。' },
    { id:'s_114', title:'请保持冷静并坐好', en:'Stay calm and remain seated.', cn:'请保持冷静并坐好。' },
    { id:'s_115', title:'请立即关闭设备', en:'Turn off your device now.', cn:'请立即关闭设备。' },
    { id:'s_116', title:'此处禁止拍照', en:'No photography is allowed here.', cn:'此处禁止拍照。' },
    { id:'s_117', title:'请不要干扰机组工作', en:'Do not interfere with crew duties.', cn:'请不要干扰机组工作。' },
    { id:'s_118', title:'请管理好您的物品', en:'Keep your belongings under control.', cn:'请管理好您的物品。' },
    { id:'s_119', title:'我们正在监控情况', en:'We are monitoring the situation.', cn:'我们正在监控情况。' },
    { id:'s_120', title:'必要时将采取进一步措施', en:'Further action will be taken if needed.', cn:'必要时将采取进一步措施。' }
  ]},
  { category:'行李检查', list:[
    { id:'s_201', title:'请打开您的行李', en:'Open your bag, please.', cn:'请打开您的行李。' },
    { id:'s_202', title:'请将所有物品放在桌上', en:'Place all items on the table.', cn:'请将所有物品放在桌上。' },
    { id:'s_203', title:'请取出所有电子设备', en:'Take out all electronic devices.', cn:'请取出所有电子设备。' },
    { id:'s_204', title:'您是否携带尖锐物品', en:'Do you carry any sharp objects?', cn:'您是否携带尖锐物品？' },
    { id:'s_205', title:'该物品受限制', en:'This item is restricted.', cn:'该物品受限制。' },
    { id:'s_206', title:'请说明该物品', en:'Explain what this item is.', cn:'请说明该物品。' },
    { id:'s_207', title:'这个物品从哪里来的', en:'Where did you get this?', cn:'这个物品从哪里来的？' },
    { id:'s_208', title:'为什么携带这个', en:'Why are you carrying this?', cn:'为什么携带这个？' },
    { id:'s_209', title:'需要进一步检查', en:'This requires further inspection.', cn:'需要进一步检查。' },
    { id:'s_210', title:'请待在原地', en:'Stay where you are.', cn:'请待在原地。' },
    { id:'s_211', title:'请不要碰行李', en:'Do not touch your bag.', cn:'请不要碰行李。' },
    { id:'s_212', title:'请把手离开物品', en:'Hands away from your belongings.', cn:'请把手离开物品。' },
    { id:'s_213', title:'该物品将被没收', en:'This item will be confiscated.', cn:'该物品将被没收。' },
    { id:'s_214', title:'您需要额外检查', en:'You need additional screening.', cn:'您需要额外检查。' },
    { id:'s_215', title:'请等待进一步指示', en:'Wait for further instructions.', cn:'请等待进一步指示。' },
    { id:'s_216', title:'请后退保持距离', en:'Step back and give space.', cn:'请后退保持距离。' },
    { id:'s_217', title:'安检是必须的', en:'Security check is not optional.', cn:'安检是必须的。' },
    { id:'s_218', title:'请直接回答问题', en:'Answer the question directly.', cn:'请直接回答问题。' },
    { id:'s_219', title:'请不要隐瞒', en:'Do not hide anything.', cn:'请不要隐瞒。' },
    { id:'s_220', title:'我们会处理此情况', en:'We will handle this situation.', cn:'我们会处理此情况。' }
  ]},
  { category:'旅客劝导', list:[
    { id:'s_301', title:'请冷静并听清楚', en:'Calm down and listen carefully.', cn:'请冷静并听清楚。' },
    { id:'s_302', title:'请立即停止争执', en:'Stop arguing now.', cn:'请立即停止争执。' },
    { id:'s_303', title:'必须听从指示', en:'You must follow instructions.', cn:'必须听从指示。' },
    { id:'s_304', title:'请不要在机上闹事', en:'Do not make trouble onboard.', cn:'请不要在机上闹事。' },
    { id:'s_305', title:'这是最后警告', en:'This is your final warning.', cn:'这是最后警告。' },
    { id:'s_306', title:'请立刻降低音量', en:'Lower your voice immediately.', cn:'请立刻降低音量。' },
    { id:'s_307', title:'请立即坐下', en:'Sit down right now.', cn:'请立即坐下。' },
    { id:'s_308', title:'请不要挑衅他人', en:'Do not provoke others.', cn:'请不要挑衅他人。' },
    { id:'s_309', title:'请控制您的行为', en:'Control your behavior.', cn:'请控制您的行为。' },
    { id:'s_310', title:'您已违反航班规定', en:'You are violating flight rules.', cn:'您已违反航班规定。' },
    { id:'s_311', title:'现场有安全人员', en:'Security personnel is present.', cn:'现场有安全人员。' },
    { id:'s_312', title:'将采取进一步措施', en:'Further action will be taken.', cn:'将采取进一步措施。' },
    { id:'s_313', title:'我们会报告此事件', en:'We will report this incident.', cn:'我们会报告此事件。' },
    { id:'s_314', title:'请不要激化情况', en:'Do not escalate the situation.', cn:'请不要激化情况。' },
    { id:'s_315', title:'请配合否则承担后果', en:'Cooperate or face consequences.', cn:'请配合，否则承担后果。' },
    { id:'s_316', title:'请待在原地', en:'Stay where you are.', cn:'请待在原地。' },
    { id:'s_317', title:'请不要移动', en:'Do not move.', cn:'请不要移动。' },
    { id:'s_318', title:'我们正在处理', en:'We are handling this.', cn:'我们正在处理。' },
    { id:'s_319', title:'情况已受控', en:'This is a controlled situation.', cn:'情况已受控。' },
    { id:'s_320', title:'请始终保持冷静', en:'Remain calm at all times.', cn:'请始终保持冷静。' }
  ]},
  { category:'落地处置', list:[
    { id:'s_401', title:'请按指示保持坐好', en:'Remain seated until instructed.', cn:'请按指示保持坐好。' },
    { id:'s_402', title:'请不要离开座位', en:'Do not leave your seat.', cn:'请不要离开座位。' },
    { id:'s_403', title:'安全人员将带离您', en:'Security personnel will escort you.', cn:'安全人员将带离您。' },
    { id:'s_404', title:'请等待进一步指示', en:'Wait for further instructions.', cn:'请等待进一步指示。' },
    { id:'s_405', title:'请不要尝试离开', en:'Do not attempt to leave.', cn:'请不要尝试离开。' },
    { id:'s_406', title:'您正在被监控', en:'You are under observation.', cn:'您正在被监控。' },
    { id:'s_407', title:'落地后请跟随我们', en:'Follow us after landing.', cn:'落地后请跟随我们。' },
    { id:'s_408', title:'请准备接受检查', en:'Prepare for inspection.', cn:'请准备接受检查。' },
    { id:'s_409', title:'请保持双手可见', en:'Keep your hands visible.', cn:'请保持双手可见。' },
    { id:'s_410', title:'请不要联系他人', en:'Do not contact others.', cn:'请不要联系他人。' },
    { id:'s_411', title:'落地后将接受询问', en:'You will be questioned after landing.', cn:'落地后将接受询问。' },
    { id:'s_412', title:'请配合执法人员', en:'Please cooperate with authorities.', cn:'请配合执法人员。' },
    { id:'s_413', title:'这是安全事件', en:'This is a security matter.', cn:'这是安全事件。' },
    { id:'s_414', title:'请不要干扰处理过程', en:'Do not interfere with the process.', cn:'请不要干扰处理过程。' },
    { id:'s_415', title:'请冷静配合', en:'Stay calm and comply.', cn:'请冷静配合。' },
    { id:'s_416', title:'请留在此处', en:'You are required to stay here.', cn:'请留在此处。' },
    { id:'s_417', title:'地面将进一步处理', en:'Further action will be taken on ground.', cn:'地面将进一步处理。' },
    { id:'s_418', title:'请等待带离', en:'Wait until we escort you.', cn:'请等待带离。' },
    { id:'s_419', title:'请不要反抗', en:'Do not resist.', cn:'请不要反抗。' },
    { id:'s_420', title:'请按步骤执行指令', en:'Follow instructions step by step.', cn:'请按步骤执行指令。' }
  ]},
  { category:'日常交际', list:[
    { id:'s_501', title:'你好很高兴认识你', en:'Hello, nice to meet you.', cn:'你好，很高兴认识你。' },
    { id:'s_502', title:'早上好今天怎么样', en:'Good morning, how are you today?', cn:'早上好，今天怎么样？' },
    { id:'s_503', title:'请问您叫什么名字', en:'May I have your name, please?', cn:'请问您叫什么名字？' },
    { id:'s_504', title:'让我介绍一下自己', en:'Let me introduce myself.', cn:'让我介绍一下自己。' },
    { id:'s_505', title:'谢谢您的帮助', en:'Thank you for your help.', cn:'谢谢您的帮助。' },
    { id:'s_506', title:'非常感谢您的配合', en:'I really appreciate your cooperation.', cn:'非常感谢您的配合。' },
    { id:'s_507', title:'不好意思打扰一下', en:'Excuse me, sorry to bother you.', cn:'不好意思，打扰一下。' },
    { id:'s_508', title:'我为造成的麻烦道歉', en:'I apologize for the inconvenience.', cn:'我为造成的麻烦道歉。' },
    { id:'s_509', title:'请问您能帮我个忙吗', en:'Could you do me a favor?', cn:'请问您能帮我个忙吗？' },
    { id:'s_510', title:'请问您可以再说一遍吗', en:'Could you please say that again?', cn:'请问您可以再说一遍吗？' },
    { id:'s_511', title:'我没听清楚您说什么', en:'I did not catch what you said.', cn:'我没听清楚您说什么。' },
    { id:'s_512', title:'请稍等一下', en:'Please wait a moment.', cn:'请稍等一下。' },
    { id:'s_513', title:'让我确认一下', en:'Let me confirm that.', cn:'让我确认一下。' },
    { id:'s_514', title:'我明白您的意思', en:'I understand what you mean.', cn:'我明白您的意思。' },
    { id:'s_515', title:'请问您来自哪里', en:'Where are you from?', cn:'请问您来自哪里？' },
    { id:'s_516', title:'今天天气真不错', en:'The weather is nice today.', cn:'今天天气真不错。' },
    { id:'s_517', title:'请问您在这里工作吗', en:'Do you work here?', cn:'请问您在这里工作吗？' },
    { id:'s_518', title:'祝您有美好的一天', en:'Have a nice day.', cn:'祝您有美好的一天。' },
    { id:'s_519', title:'期待再次见到您', en:'Looking forward to seeing you again.', cn:'期待再次见到您。' },
    { id:'s_520', title:'请保重', en:'Take care.', cn:'请保重。' }
  ]},
  { category:'海外生活', list:[
    { id:'s_601', title:'我想预订一个房间', en:'I would like to book a room.', cn:'我想预订一个房间。' },
    { id:'s_602', title:'请问入住时间是几点', en:'What time is check-in?', cn:'请问入住时间是几点？' },
    { id:'s_603', title:'请问有WiFi吗', en:'Is there WiFi available?', cn:'请问有WiFi吗？' },
    { id:'s_604', title:'请问早餐几点开始', en:'What time does breakfast start?', cn:'请问早餐几点开始？' },
    { id:'s_605', title:'我想点餐', en:'I would like to order.', cn:'我想点餐。' },
    { id:'s_606', title:'请给我菜单', en:'Could I have the menu, please?', cn:'请给我菜单。' },
    { id:'s_607', title:'请问可以刷卡吗', en:'Do you accept credit cards?', cn:'请问可以刷卡吗？' },
    { id:'s_608', title:'请问这个多少钱', en:'How much is this?', cn:'请问这个多少钱？' },
    { id:'s_609', title:'可以给我收据吗', en:'Could I have a receipt?', cn:'可以给我收据吗？' },
    { id:'s_610', title:'请问地铁站在哪里', en:'Where is the subway station?', cn:'请问地铁站在哪里？' },
    { id:'s_611', title:'请问这趟车去机场吗', en:'Does this bus go to the airport?', cn:'请问这趟车去机场吗？' },
    { id:'s_612', title:'请问出租车在哪里打车', en:'Where can I get a taxi?', cn:'请问出租车在哪里打车？' },
    { id:'s_613', title:'请问附近有银行吗', en:'Is there a bank nearby?', cn:'请问附近有银行吗？' },
    { id:'s_614', title:'我想兑换一些货币', en:'I would like to exchange some currency.', cn:'我想兑换一些货币。' },
    { id:'s_615', title:'请问最近的药店在哪里', en:'Where is the nearest pharmacy?', cn:'请问最近的药店在哪里？' },
    { id:'s_616', title:'请问可以帮我叫医生吗', en:'Could you call a doctor for me?', cn:'请问可以帮我叫医生吗？' },
    { id:'s_617', title:'我对这个过敏', en:'I am allergic to this.', cn:'我对这个过敏。' },
    { id:'s_618', title:'请问洗手间在哪里', en:'Where is the restroom?', cn:'请问洗手间在哪里？' },
    { id:'s_619', title:'请问营业到几点', en:'What time do you close?', cn:'请问营业到几点？' },
    { id:'s_620', title:'请问可以帮我拍张照吗', en:'Could you take a photo for me?', cn:'请问可以帮我拍张照吗？' }
  ]},
  { category:'紧急应对', list:[
    { id:'s_701', title:'这里有紧急情况', en:'There is an emergency here.', cn:'这里有紧急情况。' },
    { id:'s_702', title:'请马上报警', en:'Please call the police immediately.', cn:'请马上报警。' },
    { id:'s_703', title:'这里着火了', en:'There is a fire here.', cn:'这里着火了。' },
    { id:'s_704', title:'有人受伤了', en:'Someone is injured.', cn:'有人受伤了。' },
    { id:'s_705', title:'我需要看医生', en:'I need to see a doctor.', cn:'我需要看医生。' },
    { id:'s_706', title:'我丢了护照', en:'I lost my passport.', cn:'我丢了护照。' },
    { id:'s_707', title:'我的行李被偷了', en:'My luggage was stolen.', cn:'我的行李被偷了。' },
    { id:'s_708', title:'请问中国大使馆在哪里', en:'Where is the Chinese embassy?', cn:'请问中国大使馆在哪里？' },
    { id:'s_709', title:'我需要联系领事馆', en:'I need to contact the consulate.', cn:'我需要联系领事馆。' },
    { id:'s_710', title:'请问最近的医院在哪里', en:'Where is the nearest hospital?', cn:'请问最近的医院在哪里？' },
    { id:'s_711', title:'我感觉不舒服', en:'I am not feeling well.', cn:'我感觉不舒服。' },
    { id:'s_712', title:'我有严重的头痛', en:'I have a severe headache.', cn:'我有严重的头痛。' },
    { id:'s_713', title:'我呼吸困难', en:'I have difficulty breathing.', cn:'我呼吸困难。' },
    { id:'s_714', title:'我觉得不安全', en:'I do not feel safe.', cn:'我觉得不安全。' },
    { id:'s_715', title:'请问可以帮我报警吗', en:'Could you help me call the police?', cn:'请问可以帮我报警吗？' },
    { id:'s_716', title:'我需要急救', en:'I need first aid.', cn:'我需要急救。' },
    { id:'s_717', title:'请问哪里可以找到警察', en:'Where can I find a police officer?', cn:'请问哪里可以找到警察？' },
    { id:'s_718', title:'请帮帮我我遇到麻烦了', en:'Please help me, I am in trouble.', cn:'请帮帮我，我遇到麻烦了。' }
  ]}
];

/* ---------------- 情景对话 ---------------- */
window.DATA.dialogues = [
  { category:'登机检查', list:[
    { id:'b_001', title:'证件核验', dialogue:[
      { role:'officer', text:'Please show your boarding pass and ID.' },
      { role:'passenger', text:'Sure, here you are.' },
      { role:'officer', text:'Please remove your mask for identification.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Thank you. You may board now.' }
    ]},
    { id:'b_002', title:'二次检查', dialogue:[
      { role:'officer', text:'Step aside for additional screening.' },
      { role:'passenger', text:'Why do I need extra screening?' },
      { role:'officer', text:'This is a routine security procedure.' },
      { role:'passenger', text:'All right.' },
      { role:'officer', text:'Please cooperate with the security check.' }
    ]},
    { id:'b_003', title:'核实行李', dialogue:[
      { role:'officer', text:'Who packed your luggage?' },
      { role:'passenger', text:'I packed it myself.' },
      { role:'officer', text:'Has your baggage been out of your sight?' },
      { role:'passenger', text:'No, it has not.' },
      { role:'officer', text:'All right, thank you.' }
    ]},
    { id:'b_004', title:'违禁品询问', dialogue:[
      { role:'officer', text:'Do you carry any prohibited items?' },
      { role:'passenger', text:'No, I do not.' },
      { role:'officer', text:'Please open your bag for inspection.' },
      { role:'passenger', text:'Okay, one moment.' },
      { role:'officer', text:'Thank you for your cooperation.' }
    ]},
    { id:'b_005', title:'秩序维护', dialogue:[
      { role:'officer', text:'Stay in line and keep your distance.' },
      { role:'passenger', text:'Sorry, I was in a hurry.' },
      { role:'officer', text:'Do not rush forward.' },
      { role:'passenger', text:'Understood.' },
      { role:'officer', text:'Please wait for your turn.' }
    ]}
  ]},
  { category:'客舱巡查', list:[
    { id:'c_001', title:'安全带检查', dialogue:[
      { role:'officer', text:'Please fasten your seat belt immediately.' },
      { role:'passenger', text:'Okay, I am doing it now.' },
      { role:'officer', text:'Keep your seat belt visible.' },
      { role:'passenger', text:'All right.' },
      { role:'officer', text:'Thank you for your cooperation.' }
    ]},
    { id:'c_002', title:'气流控制', dialogue:[
      { role:'officer', text:'Return to your seat now.' },
      { role:'passenger', text:'I just need to use the lavatory.' },
      { role:'officer', text:'Do not stand up during turbulence.' },
      { role:'passenger', text:'Okay, I understand.' },
      { role:'officer', text:'Please remain seated.' }
    ]},
    { id:'c_003', title:'过道清理', dialogue:[
      { role:'officer', text:'Keep the aisle clear at all times.' },
      { role:'passenger', text:'I will move my bag.' },
      { role:'officer', text:'Do not block the aisle.' },
      { role:'passenger', text:'Sorry about that.' },
      { role:'officer', text:'Thank you.' }
    ]},
    { id:'c_004', title:'电子设备管理', dialogue:[
      { role:'officer', text:'Turn off your device now.' },
      { role:'passenger', text:'Can I use it for one more minute?' },
      { role:'officer', text:'No, electronic devices must be turned off now.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Please follow crew instructions immediately.' }
    ]},
    { id:'c_005', title:'客舱秩序提醒', dialogue:[
      { role:'officer', text:'Please lower your voice.' },
      { role:'passenger', text:'I was just talking to my friend.' },
      { role:'officer', text:'Do not disturb other passengers.' },
      { role:'passenger', text:'Understood.' },
      { role:'officer', text:'Please remain calm and seated.' }
    ]}
  ]},
  { category:'行李检查', list:[
    { id:'l_001', title:'开包检查', dialogue:[
      { role:'officer', text:'Open your bag, please.' },
      { role:'passenger', text:'Sure.' },
      { role:'officer', text:'Place all items on the table.' },
      { role:'passenger', text:'All right.' },
      { role:'officer', text:'Do not touch your bag until instructed.' }
    ]},
    { id:'l_002', title:'电子设备检查', dialogue:[
      { role:'officer', text:'Take out all electronic devices.' },
      { role:'passenger', text:'Do I need to remove my laptop too?' },
      { role:'officer', text:'Yes, place it separately.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Thank you.' }
    ]},
    { id:'l_003', title:'可疑物品询问', dialogue:[
      { role:'officer', text:'Explain what this item is.' },
      { role:'passenger', text:'It is a work tool.' },
      { role:'officer', text:'Why are you carrying this?' },
      { role:'passenger', text:'I forgot to remove it.' },
      { role:'officer', text:'This requires further inspection.' }
    ]},
    { id:'l_004', title:'控制行为', dialogue:[
      { role:'officer', text:'Stay where you are.' },
      { role:'passenger', text:'Can I take my bag back?' },
      { role:'officer', text:'No, hands away from your belongings.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Wait for further instructions.' }
    ]},
    { id:'l_005', title:'违禁品处置', dialogue:[
      { role:'officer', text:'This item will be confiscated.' },
      { role:'passenger', text:'Why?' },
      { role:'officer', text:'This item is restricted onboard.' },
      { role:'passenger', text:'I understand.' },
      { role:'officer', text:'Security check is not optional.' }
    ]}
  ]},
  { category:'旅客劝导', list:[
    { id:'p_001', title:'情绪安抚', dialogue:[
      { role:'officer', text:'Calm down and listen carefully.' },
      { role:'passenger', text:'I am very upset right now.' },
      { role:'officer', text:'We are here to help you.' },
      { role:'passenger', text:'Then explain what is happening.' },
      { role:'officer', text:'Please remain calm first.' }
    ]},
    { id:'p_002', title:'停止争执', dialogue:[
      { role:'officer', text:'Stop arguing now.' },
      { role:'passenger', text:'He started it.' },
      { role:'officer', text:'You must follow instructions.' },
      { role:'passenger', text:'Fine.' },
      { role:'officer', text:'Sit down right now.' }
    ]},
    { id:'p_003', title:'最后警告', dialogue:[
      { role:'officer', text:'This is your final warning.' },
      { role:'passenger', text:'Are you serious?' },
      { role:'officer', text:'Yes. Control your behavior.' },
      { role:'passenger', text:'Okay, I will.' },
      { role:'officer', text:'Do not provoke others again.' }
    ]},
    { id:'p_004', title:'执勤介入', dialogue:[
      { role:'officer', text:'Security personnel is present.' },
      { role:'passenger', text:'I do not want any trouble.' },
      { role:'officer', text:'Then cooperate and stay calm.' },
      { role:'passenger', text:'All right.' },
      { role:'officer', text:'Further action will be taken if needed.' }
    ]},
    { id:'p_005', title:'现场控制', dialogue:[
      { role:'officer', text:'Stay where you are.' },
      { role:'passenger', text:'Can I move to another seat?' },
      { role:'officer', text:'No. Do not move.' },
      { role:'passenger', text:'Understood.' },
      { role:'officer', text:'This is a controlled situation.' }
    ]}
  ]},
  { category:'落地处置', list:[
    { id:'g_001', title:'落地后留置', dialogue:[
      { role:'officer', text:'Remain seated until instructed.' },
      { role:'passenger', text:'Can I leave now?' },
      { role:'officer', text:'No, do not leave your seat.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Wait for further instructions.' }
    ]},
    { id:'g_002', title:'带离程序', dialogue:[
      { role:'officer', text:'Security personnel will escort you.' },
      { role:'passenger', text:'Where are you taking me?' },
      { role:'officer', text:'Follow us after landing.' },
      { role:'passenger', text:'Do I have a choice?' },
      { role:'officer', text:'Please cooperate with authorities.' }
    ]},
    { id:'g_003', title:'限制行动', dialogue:[
      { role:'officer', text:'Do not attempt to leave.' },
      { role:'passenger', text:'I just want to make a phone call.' },
      { role:'officer', text:'Do not contact others.' },
      { role:'passenger', text:'All right.' },
      { role:'officer', text:'You are under observation.' }
    ]},
    { id:'g_004', title:'询问前控制', dialogue:[
      { role:'officer', text:'Prepare for inspection.' },
      { role:'passenger', text:'What inspection?' },
      { role:'officer', text:'You will be questioned after landing.' },
      { role:'passenger', text:'I understand.' },
      { role:'officer', text:'Keep your hands visible.' }
    ]},
    { id:'g_005', title:'执法处置', dialogue:[
      { role:'officer', text:'Do not resist.' },
      { role:'passenger', text:'I am not resisting.' },
      { role:'officer', text:'Follow instructions step by step.' },
      { role:'passenger', text:'Okay.' },
      { role:'officer', text:'Further action will be taken on ground.' }
    ]}
  ]},
  { category:'酒店入住', list:[
    { id:'h_001', title:'办理入住', dialogue:[
      { role:'A', text:'Good evening. I have a reservation under the name Zhang.', textCn:'晚上好。我姓张，有预订。' },
      { role:'B', text:'Welcome, Mr. Zhang. Let me check your booking. A single room for three nights?', textCn:'欢迎您，张先生。让我查一下您的预订。单人间住三晚对吗？' },
      { role:'A', text:'That is correct. I just finished a long flight and would like a quiet room if possible.', textCn:'没错。我刚结束长途飞行，如果可能的话，我想要一间安静的房间。' },
      { role:'B', text:'I can arrange a room on a higher floor away from the elevator. May I have your passport?', textCn:'我可以为您安排远离电梯的高层房间。请出示您的护照。' },
      { role:'A', text:'Here is my passport. What time is breakfast served?', textCn:'这是我的护照。请问早餐几点开始？' },
      { role:'B', text:'Breakfast is from 6:30 to 10:00 AM on the first floor. Here is your key card.', textCn:'早餐在一楼，时间是早上6:30到10:00。这是您的房卡。' }
    ]},
    { id:'h_002', title:'房间问题', dialogue:[
      { role:'A', text:'Hello, front desk? I have a problem with my room. The air conditioning is not working properly.', textCn:'你好，前台吗？我的房间有问题。空调不太好用。' },
      { role:'B', text:'I am sorry to hear that, sir. What seems to be the problem?', textCn:'很抱歉听到这个，先生。具体是什么问题？' },
      { role:'A', text:'It keeps making loud noises and the room is still very warm.', textCn:'空调一直发出很大的噪音，房间还是很热。' },
      { role:'B', text:'I apologize for the inconvenience. Shall I send someone to fix it, or would you prefer to change rooms?', textCn:'给您带来不便非常抱歉。您是希望我派人维修，还是换一间房间？' },
      { role:'A', text:'I would prefer to change rooms. I really need a good rest.', textCn:'我想换房间。我真的需要好好休息。' },
      { role:'B', text:'No problem. Please bring your belongings to the front desk and we will help you move.', textCn:'没问题。请把行李带到前台，我们会帮您搬过去。' }
    ]},
    { id:'h_003', title:'延长住宿', dialogue:[
      { role:'A', text:'Hello, I need to extend my stay for two more nights. Is my room still available?', textCn:'你好，我需要延长住宿两晚。我的房间还能续住吗？' },
      { role:'B', text:'Let me check the availability. Yes, your room is available.', textCn:'让我查一下空房情况。是的，您的房间可以续住。' },
      { role:'A', text:'That would be convenient. What is the rate for the extra nights?', textCn:'这样比较方便。额外几晚的价格是多少？' },
      { role:'B', text:'The rate is the same as your original booking, 120 dollars per night.', textCn:'价格和您原来的预订一样，每晚120美元。' },
      { role:'A', text:'Yes, please. Do I need to get a new key card?', textCn:'好的，请用同一张卡。我需要换新的房卡吗？' },
      { role:'B', text:'No, your current key card will be updated automatically.', textCn:'不用，您现在的房卡会自动更新。' }
    ]},
    { id:'h_004', title:'退房结账', dialogue:[
      { role:'A', text:'Good morning. I would like to check out now. Room 512.', textCn:'早上好。我想现在退房。512房间。' },
      { role:'B', text:'Certainly, Mr. Zhang. Did you enjoy your stay with us?', textCn:'当然，张先生。您入住愉快吗？' },
      { role:'A', text:'Yes, everything was great. I had some items from the minibar.', textCn:'是的，一切都很棒。我用了迷你吧的一些东西。' },
      { role:'B', text:'Let me check. Your total comes to 385 dollars.', textCn:'让我核对一下。您的总费用是385美元。' },
      { role:'A', text:'That sounds right. Can I pay with this credit card?', textCn:'听起来没错。我可以用这张信用卡支付吗？' },
      { role:'B', text:'Yes, of course. Here is your receipt.', textCn:'当然可以。这是您的收据。' }
    ]},
    { id:'h_005', title:'寻求帮助', dialogue:[
      { role:'A', text:'Excuse me, could you help me with some information?', textCn:'打扰一下，能帮我提供一些信息吗？' },
      { role:'B', text:'Of course, sir. How may I assist you?', textCn:'当然，先生。我能为您做什么？' },
      { role:'A', text:'I need to go to the city center. What is the best way to get there?', textCn:'我需要去市中心。怎么去最方便？' },
      { role:'B', text:'You can take the subway, which is cheaper and faster during rush hour.', textCn:'您可以坐地铁，高峰期更便宜更快。' },
      { role:'A', text:'Thank you. Can you recommend a good local restaurant nearby?', textCn:'谢谢。你能推荐附近好的当地餐厅吗？' },
      { role:'B', text:'There is an excellent Italian restaurant on Main Street, about ten minutes walk.', textCn:'主街上有一家很棒的意大利餐厅，步行大约十分钟。' }
    ]}
  ]},
  { category:'餐厅点餐', list:[
    { id:'r_001', title:'预订座位', dialogue:[
      { role:'A', text:'Hello, I would like to make a reservation for tonight at 7 PM.', textCn:'你好，我想预订今晚7点的座位。' },
      { role:'B', text:'Certainly. For how many people, sir?', textCn:'当然。请问几位，先生？' },
      { role:'A', text:'Just for two people. Do you have a table by the window?', textCn:'就两个人。有靠窗的位置吗？' },
      { role:'B', text:'Yes, we have a window table available. May I have your name and phone number?', textCn:'是的，我们有靠窗的位置。请问您的姓名和电话号码？' },
      { role:'A', text:'My name is Zhang, and my number is 555-1234.', textCn:'我姓张，电话是555-1234。' },
      { role:'B', text:'Your table is booked for 7 PM. We look forward to seeing you!', textCn:'您的桌子已预订在晚上7点。期待您的光临！' }
    ]},
    { id:'r_002', title:'点餐', dialogue:[
      { role:'A', text:'Could I see the menu, please?', textCn:'请给我菜单看看。' },
      { role:'B', text:'Here is the menu, sir. Would you like to start with something to drink?', textCn:'这是菜单，先生。您想先来点什么喝的吗？' },
      { role:'A', text:'Just water for now. What do you recommend for the main course?', textCn:'先来点水就好。主菜你推荐什么？' },
      { role:'B', text:'Our grilled salmon is very popular, and the steak is also excellent.', textCn:'我们的烤三文鱼很受欢迎，牛排也很棒。' },
      { role:'A', text:'I will have the grilled salmon, please. Also, I have a peanut allergy.', textCn:'我要烤三文鱼。另外，我对花生过敏。' },
      { role:'B', text:'Thank you for letting me know, I will inform the kitchen right away.', textCn:'谢谢您告知，我会立即通知厨房。' }
    ]},
    { id:'r_003', title:'结账买单', dialogue:[
      { role:'A', text:'Could I have the bill, please?', textCn:'请把账单给我好吗？' },
      { role:'B', text:'Of course, here it is. Your total is 68 dollars.', textCn:'当然，给您。您的总额是68美元。' },
      { role:'A', text:'Is a tip included in the bill?', textCn:'账单包含小费吗？' },
      { role:'B', text:'No, tipping is optional here, usually around 10 to 15 percent.', textCn:'不包含，这里小费是自愿的，一般是10%到15%。' },
      { role:'A', text:'Can I pay by credit card?', textCn:'我可以用信用卡付款吗？' },
      { role:'B', text:'Yes, of course. Here is your receipt, thank you for dining with us.', textCn:'当然可以。这是您的收据，感谢您的光临。' }
    ]}
  ]},
  { category:'机场问路', list:[
    { id:'w_001', title:'查询登机口', dialogue:[
      { role:'A', text:'Excuse me, could you tell me where Gate 32 is?', textCn:'打扰一下，请问32号登机口在哪里？' },
      { role:'B', text:'Sure, go straight down this corridor and turn left at the food court.', textCn:'好的，沿这条走廊直走，在美食广场处左转。' },
      { role:'A', text:'How long will it take to walk there?', textCn:'走过去需要多长时间？' },
      { role:'B', text:'About ten minutes. There is also a shuttle train if you prefer.', textCn:'大约十分钟。如果您愿意，也可以乘坐摆渡车。' },
      { role:'A', text:'Thank you very much for your help.', textCn:'非常感谢您的帮助。' },
      { role:'B', text:'You are welcome. Have a safe flight.', textCn:'不客气，祝您旅途平安。' }
    ]},
    { id:'w_002', title:'转机指引', dialogue:[
      { role:'A', text:'I have a connecting flight in two hours. Do I need to go through security again?', textCn:'我两小时后有联程航班，需要再次过安检吗？' },
      { role:'B', text:'Yes, please follow the transfer signs to the security checkpoint.', textCn:'是的，请按照转机指示牌前往安检口。' },
      { role:'A', text:'Where can I find the transfer signs?', textCn:'转机指示牌在哪里能找到？' },
      { role:'B', text:'They are the yellow signs right after you exit the aircraft.', textCn:'就是您下飞机后马上能看到的黄色指示牌。' },
      { role:'A', text:'Thank you. Is there enough time to make my connection?', textCn:'谢谢。我的转机时间来得及吗？' },
      { role:'B', text:'Yes, two hours should be plenty of time.', textCn:'是的，两小时应该很充裕。' }
    ]}
  ]}
];

/* ---------------- 空保英语专题（真实执勤场景 QA / 剧本卡片） ---------------- */
window.DATA.security = [
  { part:'特情处置', partEn:'Special Incident Response', categories:[
    { category:'反劫机处置', categoryEn:'Anti-hijacking Response', items:[
      { type:'qa', q:{ en:'What should you say first if a passenger rushes toward the cockpit?', cn:'如果旅客冲向驾驶舱，你首先应该说什么？' }, a:{ en:'Stop! Step back now!', cn:'站住！立刻后退！' } },
      { type:'qa', q:{ en:'How do you alert the crew without alarming passengers?', cn:'如何在不惊动旅客的情况下提醒机组？' }, a:{ en:'Use the code word or the silent alarm to alert the crew discreetly.', cn:'使用暗语或静默警报悄悄提醒机组。' } },
      { type:'qa', q:{ en:'What is the first thing to do when a hijack attempt is confirmed?', cn:'确认劫机企图后第一件事应该做什么？' }, a:{ en:'Lock the cockpit door immediately.', cn:'立即锁闭驾驶舱门。' } },
      { type:'qa', q:{ en:'How do you report a controlled situation to the cockpit?', cn:'如何向驾驶舱报告已控制的局面？' }, a:{ en:'Cockpit, cabin secure, situation under control, over.', cn:'驾驶舱，客舱安全，情况已控制，完毕。' } },
      { type:'qa', q:{ en:'What principle guides the crew during a hijack response?', cn:'处置劫机事件时机组遵循什么原则？' }, a:{ en:'Follow the chain of command and respond as a coordinated team.', cn:'遵循指挥链，进行协同处置。' } },
      { type:'qa', q:{ en:'After subduing the hijacker, what is the next step?', cn:'制伏劫机者后下一步该做什么？' }, a:{ en:'Apply restraints and continuously monitor the surrounding passengers.', cn:'实施约束并持续监控周围旅客。' } }
    ]},
    { category:'爆炸物威胁处置', categoryEn:'Bomb Threat Handling', items:[
      { type:'qa', q:{ en:'What is the first rule when a suspicious device is found?', cn:'发现可疑装置时的第一原则是什么？' }, a:{ en:'Do not touch it. Step away calmly.', cn:'不要碰它，冷静地离开。' } },
      { type:'qa', q:{ en:'How do you report a suspicious device to the cockpit?', cn:'如何向驾驶舱报告可疑装置？' }, a:{ en:'Cockpit, we have a suspicious device in the aft lavatory, requesting instructions, over.', cn:'驾驶舱，我们在后洗手间发现可疑装置，请求指示，完毕。' } },
      { type:'qa', q:{ en:'How do you clear passengers away from a suspicious item without causing panic?', cn:'如何在不引发恐慌的情况下疏散可疑物品附近的旅客？' }, a:{ en:'For a routine check, please move to the front cabin for a moment.', cn:'例行检查，请您暂时移步到前舱。' } },
      { type:'qa', q:{ en:'What must be maintained around a suspicious item until it is cleared?', cn:'在可疑物品被排除风险之前必须维持什么？' }, a:{ en:'A containment area must be maintained at all times.', cn:'必须始终维持隔离区域。' } },
      { type:'qa', q:{ en:'Who should ultimately handle a confirmed explosive device?', cn:'确认为爆炸装置后最终应由谁处置？' }, a:{ en:'The bomb disposal unit on the ground.', cn:'由地面的爆炸物处置小组处理。' } },
      { type:'qa', q:{ en:'What word should never be used in a cabin announcement about a suspicious item?', cn:'关于可疑物品的客舱广播中绝不能使用什么词？' }, a:{ en:'Never say "bomb" directly in a public announcement — use neutral wording instead.', cn:'切勿在广播中直接说"炸弹"，应使用中性说法。' } }
    ]},
    { category:'涉毒涉恐特情', categoryEn:'Drug & Terrorism-related Cases', items:[
      { type:'qa', q:{ en:'What should you do if X-ray shows an unusual shadow in a bag?', cn:'X光显示行李中有异常阴影时该怎么做？' }, a:{ en:'Please step aside for additional screening.', cn:'请到一旁进行进一步检查。' } },
      { type:'qa', q:{ en:'What must happen before you conclude an unlabeled substance is safe?', cn:'在判定无标签物质安全之前必须先做什么？' }, a:{ en:'It must be verified by law enforcement, never assumed.', cn:'必须由执法人员核实，绝不能自行假设。' } },
      { type:'qa', q:{ en:'How do you hand over a suspicious substance to police?', cn:'如何向警方移交可疑物质？' }, a:{ en:'Here is the evidence bag with the item and the chain of custody log.', cn:'这是装有物品的证物袋和保管链记录。' } },
      { type:'qa', q:{ en:'What should you do if a passenger name matches an intelligence watchlist?', cn:'如果旅客姓名与情报监控名单匹配该怎么做？' }, a:{ en:'Discreetly verify the identity first, then report to the cockpit quietly.', cn:'先低调核实身份，再向驾驶舱低调报告。' } },
      { type:'qa', q:{ en:'Why should you avoid confronting a suspect directly before verification?', cn:'为什么在核实前不应直接对峙嫌疑人？' }, a:{ en:'Direct confrontation may cause panic or provoke an unpredictable reaction.', cn:'直接对峙可能引发恐慌或不可预测的反应。' } },
      { type:'qa', q:{ en:'What should be handed to ground security after observing a suspect?', cn:'观察嫌疑人后应向地面安保部门移交什么？' }, a:{ en:'A complete observation report with the full timeline.', cn:'一份包含完整时间线的观察记录。' } }
    ]}
  ]},
  { part:'客舱安全管理', partEn:'Cabin Safety Management', categories:[
    { category:'醉酒旅客处置', categoryEn:'Intoxicated Passenger Handling', items:[
      { type:'dialogue', title:'拒绝提供酒精饮品', turns:[
        { speaker:'Q', role:'旅客', en:'Can I get one more drink, please?', cn:'能再给我一杯酒吗？' },
        { speaker:'A', role:'安全员', en:'Sir, I am sorry, we cannot serve you more alcohol at this time.', cn:'先生，很抱歉，我们现在不能再为您提供酒精饮品了。' },
        { speaker:'Q', role:'旅客', en:'Why not? I paid for my ticket.', cn:'为什么不行？我付了机票钱。' },
        { speaker:'A', role:'安全员', en:'It is for your safety. Please let me help you back to your seat.', cn:'这是为了您的安全。请让我扶您回到座位。' }
      ]},
      { type:'qa', q:{ en:'What is a sign of an intoxicated passenger?', cn:'醉酒旅客的表现有哪些？' }, a:{ en:'Slurred speech and erratic or unsteady behavior.', cn:'言语含糊，行为反常或走路不稳。' } },
      { type:'qa', q:{ en:'What should you do if an intoxicated passenger tries to walk around?', cn:'醉酒旅客试图走动时该怎么做？' }, a:{ en:'Sir, please sit down. I will help you back to your seat.', cn:'先生，请坐下，我扶您回到座位。' } },
      { type:'qa', q:{ en:'What must you do throughout the flight for an intoxicated passenger?', cn:'对醉酒旅客在整个航程中必须做什么？' }, a:{ en:'Continuously monitor his condition and log it.', cn:'持续观察其状态并记录日志。' } },
      { type:'qa', q:{ en:'What should happen before landing regarding an intoxicated passenger?', cn:'落地前对醉酒旅客应该做什么？' }, a:{ en:'Report his condition to ground staff for further follow-up.', cn:'将他的状态报告给地勤以便后续跟进。' } }
    ]},
    { category:'驾驶舱门安全', categoryEn:'Cockpit Door Security', items:[
      { type:'qa', q:{ en:'What must be confirmed before the cockpit door opens?', cn:'驾驶舱门开启前必须确认什么？' }, a:{ en:'The surrounding area must be confirmed clear.', cn:'必须确认周边区域没有异常情况。' } },
      { type:'qa', q:{ en:'What rule applies whenever the cockpit door is open?', cn:'驾驶舱门开启期间适用什么原则？' }, a:{ en:'The two-person rule always applies.', cn:'始终适用双人原则。' } },
      { type:'qa', q:{ en:'How do you respond if a passenger asks to photograph the cockpit?', cn:'如果旅客要求拍摄驾驶舱该如何回应？' }, a:{ en:'I am sorry, photography is restricted in this area for security reasons.', cn:'很抱歉，出于安全考虑，此区域禁止拍照。' } },
      { type:'qa', q:{ en:'What confirms the end of a cockpit door security procedure?', cn:'什么标志着驾驶舱门安全流程的结束？' }, a:{ en:'Cockpit door is now secured and locked.', cn:'驾驶舱门已锁闭确认安全。' } },
      { type:'qa', q:{ en:'What area near the cockpit has restricted access at all times?', cn:'驾驶舱附近哪个区域始终限制进入？' }, a:{ en:'The crew rest area has restricted access.', cn:'机组休息区的进入受到限制。' } }
    ]},
    { category:'客舱异物与设备故障', categoryEn:'Foreign Objects & Equipment Faults', items:[
      { type:'qa', q:{ en:'What should you do if a strange odor is reported in the cabin?', cn:'客舱内报告异常气味时该怎么做？' }, a:{ en:'Investigate immediately and report to the cockpit.', cn:'立即调查并向驾驶舱报告。' } },
      { type:'qa', q:{ en:'What device might trigger if there is smoke in the lavatory?', cn:'洗手间内如有烟雾可能触发什么设备？' }, a:{ en:'The smoke detector.', cn:'烟雾探测器。' } },
      { type:'qa', q:{ en:'What risk is associated with a passenger device that is overheating?', cn:'旅客设备过热存在什么风险？' }, a:{ en:'Battery overheating can lead to a fire onboard.', cn:'电池过热可能导致机上火情。' } },
      { type:'qa', q:{ en:'What should be reported when an unidentified item is found under a seat?', cn:'座位下方发现不明物品时应报告什么？' }, a:{ en:'Report it as a foreign object immediately.', cn:'立即报告发现异物。' } },
      { type:'qa', q:{ en:'What is the correct radio term for equipment failure?', cn:'设备故障的正确通话用词是什么？' }, a:{ en:'Malfunction.', cn:'故障（malfunction）。' } }
    ]}
  ]},
  { part:'涉外执法与移交', partEn:'Foreign-related Enforcement', categories:[
    { category:'涉外人身检查', categoryEn:'Foreign-related Body Search', items:[
      { type:'qa', q:{ en:'What should you offer to protect a passenger privacy during a search?', cn:'检查过程中应提供什么以保护旅客隐私？' }, a:{ en:'A same-gender search behind a privacy screen.', cn:'安排同性别安全员在隐私遮挡后检查。' } },
      { type:'qa', q:{ en:'What should you arrange if a passenger has limited language ability?', cn:'如果旅客语言能力有限应安排什么？' }, a:{ en:'Arrange an interpreter to help explain each step.', cn:'安排一名翻译来说明每个步骤。' } },
      { type:'qa', q:{ en:'What special procedure applies to religious garments?', cn:'宗教服饰适用什么特殊流程？' }, a:{ en:'A witness officer must be present, following the special procedure.', cn:'必须有见证人员在场，按特殊流程处理。' } },
      { type:'qa', q:{ en:'What quality should officers show throughout a cross-cultural search?', cn:'跨文化检查全程应体现什么品质？' }, a:{ en:'Cultural sensitivity throughout the process.', cn:'全程体现文化敏感性。' } },
      { type:'qa', q:{ en:'How should officers end a search that went smoothly?', cn:'顺利完成检查后应如何收尾？' }, a:{ en:'Thank you for your patience and cooperation, have a safe flight.', cn:'感谢您的耐心配合，祝您旅途平安。' } }
    ]},
    { category:'机场公安交接', categoryEn:'Airport Police Handover', items:[
      { type:'dialogue', title:'廊桥交接', turns:[
        { speaker:'Q', role:'警官', en:'Can you brief me on what happened during the flight?', cn:'能向我简报一下航程中发生的情况吗？' },
        { speaker:'A', role:'安全员', en:'Here is the incident report with the full timeline and witness statements.', cn:'这是包含完整时间线和证人证言的事件报告。' },
        { speaker:'Q', role:'警官', en:'Is there any evidence to hand over?', cn:'有证物需要移交吗？' },
        { speaker:'A', role:'安全员', en:'Yes, here is the evidence bag with the chain of custody log.', cn:'是的，这是证物袋和保管链记录。' }
      ]},
      { type:'qa', q:{ en:'What is the first step when police arrive at the gate?', cn:'警方到达登机口时的第一步是什么？' }, a:{ en:'Thank them for coming and brief them on the situation.', cn:'感谢到场并简要说明情况。' } },
      { type:'qa', q:{ en:'What confirms the handover to police is complete?', cn:'什么标志着向警方的交接已完成？' }, a:{ en:'A signature confirming the handover is complete.', cn:'签字确认交接已完成。' } },
      { type:'qa', q:{ en:'What must accompany any evidence handed to police?', cn:'移交给警方的任何证物都必须附带什么？' }, a:{ en:'The chain of custody log.', cn:'证据保管链记录。' } },
      { type:'qa', q:{ en:'What document should be prepared throughout an incident, not just at the end?', cn:'什么文件应在事件全程同步准备，而非事后补写？' }, a:{ en:'The incident report with a real-time timeline.', cn:'带有实时时间线的事件报告。' } }
    ]},
    { category:'VIP外交旅客服务', categoryEn:'VIP & Diplomatic Service', items:[
      { type:'qa', q:{ en:'What is exempt from inspection under diplomatic protocol?', cn:'根据外交惯例什么物品可免于检查？' }, a:{ en:'A diplomatic pouch is exempt from inspection.', cn:'外交邮袋可免于开包检查。' } },
      { type:'qa', q:{ en:'How should a VIP delegation be treated at boarding?', cn:'VIP代表团登机时应受到怎样的对待？' }, a:{ en:'With courtesy and priority boarding.', cn:'以礼貌对待并安排优先登机。' } },
      { type:'qa', q:{ en:'What should you say before checking a VIP passenger item?', cn:'检查VIP旅客物品前应说什么？' }, a:{ en:'May I do a quick visual check of this item, purely as a routine courtesy?', cn:'我可以对这件物品做一个简单的目视检查吗，只是例行礼节性核实？' } },
      { type:'qa', q:{ en:'Who typically accompanies a government delegation?', cn:'通常谁会陪同政府代表团？' }, a:{ en:'A protocol officer.', cn:'一名礼宾官员。' } },
      { type:'qa', q:{ en:'What tone should be used throughout VIP service?', cn:'VIP服务全程应使用什么语气？' }, a:{ en:'A professional and courteous tone.', cn:'专业而有礼节的语气。' } }
    ]}
  ]},
  { part:'应急与服务', partEn:'Emergency & Service', categories:[
    { category:'客舱医疗紧急', categoryEn:'In-flight Medical Emergency', items:[
      { type:'qa', q:{ en:'What should you announce first when a passenger collapses?', cn:'旅客突然倒下时应首先广播什么？' }, a:{ en:'Is there a doctor onboard? We need assistance immediately.', cn:'机上是否有医生？我们需要立即协助。' } },
      { type:'qa', q:{ en:'How do you report a medical emergency to the cockpit?', cn:'如何向驾驶舱报告医疗紧急情况？' }, a:{ en:'Cockpit, medical emergency in row 22, a doctor is assisting, will update, over.', cn:'驾驶舱，22排发生医疗紧急情况，一名医生正在协助，我们会持续更新，完毕。' } },
      { type:'qa', q:{ en:'What equipment should be brought for a suspected heart problem?', cn:'疑似心脏问题时应取用什么设备？' }, a:{ en:'The defibrillator and medical kit.', cn:'自动体外除颤器和医疗急救箱。' } },
      { type:'qa', q:{ en:'What should be coordinated with ground staff before landing for a medical case?', cn:'医疗紧急情况落地前应与地勤协调什么？' }, a:{ en:'Have medical personnel meet the aircraft on arrival.', cn:'安排医护人员在飞机落地时接应。' } },
      { type:'qa', q:{ en:'What symptom requires calling an ambulance immediately?', cn:'哪种症状需要立即叫救护车？' }, a:{ en:'Loss of consciousness or difficulty breathing.', cn:'失去意识或呼吸困难。' } }
    ]},
    { category:'投诉服务补救', categoryEn:'Complaint & Service Recovery', items:[
      { type:'dialogue', title:'安抚投诉旅客', turns:[
        { speaker:'Q', role:'旅客', en:'I am very upset about the long delay and the meal shortage!', cn:'我对长时间延误和餐食不足非常不满！' },
        { speaker:'A', role:'安全员', en:'I am sorry for the inconvenience. I understand your frustration completely.', cn:'对给您带来的不便我很抱歉，我完全理解您的沮丧。' },
        { speaker:'Q', role:'旅客', en:'What can you do about it?', cn:'你们能为此做些什么？' },
        { speaker:'A', role:'安全员', en:'Let me see what alternative meal options I can offer you right away.', cn:'我马上为您看看能提供哪些替代餐食选项。' }
      ]},
      { type:'qa', q:{ en:'What is the first step in service recovery?', cn:'服务补救的第一步是什么？' }, a:{ en:'A sincere apology and genuine empathy.', cn:'真诚的道歉和真正的共情。' } },
      { type:'qa', q:{ en:'How should a passenger wish to file a formal complaint be treated?', cn:'应如何对待旅客提出正式投诉的意愿？' }, a:{ en:'Assist them fully rather than discourage them.', cn:'应积极协助而非劝阻。' } },
      { type:'qa', q:{ en:'What should close out a well-handled service recovery?', cn:'一次妥善的服务补救应以什么收尾？' }, a:{ en:'A genuine thank-you for the feedback.', cn:'对旅客反馈的真诚感谢。' } }
    ]},
    { category:'无线电通话规范', categoryEn:'Radio Communication Standards', items:[
      { type:'qa', q:{ en:'How do you confirm you received a message clearly?', cn:'如何确认清楚收到了一条信息？' }, a:{ en:'Copy that, or Roger.', cn:'Copy that（收到）或 Roger（收到）。' } },
      { type:'qa', q:{ en:'What do you say if you did not hear the message clearly?', cn:'没有听清信息时该说什么？' }, a:{ en:'Say again, last transmission was unclear.', cn:'请重复，刚才信号不清楚。' } },
      { type:'qa', q:{ en:'How do you end a radio transmission?', cn:'如何结束一次无线电通话？' }, a:{ en:'End with "over".', cn:'以"over"（完毕）结束。' } },
      { type:'qa', q:{ en:'How do you interrupt for an urgent message?', cn:'如何插播一条紧急信息？' }, a:{ en:'Break break, followed by the urgent message.', cn:'先说"Break break"（紧急插播），再接紧急信息。' } },
      { type:'qa', q:{ en:'What word confirms "yes" in radio communication?', cn:'无线电通话中确认"是"用什么词？' }, a:{ en:'Affirmative.', cn:'Affirmative（确认）。' } },
      { type:'qa', q:{ en:'What word means "no" in radio communication?', cn:'无线电通话中"否"用什么词？' }, a:{ en:'Negative.', cn:'Negative（否定）。' } }
    ]}
  ]}
];
