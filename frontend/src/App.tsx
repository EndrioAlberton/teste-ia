import { useState } from 'react';
import { MdError, MdRefresh } from 'react-icons/md';
import './App.css';
import EmailForm from './components/EmailForm';
import ResultDisplay from './components/ResultDisplay';
import Header from './components/Header';
import type { ClassificationResult } from './types';

function App() {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSuccess = (data: ClassificationResult) => {
    setResult(data);
    setError('');
    setLoading(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
    setLoading(false);
  };

  const handleLoading = () => {
    setLoading(true);
    setError('');
    setResult(null);
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setError('');
    setLoading(false);
  };

  return (
    <div className="app">
      <Header />

      <main className="container">
        {!result && !error && (
          <EmailForm
            onSuccess={handleSuccess}
            onError={handleError}
            onLoading={handleLoading}
            loading={loading}
          />
        )}

        {result && (
          <ResultDisplay
            result={result}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {error && (
          <div className="error-card">
            <h2><MdError /> Erro</h2>
            <p>{error}</p>
            <button 
              className="btn-new-analysis" 
              onClick={handleNewAnalysis}
            >
              <MdRefresh />
              Tentar Novamente
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Desenvolvido para o AutoU Challenge | Autor Endrio Alberton
        </p>
      </footer>
    </div>
  );
}

export default App;
