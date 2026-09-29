def get_deploy_history(service: str, hours: int = 24) -> str:
    # Simulated deploy history
    return f"Deployment for {service}: v1.4.2 deployed {hours - 1} hours ago. Status: Success."
