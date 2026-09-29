import json
import os
import random
from datetime import datetime, timedelta

def generate_incidents():
    incidents = []
    base_time = datetime.now() - timedelta(days=90)
    
    # 1. Redis Eviction
    for i in range(3):
        incidents.append({
            "id": f"INC-{2041 + i}",
            "service": "checkout-api",
            "severity": "SEV1",
            "summary": "p99 latency > 4s, Redis evicted_keys spiking, 500 errors",
            "timestamp": (base_time + timedelta(days=random.randint(1, 20))).isoformat(),
            "root_cause": "Redis maxmemory too low after traffic growth",
            "fix_steps": ["Raised maxmemory 2GB->4GB", "Set allkeys-lru"],
            "outcome": "worked",
            "minutes_to_resolve": 14
        })

    # 2. DB Pool Exhaustion
    for i in range(3):
        incidents.append({
            "id": f"INC-{1987 + i}",
            "service": "user-service",
            "severity": "SEV2",
            "summary": "DB connection timeouts, max_connections reached",
            "timestamp": (base_time + timedelta(days=random.randint(20, 40))).isoformat(),
            "root_cause": "Connection pool leak in the auth middleware",
            "fix_steps": ["Restarted user-service pods", "Patched middleware to close idle connections"],
            "outcome": "worked" if i < 2 else "partial",
            "minutes_to_resolve": 25
        })
        
    # 3. Bad Deploy
    for i in range(2):
        incidents.append({
            "id": f"INC-{1720 + i}",
            "service": "payment-gateway",
            "severity": "SEV1",
            "summary": "High error rate on /charge endpoint immediately after deploy",
            "timestamp": (base_time + timedelta(days=random.randint(40, 60))).isoformat(),
            "root_cause": "Missing environment variable in the new helm chart",
            "fix_steps": ["Rollback to previous helm release"],
            "outcome": "worked",
            "minutes_to_resolve": 8
        })

    # 4. Disk Full
    for i in range(3):
        incidents.append({
            "id": f"INC-{1500 + i}",
            "service": "log-aggregator",
            "severity": "SEV3",
            "summary": "No space left on device for /var/log",
            "timestamp": (base_time + timedelta(days=random.randint(60, 75))).isoformat(),
            "root_cause": "Log rotation cron job failed to run",
            "fix_steps": ["Manually deleted old logs", "Fixed cron permissions"],
            "outcome": "worked",
            "minutes_to_resolve": 45
        })

    # 5. DNS Failure
    for i in range(2):
        incidents.append({
            "id": f"INC-{1400 + i}",
            "service": "api-gateway",
            "severity": "SEV1",
            "summary": "Unable to resolve internal service hostnames",
            "timestamp": (base_time + timedelta(days=random.randint(75, 80))).isoformat(),
            "root_cause": "CoreDNS pods crashing due to OOM",
            "fix_steps": ["Increased memory limits for CoreDNS deployment"],
            "outcome": "worked",
            "minutes_to_resolve": 18
        })
        
    # 6. Cert Expiry
    incidents.append({
        "id": "INC-1300",
        "service": "ingress-nginx",
        "severity": "SEV1",
        "summary": "SSL certificate expired, browsers rejecting connections",
        "timestamp": (base_time + timedelta(days=random.randint(80, 85))).isoformat(),
        "root_cause": "cert-manager failed to auto-renew due to rate limits",
        "fix_steps": ["Manually triggered cert renewal", "Updated rate limit config"],
        "outcome": "worked",
        "minutes_to_resolve": 30
    })

    # 7. Memory Leak
    for i in range(2):
        incidents.append({
            "id": f"INC-{1200 + i}",
            "service": "inventory-worker",
            "severity": "SEV2",
            "summary": "Worker pods OOMKilled every 4 hours",
            "timestamp": (base_time + timedelta(days=random.randint(85, 88))).isoformat(),
            "root_cause": "Unbounded array growth in background job",
            "fix_steps": ["Restarted pods (temporary)", "Deployed hotfix with bounded array"],
            "outcome": "worked",
            "minutes_to_resolve": 60
        })

    # 8. Rate Limit Misconfig
    incidents.append({
        "id": "INC-1100",
        "service": "public-api",
        "severity": "SEV2",
        "summary": "Legitimate customers getting 429 Too Many Requests",
        "timestamp": (base_time + timedelta(days=random.randint(88, 90))).isoformat(),
        "root_cause": "Rate limit threshold set to 10/min instead of 100/min",
        "fix_steps": ["Updated rate limit config map and restarted ingress"],
        "outcome": "worked",
        "minutes_to_resolve": 12
    })

    data_dir = os.path.dirname(__file__)
    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, "incidents.json"), "w") as f:
        json.dump(incidents, f, indent=2)

if __name__ == "__main__":
    generate_incidents()
    print("Generated synthetic incidents.")
