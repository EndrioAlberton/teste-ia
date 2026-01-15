import { useState, type FormEvent, type ChangeEvent } from 'react';
import { MdEmail, MdTextFields, MdAttachFile, MdUploadFile, MdSend } from 'react-icons/md';
import { classifyEmail } from '../services/api';
import type { ClassificationResult } from '../types';
import './EmailForm.css';

interface EmailFormProps {
  onSuccess: (result: ClassificationResult) => void;
  onError: (error: string) => void;
  onLoading: () => void;
  loading: boolean;
}

const EmailForm = ({ onSuccess, onError, onLoading, loading }: EmailFormProps) => {
  const [emailText, setEmailText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  const handleTabChange = (tab: 'text' | 'file') => {
    setActiveTab(tab);
    if (tab === 'text') {
      setSelectedFile(null);
    } else {
      setEmailText('');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const validTypes = ['text/plain', 'application/pdf'];
      
      if (!validTypes.includes(file.type)) {
        onError('Formato não suportado. Use .txt ou .pdf');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        onError('Arquivo muito grande. Máximo: 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'text' && emailText.trim().length < 10) {
      onError('Por favor, insira um texto com pelo menos 10 caracteres.');
      return;
    }
    
    if (activeTab === 'file' && !selectedFile) {
      onError('Por favor, selecione um arquivo.');
      return;
    }
    
    let textToClassify = '';
    
    if (activeTab === 'text') {
      textToClassify = emailText;
    } else if (selectedFile) {
      try {
        textToClassify = await readFileContent(selectedFile);
      } catch (error) {
        onError('Erro ao ler arquivo. Tente novamente.');
        return;
      }
    }
    
    try {
      onLoading();
      const result = await classifyEmail(textToClassify);
      onSuccess(result);
    } catch (error: any) {
      onError(error.message || 'Erro ao classificar email');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="email-form-card">
      <h2><MdEmail /> Envie seu Email</h2>
      <p className="description">
        Cole o texto do email ou envie um arquivo (.txt ou .pdf)
      </p>

      <form onSubmit={handleSubmit}>
        <div className="tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => handleTabChange('text')}
          >
            <MdTextFields />
            Colar Texto
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => handleTabChange('file')}
          >
            <MdAttachFile />
            Upload Arquivo
          </button>
        </div>

        {activeTab === 'text' && (
          <div className="tab-content">
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Cole aqui o conteúdo do email...&#10;&#10;Exemplo:&#10;Olá, estou com problemas para acessar o sistema. Quando tento fazer login, recebo uma mensagem de erro. Preciso de ajuda urgente pois tenho um relatório importante para entregar hoje."
              rows={10}
              disabled={loading}
            />
          </div>
        )}

        {activeTab === 'file' && (
          <div className="tab-content">
            <div className="file-upload-area">
              <input
                type="file"
                id="fileInput"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                hidden
              />
              <label htmlFor="fileInput" className="file-upload-label">
                <MdUploadFile size={40} />
                
                <span className="upload-text">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo'}
                </span>
                
                <span className="upload-hint">
                  Formatos: .txt, .pdf (Máx: 5MB)
                </span>
              </label>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : (
            <>
              <MdSend />
              Classificar Email
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;
