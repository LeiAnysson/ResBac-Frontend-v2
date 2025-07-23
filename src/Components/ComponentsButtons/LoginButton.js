import React from 'react';

const LoginButton = ({ onClick, children, style, ...props }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1A19FF',
        color: 'white',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '2em',
        padding: '0.8em 2.5em',
        fontSize: '1.2em',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'background 0.2s',
        ...style,
      }}
      onMouseOver={e => (e.currentTarget.style.background = '#1514cc')}
      onMouseOut={e => (e.currentTarget.style.background = '#1A19FF')}
      {...props}
    >
      {children}
    </button>
  );
};

export default LoginButton; 