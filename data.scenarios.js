/* ===========================================================
   data.scenarios.js —— 情景剧本（分支决策式真实执勤场景）
   每个剧本由若干节点(node)组成，每节点提供2-3个应对选项，
   选对进入下一节点，选错扣生命值并给出参考解释后原地重选。
=========================================================== */
window.DATA = window.DATA || {};

window.DATA.scenarios = [
{
  id:'sc_hijack_01', title:'反劫机特情：舱门威胁', titleEn:'Cockpit Threat Response', scene:'cabin', icon:'alert',
  brief:'巡航阶段，一名男性旅客突然解开安全带冲向前舱，声称"必须马上进驾驶舱"，并伸手推搡阻拦他的乘务员。',
  start:'n1',
  nodes:{
    n1:{ narration:'旅客已冲到厨房区，正试图绕过乘务员靠近驾驶舱门。你就在附近，必须第一时间反应。', choices:[
      { en:'Stop! Step back now!', cn:'站住！立刻后退！', correct:true, feedback:'正确。面对直接冲向驾驶舱的威胁，第一反应必须是大声、清晰、简短地下达制止指令，同时靠近控制其行动路线。', next:'n2' },
      { en:'Excuse me sir, is everything OK?', cn:'先生您好，一切还好吗？', correct:false, feedback:'过于礼貌的询问会浪费宝贵的反应时间。面对冲向驾驶舱的直接威胁，应立即用简短有力的指令制止，而非先询问。', next:'n1' }
    ]},
    n2:{ narration:'旅客没有停下，仍试图伸手拉驾驶舱门把手。乘务长按下了静默警报。', choices:[
      { en:'Get back! Do not touch that door!', cn:'退后！不要碰那扇门！', correct:true, feedback:'正确。此时应上前近距离制止并明确指出禁止触碰驾驶舱门，同时准备使用约束手段。', next:'n3' },
      { en:'Sir, please calm down and return to your seat.', cn:'先生请冷静，回到您的座位上。', correct:false, feedback:'情况已升级为直接触碰驾驶舱门的高危动作，此刻必须用强制性指令加身体阻拦，而不是温和劝说。', next:'n2' }
    ]},
    n3:{ narration:'你与另一名机组成员合力将旅客拉离舱门并将其按压在地面上控制住。', choices:[
      { en:'Hands behind your back, now!', cn:'把手放到背后，现在！', correct:true, feedback:'正确，制服后立即下达约束指令并使用约束装备（plastic handcuffs），同时安排一人持续监控周围乘客情绪。', next:'n4' },
      { en:'What is your name, sir?', cn:'先生您叫什么名字？', correct:false, feedback:'此刻旅客仍具威胁性，应先完成物理约束，身份核实与录入笔录是控制局面之后的步骤。', next:'n3' }
    ]},
    n4:{ narration:'旅客已被约束在地面，情绪逐渐平息，其他乘客开始骚动。你需要向驾驶舱和全客舱通报。', choices:[
      { en:'Cockpit, cabin secure, passenger restrained, situation under control, over.', cn:'驾驶舱，客舱安全，旅客已被约束，情况已控制，完毕。', correct:true, feedback:'正确，使用标准无线电通话格式简明报告状态：地点、状态、结果，并以"over"结束通话。', next:'end' },
      { en:'It is fine now, don\'t worry about it.', cn:'现在没事了，别担心。', correct:false, feedback:'对驾驶舱的报告必须专业、结构化，包含关键信息（客舱状态/旅客状态/是否需要后续支援），而非口语化安慰。', next:'n4' }
    ]}
  },
  endText:'处置完毕：你按流程完成了制止、约束、通报三个关键环节，落地后旅客将被移交机场公安处理。'
},
{
  id:'sc_bomb_01', title:'可疑爆炸物发现', titleEn:'Suspicious Device Found', scene:'cabin', icon:'bomb',
  brief:'客舱巡查时，一名乘务员在洗手间垃圾桶下发现一个用胶带缠绕、带有电线外露的不明包裹，旅客们尚未察觉。',
  start:'n1',
  nodes:{
    n1:{ narration:'乘务员低声向你报告发现可疑物品，正焦急地想伸手拿出来查看。', choices:[
      { en:'Do not touch it. Step away calmly.', cn:'不要碰它，冷静地离开。', correct:true, feedback:'正确。发现疑似爆炸装置的第一原则是绝不触碰、不移动，避免触发风险，并保持镇定不引起旅客恐慌。', next:'n2' },
      { en:'Let me take a closer look at it.', cn:'我来仔细看看是什么。', correct:false, feedback:'切勿靠近或触碰可疑装置，即使是出于检查目的，也应保持安全距离并立即上报。', next:'n1' }
    ]},
    n2:{ narration:'你需要立即通知机长并设置隔离区域，同时避免客舱大范围恐慌。', choices:[
      { en:'Cockpit, we have a suspicious device in the aft lavatory, requesting instructions, over.', cn:'驾驶舱，我们在后洗手间发现可疑装置，请求指示，完毕。', correct:true, feedback:'正确，第一时间用标准通话格式向机长报告具体位置和情况，由机长决定后续处置方案（是否备降等）。', next:'n3' },
      { en:'Everyone please remain calm, there is a bomb onboard!', cn:'大家请保持冷静，飞机上有炸弹！', correct:false, feedback:'绝不能在客舱内直接使用"炸弹"等词汇广播，这会引发恐慌甚至次生风险，应先通过内部通话上报机长。', next:'n2' }
    ]},
    n3:{ narration:'机长决定就近备降。你需要在不引起恐慌的前提下建立隔离区域并疏导附近旅客。', choices:[
      { en:'Sir, madam, for a routine check please move to the front cabin for a moment.', cn:'先生女士，例行检查，请您暂时移步到前舱。', correct:true, feedback:'正确，使用"例行检查"这类中性说法引导附近旅客远离可疑物品所在区域，避免引发恐慌。', next:'n4' },
      { en:'Stay exactly where you are, do not move at all!', cn:'原地不许动，谁都不许动！', correct:false, feedback:'此阶段目标是柔性疏散周边旅客远离可疑物品，而非强制静止——那会让旅客靠可疑物品太近且容易引发焦虑。', next:'n3' }
    ]},
    n4:{ narration:'飞机开始备降程序，你需要保持隔离区域直到落地。', choices:[
      { en:'Maintain the containment area, no one crosses this point.', cn:'保持隔离区域，任何人不得越过这条线。', correct:true, feedback:'正确，落地前必须持续维持隔离区域，禁止旅客靠近，直到地面专业人员（爆炸物处置小组）介入。', next:'end' },
      { en:'It should be fine, let\'s just relax now.', cn:'应该没事的，我们先放松一下。', correct:false, feedback:'在专业人员确认排除风险前，隔离状态必须持续维持，不能因情况暂时平稳而松懈。', next:'n4' }
    ]}
  },
  endText:'处置完毕：飞机安全备降，地面爆炸物处置小组接手。全程未触碰可疑物、未引发客舱恐慌，处置得当。'
},
{
  id:'sc_unruly_01', title:'旅客情绪失控升级', titleEn:'Escalating Unruly Passenger', scene:'cabin', icon:'talk',
  brief:'一名旅客因航班延误情绪激动，起初只是大声抱怨，逐渐开始拍打前排座椅并辱骂乘务员。',
  start:'n1',
  nodes:{
    n1:{ narration:'旅客还在座位上，情绪激动但尚未有肢体动作，周围旅客开始侧目。', choices:[
      { en:'Sir, I understand you are frustrated. Let me see how I can help.', cn:'先生，我理解您的沮丧。让我看看能帮您做些什么。', correct:true, feedback:'正确。情绪升级初期应优先共情安抚，给对方被理解的感觉，往往能有效降温。', next:'n2' },
      { en:'Sir, you need to stop this behavior immediately.', cn:'先生，您必须立即停止这种行为。', correct:false, feedback:'情绪尚未失控到肢体冲突阶段时，直接强硬命令容易激化矛盾，应先尝试共情缓和。', next:'n1' }
    ]},
    n2:{ narration:'旅客并未平静，反而开始拍打前排座椅靠背，语气更加激烈。', choices:[
      { en:'Sir, please stop hitting the seat. This is a safety warning.', cn:'先生，请不要拍打座椅，这是一次安全警告。', correct:true, feedback:'正确，行为已升级为对客舱安全的干扰，应明确、坚定地发出正式的安全警告，让对方清楚后果。', next:'n3' },
      { en:'Haha, calm down buddy, it\'s not a big deal.', cn:'哈哈，冷静点老兄，没什么大不了的。', correct:false, feedback:'轻浮的语气会让旅客觉得不被重视，反而可能加剧情绪，此时需要专业而坚定的态度。', next:'n2' }
    ]},
    n3:{ narration:'旅客仍未收敛，并对乘务员进行言语辱骂。你需要给出最后警告。', choices:[
      { en:'This is your final warning. Further action will be taken if this continues.', cn:'这是最后警告，如继续如此将采取进一步措施。', correct:true, feedback:'正确，明确下达最后警告，为后续可能的约束或移交警方处置提供依据（书面记录很重要）。', next:'n4' },
      { en:'I will just ignore this and hope it stops.', cn:'我先不管，希望它自己停下来。', correct:false, feedback:'消极忽视可能让情况进一步失控，正式警告是必要的处置步骤，也是后续处置的程序依据。', next:'n3' }
    ]},
    n4:{ narration:'旅客在最后警告后逐渐平静下来，坐回座位。落地后需要完整记录此次事件。', choices:[
      { en:'I will file a complete incident report with the timeline of events.', cn:'我会提交一份包含完整事件时间线的事件报告。', correct:true, feedback:'正确，无论事件最终是否升级，都应完整记录时间线、警告内容与旅客反应，作为规范存档。', next:'end' },
      { en:'No need to report since it\'s resolved now.', cn:'既然已经解决了就不用报告了。', correct:false, feedback:'即使情况已平息，涉及警告和秩序干扰的事件仍必须记录在案，这是规范要求。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过"共情—警告—最后警告—记录"的标准升级流程，成功平息了这起旅客秩序事件。'
},
{
  id:'sc_drunk_01', title:'醉酒旅客处置', titleEn:'Intoxicated Passenger', scene:'cabin', icon:'medical',
  brief:'登机前已饮酒的旅客在起飞后向乘务员索要更多酒精饮品，言语含糊、走路不稳，并试图站起走动。',
  start:'n1',
  nodes:{
    n1:{ narration:'旅客再次按呼叫铃要求酒精饮品，你被请求协助处理。', choices:[
      { en:'Sir, I am sorry, we cannot serve you more alcohol at this time.', cn:'先生，很抱歉，我们现在不能再为您提供酒精饮品了。', correct:true, feedback:'正确，机组有权对已显醉态的旅客拒绝提供酒精饮品，用礼貌但坚定的语气说明即可。', next:'n2' },
      { en:'Sure, one more drink coming right up.', cn:'好的，马上再给您来一杯。', correct:false, feedback:'对已明显醉酒的旅客继续提供酒精饮品会增加风险，应当拒绝。', next:'n1' }
    ]},
    n2:{ narration:'旅客不满，摇晃着站起来想自己去厨房区拿酒，脚步不稳几乎摔倒。', choices:[
      { en:'Sir, please sit down. I will help you back to your seat.', cn:'先生，请坐下，我扶您回到座位。', correct:true, feedback:'正确，行走不稳存在摔伤风险，应主动上前协助其安全就座，同时安抚情绪。', next:'n3' },
      { en:'You should really be more careful.', cn:'你真的应该小心一点。', correct:false, feedback:'此刻应立即行动协助其安全坐下，而不是仅做口头提醒，防止跌倒受伤。', next:'n2' }
    ]},
    n3:{ narration:'旅客坐下后情绪仍不稳定，开始语无伦次。你需要持续观察并决定是否需要采取进一步措施。', choices:[
      { en:'I will monitor him closely and note his condition in the log.', cn:'我会持续观察他的状态并记录在日志中。', correct:true, feedback:'正确，对醉酒旅客应持续行为监控并书面记录，为落地后续处置（如是否需要移交）提供依据。', next:'n4' },
      { en:'He will probably just fall asleep, no need to watch him.', cn:'他大概会睡着的，不用管他了。', correct:false, feedback:'醉酒旅客存在健康和安全双重风险，不能掉以轻心，必须持续监控直至落地。', next:'n3' }
    ]},
    n4:{ narration:'飞机即将落地，旅客的状态需要向地面交接。', choices:[
      { en:'We will report his condition to ground staff for further follow-up.', cn:'我们会将他的状态报告给地勤，以便后续跟进。', correct:true, feedback:'正确，落地前应完成交接准备，将旅客状态告知地勤或相关部门以便妥善处理。', next:'end' },
      { en:'Once he leaves the aircraft, it is no longer our concern.', cn:'他一下飞机就不关我们的事了。', correct:false, feedback:'交接责任是完整处置流程的一部分，应主动告知地面相关人员旅客情况。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过拒绝服务、安全搀扶、持续监控与地面交接，妥善处理了醉酒旅客风险。'
},
{
  id:'sc_drug_01', title:'涉毒可疑旅客盘查', titleEn:'Suspected Drug Carrier', scene:'checkpoint', icon:'scan',
  brief:'安检口，一名旅客神情紧张、手心冒汗，其随身包在X光机下显示出异常密度阴影。',
  start:'n1',
  nodes:{
    n1:{ narration:'X光图像显示可疑阴影，你需要决定下一步动作。', choices:[
      { en:'Sir, please step aside for additional screening.', cn:'先生，请到一旁进行进一步检查。', correct:true, feedback:'正确，对图像存疑的行李应引导旅客至二次安检区域，礼貌且明确地说明流程。', next:'n2' },
      { en:'Sir, you are hiding drugs, aren\'t you?', cn:'先生，你是不是在藏毒品？', correct:false, feedback:'在未核实前不能直接指控旅客，应先按流程进行客观、专业的二次检查。', next:'n1' }
    ]},
    n2:{ narration:'二次检查中，你需要旅客配合打开行李接受人工检查。', choices:[
      { en:'Please open your bag. I need to inspect this item.', cn:'请打开您的行李，我需要检查这件物品。', correct:true, feedback:'正确，用清晰、专业的指令请旅客配合打开行李，逐步排查可疑区域。', next:'n3' },
      { en:'Just tell me what\'s inside, I will trust you.', cn:'你就告诉我里面是什么，我相信你。', correct:false, feedback:'安检流程要求实际开包检查核实，不能仅凭口头陈述判断，必须完成规范检查步骤。', next:'n2' }
    ]},
    n3:{ narration:'检查中发现一包用塑料袋密封、无标签的白色粉末状物质。', choices:[
      { en:'This requires further inspection. Please wait here.', cn:'这需要进一步检查，请您在此等候。', correct:true, feedback:'正确，发现疑似管制物质后应稳住旅客并立即联系执法人员，避免打草惊蛇或激化冲突。', next:'n4' },
      { en:'Oh it\'s probably just flour, you can go now.', cn:'哦，可能只是面粉，您可以走了。', correct:false, feedback:'未经专业检测前不能自行判断物质性质并放行，必须交由执法人员核实处理。', next:'n3' }
    ]},
    n4:{ narration:'执法人员到场后需要你完整交接情况。', choices:[
      { en:'We found an unlabeled substance during secondary screening. Here is the evidence bag.', cn:'我们在二次安检中发现了一包无标签物质，这是证物袋。', correct:true, feedback:'正确，向执法人员清晰说明发现过程并移交证物，保持证据保管链完整。', next:'end' },
      { en:'I don\'t really remember the details.', cn:'我记不太清细节了。', correct:false, feedback:'必须准确、完整地陈述发现过程，这对后续调查和证据链至关重要。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过规范的二次安检、开包检查与执法交接，妥善处理了这起涉毒可疑物品事件。'
},
{
  id:'sc_handover_01', title:'落地移交机场公安', titleEn:'Airport Police Handover', scene:'gate', icon:'handoff',
  brief:'飞机落地滑行至廊桥，一名此前被约束的旅客需要在下机后移交机场公安处理。',
  start:'n1',
  nodes:{
    n1:{ narration:'廊桥对接后，机场公安已在舱门外等候。你需要先做什么？', choices:[
      { en:'Officer, thank you for coming. Let me brief you on the situation.', cn:'警官您好，感谢到场，我先向您简要说明情况。', correct:true, feedback:'正确，第一时间与到场警方建立联系并主动简报情况，是标准交接流程的第一步。', next:'n2' },
      { en:'He is all yours now, good luck.', cn:'他现在归你们了，祝你好运。', correct:false, feedback:'交接前必须完整简报事件经过，而非简单甩手，这关系到后续调查的准确性。', next:'n1' }
    ]},
    n2:{ narration:'警方需要了解具体的时间线和处置过程。', choices:[
      { en:'Here is the incident report with the full timeline and witness statements.', cn:'这是包含完整时间线和证人证言的事件报告。', correct:true, feedback:'正确，提供书面事件报告、时间线记录和证人证言，是规范交接的核心材料。', next:'n3' },
      { en:'It all happened really fast, I don\'t have anything written down.', cn:'事情发生得很快，我没有任何书面记录。', correct:false, feedback:'规范执勤要求在事件过程中同步记录关键信息，交接时必须提供书面材料。', next:'n2' }
    ]},
    n3:{ narration:'警方询问是否有证物需要移交。', choices:[
      { en:'Yes, here is the evidence bag with the item and the chain of custody log.', cn:'是的，这是装有物品的证物袋和保管链记录。', correct:true, feedback:'正确，任何相关证物都需连同保管链记录一并移交，确保证据链完整可追溯。', next:'n4' },
      { en:'We threw that away, it wasn\'t important.', cn:'我们把那个扔了，觉得不重要。', correct:false, feedback:'任何在事件中提取的物品都应作为证物妥善保存并移交，不可随意处理。', next:'n3' }
    ]},
    n4:{ narration:'交接完成前，你需要请对方确认接收。', choices:[
      { en:'Could you please sign here to confirm the handover is complete?', cn:'请您在此签字确认交接已完成。', correct:true, feedback:'正确，请警方签字确认接收，完成整个交接流程的闭环，也是权责划分的凭证。', next:'end' },
      { en:'OK, I guess we are done here.', cn:'好了，我想这样就结束了。', correct:false, feedback:'交接必须有正式的签字确认环节，口头默认不能作为流程完成的凭证。', next:'n4' }
    ]}
  },
  endText:'处置完毕：完整的简报、书面报告、证物移交与签字确认，构成了一次规范的公安交接流程。'
},
{
  id:'sc_medical_01', title:'客舱医疗紧急', titleEn:'In-flight Medical Emergency', scene:'cabin', icon:'medical',
  brief:'巡航途中，一名中年旅客突然捂着胸口倒向座椅，脸色苍白，呼吸急促。',
  start:'n1',
  nodes:{
    n1:{ narration:'你第一时间赶到旅客身边，周围乘客开始紧张围观。', choices:[
      { en:'Is there a doctor onboard? We need assistance immediately.', cn:'机上是否有医生？我们需要立即协助。', correct:true, feedback:'正确，第一时间通过广播寻求机上医疗资源，同时安排他人取医疗急救箱。', next:'n2' },
      { en:'Everyone please stay away and stop looking.', cn:'大家请离开，别再围观了。', correct:false, feedback:'虽然维持秩序重要，但当下最紧急的是第一时间寻求医疗协助，这应优先处理。', next:'n1' }
    ]},
    n2:{ narration:'一名医生响应并到场，同时旅客的情况仍需持续汇报驾驶舱。', choices:[
      { en:'Cockpit, medical emergency in row 22, a doctor is assisting, will update, over.', cn:'驾驶舱，22排发生医疗紧急情况，一名医生正在协助，我们会持续更新，完毕。', correct:true, feedback:'正确，使用标准无线电格式向驾驶舱报告位置、情况和处置进展，便于机长决定是否备降。', next:'n3' },
      { en:'It\'s probably nothing serious, no need to tell the cockpit yet.', cn:'应该不严重，暂时不用告诉驾驶舱。', correct:false, feedback:'任何医疗紧急情况都应第一时间通报驾驶舱，由机长综合判断是否需要备降等措施。', next:'n2' }
    ]},
    n3:{ narration:'医生判断旅客可能突发心脏问题，情况危急，需要设备支持。', choices:[
      { en:'Bring the defibrillator and medical kit from the front galley immediately.', cn:'立即把前厨房区的自动体外除颤器和医疗急救箱拿过来。', correct:true, feedback:'正确，明确指出所需设备名称和存放位置，确保医疗支援高效开展。', next:'n4' },
      { en:'Let\'s just wait and see how he feels in a bit.', cn:'我们先等等看他感觉怎么样。', correct:false, feedback:'心脏症状属于高危医疗紧急情况，必须立即行动取用急救设备，不能观望等待。', next:'n3' }
    ]},
    n4:{ narration:'在医生和设备协助下旅客情况稳定，飞机决定就近备降以便旅客尽快就医。', choices:[
      { en:'We will coordinate with ground staff to have medical personnel meet the aircraft.', cn:'我们会与地勤协调，安排医护人员在飞机落地时接应。', correct:true, feedback:'正确，备降前应提前与地面协调，确保医护人员在落地时第一时间接手旅客。', next:'end' },
      { en:'We\'ll figure out the details after we land.', cn:'落地以后再想办法吧。', correct:false, feedback:'医疗紧急情况的地面协调应在落地前提前完成，以争取黄金救援时间。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过快速寻医、标准通报、设备支援与地面协调，为旅客争取到了最佳的救治时间窗口。'
},
{
  id:'sc_search_01', title:'涉外人身检查·文化敏感场景', titleEn:'Culturally Sensitive Search', scene:'checkpoint', icon:'scan',
  brief:'一名身着宗教服饰的外籍女性旅客在安检时因金属探测器报警需要进一步检查，她对检查方式表现出明显的不安。',
  start:'n1',
  nodes:{
    n1:{ narration:'旅客因为报警需要接受人工检查，但她对检查方式感到紧张。你该如何开场？', choices:[
      { en:'Ma\'am, for privacy, a female officer will assist you behind this screen.', cn:'女士，为保护您的隐私，将由一名女性安全员在这块遮挡后为您检查。', correct:true, feedback:'正确，主动说明将安排同性别安全员并使用隐私遮挡，体现对文化和隐私的尊重，能有效缓解紧张情绪。', next:'n2' },
      { en:'Just stand still, this will only take a second.', cn:'站好别动，一下子就好。', correct:false, feedback:'涉外检查中应体现对隐私和文化的敏感性，简单粗暴的指令容易引发旅客不适或投诉。', next:'n1' }
    ]},
    n2:{ narration:'旅客表示她的语言不太好，担心听不懂指令。', choices:[
      { en:'Would you like an interpreter to help explain each step?', cn:'需要为您安排一名翻译来说明每个步骤吗？', correct:true, feedback:'正确，主动提出安排翻译人员，确保旅客理解每一步检查流程，也是规范的涉外服务要求。', next:'n3' },
      { en:'Don\'t worry, just do whatever I gesture.', cn:'别担心，我做什么手势你照做就行。', correct:false, feedback:'仅靠手势沟通容易造成误解，涉外检查应主动提供语言协助确保沟通顺畅。', next:'n2' }
    ]},
    n3:{ narration:'检查中涉及触碰其宗教头巾区域，需要特别处理。', choices:[
      { en:'I will ask a colleague to witness this step, following special procedure for religious garments.', cn:'我会请一位同事见证这一步骤，按照宗教服饰的特殊流程处理。', correct:true, feedback:'正确，涉及宗教服饰的检查需要额外的见证人员和特殊流程，体现规范与尊重并重。', next:'n4' },
      { en:'I\'ll just quickly check it myself, no need to explain.', cn:'我自己快速检查一下就行，不用多解释。', correct:false, feedback:'涉及宗教敏感区域的检查必须遵循特殊流程并有见证人员在场，不能简化处理。', next:'n3' }
    ]},
    n4:{ narration:'检查顺利完成，旅客的情绪已经平复。', choices:[
      { en:'Thank you for your patience and cooperation, have a safe flight.', cn:'感谢您的耐心配合，祝您旅途平安。', correct:true, feedback:'正确，检查结束后礼貌致谢是良好服务闭环的重要一步，也有助于旅客对流程留下正面印象。', next:'end' },
      { en:'OK, next!', cn:'好了，下一个！', correct:false, feedback:'检查结束时应礼貌致谢而非草草打发，专业的收尾同样是服务质量的一部分。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过隐私保护、语言协助与特殊流程，专业且有温度地完成了这次涉外人身检查。'
},
{
  id:'sc_vip_01', title:'VIP外交旅客服务', titleEn:'VIP & Diplomatic Passenger', scene:'cabin', icon:'globe',
  brief:'一支外国政府代表团登机，其中一名成员随身携带一个标注为外交邮袋的公文包，要求不接受安检开包检查。',
  start:'n1',
  nodes:{
    n1:{ narration:'该旅客坚持公文包属于外交邮袋，拒绝开包检查。你该如何应对？', choices:[
      { en:'I understand, sir. A diplomatic pouch is exempt from inspection under protocol.', cn:'我理解，先生。根据规定，外交邮袋可免于开包检查。', correct:true, feedback:'正确，外交邮袋依据国际惯例享有不可开拆的豁免权，应予以认可并按规定核实其外交身份标识即可，无需强制开包。', next:'n2' },
      { en:'I don\'t care what it is, everyone must open their bag.', cn:'我不管那是什么，所有人都必须开包。', correct:false, feedback:'外交邮袋受国际协议保护免于检查，一刀切要求开包不符合规范，且可能引发外交层面的问题。', next:'n1' }
    ]},
    n2:{ narration:'代表团的礼宾官员前来协调，希望确认后续流程。', choices:[
      { en:'We will verify the diplomatic status and proceed with priority boarding courteously.', cn:'我们会核实外交身份，并礼貌地安排优先登机。', correct:true, feedback:'正确，核实身份后按礼节安排优先登机，是对VIP和外交旅客服务的标准流程。', next:'n3' },
      { en:'They can just wait in line like everyone else.', cn:'他们和大家一样排队等着就行。', correct:false, feedback:'对已核实身份的外交代表团，应按国际礼节提供适当的优先与礼遇服务。', next:'n2' }
    ]},
    n3:{ narration:'登机后，你注意到代表团其中一件随身物品需要例行的目视检查（不涉及开包）。', choices:[
      { en:'May I do a quick visual check of this item, purely as a routine courtesy?', cn:'我可以对这件物品做一个简单的目视检查吗，只是例行礼节性核实？', correct:true, feedback:'正确，用礼貌措辞说明是常规礼节性核实，既保持安保底线又不失分寸。', next:'n4' },
      { en:'Let me just grab that and look inside real quick.', cn:'我拿过来快速看一眼里面。', correct:false, feedback:'即使是VIP旅客的普通物品，也应先礼貌征得同意再进行任何检查动作，避免失礼或误会。', next:'n3' }
    ]},
    n4:{ narration:'服务过程顺利，代表团对整体安排表示满意。', choices:[
      { en:'Thank you for your cooperation, please let us know if you need anything during the flight.', cn:'感谢您的配合，飞行途中如有需要请随时告知我们。', correct:true, feedback:'正确，服务收尾时表达持续服务意愿，体现专业与礼遇兼具的服务水准。', next:'end' },
      { en:'Alright, that\'s it, enjoy your flight I guess.', cn:'好了就这样，祝你们飞行愉快吧。', correct:false, feedback:'对VIP和外交旅客的服务收尾应更正式、更专业，而非随意的口吻。', next:'n4' }
    ]}
  },
  endText:'处置完毕：在坚守安保规范的同时，以专业礼节完成了对外交代表团的服务保障。'
},
{
  id:'sc_report_01', title:'涉恐特情上报', titleEn:'Terrorism-related Reporting', scene:'cabin', icon:'alert',
  brief:'巡查中你注意到一名旅客的姓名与登机前收到的一份情报通报中提示关注的姓名高度相似，且其行为略显紧张、频繁查看舱门方向。',
  start:'n1',
  nodes:{
    n1:{ narration:'你需要先确认这一情况是否属实，同时不能打草惊蛇。', choices:[
      { en:'I will discreetly verify his identity against the passenger manifest first.', cn:'我会先不动声色地核对航班舱单确认他的身份信息。', correct:true, feedback:'正确，第一步应低调核实信息而非直接对峙，避免打草惊蛇或造成误判引发不必要的冲突。', next:'n2' },
      { en:'I will go confront him directly and ask if he is a terrorist.', cn:'我直接去质问他是不是恐怖分子。', correct:false, feedback:'在未核实前直接对峙极其危险且可能造成误判、引发恐慌或打草惊蛇，应先低调核实。', next:'n1' }
    ]},
    n2:{ narration:'核实后确认信息高度吻合，你需要上报但不能引起周围旅客注意。', choices:[
      { en:'Break break, cockpit, possible watchlist match in seat 14C, requesting discreet guidance, over.', cn:'紧急插播，驾驶舱，14C座位旅客疑似与监控名单匹配，请求低调指示，完毕。', correct:true, feedback:'正确，使用紧急插播的标准通话格式简明上报，并明确要求"低调"处理方式，避免打草惊蛇。', next:'n3' },
      { en:'I will announce it over the cabin PA to warn everyone.', cn:'我要在客舱广播里警告所有人。', correct:false, feedback:'绝不能通过客舱广播公开此类未证实的信息，这会引发严重恐慌甚至打草惊蛇导致风险升级。', next:'n2' }
    ]},
    n3:{ narration:'机长指示持续观察并保持正常客舱氛围，等待地面进一步指令。', choices:[
      { en:'I will maintain normal cabin service while quietly monitoring the passenger.', cn:'我会保持正常客舱服务的同时低调观察该旅客。', correct:true, feedback:'正确，在等待进一步指令期间应维持客舱正常氛围，避免引起旅客怀疑，同时持续行为监控。', next:'n4' },
      { en:'I will stand right next to him and stare at him the whole flight.', cn:'我整段航程都站在他旁边死死盯着他。', correct:false, feedback:'过于明显的监视会让对方察觉并可能引发不可预测的反应，应保持低调自然的观察方式。', next:'n3' }
    ]},
    n4:{ narration:'飞机安全落地，地面安保力量已按计划部署。', choices:[
      { en:'We will hand over the full observation report to ground security upon arrival.', cn:'落地后我们会向地面安保部门移交完整的观察记录。', correct:true, feedback:'正确，落地后应完整移交观察记录供地面安保部门进一步核实处理，形成完整的处置闭环。', next:'end' },
      { en:'Since nothing happened, there is no need to report anything.', cn:'既然什么都没发生，就不用报告了。', correct:false, feedback:'无论最终是否属实，涉及监控名单匹配的观察记录都必须完整移交地面部门，这是规范要求。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过低调核实、规范上报与持续观察，在不引发恐慌的前提下稳妥完成了这起涉恐特情的处置闭环。'
},
{
  id:'sc_complaint_01', title:'投诉与服务补救', titleEn:'Complaint & Service Recovery', scene:'cabin', icon:'heart',
  brief:'一名旅客因为此前的安检环节等待时间过长而心情不佳，登机后又发现餐食选择已售罄，情绪激动地要求投诉。',
  start:'n1',
  nodes:{
    n1:{ narration:'旅客情绪激动地表达不满，你首先应该怎么做？', choices:[
      { en:'I am sorry for the inconvenience. I understand your frustration completely.', cn:'对给您带来的不便我很抱歉，我完全理解您的沮丧。', correct:true, feedback:'正确，服务补救的第一步永远是真诚道歉与共情，先接住对方的情绪，再着手解决问题。', next:'n2' },
      { en:'That\'s not really our department\'s fault though.', cn:'不过这真的不是我们部门的问题。', correct:false, feedback:'在服务补救的开场阶段推卸责任只会激化矛盾，应先真诚致歉再解释情况。', next:'n1' }
    ]},
    n2:{ narration:'旅客追问具体能为他做些什么弥补。', choices:[
      { en:'Let me see what alternative meal options I can offer you right away.', cn:'我马上为您看看能提供哪些替代餐食选项。', correct:true, feedback:'正确，在道歉之后应立即提供具体可行的解决方案，展现解决问题的诚意和效率。', next:'n3' },
      { en:'There\'s nothing I can really do about the food now.', cn:'关于餐食现在真的没什么我能做的了。', correct:false, feedback:'即使选择有限，也应积极寻找可行的替代方案，而不是直接表示无能为力。', next:'n2' }
    ]},
    n3:{ narration:'旅客对餐食问题不再纠结，但仍坚持要提交正式投诉。', choices:[
      { en:'Of course, I will help you file a formal complaint and note all the details.', cn:'当然可以，我会协助您提交正式投诉并记录所有细节。', correct:true, feedback:'正确，旅客坚持投诉是其正当权利，应积极协助而非阻拦，专业地记录细节体现服务态度。', next:'n4' },
      { en:'Are you sure you really want to make a big deal out of this?', cn:'你确定真的要把这件事闹大吗？', correct:false, feedback:'不应质疑或劝阻旅客投诉的意愿，这会给人推诿和不专业的印象。', next:'n3' }
    ]},
    n4:{ narration:'投诉记录完成，旅客情绪明显缓和。', choices:[
      { en:'Thank you for your feedback, it genuinely helps us improve our service.', cn:'感谢您的反馈，这确实能帮助我们改进服务。', correct:true, feedback:'正确，以真诚感谢收尾，既是良好的服务补救闭环，也传递出重视旅客意见的态度。', next:'end' },
      { en:'OK whatever, hope you feel better now.', cn:'好吧随便，希望你现在感觉好点了。', correct:false, feedback:'收尾时的敷衍语气会抵消之前所有补救努力，应保持真诚专业的态度直到最后。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过"共情道歉—解决方案—协助投诉—真诚致谢"的服务补救闭环，成功化解了旅客的不满情绪。'
},
{
  id:'sc_cockpit_01', title:'驾驶舱门安全巡查', titleEn:'Cockpit Door Security Check', scene:'cockpit', icon:'shield',
  brief:'一次机组人员如厕需要短暂开启驾驶舱门，你作为安全员需要按标准流程协助保障这一过程的安全。',
  start:'n1',
  nodes:{
    n1:{ narration:'机组人员通知需要开门如厕，你首先要确认什么？', choices:[
      { en:'I will confirm the surrounding area is clear before the door opens.', cn:'我会在开门前确认周围区域没有异常情况。', correct:true, feedback:'正确，开门前的首要任务是确认舱门周边区域安全，排除任何潜在威胁靠近的可能。', next:'n2' },
      { en:'I will just let them know it\'s fine, go ahead and open it.', cn:'我直接告诉他们没事，开门吧。', correct:false, feedback:'不能仅凭主观判断草率确认，必须实际检查周边区域确保安全后才能允许开门。', next:'n1' }
    ]},
    n2:{ narration:'确认安全后，舱门即将开启，此时必须遵循的原则是什么？', choices:[
      { en:'The two-person rule applies — I will stay as the second person in the cockpit.', cn:'必须遵循双人原则——我会作为第二人留在驾驶舱内。', correct:true, feedback:'正确，驾驶舱门开启期间必须始终保持双人原则，安全员或另一名机组成员需在驾驶舱内陪同，防止舱内出现单人失能等风险。', next:'n3' },
      { en:'I will just stand outside and keep an eye on the hallway.', cn:'我就站在外面看着走廊。', correct:false, feedback:'双人原则要求驾驶舱内始终有两人在场，仅在外部观察走廊不满足这一安全要求。', next:'n2' }
    ]},
    n3:{ narration:'过程中，一名旅客借故走近想拍照留念，声称想拍驾驶舱的照片。', choices:[
      { en:'I am sorry, photography is restricted in this area for security reasons.', cn:'很抱歉，出于安全考虑，此区域禁止拍照。', correct:true, feedback:'正确，礼貌但坚定地说明拍照限制规定，同时留意该旅客是否存在其他异常动机。', next:'n4' },
      { en:'Sure, just take it quickly before someone notices.', cn:'行啊，趁没人注意赶紧拍一张。', correct:false, feedback:'驾驶舱区域绝对不允许拍照，任何情况下都必须坚持这一安全规定，不能通融。', next:'n3' }
    ]},
    n4:{ narration:'机组人员返回，舱门重新关闭锁定，本次流程结束。', choices:[
      { en:'Cockpit door is now secured and locked, resuming normal cabin duties.', cn:'驾驶舱门已锁闭确认安全，恢复正常客舱执勤。', correct:true, feedback:'正确，流程结束时应确认舱门已锁闭，并简明记录/通报状态，形成完整闭环。', next:'end' },
      { en:'OK that\'s done, moving on.', cn:'好了搞定，接着干别的。', correct:false, feedback:'应明确确认舱门锁闭状态并做简要通报，而非含糊带过，这是安全规范的必要一环。', next:'n4' }
    ]}
  },
  endText:'处置完毕：通过区域确认、双人原则、拍照制止与闭环确认，规范完成了一次驾驶舱门安全巡查。'
}
];
