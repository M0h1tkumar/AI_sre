from app.api.schemas import Alert, AgentResponse
from app.memory.client import memory_client
from app.agent.prompts import SYSTEM_PROMPT, build_task_prompt
from app.agent.llm import llm_client
from app.agent.ranking import rerank
from app.tools.search_logs import search_logs
from app.tools.deploy_history import get_deploy_history

def handle_alert(alert: Alert, memory_enabled: bool = True) -> AgentResponse:
    # 1. Recall memory
    recalled = memory_client.recall_similar(alert) if memory_enabled else []
    
    # 2. Tool Outputs
    tool_outputs = ""
    tool_outputs += f"Logs: {search_logs(alert.service, alert.summary)}\n"
    tool_outputs += f"Deploy History: {get_deploy_history(alert.service)}\n"
    
    # 3. Build context
    alert_summary = f"Service: {alert.service} | Severity: {alert.severity} | Issue: {alert.summary}"
    if alert.raw_log_snippet:
        alert_summary += f"\nLogs:\n{alert.raw_log_snippet}"
        
    user_prompt = build_task_prompt(alert_summary, recalled, tool_outputs)
    
    # 4. LLM call
    response = llm_client.chat(SYSTEM_PROMPT, user_prompt)
    
    # Ensure ID matches and states
    response.alert_id = alert.id
    response.memory_enabled = memory_enabled
    response.recalled = recalled
    
    # 5. Rerank fixes
    response.fixes = rerank(response.fixes, recalled)
    
    return response
