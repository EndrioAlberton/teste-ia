import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <svg viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
          <path 
            d="M20 10L28 15V25L20 30L12 25V15L20 10Z" 
            fill="white" 
            opacity="0.9"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" style={{stopColor: '#667eea'}}/>
              <stop offset="100%" style={{stopColor: '#764ba2'}}/>
            </linearGradient>
          </defs>
        </svg>
        <h1>Classificador de Emails</h1>
      </div>
      <div className="subtitle">
        Automatize a classificação de emails com Inteligência Artificial
      </div>
    </header>
  );
};

export default Header;
