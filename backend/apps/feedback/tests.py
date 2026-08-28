import pytest
from rest_framework.test import APIClient
from unittest.mock import patch
from .models import Feedback

@pytest.mark.django_db
class TestFeedbackAPI:
    def setup_method(self):
        self.client = APIClient()
        self.url = '/api/v1/feedback/'

    @patch('apps.feedback.views.send_telegram_notification')
    def test_valid_post(self, mock_send):
        data = {
            "type": "proposal",
            "name": "Test User",
            "contact": "test@example.com",
            "message": "This is a valid message."
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 201
        assert response.data['success'] is True
        assert 'message' in response.data
        assert 'data' in response.data
        assert Feedback.objects.count() == 1
        mock_send.assert_called_once()

    def test_empty_message(self):
        data = {
            "type": "proposal",
            "message": ""
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 400

    def test_message_too_short(self):
        data = {
            "type": "question",
            "message": "abc"
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 400

    def test_message_too_long(self):
        data = {
            "type": "proposal",
            "message": "a" * 3001
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 400

    def test_invalid_type(self):
        data = {
            "type": "invalid_type",
            "message": "Valid message here."
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 400

    @patch('apps.feedback.views.send_telegram_notification')
    def test_valid_post_without_optional_fields(self, mock_send):
        data = {
            "type": "error_report",
            "message": "Valid message without optional fields."
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 201
        assert Feedback.objects.count() == 1
        mock_send.assert_called_once()

    @patch('apps.feedback.views.send_telegram_notification')
    def test_telegram_failure_does_not_prevent_saving(self, mock_send):
        mock_send.side_effect = Exception("Telegram API error")
        data = {
            "type": "proposal",
            "message": "Message that will fail telegram sending."
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 201
        assert Feedback.objects.count() == 1
        mock_send.assert_called_once()

    @patch('apps.feedback.views.send_telegram_notification')
    def test_response_structure(self, mock_send):
        data = {
            "type": "other",
            "name": "Tester",
            "message": "Checking response structure."
        }
        response = self.client.post(self.url, data)
        assert response.status_code == 201
        assert response.data['success'] is True
        assert 'data' in response.data
        resp_data = response.data['data']
        assert resp_data['type'] == 'other'
        assert resp_data['name'] == 'Tester'
        assert 'id' in resp_data
        assert 'created_at' in resp_data

