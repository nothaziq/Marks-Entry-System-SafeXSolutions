from pydantic import BaseModel


class NotificationPreferencesResponse(BaseModel):
    reminders_enabled: bool


class UpdateNotificationPreferencesRequest(BaseModel):
    reminders_enabled: bool
