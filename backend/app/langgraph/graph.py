from langgraph.graph import StateGraph
from langgraph.graph import START
from langgraph.prebuilt import ToolNode
from langgraph.prebuilt import tools_condition

from app.langgraph.state import CRMState
from app.langgraph.nodes import assistant
from app.langgraph.nodes import TOOLS

builder = StateGraph(CRMState)

builder.add_node(
    "assistant",
    assistant
)

builder.add_node(
    "tools",
    ToolNode(TOOLS)
)

builder.add_edge(
    START,
    "assistant"
)

builder.add_conditional_edges(
    "assistant",
    tools_condition
)

builder.add_edge(
    "tools",
    "assistant"
)

graph = builder.compile()