import os
from typing import Dict, Any
from dotenv import load_dotenv
load_dotenv()

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

AWS_REGION = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-east-1"
DYNAMO_TABLE_NAME = os.getenv("DYNAMO_TABLE_NAME", "AtmosAI_UserProfiles")

DYNAMO_ENABLED = False
table = None

if BOTO3_AVAILABLE:
    try:
        dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        table = dynamodb.Table(DYNAMO_TABLE_NAME)
        
        # Check if table exists, if not, create it automatically
        try:
            table.load()
        except ClientError as ce:
            if ce.response['Error']['Code'] == 'ResourceNotFoundException':
                print(f"Table {DYNAMO_TABLE_NAME} not found. Creating it automatically...")
                table = dynamodb.create_table(
                    TableName=DYNAMO_TABLE_NAME,
                    KeySchema=[{'AttributeName': 'UserId', 'KeyType': 'HASH'}],
                    AttributeDefinitions=[{'AttributeName': 'UserId', 'AttributeType': 'S'}],
                    BillingMode='PAY_PER_REQUEST'
                )
                table.wait_until_exists()
                print(f"Table {DYNAMO_TABLE_NAME} created successfully!")
            else:
                raise ce

        DYNAMO_ENABLED = True
    except Exception as e:
        print(f"AWS DynamoDB Setup Error: {e}")

def save_user_profile(user_id: str, profile_data: Dict[str, Any]) -> bool:
    """Save user profile to DynamoDB with safe fallback."""
    if not DYNAMO_ENABLED or not table:
        print("DynamoDB fallback: saving locally instead.")
        return False
        
    try:
        table.put_item(
            Item={
                'UserId': user_id,
                'Name': profile_data.get('name'),
                'Age': profile_data.get('age'),
                'Activities': profile_data.get('activities', []),
                'Sensitivities': profile_data.get('sensitivities', []),
                'Commute': profile_data.get('commute'),
                'MitigationGear': profile_data.get('gear', [])
            }
        )
        return True
    except Exception as e:
        print(f"DynamoDB Write Error: {e}")
        return False

def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Retrieve user profile from DynamoDB."""
    if not DYNAMO_ENABLED or not table:
        return None
        
    try:
        response = table.get_item(Key={'UserId': user_id})
        return response.get('Item', None)
    except Exception as e:
        print(f"DynamoDB Read Error: {e}")
        return None
