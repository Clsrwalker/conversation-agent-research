window.HARNESS_EXECUTION_VIEW = {
  "src": "assets/harness-execution.svg",
  "nodes": {
    "exec-observe": {
      "title": "Run boundary",
      "description": "Outer observe first verifies paired tool messages. A closed replay window or already exhausted call/token budget sets a stop reason and ends the normal run. The token threshold uses known usage before another request; the final completed request can overshoot it.",
      "sources": [
        {
          "label": "agent_led.py:81–88"
        },
        {
          "label": "world.py:346–399"
        }
      ]
    },
    "exec-events": {
      "title": "Unread arrivals?",
      "description": "Read events since the saved event cursor. These include arrived conversation updates and completed retrieval jobs. Future events and pending document contents are not exposed to the model.",
      "sources": [
        {
          "label": "agent_led.py:89–90"
        },
        {
          "label": "world.py:190–205"
        }
      ]
    },
    "exec-recovery": {
      "title": "Recovery eligible?",
      "description": "Only considered when there are no unread arrivals, the last model response has no tool calls, and the latest tool batch did not include wait. With recovery enabled, the world requires a retryable rejected source ID or empty search query that started no job, no pending jobs, later environment arrival or newer successful action, and at most one new feedback record per conversation revision. Saved unacknowledged feedback is redelivered on replay.",
      "sources": [
        {
          "label": "agent_led.py:91–106"
        },
        {
          "label": "world.py:217–276"
        }
      ],
      "status": "optional"
    },
    "exec-advance": {
      "title": "Advance replay clock",
      "description": "If no arrival or eligible recovery is available, advance simulated time to the next scheduled event, retrieval completion or deadline. A deadline ends the run; an arrival becomes the next observation. This is controlled text replay, not a live microphone.",
      "sources": [
        {
          "label": "agent_led.py:107–113"
        },
        {
          "label": "conversation_harness/runner.py:180–204"
        }
      ]
    },
    "exec-observation": {
      "title": "Append observation",
      "description": "Append one HumanMessage containing the delivered observation payload, or the eligible recovery feedback, and persist the event cursor. The outer router then invokes the investigator subgraph.",
      "sources": [
        {
          "label": "agent_led.py:96–123"
        }
      ]
    },
    "exec-boundary": {
      "title": "Before-model boundary",
      "description": "EventBoundary checks the window and budget, verifies that tool calls and results are paired, and—when boundary input is enabled—adds newly delivered events before the next model request. Pending retrieval jobs can coexist with a complete tool batch because the job acknowledgement has already returned.",
      "sources": [
        {
          "label": "agent.py:180–207"
        },
        {
          "label": "agent.py:124–139"
        }
      ]
    },
    "exec-request": {
      "title": "Prepare & call model",
      "description": "Native context preparation runs before the optional progress wrapper adds a temporary factual projection to this request. Accounting durably reserves a model call before dispatch and stores reported usage and wall time on completion or error; missing usage remains flagged. Completed calls advance simulated time and may create new arrivals. Progress does not add a model turn or persist in chat history. Optional model advice and automatic context summaries share the same budget.",
      "sources": [
        {
          "label": "agent.py:150–177"
        },
        {
          "label": "world.py:346–399"
        },
        {
          "label": "investigation_progress.py:162–181"
        },
        {
          "label": "deepagents/graph.py:879–950"
        }
      ]
    },
    "exec-choice": {
      "title": "Model requests tools?",
      "description": "The model may choose any available tool combination or return ordinary prose. A response without tool calls ends this investigator turn and returns to outer observe. The prose is private; it does not automatically publish a help card.",
      "sources": [
        {
          "label": "agent_led.py:57–78,115–123"
        },
        {
          "label": "langchain/agents/factory.py:2016–2019"
        }
      ]
    },
    "exec-tools": {
      "title": "Execute tool batch",
      "description": "The native tool dispatcher executes the requested batch and pairs each tool result. Search/read return a job acknowledgement while evidence arrives later. Card guards return outcomes such as new_observations or conflict to the agent; they do not automatically retry or approve an answer. wait first checks for unread arrivals, otherwise advances the replay clock.",
      "sources": [
        {
          "label": "agent.py:215–238"
        },
        {
          "label": "agent_led_tools.py:137–261"
        },
        {
          "label": "world.py:297–344"
        }
      ]
    },
    "exec-direct": {
      "title": "All tools return direct?",
      "description": "After a completed tool batch, the native graph exits the investigator if all executed tools in the batch are return_direct. wait_for_event is a direct-return tool: a wait-only batch returns to observe. A mixed wait + ordinary-tool batch instead continues through the next before-model boundary.",
      "sources": [
        {
          "label": "agent.py:228–238"
        },
        {
          "label": "langchain/agents/factory.py:2086–2109"
        }
      ]
    },
    "exec-turn-end": {
      "title": "Investigator turn ends",
      "description": "This is a subgraph return, not a run-completion signal. Outer observe may deliver another event, supply narrowly eligible recovery, advance time, or detect the terminal window/budget boundary. No card is created merely because a turn ended.",
      "sources": [
        {
          "label": "agent_led.py:115–125"
        }
      ]
    },
    "exec-run-end": {
      "title": "Run ends",
      "description": "Normal termination records the stop reason and final state. Exceptions are separately recorded as error; a remaining next node after interruption is paused. The runner saves records and summaries. Completion, token use and active-card counts are not assistance-quality scores.",
      "sources": [
        {
          "label": "agent_led.py:81–88,110–123"
        },
        {
          "label": "run.py:190–225"
        }
      ]
    }
  },
  "defaultNode": "exec-observe"
};
