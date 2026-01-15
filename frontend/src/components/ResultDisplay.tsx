import { useState } from 'react';
import { MdCheckCircle, MdWarning, MdError, MdContentCopy, MdCheck, MdExpandMore, MdRefresh, MdAssessment } from 'react-icons/md';
import type { ClassificationResult } from '../types';
import './ResultDisplay.css';

interface ResultDisplayProps {
  result: ClassificationResult;
  onNewAnalysis: () => void;
}

const ResultDisplay = ({ result, onNewAnalysis }: ResultDisplayProps) => {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(result.resposta_sugerida);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      alert('Não foi possível copiar o texto.');
    }
  };

  const getCategoryStyle = () => {
    if (result.categoria === 'Produtivo') {
      return { className: 'produtivo', IconComponent: MdCheckCircle, color: '#10b981' };
    } else if (result.categoria === 'Improdutivo') {
      return { className: 'improdutivo', IconComponent: MdWarning, color: '#f59e0b' };
    } else {
      return { className: 'erro', IconComponent: MdError, color: '#ef4444' };
    }
  };

  const categoryStyle = getCategoryStyle();

  const { IconComponent } = categoryStyle;

  return (
    <div className="result-card">
      <h2><MdAssessment /> Resultado da Análise</h2>

      <div className="classification-result">
        <div className={`badge ${categoryStyle.className}`}>
          <IconComponent className="badge-icon" />
          <span className="badge-text">{result.categoria}</span>
        </div>

        <div className="confidence">
          <div className="confidence-label">
            Confiança: <strong>{result.confianca}%</strong>
          </div>
          <div className="confidence-track">
            <div 
              className="confidence-fill"
              style={{ 
                width: `${result.confianca}%`,
                backgroundColor: categoryStyle.color
              }}
            ></div>
          </div>
        </div>
      </div>

      {result.razao && (
        <div className="result-section">
          <h3>Motivo da Classificação</h3>
          <p>{result.razao}</p>
        </div>
      )}

      <div className="result-section">
        <h3>Resposta Sugerida</h3>
        <div className="suggested-response">
          <p>{result.resposta_sugerida}</p>
          <button className="btn-copy" onClick={handleCopyResponse}>
            {isCopied ? <MdCheck /> : <MdContentCopy />}
            {isCopied ? 'Copiado!' : 'Copiar Resposta'}
          </button>
        </div>
      </div>

      {result.email_original && (
        <div className="result-section">
          <h3 
            className="collapsible-header"
            onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          >
            Preview do Email Original
            <MdExpandMore className={`collapse-icon ${isPreviewExpanded ? 'expanded' : ''}`} />
          </h3>
          {isPreviewExpanded && (
            <div className="email-preview">
              {result.email_original}
            </div>
          )}
        </div>
      )}

      <button className="btn-new-analysis" onClick={onNewAnalysis}>
        <MdRefresh />
        Nova Análise
      </button>
    </div>
  );
};

export default ResultDisplay;
