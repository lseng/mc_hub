"""Vercel deployment tracking module for ADW workflows.

Provides functions to check Vercel deployment status and wait for builds to complete.
Requires VERCEL_TOKEN environment variable for API access.
"""

import os
import time
import logging
import subprocess
from typing import Optional, Tuple
from adw_modules.data_types import DeploymentResult

logger = logging.getLogger(__name__)


def get_vercel_token() -> Optional[str]:
    """Get Vercel token from environment."""
    return os.environ.get("VERCEL_TOKEN")


def get_project_info() -> Tuple[Optional[str], Optional[str]]:
    """Get Vercel project ID and org ID from .vercel/project.json."""
    import json

    project_json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        ".vercel",
        "project.json"
    )

    if not os.path.exists(project_json_path):
        return None, None

    try:
        with open(project_json_path, "r") as f:
            data = json.load(f)
        return data.get("projectId"), data.get("orgId")
    except Exception as e:
        logger.error(f"Failed to read .vercel/project.json: {e}")
        return None, None


def get_latest_deployment(project_id: str, branch: Optional[str] = None) -> Optional[dict]:
    """Get the latest deployment for a project using Vercel CLI.

    Args:
        project_id: Vercel project ID
        branch: Optional branch name to filter by

    Returns:
        Deployment info dict or None if not found
    """
    import json

    try:
        # Use vercel CLI to list deployments
        cmd = ["vercel", "list", "--json", "--limit", "5"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            logger.error(f"vercel list failed: {result.stderr}")
            return None

        deployments = json.loads(result.stdout)

        if not deployments:
            return None

        # Filter by branch if specified
        if branch:
            for dep in deployments:
                if dep.get("meta", {}).get("githubCommitRef") == branch:
                    return dep

        # Return the latest deployment
        return deployments[0] if deployments else None

    except subprocess.TimeoutExpired:
        logger.error("vercel list timed out")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse vercel list output: {e}")
        return None
    except Exception as e:
        logger.error(f"Error getting deployment: {e}")
        return None


def get_deployment_status(deployment_url: str) -> Optional[str]:
    """Get deployment status using vercel inspect.

    Args:
        deployment_url: The deployment URL to inspect

    Returns:
        Status string: "building", "ready", "error", "canceled", or None
    """
    import json

    try:
        cmd = ["vercel", "inspect", deployment_url, "--json"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            logger.warning(f"vercel inspect failed: {result.stderr}")
            return None

        data = json.loads(result.stdout)
        return data.get("readyState") or data.get("state")

    except subprocess.TimeoutExpired:
        logger.error("vercel inspect timed out")
        return None
    except json.JSONDecodeError:
        # Sometimes inspect returns non-JSON, try to parse status from text
        if "READY" in result.stdout:
            return "ready"
        elif "ERROR" in result.stdout:
            return "error"
        elif "BUILDING" in result.stdout:
            return "building"
        return None
    except Exception as e:
        logger.error(f"Error inspecting deployment: {e}")
        return None


def wait_for_deployment(
    deployment_url: str,
    timeout_seconds: int = 300,
    poll_interval: int = 10
) -> DeploymentResult:
    """Wait for a Vercel deployment to complete.

    Args:
        deployment_url: The deployment URL to monitor
        timeout_seconds: Maximum time to wait (default 5 minutes)
        poll_interval: Time between status checks (default 10 seconds)

    Returns:
        DeploymentResult with final status
    """
    start_time = time.time()
    last_status = None

    logger.info(f"⏳ Waiting for deployment: {deployment_url}")

    while time.time() - start_time < timeout_seconds:
        status = get_deployment_status(deployment_url)

        if status != last_status:
            logger.info(f"📦 Deployment status: {status}")
            last_status = status

        if status == "ready":
            logger.info(f"✅ Deployment ready: {deployment_url}")
            return DeploymentResult(
                success=True,
                deployment_url=deployment_url,
                deployment_status="ready"
            )
        elif status == "error":
            logger.error(f"❌ Deployment failed: {deployment_url}")
            return DeploymentResult(
                success=False,
                deployment_url=deployment_url,
                deployment_status="error",
                error_message="Deployment failed"
            )
        elif status == "canceled":
            logger.warning(f"⚠️ Deployment canceled: {deployment_url}")
            return DeploymentResult(
                success=False,
                deployment_url=deployment_url,
                deployment_status="canceled",
                error_message="Deployment was canceled"
            )

        time.sleep(poll_interval)

    # Timeout
    logger.error(f"⏰ Deployment timed out after {timeout_seconds}s")
    return DeploymentResult(
        success=False,
        deployment_url=deployment_url,
        deployment_status="pending",
        error_message=f"Deployment timed out after {timeout_seconds} seconds"
    )


def check_deployment_for_branch(branch: str, timeout_seconds: int = 300) -> DeploymentResult:
    """Check deployment status for a specific branch.

    This is the main entry point for ADW workflows to check if a
    Vercel deployment succeeded for their branch.

    Args:
        branch: Git branch name to check deployment for
        timeout_seconds: Maximum time to wait for deployment

    Returns:
        DeploymentResult with deployment status
    """
    project_id, _ = get_project_info()

    if not project_id:
        return DeploymentResult(
            success=False,
            deployment_status="error",
            error_message="Vercel project not configured (.vercel/project.json missing)"
        )

    # Get the latest deployment for this branch
    deployment = get_latest_deployment(project_id, branch)

    if not deployment:
        logger.info(f"No deployment found for branch {branch}, checking latest...")
        deployment = get_latest_deployment(project_id)

    if not deployment:
        return DeploymentResult(
            success=False,
            deployment_status="error",
            error_message="No deployments found for this project"
        )

    deployment_url = deployment.get("url")
    if not deployment_url:
        deployment_url = deployment.get("inspectorUrl") or deployment.get("alias", [None])[0]

    if not deployment_url:
        return DeploymentResult(
            success=False,
            deployment_status="error",
            error_message="Could not determine deployment URL"
        )

    # Ensure URL has protocol
    if not deployment_url.startswith("http"):
        deployment_url = f"https://{deployment_url}"

    # Wait for deployment to complete
    result = wait_for_deployment(deployment_url, timeout_seconds)
    result.deployment_id = deployment.get("uid")
    result.branch = branch
    result.commit_sha = deployment.get("meta", {}).get("githubCommitSha")

    return result


def trigger_deployment() -> DeploymentResult:
    """Trigger a new Vercel deployment using the CLI.

    Returns:
        DeploymentResult with deployment info
    """
    import json

    try:
        logger.info("🚀 Triggering Vercel deployment...")

        # Get project root
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )

        cmd = ["vercel", "--prod", "--json"]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
            cwd=project_root
        )

        if result.returncode != 0:
            logger.error(f"vercel deploy failed: {result.stderr}")
            return DeploymentResult(
                success=False,
                deployment_status="error",
                error_message=result.stderr
            )

        # Parse deployment info from output
        try:
            data = json.loads(result.stdout)
            deployment_url = data.get("url")
            if deployment_url and not deployment_url.startswith("http"):
                deployment_url = f"https://{deployment_url}"

            return DeploymentResult(
                success=True,
                deployment_id=data.get("id"),
                deployment_url=deployment_url,
                deployment_status="ready"
            )
        except json.JSONDecodeError:
            # Non-JSON output, try to extract URL
            lines = result.stdout.strip().split("\n")
            for line in lines:
                if "vercel.app" in line or "https://" in line:
                    url = line.strip()
                    if not url.startswith("http"):
                        url = f"https://{url}"
                    return DeploymentResult(
                        success=True,
                        deployment_url=url,
                        deployment_status="ready"
                    )

            return DeploymentResult(
                success=True,
                deployment_status="ready",
                error_message="Deployment succeeded but could not parse URL"
            )

    except subprocess.TimeoutExpired:
        return DeploymentResult(
            success=False,
            deployment_status="error",
            error_message="Deployment timed out"
        )
    except Exception as e:
        return DeploymentResult(
            success=False,
            deployment_status="error",
            error_message=str(e)
        )
