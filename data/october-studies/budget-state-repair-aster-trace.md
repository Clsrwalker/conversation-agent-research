# Aster：人数改变后的答案状态

记录日期：2026-10-17。这里只检查 Aster 的八条已完成原始 trace：同一模型、同一 repeat 的 `agent-led-budget-state` 与旧 `agent-led-answer-delivery`。没有读取 blind review，没有计算或判断 primary success，也没有重跑模型或更新网站。

**机制已实现，对照已完成，但这组记录不能支持“丢答案和修订失败已彻底修好”。** 局部编辑确实有保留另一项答案的实例；也有模型显式选中全文后删掉投影答案的反例。另一条运行已经理解人数变化，却因编辑参数错误、后续 review 份额耗尽和 actor 没有直接修卡，最终仍显示 26 人的旧建议。

## 记录位置和读法

下表链接到各 run 的 `environment_log.json`。后文的 `seq` 是该文件中的事件序号，不是文件行号；`ms` 全部是模拟时间，不能当作实际等待时间。`call` 是同目录 `model_calls.json` 的 ordinal；`line` 指同目录 `model-responses.jsonl` 的物理行号。

| 模型 / repeat | 旧交付 | 修复版 |
| --- | --- | --- |
| Qwen2.5 14B / r1 | [run 38](runs/models/qwen25-14b/agent-led-answer-delivery__meeting-aster-workshop__r1/environment_log.json) | [run 40](runs/models/qwen25-14b/agent-led-budget-state__meeting-aster-workshop__r1/environment_log.json) |
| Qwen2.5 14B / r2 | [run 47](runs/models/qwen25-14b/agent-led-answer-delivery__meeting-aster-workshop__r2/environment_log.json) | [run 45](runs/models/qwen25-14b/agent-led-budget-state__meeting-aster-workshop__r2/environment_log.json) |
| Qwen3.5 9B / r1 | [run 41](runs/models/qwen35-9b/agent-led-answer-delivery__meeting-aster-workshop__r1/environment_log.json) | [run 39](runs/models/qwen35-9b/agent-led-budget-state__meeting-aster-workshop__r1/environment_log.json) |
| Qwen3.5 9B / r2 | [run 44](runs/models/qwen35-9b/agent-led-answer-delivery__meeting-aster-workshop__r2/environment_log.json) | [run 46](runs/models/qwen35-9b/agent-led-budget-state__meeting-aster-workshop__r2/environment_log.json) |

[fixture.json](runs/models/qwen35-9b/agent-led-budget-state__meeting-aster-workshop__r1/fixture.json) 中，对话在 0 ms 问 26 人能否在 Birch 用桌子开展 workshop，11,000 ms 补问 Studio 的投影设备。57,000 ms 的修订原句是：

> The late registrations are in. It is thirty-eight people now, including the facilitators. Keep the same table workshop; twenty-six was my old count.

82,000 ms 再次明确这是 38 人的 workshop，需要先知道 Studio 能否容纳，再向 centre desk 询问是否有空。96,000 ms 明确还剩场地容量和投影设备两个问题。资料说明 Birch 可容纳 32 人、Studio 48 人；Studio 有固定幕布，但投影仪需要另行预约。容量信息本身不代表房间或设备已经预约成功。

这是一组既有开发场景上的联合修复比较，预算分配与更新接口同时改变；不能用这八条轨迹分别估计两项机制的独立效果。

## 14B / r1：局部替换保留了投影答案，但多花了一次调用

旧版 run 38 在 seq 45 / 3,750 ms 发布：

> Birch can accommodate up to 32 people for a seated workshop with tables, which is sufficient for the 26 people including facilitators. Therefore, Birch is large enough for the Aster workshop setup.

seq 62 / 4,500 ms 撤下此卡，seq 68 / 4,750 ms 又重新创建相同内容。这个撤回发生在人数改变之前，不能算作对 38 人修订的处理。seq 113 / 13,250 ms 把同一卡改成只有设备的答案：

> Studio has a fixed projection screen but does not include a projector. You can reserve an HDMI projector from the centre desk and bring your laptop and an HDMI lead to connect it to the fixed screen.

原本的容量结论消失。run 在 22,250 ms 耗尽 24 次调用；实际模型请求只收到前三轮话语，没有收到 57,000 ms 的人数修订。

修复版 run 40 的 seq 75 / 11,500 ms 已将投影说明加入卡片，并保留末尾 Birch 容量句。seq 134 / 52,750 ms 的卡片为：

> Studio is large enough to accommodate the Aster workshop setup with twenty-six people, including facilitators. However, a projector is not included with the room. You will need to make a separate reservation for an HDMI projector from the centre desk if you decide to use Studio. The room capacity for Birch is up to 32 people for seated workshops with tables.

57,000 ms 的新人数在 seq 138 到达，当时额度暂缓（seq 139）。60,000 ms 恢复额度，call 16 的实际输入包括新人数，输出也已理解 38 人。但它先调用 `publish_card` 重写已有卡，seq 146 / 60,250 ms 返回 `edit_required`、当前卡片和使用 `edit_card` 的提示，未改显示内容。

67,500 ms 的 call 17 随额度恢复继续执行。原始响应 line 34 调用 `edit_card`，只替换第一句：

```text
old: Studio is large enough to accommodate the Aster workshop setup with twenty-six people, including facilitators.
new: Studio is large enough to accommodate the Aster workshop setup with thirty-eight people, including facilitators.
```

seq 154–155 / 67,750 ms 实际提交。后面三句——没有投影仪、需要单独预约、Birch 容量 32 人——逐字保留，两项来源 ID 也保留。这是可定位的局部保留实例；它同时显示接口纠正和预算等待使显示更新延后。最终卡片没有直接写“Birch 无法容纳 38 人”，也没有确认 Studio 的可用性，不能把提交成功等同于完整结论通过评分。

## 14B / r2：整卡编辑仍会删掉另一项已经显示的答案

修复版 run 45 的 `agent-card-1` 在 seq 75 / 11,500 ms 显示：

> Studio is large enough to accommodate the Aster workshop setup with twenty-six people, including facilitators. However, a projector is not included with the room. You will need to confirm the availability of a projector separately from the centre desk.

seq 95 / 22,750 ms 的 reviewer 尝试用 `old: ""` 增加午餐和路线信息，得到 `invalid_passage`，整次编辑未应用。`delivery-96` 错误回执与当前卡片确实进入下一次 actor 请求（call 12 / 33,000 ms），不是只保存在日志里。

但是 call 12 选择把**上述全文**替换成容量答案。原始响应 line 24 与 seq 105–106 / 33,250 ms 的成功回执一致：

> Birch is large enough to accommodate the Aster workshop setup with twenty-six people, including facilitators. The room capacity for Birch is up to 32 people for seated workshops with tables. Ensure that the room setup includes tables for the exercises.

**投影答案从实际卡片中消失了。** 这不是编辑失败后被悄悄丢弃，而是合法、明确的整卡选择覆盖了已答内容。两个来源 ID 仍被保留，因此“来源保留”也不能证明对应答案保留。

seq 136–137 / 52,750 ms，reviewer 又选中容量全文，替换为：

> Theo, since you are checking the equipment needed for Studio, remember that a projector is not included with the room. You will need to confirm the availability of a projector separately from the centre desk. Additionally, ensure that the room setup includes tables for the exercises.

投影说明恢复了，容量结论则消失。投影答案缺失区间为 33,250–52,750 ms，共 19,500 模拟毫秒。

收到 38 人的新输入后，seq 149–150 / 60,250 ms 的 actor 再次整卡替换，才重新合并两项：

> Birch can accommodate up to 32 people for seated workshops with tables, but it may not be sufficient for thirty-eight people including facilitators. Studio is the better option, which can hold up to 48 people. Additionally, remember that a projector is not included with the room, so you will need to confirm the availability of a projector separately from the centre desk.

这里的 “may not be sufficient” 对已知的 32 与 38 人关系仍然含糊。seq 195–196 / 90,250 ms 还有一次语义重复：第一个 patch 将投影句加入容量段，第二个 patch 又保留原投影句，最终 `Additionally, remember ... centre desk.` 连续出现两遍。两个 patch 都能定位且不重叠，机械校验没有阻止重复内容。

对应旧版 run 47 也有覆盖：seq 73 / 11,750 ms 同时写 26 人容量与投影，seq 81 / 13,500 ms 改成设备单项；seq 129 / 45,500 ms 才重新带回容量数字。但它在 seq 142 / 57,500 ms 已显示人数修订并保留投影说明：

> The total number of participants has increased to 38 people, including facilitators. Birch can accommodate up to 32 people with tables, making it unsuitable for the current number of participants. Studio, however, can hold up to 48 people and includes a fixed projection screen. You will need to borrow a projector from the centre desk separately if you decide to use Studio.

因此，这一对不能描述为“旧版会丢，修复版不会丢”。两个版本都曾丢掉另一项结论；旧版这次更早显示了 38 人的合并答案。

## 9B / r1：修复版更新一张卡，旧版留下其他 26 人卡片

修复版 run 39 在 seq 62 / 12,500 ms 的同一卡里保存 26 人容量和投影答案。seq 78 / 22,500 ms 与 seq 125 / 52,750 ms 两次 reviewer 编辑因 `unmatched_passage` 失败；回执分别首次进入 call 11 / 33,000 ms 和 call 16 / 60,000 ms。失败期间卡片保持不变。

call 16 使用直接 `edit_card`，seq 136–137 / 60,250 ms 实际更新为：

> **Birch can hold up to 32 people** for a seated workshop with tables, but your group has grown to **38 people**, which exceeds Birch's capacity.
>
> **Studio holds up to 48 people** and would be the appropriate choice for your group of 38. Studio also has a fixed projection screen (though you'll need to reserve an HDMI projector separately from the centre desk). You can bring your laptop and HDMI lead, but a separate equipment reservation for the projector is required.

这次 `old` 仍是整张旧卡，不是只选容量段；投影答案依靠模型在 `new` 中重新写入而保留，不能将其解释为局部 patch 自动保留的证据。最终只有这一张卡，原来的“26 人、Birch 足够”文字已被替换；没有 `card_withdrawn`。

旧版 run 41 在 seq 129 / 58,250 ms 也已更新主卡，写出：

> With 38 people now (including facilitators), Birch is no longer large enough - it holds up to 32 people for a seated workshop with tables. You would need to use Studio instead, which holds up to 48 people.

其后的完整投影段仍在。这次旧版并没有丢掉主卡中的投影答案。但 seq 73 / 15,000 ms 创建的另一张卡仍写：

> Yes, Birch is large enough for 26 people (capacity of 32).

seq 110 / 45,500 ms 创建的第三张卡仍写：

> Yes, Birch can accommodate 26 people with tables (capacity is 32).

这两张卡都没有更新或撤回，最后和已经改为 38 人的主卡同时留在 active cards 中。旧版更早更新主卡，但未清理旧建议；修复版在本次运行中没有产生这些重复卡。这里记录的是卡片状态，不把卡片数量换算成正确率。

## 9B / r2：模型理解修订，卡片却一直停在 26 人

修复版 run 46 在 seq 62 / 12,500 ms 的卡片先写：

> **Birch can hold up to 32 people** for a seated workshop with tables. Since you counted 26 people including yourselves, Birch would be large enough for your setup.

然后说明 Studio 可容纳 48 人、有幕布但不含投影仪，需要单独预约。seq 78 / 22,500 ms 和 seq 93 / 33,500 ms 因无法匹配旧片段而失败。seq 109 / 45,500 ms 的编辑则是 `old == new`，得到 `unchanged`；这不是一次修复或新的实际显示。

57,000 ms 的 call 15 已实际收到新人数。原始响应 line 30 清楚写出：

> The group size has increased from 26 to **38 people** (including facilitators).
>
> - **Birch holds up to 32 people** - this is now **too small** for 38 people
> - **Studio holds up to 48 people** - this would work for 38 people

但是，call 16 的 reviewer 把 `edits` 输出为包含 JSON 的**字符串**，不是列表（原始响应 line 32）。它写出的意图是替换过时容量句并保留投影信息；seq 129 / 60,250 ms 的实际结果是：

```text
outcome: invalid_edit
code: invalid_edits
reason: Edits must be a list of old/new passage pairs.
```

seq 130 的回执为 `not_published`。全部编辑未应用，当前卡仍是 12,500 ms 的版本。

随后不是完全没有机会或没有反馈：

- `delivery-130` 连同错误、当前卡片和如何修正的提示，首次进入 call 17 / 69,000 ms 的实际请求。actor 的 line 34 输出仍知道 38 人需要更大房间，但没有调用 `edit_card`。
- 下一次 review 先等到 75,000 ms；seq 143–145 记录 `review_share_exhausted`，已使用 6 / 6 次 review。全局并未耗尽：当时只用 17 / 24 次总调用、84,878 tokens。
- call 18 / 82,000 ms 又收到确认 38 人的发言，仍只输出私人文本。seq 157–159 / 82,500 ms 再次因 review 份额耗尽而未发布。
- call 19 / 96,000 ms 收到最后两个问题的总结，line 38 却说 `The current card has all the relevant information ... No further action is needed at this point.`。它的实际请求仍包含旧卡和失败回执。seq 168–170 / 96,250 ms 的交付再次被 review 份额拒绝。

最终 run 以 `window_closed` 结束，共 19 次调用、104,570 tokens，没有新的 card update 或 withdrawal。**38 人判断存在于模型输出中，却没有进入用户卡片；过时的 26 人建议保留到了结束。** 投影答案是保住了，但过时容量答案也被一起保住。固定 review 份额耗尽阻止了后续 review 路径，actor 仍有直接编辑工具却未使用；不能把这条失败只归为模型不懂人数，也不能只归为总预算不足。

对应旧版 run 44 在 seq 128 / 57,500 ms 已将主卡更新为：

> **Updated Headcount:** Nina has updated the count to **38 people** (including facilitators), replacing her original count of 26.
>
> **Birch Capacity:** Birch holds up to 32 people for a seated workshop with tables. With 38 people, **Birch is no longer large enough**. You would need to consider Studio instead.

主卡保留了投影答案，但也保留了一个容易误导的选项：`Or use your laptop without a projector for slides`，随后又说笔记本与幕布本身不能投影。另有四张早先创建的卡仍表示 26 人可以用 Birch，没有被撤回。这里同样不能把主卡更新等同于所有显示内容已一致。

## 预算等待让哪些输入真正进入模型

以下数量来自保存的实际 normal-investigator 请求中的 `asr_final` 事件，按话语去重，不是只统计环境已经收到的事件。`model-responses.jsonl` 元数据也确认这些是普通 actor 调用，而非框架上下文摘要调用。每个 Aster 脚本共九轮。

| 模型 / repeat | 旧交付实际输入 | 修复版实际输入 | 38 人发言首次进入修复版模型 | 最后发言首次进入修复版模型 |
| --- | ---: | ---: | --- | --- |
| 14B / r1 | 3 / 9 | 9 / 9 | call 16，60,000 ms | call 21，97,500 ms |
| 14B / r2 | 6 / 9 | 9 / 9 | call 16，60,000 ms | call 21，97,500 ms |
| 9B / r1 | 6 / 9 | 9 / 9 | call 16，60,000 ms | call 20，112,340 ms |
| 9B / r2 | 7 / 9 | 9 / 9 | call 15，57,000 ms | call 19，96,000 ms |

例如 run 40 的 seq 138–144 表明 57,000 ms 到达的人数发言先等待额度，在 60,000 ms 真正送入模型；seq 146 返回工具反馈后，seq 149–155 又在 67,500 ms 恢复并提交编辑。因此等待不是直接跳到结束，也不是只增加日志中的 observation 次数。

不过，看到九轮输入不代表九轮处理正确，更不代表最终显示正确。run 46 是直接反例。run 39 还在 112,590 ms 以 token 预算耗尽结束，总用量 125,576，超过 120,000 的软上限；预算调度没有消除单次调用造成的超额。

## 新反馈路径与旧 audit 计数

原 [trace-audit.json](analysis/trace-audit.json) 的 `delivery_feedback_issued` / `delivery_feedback_consumed` 等旧计数没有统计新的 `HumanMessage(kind=delivery_recovery, origin=budget_state_receipt)` 路径。Aster 修复 run 的这些旧字段为 0，**不能读成 actor 没有收到反馈**。本记录没有改动原 audit。

新增 [diagnostics/feedback-receipts.json](diagnostics/feedback-receipts.json) 只从 48 条已保存运行的实际请求提取这类 HumanMessage，与同 run 的 `delivery-<seq>` / `answer_delivery_receipt` 匹配。共发现 35 个不同回执进入普通 investigator 请求，35 个均能匹配事件、result payload 与 decision action，没有未匹配项。Aster 的 run 39、40、45、46 分别有 4、3、5、6 个这样的回执首次进入普通 investigator；其中包含成功、unchanged 和失败回执，不全是错误。

该新增文件是反馈可见性的补充记录，不是重新评分或新的完整审计。没有后续请求的回执未被观察到，不自动推断为系统没有生成反馈。是否收到错误提示、是否采取修正行动、是否实际修改卡片，需要分开看；run 46 清楚展示了这三者的区别。

## 本轮可以保留的机制结论

- 局部 patch 能在只选中容量句时保持投影段和引用不变，run 40 有完整工具请求、回执和卡片前后文本。
- 允许模型自由选择片段，也意味着模型可以选中全文。run 45 的成功编辑仍删除已答内容，之后又生成重复句。接口没有建立“另一项问题仍需保留”的语义保证。
- 错误回执进入了实际模型请求，但不保证模型修正。run 46 的参数形式错误没有被恢复；固定 review 份额也阻断了后续 review 交付，最终仍显示旧人数。
- 旧版也能正确处理部分人数修订；9B 旧版的突出问题是旧卡与更新卡同时存在。修复版本组只保留一张卡，但其中一条保留的正是过时答案。
- 没有在这些 trace 中看到 57,000 ms 后的成功整卡撤回。更新覆盖旧句和撤回整卡是两种不同操作，不能把旧句替换说成执行了 cancellation。

这些例子支持继续研究更新范围的语义判断、失败后实际执行修复，以及交付预算如何为晚期修订留出机会。它们不支持宣布本轮已解决全部丢答案或修订失败。

冻结检查：创建补充记录前后运行 `prepare.py --verify`；校验通过，`model_calls=0`、`website_updated=false`。源码、原始输出、评分标准、原 audit 和网站未修改。
