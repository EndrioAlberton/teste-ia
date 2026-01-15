"""
Endpoint de verificação de status da API.
"""

import os
import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    """Handler para health check."""
    
    def do_GET(self):
        """Retorna status do backend e configuração da API Gemini."""
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        api_status = "configurada" if gemini_api_key else "não configurada"
        
        response_data = {
            'status': 'online',
            'gemini_api': api_status,
            'message': 'Backend serverless está funcionando!'
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
