"""
Minimal SMTP email sending via Gmail, using only the standard library.

Requires a Gmail App Password (not the normal account password) - see
.env.example for setup instructions. If credentials are missing or the
send fails for any reason, this logs the error and returns False; it
never raises, so a broken mail server never takes down a request or
the scheduled job that calls it.
"""
import logging
import smtplib
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def send_email(to_email: str, subject: str, body: str) -> bool:
    if not settings.GMAIL_ADDRESS or not settings.GMAIL_APP_PASSWORD:
        logger.error("Email not sent: GMAIL_ADDRESS or GMAIL_APP_PASSWORD is not configured.")
        return False

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = f"{settings.GMAIL_SENDER_NAME} <{settings.GMAIL_ADDRESS}>"
    message["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.GMAIL_ADDRESS, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.GMAIL_ADDRESS, [to_email], message.as_string())
        return True
    except Exception as exc:  # noqa: BLE001 - deliberately broad: a mail failure must never crash the caller
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False
