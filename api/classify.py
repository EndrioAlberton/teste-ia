"""
API de classificação de emails usando Google Gemini AI.
Serverless function para Vercel.
"""

import os
import json
from http.server import BaseHTTPRequestHandler
import google.generativeai as genai

# Configurar API do Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Usar modelo mais recente disponível: gemini-2.5-flash
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None


def classify_email_with_ai(email_text: str) -> dict:
    """
    Classifica email usando Google Gemini AI.
    
    Args:
        email_text: Texto do email a ser classificado
        
    Returns:
        dict: Contém categoria, confiança, razão e resposta sugerida
    """
    if not model:
        return {
            'categoria': 'Erro',
            'resposta_sugerida': 'API Key não configurada. Configure GEMINI_API_KEY no Vercel.',
            'confianca': 0,
            'razao': 'GEMINI_API_KEY não configurada'
        }
    
    # Construir prompt para a IA
    prompt = f"""
Você é um assistente de classificação de emails para uma empresa financeira.

TAREFA: Analise o email abaixo e:
1. Classifique como "Produtivo" ou "Improdutivo"
2. Gere uma resposta automática apropriada

DEFINIÇÕES:
- **Produtivo**: Emails que requerem ação ou resposta (ex: solicitações de suporte, dúvidas sobre sistema, atualização de casos)
- **Improdutivo**: Emails que não necessitam ação imediata (ex: felicitações, agradecimentos, mensagens sociais)

EMAIL:
{email_text}

RESPONDA EXATAMENTE neste formato JSON (sem markdown):
{{
    "categoria": "Produtivo" ou "Improdutivo",
    "confianca": número entre 0 e 100,
    "razao": "breve explicação da classificação",
    "resposta_sugerida": "resposta automática apropriada e profissional"
}}
"""
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Remover markdown code blocks se existirem
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
            result_text = result_text.strip()
        
        result = json.loads(result_text)
        return result
        
    except json.JSONDecodeError as e:
        return {
            'categoria': 'Erro',
            'resposta_sugerida': 'Erro ao processar resposta da IA.',
            'confianca': 0,
            'razao': f'Erro no formato da resposta: {str(e)}'
        }
        
    except Exception as e:
        return {
            'categoria': 'Erro',
            'resposta_sugerida': f'Erro ao comunicar com a IA: {str(e)}',
            'confianca': 0,
            'razao': str(e)
        }


class handler(BaseHTTPRequestHandler):
    """Handler para requisições HTTP da Vercel."""
    
    def do_OPTIONS(self):
        """Responder a requisições OPTIONS (CORS preflight)."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Processar requisição POST para classificação de email."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response('Invalid JSON', 400)
                return
            
            email_text = data.get('email_text', '').strip()
            
            if not email_text:
                self.send_error_response('Campo email_text é obrigatório', 400)
                return
            
            if len(email_text) < 10:
                self.send_error_response('Email muito curto. Forneça mais conteúdo.', 400)
                return
            
            # Classificar com IA
            result = classify_email_with_ai(email_text)
            
            # Adicionar preview do email (máximo 500 caracteres)
            result['email_original'] = email_text[:500] + ('...' if len(email_text) > 500 else '')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(f'Erro interno: {str(e)}', 500)
    
    def send_error_response(self, message: str, status_code: int = 400):
        """Enviar resposta de erro em JSON."""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_data = {'error': message}
        self.wfile.write(json.dumps(error_data).encode('utf-8'))
