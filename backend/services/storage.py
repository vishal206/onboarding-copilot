import os
import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()


def get_r2_client():
    """Create and return an R2 client."""
    return boto3.client(
        "s3",
        endpoint_url=os.getenv("R2_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Upload a file to R2 and return its URL.
    filename should be unique — we'll prefix with bot_id later.
    """
    client = get_r2_client()
    bucket = os.getenv("R2_BUCKET_NAME")

    client.put_object(
        Bucket=bucket,
        Key=filename,
        Body=file_bytes,
        ContentType=content_type,
    )

    # Return the file's storage path — we store this in the DB
    return f"{bucket}/{filename}"


def get_signed_url(filename: str, expiry_seconds: int = 3600) -> str:
    """
    Generate a temporary URL to access a private file.
    Default expiry is 1 hour.
    """
    client = get_r2_client()
    bucket = os.getenv("R2_BUCKET_NAME")

    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": filename},
        ExpiresIn=expiry_seconds,
    )
    return url


def delete_file(filename: str) -> bool:
    """Delete a file from R2."""
    client = get_r2_client()
    bucket = os.getenv("R2_BUCKET_NAME")

    client.delete_object(Bucket=bucket, Key=filename)
    return True
