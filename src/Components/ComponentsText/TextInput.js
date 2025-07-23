import React from 'react';

const TextInput = ({ type = 'text', placeholder, value, onChange, style, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.9em 1em',
        borderRadius: '0.7em',
        border: '1px solid #e0e0e0',
        fontSize: '1em',
        marginBottom: '1em',
        background: 'white',
        ...style,
      }}
      {...props}
    />
  );
};

export default TextInput; 