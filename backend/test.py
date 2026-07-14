from app.langgraph.agent import invoke_agent

response = invoke_agent(

"""
Today I met Dr John.

Discussed Ozempic.

Doctor liked it.

Follow up next Monday.

"""

)

print(response)