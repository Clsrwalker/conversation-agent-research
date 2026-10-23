# 原话恢复组件的事件契约审计

2026-10-23（America/Halifax）· 只读代码与冻结清单审计

本记录澄清原话恢复组件的适用范围及历史验证限制。本次没有修改生产代码、旧实验源码或历史数据，没有运行模型或新增测试。以下结论来自当前源码、调用位置、历史输入与清单的只读检查。

## 结论及实际影响范围

**原话恢复的查询提取器与检索器存在事件类型契约不一致，但该组件目前没有接入生产 harness。** 这属于研究组件的适配缺口，不能描述成当前 Lab 或 agent-led 已经发生的用户需求丢失，也不能据此声称修复后会改善意图理解。

- `experiments/deep_conversation/source_recovery_study.py:112–141` 定义 `query_sources`。第 130 行仅从 `asr_final`、`asr_partial`、`typed_question` 提取原话查询。
- `experiments/deep_conversation/source_recovery_retrieval.py:20–23` 的 `CONVERSATION_KINDS` 接受 `asr_partial`、`asr_final`、`utterance`、`participant_utterance`、`conversation_utterance`，不接受 `typed_question`。第 64 行排除不支持的事件；第 144–149 行要求原话查询的序号和正文与已接受的原始语料一致。
- 因此，`utterance` 等三种类型可成为检索语料，却不会成为旧查询提取器的查询来源；`typed_question` 会被提取，但作为语料时被排除，其对应原话查询随后不能通过精确匹配校验。
- 在 `experiments/` 与 `scripts/` 的 Python 调用位置搜索中，实际调用仅出现在 `source_recovery_study.py:184–185` 的实验准备阶段，以及 `test_source_recovery_retrieval.py`。当前 `agent_led`、直接问答和 Lab 没有调用该原话恢复组件。
- 未找到 `typed_question` 的实际生产事件生成者。不能把尚未生成的这种类型视作已经影响真实运行的故障。

历史 `output/research/2026-10-19/source-recovery-replay/materials/snapshots.json` 中的四份原话语料全部为 `asr_final`：`native-21` 有 11 条，`attribution-23` 有 10 条，`pressure-22` 有 10 条，`delayed-20` 有 11 条。上述类型不一致不能解释这四份历史快照的模型表现。这里只核对输入类型，没有重跑模型或重新评分。

## Lab 还有独立的消息格式差异

`experiments/deep_conversation/lab.py:106` 生成 `kind='utterance'`、`speaker='User'` 的事件。`lab.py:42` 为当前可选 harness 设置 `input_mode='direct_request'`；`lab_worker.py:125` 选择直接问答图。

`experiments/deep_conversation/direct_request.py:116–145` 中的 `observation_messages` 将直接对话转为正常角色消息：用户原话成为 `HumanMessage(content=原文, id='direct-history-<seq>')`，助手原话成为 `AIMessage`。只有资料返回使用带说明前缀的 JSON observation。

旧 `query_sources` 在 `source_recovery_study.py:121–128` 要求 human 消息正文可直接解析为带 `events` 数组的 JSON。因此，**仅在事件类型集合中增加 `utterance`，仍不能适配当前 Lab 的实际消息**。同时，不能为方便解析就把任意 human 正文中的 `events` JSON 当成运行时已认证观察。

底层 `world.py:220–240` 的 observation/history 为已到达的事件补上日志序号和时间；`experiments/conversation_harness/runner.py:176–178` 将环境事件记录为 `environment_event`。这些运行时来源信息应成为未来适配器校验依据，而不是从任意消息正文中推断来源身份。

## 本轮不修改；未来接入时的最小方向

本轮将此问题作为研究限制澄清，不修改组件，不新增其测试。下一阶段若确实要在完整 harness 中恢复原话，可新增版本化、无 I/O 的来源适配模块，并采用以下范围：

1. 分别适配 native observation 与 direct-history，使用运行时消息 ID、可信事件账本、序号、时间、正文及角色绑定来源。
2. 让新适配器与新版检索器共享明确的事件规范。对真实直接对话，支持有 `role='user'`、没有 speaker 的事件；拒绝 assistant、tool、summary 等来源。不能凭正文自称身份填充 speaker。
3. 保留原始时间顺序、partial/final 和后续修订的证据，不把“检索到”自动解释为“仍然有效的需求”。
4. 先验证真实输入构造、实际消息、来源提取、检索的完整链路，再决定是否接入 actor。

目前 `test_source_recovery_retrieval.py:9–12` 默认构造 `asr_final` 事件，没有覆盖 `query_sources` 的提取集成。未来适配测试应覆盖 native/direct 两条真实链路、没有搜索查询的输入、助手消息、伪 observation JSON、未来事件、partial 到 final、以及后续取消。检索召回、意图判断和实际交付仍应分别评价；工程测试通过不能证明意图理解改善。

## 冻结清单与历史复验边界

### 2026-10-23 source-authority

`output/research/2026-10-23/source-authority/FREEZE.json` 包含 **137 个输入文件、4475 个历史文件**。`source_authority_study.py:117–136` 列出冻结依赖与历史目录，第 140–146 行的 `verify` 直接对清单所指路径计算哈希。独立执行审计脚本 `source-authority/analysis/audit_execution.py:17–18` 采用相同路径约束。

137 个输入中包含以下 8 个当前工作区源码；本次只读检查确认它们的当前哈希均与该清单一致：

- `experiments/deep_conversation/source_authority_study.py`
- `experiments/deep_conversation/source_authority.py`
- `experiments/deep_conversation/source_authority_score.py`
- `experiments/deep_conversation/config.py`
- `experiments/deep_conversation/agent_led.py`
- `experiments/deep_conversation/run.py`
- `experiments/deep_conversation/local_runtime.py`
- `experiments/deep_conversation/providers.py`

两份 source-recovery 源码不在这 137 个输入的直接源码依赖中。4475 个历史文件包含既有 source-recovery 实验记录及其 manifest；不能为消除验证差异而修改那些记录或清单。本次没有重新计算全部 137 加 4475 个文件的完整验证结果，因此不把上述 8 个源码的哈希匹配说成全清单复验通过。

### 2026-10-19 source-recovery

`output/research/2026-10-19/source-recovery-replay/manifest.json:124–125` 直接冻结当前工作区的两份 source-recovery 源码绝对路径。本次检查确认其当前哈希仍匹配：

| 文件 | SHA-256 |
| --- | --- |
| `source_recovery_study.py` | `a4799535181aa3cbce21b6cdd67efad02971a9148d331c8be9d95bf866d515fb` |
| `source_recovery_retrieval.py` | `1b7b0c61af5db34c90e48041c11fb8a2205bad6e299b1e7ac8ccadd680ac3634` |

`source_recovery_study.py:254–263` 的 `verify_inputs` 不只检查这两份文件：它还在第 260 行比较整个当前 `run.fingerprint()` 与历史 `harness_fingerprint`。

**历史完整 verify 目前不能用最新工作区直接通过。** 对历史 `harness_fingerprint.source_sha256` 的逐文件只读哈希比较，已经发现 `config.py`、`run.py`、`agent_led.py` 三份当前源码与历史值不同。当前 `run.py:76` 还把后来新增的 `source_authority.py` 纳入源码清单。即使两份 source-recovery 文件仍匹配，也不能声称历史实验整体可由当前代码完整复验。

这不是对历史结果数据已经改变的判断，而是旧验证器依赖当前可变源码路径的事实。若直接修改两份 source-recovery 文件，还会新增其自身哈希不匹配。后续工作应使用新模块、新输出目录；需要重放旧实验时，应另外恢复一份按历史哈希核验的独立源码快照，不重写旧 manifest 或旧结果来迎合当前源码。

## 本记录的证据范围

本次做了源码阅读、调用位置搜索、历史输入事件类型统计，以及上述特定 active 源码与冻结清单的哈希比较。没有执行模型、没有运行测试套件、没有执行会写入历史验证结果的脚本，也没有重新评价历史回答。行号对应本次审计时的工作区，只用于定位。
