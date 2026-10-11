
from dotenv import load_dotenv
load_dotenv()

import boto3
from app.config import settings


_dynamodb = None


def get_dynamodb():
    """Return a reusable DynamoDB resource."""
    global _dynamodb

    if not settings.use_dynamodb:
        return None

    if _dynamodb is None:
        _dynamodb = boto3.resource(
            "dynamodb",
            region_name=settings.aws_region,
        )

    return _dynamodb


def get_telemetry_table():
    """Return the telemetry table, ensuring it exists in DynamoDB."""
    dynamodb = get_dynamodb()

    if dynamodb is None:
        return None

    table = dynamodb.Table(settings.dynamodb_telemetry_table)
    try:
        table.load()
    except Exception:
        try:
            table = dynamodb.create_table(
                TableName=settings.dynamodb_telemetry_table,
                KeySchema=[
                    {"AttributeName": "node_id", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"},
                ],
                AttributeDefinitions=[
                    {"AttributeName": "node_id", "AttributeType": "S"},
                    {"AttributeName": "timestamp", "AttributeType": "S"},
                ],
                BillingMode="PAY_PER_REQUEST",
            )
            table.wait_until_exists()
        except Exception:
            pass

    return table

def get_recent_telemetry(node_id: str, limit: int = 500):
    """Retrieve the most recent telemetry records for a node."""
    table = get_telemetry_table()

    if table is None:
        return []

    response = table.query(
        KeyConditionExpression="node_id = :node",
        ExpressionAttributeValues={
            ":node": node_id,
        },
        ScanIndexForward=False,
        Limit=limit,
    )

    return response.get("Items", [])
